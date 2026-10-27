/* Peringatan (tidur, rehat, tahajjud, dhuha, Al-Kahfi, puasa sunat, zikir, tersuai) + tetapan azan */
(() => {
  const { $, $$, P, store, on, toast, esc, settings, saveSettings } = WZ;
  const LN = P.LocalNotifications, AZ = P.WzAzan;
  const L = LANG === 'en' ? 1 : 0;
  const DAYS = [['Ahd', 'Sun'], ['Isn', 'Mon'], ['Sel', 'Tue'], ['Rab', 'Wed'], ['Kha', 'Thu'], ['Jum', 'Fri'], ['Sab', 'Sat']];
  const ALL = [0, 1, 2, 3, 4, 5, 6], WEEKDAY = [1, 2, 3, 4, 5];
  /* Pratetap: id, ikon, warna, masa, hari, laluan, aktif lalai, [tajuk BM, EN], [isi BM, EN], selang (rehat) */
  const PRESETS = [
    { id: 'tidur', ic: 'bed', g: 'g-indigo', time: '23:00', days: ALL, route: 'doa', on: true,
      t: ['🌙 Masa tidur', '🌙 Bedtime'], b: ['Berwuduk, baca doa tidur & Surah Al-Mulk. Tidur awal, bangun segar untuk Subuh.', 'Take wudu, recite the sleep du\'a & Surah Al-Mulk. Sleep early, wake fresh for Fajr.'] },
    { id: 'rehat', ic: 'timer', g: 'g-green', time: '10:00', to: '16:00', every: 2, days: WEEKDAY, route: 'air', on: true,
      t: ['🧘 Masa rehat sekejap', '🧘 Time for a short break'], b: ['Bangun, regangkan badan, rehatkan mata 20 saat & minum segelas air.', 'Stand up, stretch, rest your eyes for 20 seconds & drink a glass of water.'] },
    { id: 'tahajjud', ic: 'moon-star', g: 'g-purple', time: '04:30', days: ALL, route: 'quran', on: false,
      t: ['🌌 Qiamullail', '🌌 Night prayer'], b: ['Bangun sebentar untuk tahajjud & doa sebelum Subuh.', 'Wake up for tahajjud & du\'a before Fajr.'] },
    { id: 'dhuha', ic: 'sun', g: 'g-yellow', time: '09:30', days: ALL, route: 'solat', on: false,
      t: ['☀️ Solat Dhuha', '☀️ Dhuha prayer'], b: ['Luangkan beberapa minit untuk solat Dhuha.', 'Take a few minutes for the Dhuha prayer.'] },
    { id: 'kahfi', ic: 'book-open', g: 'g-teal', time: '09:00', days: [5], route: 'surah:18:1', on: true,
      t: ['📖 Surah Al-Kahfi', '📖 Surah Al-Kahf'], b: ['Hari Jumaat — jom baca Surah Al-Kahfi.', 'It\'s Friday — let\'s read Surah Al-Kahf.'] },
    { id: 'puasa', ic: 'utensils', g: 'g-orange', time: '21:30', days: [0, 3], route: 'home', on: false,
      t: ['🌙 Puasa sunat esok?', '🌙 Sunnah fast tomorrow?'], b: ['Esok Isnin/Khamis — pasang niat & bersahur untuk puasa sunat.', 'Tomorrow is Monday/Thursday — set your intention & have suhoor for a sunnah fast.'] },
    { id: 'zkpagi', ic: 'sunrise', g: 'g-orange', time: '07:00', days: ALL, route: 'zikir:pagi', on: false,
      t: ['🌅 Zikir pagi', '🌅 Morning dhikr'], b: ['Mulakan hari dengan zikir pagi.', 'Start your day with the morning dhikr.'] },
    { id: 'zkpetang', ic: 'sunset', g: 'g-pink', time: '17:30', days: ALL, route: 'zikir:petang', on: false,
      t: ['🌇 Zikir petang', '🌇 Evening dhikr'], b: ['Masa untuk zikir petang.', 'Time for the evening dhikr.'] },
    { id: 'senaman', ic: 'footprints', g: 'g-green', time: '18:00', days: [1, 3, 5], route: 'langkah', on: false,
      t: ['🏃 Masa bersenam', '🏃 Exercise time'], b: ['Jom berjalan atau bersenam 30 minit hari ini.', 'Let\'s walk or exercise for 30 minutes today.'] }
  ];
  const st = () => Object.assign({ p: {}, custom: [] }, store.get('reminders', {}));
  const cfg = (s, p) => Object.assign({ on: p.on, time: p.time, days: p.days, to: p.to, every: p.every }, s.p[p.id] || {});
  const hm = s => s.split(':').map(Number);
  const daysTxt = d => d.length === 7 ? t('ing.daily') : d.length === 5 && WEEKDAY.every(x => d.includes(x)) ? t('ing.weekdays') : d.map(x => DAYS[x][L]).join(', ');
  const chips = (sel, attr) => DAYS.map((d, i) => `<button class="${sel.includes(i) ? 'active' : ''}" data-${attr}="${i}">${d[L]}</button>`).join('');

  function render() {
    const s = st();
    $('#ingList').innerHTML = PRESETS.map(p => {
      const c = cfg(s, p);
      return `<div class="card ing ${c.on ? 'on' : ''}" data-p="${p.id}">
        <div class="ing-top"><span class="chip-ic ${p.g}">${ico(p.ic)}</span><span class="grow"><b>${esc(p.t[L])}</b><small>${c.every ? t('ing.every', { h: c.every, a: c.time, b: c.to }) : c.time} · ${daysTxt(c.days)}</small></span>
          <label class="switch-row sw"><input type="checkbox" data-on ${c.on ? 'checked' : ''}></label></div>
        <div class="ing-edit"><p class="muted small">${esc(p.b[L])}</p>
          <div class="two"><input type="time" data-time value="${c.time}">${c.every ? `<input type="time" data-to value="${c.to}">` : '<span></span>'}</div>
          <div class="ing-days">${chips(c.days, 'd')}</div></div>
      </div>`;
    }).join('');
    $('#ingCustom').innerHTML = s.custom.map((c, i) => `<div class="card ing on"><div class="ing-top"><span class="chip-ic g-blue">${ico('bell')}</span><span class="grow"><b>${esc(c.title)}</b><small>${c.time} · ${daysTxt(c.days)}</small></span>
      <button class="icbtn" data-del="${i}" aria-label="delete">${ico('trash-2')}</button></div></div>`).join('') || `<p class="muted small center">${t('ing.noCustom')}</p>`;
    if (!$('#ingDays').innerHTML) $('#ingDays').innerHTML = chips(ALL, 'nd');
  }
  function update(id, patch) { const s = st(); const p = PRESETS.find(x => x.id === id); s.p[id] = Object.assign(cfg(s, p), patch); store.set('reminders', s); render(); schedule(); }
  $('#ingList').addEventListener('change', e => {
    const card = e.target.closest('[data-p]'); if (!card) return;
    if (e.target.matches('[data-on]')) update(card.dataset.p, { on: e.target.checked });
    if (e.target.matches('[data-time]')) update(card.dataset.p, { time: e.target.value });
    if (e.target.matches('[data-to]')) update(card.dataset.p, { to: e.target.value });
  });
  $('#ingList').addEventListener('click', e => {
    const b = e.target.closest('[data-d]'); if (!b) return;
    const id = b.closest('[data-p]').dataset.p, s = st(), c = cfg(s, PRESETS.find(x => x.id === id)), d = +b.dataset.d;
    const days = c.days.includes(d) ? c.days.filter(x => x !== d) : [...c.days, d].sort();
    if (days.length) update(id, { days });
  });
  $('#ingDays').addEventListener('click', e => { const b = e.target.closest('[data-nd]'); if (b) b.classList.toggle('active'); });
  $('#ingAddBtn').onclick = () => {
    const title = $('#ingTitle').value.trim(), time = $('#ingTime').value, days = $$('#ingDays .active').map(b => +b.dataset.nd);
    if (!title || !time || !days.length) return toast(t('ing.fill'));
    const s = st(); if (s.custom.length >= 10) return toast(t('ing.max'));
    s.custom.push({ title, time, days }); store.set('reminders', s);
    $('#ingTitle').value = ''; render(); schedule(); toast(t('ing.added'));
  };
  $('#ingCustom').addEventListener('click', e => { const b = e.target.closest('[data-del]'); if (!b) return; const s = st(); s.custom.splice(+b.dataset.del, 1); store.set('reminders', s); render(); schedule(); });

  async function schedule() {
    if (!LN) {
      if (!WZ.ics) { $('#ingStatus').textContent = t('notif.apkOnly'); return; }
      const s = st(), ev = [];
      PRESETS.forEach(p => {
        const c = cfg(s, p); if (!c.on) return;
        if (c.every) { const [a] = hm(c.time), [b] = hm(c.to); for (let h = a; h <= b; h += c.every) ev.push({ title: p.t[L], desc: p.b[L], time: `${h}:${c.time.split(':')[1]}`, days: c.days }); }
        else ev.push({ title: p.t[L], desc: p.b[L], time: c.time, days: c.days });
      });
      s.custom.forEach(c => ev.push({ title: '🔔 ' + c.title, desc: t('ing.customBody'), time: c.time, days: c.days }));
      $('#ingStatus').innerHTML = `<button class="btn block" id="ingIcs">${ico('calendar')}<span>${t('ics.ingBtn', { n: ev.length })}</span></button><span>${t('ics.ingNote')}</span>`;
      $('#ingIcs').onclick = () => WZ.ics.weekly(ev, 'wazlee-peringatan.ics');
      return;
    }
    try {
      const pend = await LN.getPending();
      const old = pend.notifications.filter(n => n.id >= 4000 && n.id < 5000).map(n => ({ id: n.id }));
      if (old.length) await LN.cancel({ notifications: old });
      const s = st(), list = []; let id = 4000;
      const add = (title, body, time, days, route) => {
        const [h, m] = hm(time);
        days.forEach(d => { if (id < 4990) list.push({ id: id++, title, body, schedule: { on: { weekday: d + 1, hour: h, minute: m }, allowWhileIdle: true }, extra: { route } }); });
      };
      PRESETS.forEach(p => {
        const c = cfg(s, p); if (!c.on) return;
        if (c.every) { const [a] = hm(c.time), [b] = hm(c.to); for (let h = a; h <= b; h += c.every) add(p.t[L], p.b[L], `${h}:${c.time.split(':')[1]}`, c.days, p.route); }
        else add(p.t[L], p.b[L], c.time, c.days, p.route);
      });
      s.custom.forEach(c => add('🔔 ' + c.title, t('ing.customBody'), c.time, c.days, 'home'));
      if (list.length) {
        const perm = await LN.requestPermissions();
        if (perm.display !== 'granted') { $('#ingStatus').textContent = t('notif.denied'); return; }
        await LN.schedule({ notifications: list });
      }
      $('#ingStatus').textContent = t('ing.status', { n: list.length });
    } catch (e) { $('#ingStatus').textContent = t('err.generic') + ' ' + (e.message || e); }
  }
  on('show:ingat', render);
  if (LN) LN.addListener('localNotificationActionPerformed', a => { const r = a && a.notification && a.notification.extra && a.notification.extra.route; if (r && WZ.widget) WZ.widget.goRoute(r); });

  /* ---------- Tetapan azan (Profil) ---------- */
  const MAIN = ['subuh', 'zohor', 'asar', 'maghrib', 'isyak'];
  async function renderAzan() {
    if (!AZ) { $('#azBox').innerHTML = `<div class="card-sub">${t('az.title')}</div><p class="note">${t('az.apkOnly')}</p>`; return; }
    try {
      const c = await AZ.getConfig();
      $('#azNameMain').textContent = c.hasAzan ? c.nameAzan : c.builtIn ? t('az.builtin') : t('az.none');
      $('#azNameSubuh').textContent = c.hasSubuh ? c.nameSubuh : c.builtInSubuh ? t('az.builtinSubuh') : t('az.subuhNone');
      $('#azFollow').checked = !!c.followSilent;
      if (!c.exact) $('#btnExact').classList.remove('hidden');
    } catch {}
    const modes = settings.azanMode || {};
    $('#azModes').innerHTML = MAIN.map(n => `<div class="az-mode"><span>${WZ.solat.META[n].n}</span><select data-azm="${n}">${['azan', 'notif', 'silent'].map(m => `<option value="${m}" ${(modes[n] || 'azan') === m ? 'selected' : ''}>${t('az.m.' + m)}</option>`).join('')}</select></div>`).join('');
  }
  const resched = () => WZ.solat.scheduleNotifs();
  $('#azBox').addEventListener('click', async e => {
    const pk = e.target.closest('[data-az-pick]'), ts = e.target.closest('[data-az-test]'), cl = e.target.closest('[data-az-clear]');
    if (!AZ) return;
    try {
      if (pk) { const r = await AZ.pick({ kind: pk.dataset.azPick }); toast(t('az.picked', { n: r.name })); renderAzan(); resched(); }
      if (ts) { await AZ.test({ kind: ts.dataset.azTest, title: t('az.testTitle'), body: WZ.solat.zoneText() }); toast(t('az.testing')); }
      if (cl) { await AZ.clear({ kind: cl.dataset.azClear }); renderAzan(); resched(); }
    } catch (err) { const m = String(err && err.message || err); if (!m.includes('cancel')) toast(m.includes('nofile') ? t('az.none') : t('err.generic') + ' ' + m); }
  });
  $('#azBox').addEventListener('change', e => {
    if (e.target.matches('[data-azm]')) { settings.azanMode = Object.assign({}, settings.azanMode, { [e.target.dataset.azm]: e.target.value }); saveSettings(); resched(); }
    if (e.target.id === 'azFollow' && AZ) AZ.setOptions({ followSilent: e.target.checked });
  });
  on('show:profil', renderAzan);

  WZ.ingat = { schedule, render };
  setTimeout(schedule, 3000);
})();
