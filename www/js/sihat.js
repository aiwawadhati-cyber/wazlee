/* Sihat: langkah harian (sensor + Health Connect), BMI, minum air */
(() => {
  const { $, P, store, on, emit, toast, vibrate, settings, saveSettings, dkey, num, LOC } = WZ;

  /* ---------- Langkah (sensor perkakasan) ---------- */
  const S = P.WzSteps;
  const saved = store.get('steps_today', { date: '', n: 0 });
  let sensorSteps = saved.date === dkey(new Date()) ? saved.n : 0;
  let stepStatus = S ? 'init' : 'web';
  let listener = null;

  function process(counter, bootTime) {
    const today = dkey(new Date()), hist = store.get('steps_hist', {});
    let st = store.get('steps_state', null);
    if (!st) st = { date: today, base: counter, last: counter, boot: bootTime };
    const rebooted = Math.abs((bootTime || 0) - (st.boot || 0)) > 120000 || counter < st.last;
    let base = st.base;
    if (rebooted) {
      if (st.date !== today) { hist[st.date] = Math.max(hist[st.date] || 0, st.last - st.base); base = 0; }
      else base = -(st.last - st.base);
    } else if (st.date !== today) {
      hist[st.date] = Math.max(hist[st.date] || 0, st.last - st.base);
      base = st.last;
    }
    sensorSteps = Math.max(0, Math.round(counter - base));
    hist[today] = sensorSteps;
    const keys = Object.keys(hist).sort(); while (keys.length > 60) delete hist[keys.shift()];
    store.set('steps_state', { date: today, base, last: counter, boot: bootTime });
    store.set('steps_hist', hist);
    store.set('steps_today', { date: today, n: sensorSteps });
    emit('steps');
  }
  async function readSteps() {
    if (!S) { stepStatus = 'web'; emit('steps'); return; }
    try {
      const r = await S.read();
      if (!r.available) { stepStatus = 'nosensor'; emit('steps'); return; }
      if (r.counter >= 0) { stepStatus = 'ok'; process(r.counter, r.bootTime); }
    } catch (e) {
      stepStatus = String(e.message || e).includes('PERMISSION') ? 'perm' : 'err'; emit('steps');
    }
  }
  async function askPerm() {
    try { const p = await S.requestPermissions(); if (p.activity === 'granted') { await readSteps(); startWatch(); } else toast(t('steps.permNeeded')); }
    catch { toast(t('err.generic')); }
  }
  async function startWatch() {
    if (!S || stepStatus !== 'ok') return;
    try { await S.watch(); if (!listener) listener = await S.addListener('step', r => { if (r.counter >= 0) process(r.counter, r.bootTime); }); } catch {}
  }
  async function stopWatch() { if (!S) return; try { await S.unwatch(); if (listener) { await listener.remove(); listener = null; } } catch {} }

  /* ---------- Gabung sensor + Health Connect ---------- */
  function today() {
    const hc = WZ.hc.data || {}, hcSteps = hc.steps || 0, useHc = hcSteps > sensorSteps;
    const n = Math.max(sensorSteps, hcSteps);
    const stride = settings.height ? settings.height * 0.414 / 100 : 0.72, w = +settings.weight || 70;
    return {
      n, src: useHc ? 'hc' : (stepStatus === 'ok' ? 'sensor' : ''),
      km: useHc && hc.distance ? hc.distance / 1000 : n * stride / 1000,
      kcal: hc.kcal != null && WZ.hc.on ? Math.max(hc.kcal, Math.round(n * 0.04 * w / 70)) : Math.round(n * 0.04 * w / 70),
      min: Math.round(n / 100)
    };
  }
  const goal = () => +settings.goal || 8000;
  const srcLabel = s => s === 'hc' ? t('steps.srcHc') : s === 'sensor' ? t('steps.srcSensor') : '';

  function renderStepsWidgets() {
    const g = goal(), d = today(), p = d.n / g, none = stepStatus === 'web' && !WZ.hc.on;
    WZ.ring($('#hStepRing'), p, ico('footprints'), { size: 52, stroke: 6, colors: ['#fff', '#fff'], track: '#ffffff40' });
    $('#hSteps').textContent = none ? '—' : num(d.n);
    $('#hStepGoal').textContent = ` / ${num(g)}`;
    WZ.ring($('#sStepRing'), p, `<b>${Math.min(999, Math.round(p * 100))}%</b><small>${t('steps.goal')}</small>`, { size: 116, stroke: 12 });
    $('#sSteps').textContent = num(d.n); $('#sKm').textContent = d.km.toFixed(2); $('#sKcal').textContent = num(d.kcal);
    $('#sSrc').textContent = srcLabel(d.src);
  }
  function renderLangkah() {
    const g = goal(), d = today();
    WZ.ring($('#lRing'), d.n / g, `<b>${num(d.n)}</b><small>${t('steps.of', { g: num(g) })}</small>`, { size: 220, stroke: 18 });
    $('#lKm').textContent = d.km.toFixed(2); $('#lKcal').textContent = num(d.kcal); $('#lMin').textContent = d.min;
    let note = {
      web: t('steps.nWeb'), nosensor: t('steps.nNoSensor'), perm: t('steps.nPerm'), err: t('steps.nErr'), init: t('steps.nInit'),
      ok: d.n >= g ? t('steps.nDone') : t('steps.nLeft', { n: num(g - d.n) })
    }[stepStatus] || '';
    if (WZ.hc.on && stepStatus !== 'ok') note = d.n >= g ? t('steps.nDone') : t('steps.nLeft', { n: num(g - d.n) });
    $('#lNote').textContent = note + (d.src ? ` · ${srcLabel(d.src)}` : '');
    $('#btnStepPerm').classList.toggle('hidden', stepStatus !== 'perm');
    // carta 7 hari
    const hist = store.get('steps_hist', {}), hcDays = (WZ.hc.data || {}).stepsDays || {}, days = [];
    for (let i = 6; i >= 0; i--) { const dd = new Date(); dd.setDate(dd.getDate() - i); const k = dkey(dd); days.push({ d: dd, n: Math.max(hist[k] || 0, hcDays[k] || 0, i === 0 ? d.n : 0), today: i === 0 }); }
    const max = Math.max(g, ...days.map(x => x.n));
    $('#lWeek').innerHTML = days.map(x => `<div class="wbar ${x.today ? 'today' : ''} ${x.n >= g ? 'goal' : ''}"><em>${x.n ? (x.n >= 1000 ? (x.n / 1000).toFixed(1) + 'k' : x.n) : ''}</em><i style="height:${Math.max(3, x.n / max * 100)}%"></i><small>${x.d.toLocaleDateString(LOC, { weekday: 'short' }).slice(0, 3)}</small></div>`).join('');
    const tot = days.reduce((a, x) => a + x.n, 0), hit = days.filter(x => x.n >= g).length;
    $('#lWeekSum').innerHTML = `<span>${t('steps.total')} <b>${num(tot)}</b></span><span>${t('steps.avg')} <b>${num(Math.round(tot / 7))}</b></span><span>${t('steps.hit')} <b>${hit}/7</b></span>`;
  }
  $('#btnStepPerm').onclick = askPerm;
  const rerender = () => { renderStepsWidgets(); if ($('#pg-langkah').classList.contains('active')) renderLangkah(); };
  on('steps', rerender); on('hc', rerender); on('settings', renderStepsWidgets);
  on('show:langkah', () => { renderLangkah(); readSteps().then(startWatch); WZ.hc.refresh(); });
  on('hide:langkah', stopWatch);
  on('show:sihat', () => { renderStepsWidgets(); readSteps(); WZ.hc.render(); WZ.hc.refresh(); });

  /* ---------- BMI ---------- */
  function renderBMI() {
    const h = parseFloat($('#bmiH').value), w = parseFloat($('#bmiW').value);
    if (!(h > 50 && w > 10)) { $('#bmiNum').textContent = '—'; $('#bmiCat').textContent = t('bmi.enter'); $('#bmiTip').textContent = ''; return; }
    const b = w / ((h / 100) ** 2);
    const cat = b < 18.5 ? ['bmi.c1', '#3B82F6', 'bmi.t1'] : b < 23 ? ['bmi.c2', '#16A34A', 'bmi.t2'] : b < 27.5 ? ['bmi.c3', '#D97706', 'bmi.t3'] : ['bmi.c4', '#DC2626', 'bmi.t4'];
    $('#bmiNum').textContent = b.toFixed(1); $('#bmiNum').style.color = cat[1];
    $('#bmiCat').textContent = t(cat[0]); $('#bmiCat').style.color = cat[1];
    const lo = 18.5 * (h / 100) ** 2, hi = 22.9 * (h / 100) ** 2;
    $('#bmiTip').textContent = `${t(cat[2])} ${t('bmi.range', { lo: lo.toFixed(1), hi: hi.toFixed(1) })}`;
    $('#bmiMark').style.left = ((Math.min(35, Math.max(12, b)) - 12) / 23 * 100) + '%';
  }
  ['#bmiH', '#bmiW'].forEach(s => $(s).addEventListener('input', () => {
    renderBMI(); settings.height = $('#bmiH').value; settings.weight = $('#bmiW').value; saveSettings();
  }));
  on('show:bmi', () => { $('#bmiH').value = settings.height || ''; $('#bmiW').value = settings.weight || ''; renderBMI(); });

  /* ---------- Air ---------- */
  const wKey = () => 'water_' + dkey(new Date());
  const wGet = () => store.get(wKey(), 0);
  function renderWater() {
    const n = wGet(), g = +settings.waterGoal || 8;
    $('#wCount').textContent = n; $('#wGoal').textContent = g; $('#wMl').textContent = t('water.ml', { a: num(n * 250), b: num(g * 250) });
    $('#glasses').innerHTML = Array.from({ length: Math.max(g, n) }, (_, i) => `<button class="glass ${i < n ? 'full' : ''}" data-g="${i}" aria-label="${i + 1}"></button>`).join('');
    $('#hWater').textContent = `${n}/${g}`;
    $('#wGoalSel').value = g; $('#waterNotif').checked = !!settings.waterNotif;
  }
  const wSet = n => { const g = +settings.waterGoal || 8; n = Math.max(0, Math.min(20, n)); const prev = wGet(); store.set(wKey(), n); if (n === g && prev < g) { vibrate([80, 40, 80]); toast(t('water.done')); } renderWater(); };
  $('#wPlus').onclick = () => { vibrate(20); wSet(wGet() + 1); };
  $('#wMinus').onclick = () => wSet(wGet() - 1);
  $('#glasses').onclick = e => { const b = e.target.closest('[data-g]'); if (b) { const i = +b.dataset.g; wSet(i < wGet() ? i : i + 1); } };
  $('#wGoalSel').onchange = e => { settings.waterGoal = +e.target.value; saveSettings(); renderWater(); };
  async function waterNotifs() {
    const LN = P.LocalNotifications; if (!LN) { if (settings.waterNotif) toast(t('notif.apkOnly')); return; }
    try {
      const ids = [8, 10, 12, 14, 16, 18, 20, 22].map((h, i) => ({ id: 3000 + i, h }));
      await LN.cancel({ notifications: ids.map(x => ({ id: x.id })) });
      if (!settings.waterNotif) return;
      const perm = await LN.requestPermissions(); if (perm.display !== 'granted') { settings.waterNotif = false; saveSettings(); renderWater(); return; }
      await LN.schedule({ notifications: ids.map(x => ({ id: x.id, title: t('water.nTitle'), body: t('water.nBody'), schedule: { on: { hour: x.h, minute: 0 }, allowWhileIdle: true } })) });
      toast(t('water.nOn'));
    } catch (e) { toast(t('err.generic') + ' ' + (e.message || e)); }
  }
  $('#waterNotif').onchange = e => { settings.waterNotif = e.target.checked; saveSettings(); waterNotifs(); };
  on('show:air', renderWater);

  WZ.sihat = { readSteps, renderStepsWidgets, renderWater, get steps() { return today().n; } };
})();
