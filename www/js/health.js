/* Health Connect (Android): langkah, jarak, kalori aktif, degup jantung, tidur, berat */
(() => {
  const { $, P, store, emit, toast, settings, saveSettings, dkey, num, openExternal, fmtH } = WZ;
  const H = P.Health;
  const READ = ['steps', 'distance', 'calories', 'heartRate', 'restingHeartRate', 'sleep', 'weight'];
  const st = { avail: null, reason: '', busy: false, data: store.get('hc_data', null) };
  const iso = d => d.toISOString();
  const sod = (off = 0) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + off); return d; };
  const val = x => x == null ? 0 : (typeof x.value === 'number' ? x.value : (x.values && x.values.sum) || 0);
  const safe = async f => { try { return await f(); } catch { return null; } };

  async function check() {
    if (!H) { st.avail = false; st.reason = 'web'; return render(); }
    try { const r = await H.isAvailable(); st.avail = !!r.available; st.reason = r.reason || ''; }
    catch (e) { st.avail = false; st.reason = String(e.message || e); }
    render();
  }
  async function connect() {
    try {
      const r = await H.requestAuthorization({ read: READ });
      const ok = (r.readAuthorized || []).length > 0;
      settings.hc = ok; saveSettings();
      if (ok) { toast(t('hc.connected')); await refresh(); } else toast(t('hc.denied'));
    } catch (e) { toast(t('err.generic') + ' ' + (e.message || e)); }
    render();
  }
  const agg = async (dataType, start, end, aggregation = 'sum') =>
    ((await H.queryAggregated({ dataType, startDate: iso(start), endDate: iso(end), bucket: 'day', aggregation })) || {}).samples || [];
  const latest = async (dataType, from) => {
    const r = await H.readSamples({ dataType, startDate: iso(from), endDate: iso(new Date()), limit: 1, ascending: false });
    return r && r.samples && r.samples[0];
  };
  function sleepMinutes(samples) {
    const STAGE = ['asleep', 'light', 'deep', 'rem'];
    const staged = samples.filter(s => STAGE.includes(s.sleepState));
    const mins = s => (new Date(s.endDate) - new Date(s.startDate)) / 60000;
    if (staged.length) return Math.round(staged.reduce((a, s) => a + mins(s), 0));
    let tot = 0;
    samples.forEach(s => {
      if (s.sleepState === 'awake' || s.sleepState === 'inBed' && samples.length > 1) return;
      if (s.stages && s.stages.length) {
        const m = s.stages.filter(x => STAGE.includes(x.stage)).reduce((a, x) => a + (x.durationMinutes || 0), 0);
        tot += m || mins(s);
      } else tot += mins(s);
    });
    return Math.round(tot);
  }

  async function refresh(manual) {
    if (!H || !settings.hc || st.busy) return;
    st.busy = true; if (manual) $('#hcStatus').textContent = t('hc.syncing');
    const now = new Date(), today = sod(), d = { t: Date.now(), day: dkey(now), authorized: READ };
    const auth = await safe(() => H.checkAuthorization({ read: READ }));
    if (auth) d.authorized = auth.readAuthorized || [];
    if (!d.authorized.length) { settings.hc = false; saveSettings(); st.busy = false; return render(); }
    const has = k => d.authorized.includes(k);
    if (has('steps')) {
      const s = await safe(() => agg('steps', sod(-6), now));
      if (s) { d.stepsDays = {}; s.forEach(x => { d.stepsDays[dkey(new Date(x.startDate))] = Math.round(val(x)); }); d.steps = d.stepsDays[d.day] || 0; }
    }
    if (has('distance')) { const s = await safe(() => agg('distance', today, now)); if (s) d.distance = s.reduce((a, x) => a + val(x), 0); }
    if (has('calories')) { const s = await safe(() => agg('calories', today, now)); if (s) d.kcal = Math.round(s.reduce((a, x) => a + val(x), 0)); }
    if (has('heartRate')) {
      const s = await safe(() => agg('heartRate', today, now, ['average', 'min', 'max']));
      if (s && s.length) { const v = s[s.length - 1].values || {}; if (v.average) d.hr = { avg: Math.round(v.average), min: Math.round(v.min), max: Math.round(v.max) }; }
      const l = await safe(() => latest('heartRate', sod(-1))); if (l) { d.hrLast = Math.round(l.value); d.hrAt = l.endDate; }
    }
    if (has('restingHeartRate')) { const l = await safe(() => latest('restingHeartRate', sod(-7))); if (l) d.rhr = Math.round(l.value); }
    if (has('sleep')) {
      const from = new Date(today); from.setHours(-6); // 6 petang semalam
      const r = await safe(() => H.readSamples({ dataType: 'sleep', startDate: iso(from), endDate: iso(now), limit: 300, ascending: true }));
      if (r) d.sleepMin = sleepMinutes(r.samples || []);
    }
    if (has('weight')) {
      const l = await safe(() => latest('weight', sod(-120)));
      if (l) { d.weight = +(+l.value).toFixed(1); if (!settings.weight) { settings.weight = String(d.weight); saveSettings(); } }
    }
    st.data = d; store.set('hc_data', d); st.busy = false;
    emit('hc'); render();
    if (manual) toast(t('hc.synced'));
  }

  function tile(ic, g, v, label) { return `<div class="hc-tile"><span class="chip-ic ${g}">${ico(ic)}</span><div><b>${v}</b><small>${label}</small></div></div>`; }
  function render() {
    const show = (id, on) => $(id).classList.toggle('hidden', !on);
    const d = st.data, on = !!settings.hc && st.avail !== false;
    let status;
    if (!H) status = t('hc.webOnly');
    else if (st.avail === false) status = t('hc.notInstalled');
    else if (!settings.hc) status = t('hc.notConnected');
    else status = d ? t('hc.updatedAt', { t: fmtH(new Date(d.t).getHours() + new Date(d.t).getMinutes() / 60) }) : t('hc.syncing');
    $('#hcStatus').textContent = status;
    show('#hcConnect', !!H && st.avail !== false && !settings.hc);
    show('#hcInstall', !!H && st.avail === false);
    show('#hcManage', !!H && st.avail !== false);
    show('#hcRefresh', on);
    show('#hcGrid', on && !!d);
    if (on && d) {
      const today = d.day === dkey(new Date()), dash = '—';
      const sl = d.sleepMin != null && today ? `${Math.floor(d.sleepMin / 60)}${t('unit.h')} ${d.sleepMin % 60}m` : dash;
      $('#hcGrid').innerHTML = [
        tile('heart-pulse', 'g-pink', d.hrLast ? `${d.hrLast} <em>bpm</em>` : dash, t('hc.hrLast') + (d.hr ? ` · ${d.hr.min}–${d.hr.max}` : '')),
        tile('activity', 'g-purple', d.rhr ? `${d.rhr} <em>bpm</em>` : dash, t('hc.rhr')),
        tile('bed', 'g-indigo', sl, t('hc.sleep')),
        tile('flame', 'g-orange', d.kcal != null && today ? `${num(d.kcal)} <em>kcal</em>` : dash, t('hc.kcal')),
        tile('footprints', 'g-green', d.steps != null && today ? num(d.steps) : dash, t('hc.steps')),
        tile('scale', 'g-teal', d.weight ? `${num(d.weight, 1)} <em>kg</em>` : dash, t('hc.weight'))
      ].join('');
    }
  }
  $('#hcConnect').onclick = connect;
  $('#hcRefresh').onclick = () => refresh(true);
  $('#hcManage').onclick = () => { if (H) H.openHealthConnectSettings().catch(() => toast(t('hc.notInstalled'))); };
  $('#hcInstall').onclick = () => openExternal('https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata');

  WZ.hc = {
    check, refresh, render,
    get on() { return !!settings.hc && !!st.data; },
    get data() { return st.data && st.data.day === dkey(new Date()) ? st.data : (st.data ? { stepsDays: st.data.stepsDays } : null); }
  };
})();
