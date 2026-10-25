/* Waktu solat: zon JAKIM (e-Solat) + sandaran kiraan GPS, notifikasi */
(() => {
  const { $, $$, P, store, on, emit, toast, icons, esc, settings, saveSettings, dkey, fmtH, hToDate, hijriFromStr, hijriCalc, greg, tz, num } = WZ;

  const KEYS = ['imsak', 'subuh', 'syuruk', 'dhuha', 'zohor', 'asar', 'maghrib', 'isyak'];
  const MAIN = ['subuh', 'zohor', 'asar', 'maghrib', 'isyak'];
  const META = {
    imsak: { n: t('p.imsak'), ic: 'moon', g: 'g-indigo', minor: 1 }, subuh: { n: t('p.subuh'), ic: 'sunrise', g: 'g-indigo' },
    syuruk: { n: t('p.syuruk'), ic: 'sun', g: 'g-yellow', minor: 1 }, dhuha: { n: t('p.dhuha'), ic: 'sun', g: 'g-yellow', minor: 1 },
    zohor: { n: t('p.zohor'), ic: 'sun', g: 'g-orange' }, asar: { n: t('p.asar'), ic: 'cloud-sun', g: 'g-teal' },
    maghrib: { n: t('p.maghrib'), ic: 'sunset', g: 'g-pink' }, isyak: { n: t('p.isyak'), ic: 'moon-star', g: 'g-purple' }
  };

  /* ---------- Zon ---------- */
  const zoneInfo = c => ZONES.find(z => z.c === c);
  function detectZone(lat, lng) {
    if (lat < 0.6 || lat > 7.6 || lng < 99.4 || lng > 119.6) return null;
    let best = null, bd = 1e9;
    for (const [la, lo, z] of DISTRICTS) { const d = Prayer.haversine(lat, lng, la, lo); if (d < bd) { bd = d; best = z; } }
    return bd < 90 ? best : null;
  }
  function activeZone() {
    if (settings.zoneMode === 'gps') return null;
    if (settings.zoneMode === 'manual' && settings.zone) return settings.zone;
    return detectZone(WZ.loc.lat, WZ.loc.lng);
  }

  /* ---------- Data JAKIM ---------- */
  const MON = { jan: 1, feb: 2, mar: 3, mac: 3, apr: 4, may: 5, mei: 5, jun: 6, jul: 7, aug: 8, ogo: 8, ogos: 8, sep: 9, oct: 10, okt: 10, nov: 11, dec: 12, dis: 12 };
  function parseDate(s) {
    let m = /^(\d{1,2})-([A-Za-z]+)-(\d{4})$/.exec(s || '');
    if (m) { const mo = MON[m[2].toLowerCase()] || MON[m[2].toLowerCase().slice(0, 3)]; return mo ? `${m[3]}-${WZ.pad(mo)}-${WZ.pad(+m[1])}` : null; }
    m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || ''); return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
  }
  const hm = x => { const m = /(\d{1,2}):(\d{2})/.exec(x || ''); return m ? +m[1] * 60 + +m[2] : null; };
  const klFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kuala_Lumpur', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  const unixMin = u => hm(klFmt.format(new Date(u * 1000)));
  const row = (imsak, subuh, syuruk, dhuha, zohor, asar, maghrib, isyak, hijri) => {
    if ([subuh, syuruk, zohor, asar, maghrib, isyak].some(v => v == null)) return null;
    return [imsak ?? subuh - 10, subuh, syuruk, dhuha ?? syuruk + 28, zohor, asar, maghrib, isyak, hijri || ''];
  };
  function parseEsolat(j) {
    const out = {};
    (j.prayerTime || []).forEach(p => {
      const k = parseDate(p.date); if (!k) return;
      const r = row(hm(p.imsak), hm(p.fajr || p.subuh), hm(p.syuruk), hm(p.dhuha), hm(p.dhuhr || p.zohor), hm(p.asr || p.asar), hm(p.maghrib), hm(p.isha || p.isyak), p.hijri);
      if (r) out[k] = r;
    });
    return out;
  }
  function parseV2(j, y, m) {
    const out = {}, mo = j.month_number || m;
    (j.prayers || []).forEach(p => {
      const t = v => typeof v === 'number' ? (v > 1e9 ? unixMin(v) : v) : hm(v);
      const r = row(p.imsak != null ? t(p.imsak) : null, t(p.fajr), t(p.syuruk), p.dhuha != null ? t(p.dhuha) : null, t(p.dhuhr), t(p.asr), t(p.maghrib), t(p.isha), p.hijri);
      if (r) out[`${y}-${WZ.pad(mo)}-${WZ.pad(p.day)}`] = r;
    });
    return out;
  }
  async function getJSON(url) {
    const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 15000);
    try { const r = await fetch(url, { signal: ctl.signal }); if (!r.ok) throw new Error(r.status); return await r.json(); }
    finally { clearTimeout(to); }
  }
  const cacheOf = z => store.get('jk_' + z, { d: {} });
  let fetching = false;
  async function ensureData(force) {
    const z = activeZone(); if (!z || fetching) return;
    const c = cacheOf(z), now = new Date(), wk = new Date(now.getTime() + 7 * 864e5);
    if (!force && c.d[dkey(now)] && c.d[dkey(wk)]) return;
    fetching = true; let got = {};
    const years = [now.getFullYear()]; if (wk.getFullYear() !== now.getFullYear()) years.push(wk.getFullYear());
    for (const y of years) {
      try {
        const j = await getJSON(`https://www.e-solat.gov.my/index.php?r=esolatApi/TakwimSolat&period=year&zone=${z}&year=${y}`);
        Object.assign(got, parseEsolat(j));
      } catch {}
    }
    if (!got[dkey(now)]) { // sandaran: api.waktusolat.app (cermin data JAKIM)
      for (const d of [now, new Date(now.getFullYear(), now.getMonth() + 1, 1)]) {
        try { const y = d.getFullYear(), m = d.getMonth() + 1; Object.assign(got, parseV2(await getJSON(`https://api.waktusolat.app/v2/solat/${z}?year=${y}&month=${m}`), y, m)); } catch {}
      }
    }
    fetching = false;
    if (Object.keys(got).length) {
      // simpan hanya 400 hari terdekat
      const all = Object.assign({}, c.d, got), keep = {}, lo = dkey(new Date(now.getTime() - 3 * 864e5));
      Object.keys(all).sort().filter(k => k >= lo).slice(0, 400).forEach(k => keep[k] = all[k]);
      store.set('jk_' + z, { d: keep, t: Date.now() });
      emit('times');
      if (force) toast(t('solat.updated'));
    } else if (force || !c.d[dkey(now)]) toast(t('solat.loadFail'));
  }

  /* ---------- Waktu sehari ---------- */
  function getDay(date) {
    const z = activeZone();
    if (z) {
      const r = cacheOf(z).d[dkey(date)];
      if (r) { const t = {}; KEYS.forEach((k, i) => t[k] = r[i] / 60); return { src: 'jakim', zone: z, t, hijri: hijriFromStr(r[8]) || hijriCalc(date) }; }
    }
    return { src: 'gps', zone: z, t: Prayer.compute(date, WZ.loc.lat, WZ.loc.lng, tz()), hijri: hijriCalc(date) };
  }
  function nextPrayer(now = new Date()) {
    for (let k = 0; k < 2; k++) {
      const d = new Date(now); d.setDate(d.getDate() + k);
      const day = getDay(d);
      for (const n of MAIN) { const at = hToDate(d, day.t[n]); if (at > now) return { key: n, at, h: day.t[n] }; }
    }
  }
  function currentPrayer(t, now = new Date()) {
    const h = now.getHours() + now.getMinutes() / 60; let cur = 'isyak';
    for (const n of ['subuh', 'syuruk', 'zohor', 'asar', 'maghrib', 'isyak']) if (h >= t[n]) cur = n;
    if (h < t.subuh) cur = 'isyak';
    return cur === 'syuruk' ? null : cur;
  }

  /* ---------- Render: halaman solat ---------- */
  let dayOffset = 0;
  function zoneLabel() {
    const z = activeZone();
    if (!z) return { code: 'GPS', name: settings.zoneMode === 'gps' ? t('zon.gps') : t('solat.outside') };
    const zi = zoneInfo(z); return { code: z, name: zi ? `${zi.s} · ${zi.n}` : '' };
  }
  function renderSolat() {
    const d = new Date(); d.setDate(d.getDate() + dayOffset);
    const day = getDay(d), cur = dayOffset === 0 ? currentPrayer(day.t) : null, zl = zoneLabel();
    $('#sZoneCode').textContent = zl.code; $('#sZoneName').textContent = zl.name;
    $('#dayLabel').textContent = dayOffset === 0 ? t('solat.today') : greg(d, { weekday: 'long', day: 'numeric', month: 'short' });
    $('#dayHijri').textContent = day.hijri;
    $('#prayerList').innerHTML = KEYS.map(k => {
      const m = META[k];
      return `<li class="${k === cur ? 'now' : ''} ${m.minor ? 'minor' : ''}"><span class="p-ic ${m.g}">${ico(m.ic)}</span><span class="p-name">${m.n}${m.minor ? '<small>' + t('p.sub.' + k) + '</small>' : ''}</span><b>${fmtH(day.t[k])}</b></li>`;
    }).join('');
    $('#srcNote').textContent = t(day.src === 'jakim' ? 'solat.srcJakim' : 'solat.srcGps');
    $('#btnRefreshTimes').classList.toggle('hidden', !activeZone());
  }
  $('#dayPrev').onclick = () => { dayOffset--; renderSolat(); };
  $('#dayNext').onclick = () => { dayOffset++; renderSolat(); };
  $('#btnRefreshTimes').onclick = () => ensureData(true).then(() => { renderSolat(); scheduleNotifs(); });
  on('show:solat', () => { dayOffset = 0; renderSolat(); });

  /* ---------- Render: zon ---------- */
  const STATES = [...new Set(ZONES.map(z => z.s))].sort();
  $('#zoneState').innerHTML = STATES.map(s => `<option>${s}</option>`).join('');
  function renderZone() {
    const auto = detectZone(WZ.loc.lat, WZ.loc.lng);
    $('#zoneAutoInfo').textContent = auto ? t('zon.detected', { z: auto, n: zoneInfo(auto).n }) : t('zon.outside');
    $('#zoneAuto').classList.toggle('sel', settings.zoneMode === 'auto');
    $('#zoneGps').classList.toggle('sel', settings.zoneMode === 'gps');
    const st = $('#zoneState').value;
    $('#zoneList').innerHTML = ZONES.filter(z => z.s === st).map(z =>
      `<button class="zone-opt ${settings.zoneMode === 'manual' && settings.zone === z.c ? 'sel' : ''}" data-z="${z.c}"><span><b>${z.c}</b><em>${esc(z.n)}</em></span>${ico('check', 'tick')}</button>`).join('');
  }
  function pickZone(mode, code) {
    settings.zoneMode = mode; if (code) settings.zone = code; saveSettings();
    renderZone(); emit('times'); ensureData().then(scheduleNotifs);
    toast(mode === 'auto' ? t('zon.tAuto') : mode === 'gps' ? t('zon.tGps') : t('zon.tPick', { z: code }));
    setTimeout(() => WZ.back(), 350);
  }
  $('#zoneState').onchange = renderZone;
  $('#zoneAuto').onclick = () => pickZone('auto');
  $('#zoneGps').onclick = () => pickZone('gps');
  $('#zoneList').onclick = e => { const b = e.target.closest('[data-z]'); if (b) pickZone('manual', b.dataset.z); };
  on('show:zon', () => {
    const z = activeZone() || detectZone(WZ.loc.lat, WZ.loc.lng);
    if (z) $('#zoneState').value = zoneInfo(z).s;
    renderZone();
  });

  /* ---------- Hero utama (kiraan mundur) ---------- */
  function renderHeroStatic() {
    const now = new Date(), day = getDay(now), cur = currentPrayer(day.t), zl = zoneLabel();
    $('#hHijri').textContent = day.hijri;
    $('#hZone').innerHTML = `${ico('map-pin')} ${zl.code}`;
    $('#hChips').innerHTML = MAIN.map(k => `<div class="pchip ${k === cur ? 'now' : ''}"><small>${META[k].n}</small><b>${fmtH(day.t[k]).replace(/ [a-z]+$/i, '')}</b></div>`).join('');
    $('#pfZone').textContent = zl.code === 'GPS' ? zl.name : `${zl.code} · ${zoneInfo(zl.code).s}`;
  }
  let lastMin = -1;
  function tick() {
    const now = new Date(), np = nextPrayer(now); if (!np) return;
    const s = Math.max(0, Math.floor((np.at - now) / 1000));
    $('#hNextName').textContent = META[np.key].n;
    $('#hNextAt').textContent = fmtH(np.h);
    $('#hCountdown').textContent = `${WZ.pad(Math.floor(s / 3600))}:${WZ.pad(Math.floor(s % 3600 / 60))}:${WZ.pad(s % 60)}`;
    if (now.getMinutes() !== lastMin) { lastMin = now.getMinutes(); renderHeroStatic(); if ($('#pg-solat').classList.contains('active') && dayOffset === 0) renderSolat(); }
  }

  /* ---------- Notifikasi ---------- */
  async function scheduleNotifs() {
    const LN = P.LocalNotifications;
    if (!LN) { $('#notifStatus').textContent = settings.notif ? t('notif.apkOnly') : ''; return; }
    try {
      const pend = await LN.getPending();
      const mine = pend.notifications.filter(n => n.id >= 1000 && n.id < 2000).map(n => ({ id: n.id }));
      if (mine.length) await LN.cancel({ notifications: mine });
      if (!settings.notif && !settings.notifPre) { $('#notifStatus').textContent = ''; return; }
      const perm = await LN.requestPermissions();
      if (perm.display !== 'granted') { settings.notif = settings.notifPre = false; saveSettings(); $('#notifToggle').checked = $('#notifPre').checked = false; $('#notifStatus').textContent = t('notif.denied'); return; }
      const list = [], now = new Date(), zl = zoneLabel(), sound = window.WZ_FLAGS && WZ_FLAGS.azan ? 'azan.mp3' : undefined;
      for (let k = 0; k < 7; k++) {
        const d = new Date(); d.setDate(d.getDate() + k);
        const day = getDay(d);
        MAIN.forEach((n, i) => {
          const at = hToDate(d, day.t[n]);
          if (settings.notif && at > now) list.push({ id: 1000 + k * 10 + i, title: t('notif.in', { p: META[n].n }), body: `${fmtH(day.t[n])} · ${zl.code === 'GPS' ? WZ.loc.name : zl.code}`, schedule: { at, allowWhileIdle: true }, sound });
          const pre = new Date(at.getTime() - 10 * 60000);
          if (settings.notifPre && pre > now) list.push({ id: 1500 + k * 10 + i, title: t('notif.pre', { p: META[n].n }), body: t('notif.preBody', { p: META[n].n, t: fmtH(day.t[n]) }), schedule: { at: pre, allowWhileIdle: true } });
        });
      }
      await LN.schedule({ notifications: list });
      $('#notifStatus').textContent = t('notif.scheduled', { n: list.length });
      try {
        const ex = await LN.checkExactNotificationSetting();
        $('#btnExact').classList.toggle('hidden', ex.exact_alarm === 'granted');
      } catch {}
    } catch (e) { $('#notifStatus').textContent = t('err.generic') + ' ' + (e.message || e); }
  }
  $('#btnExact').onclick = async () => { try { await P.LocalNotifications.changeExactNotificationSetting(); } catch {} scheduleNotifs(); };
  $('#notifToggle').onchange = e => { settings.notif = e.target.checked; saveSettings(); scheduleNotifs(); };
  $('#notifPre').onchange = e => { settings.notifPre = e.target.checked; saveSettings(); scheduleNotifs(); };

  on('loc', () => { emit('times'); ensureData().then(scheduleNotifs); });
  on('times', () => { renderHeroStatic(); tick(); if ($('#pg-solat').classList.contains('active')) renderSolat(); });

  WZ.solat = { getDay, nextPrayer, currentPrayer, activeZone, detectZone, ensureData, scheduleNotifs, tick, META, MAIN, start() { setInterval(tick, 1000); renderHeroStatic(); tick(); } };
})();
