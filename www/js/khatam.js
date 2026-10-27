/* Perancang Khatam: sasaran harian ikut tempoh, kemajuan dari ayat terakhir dibaca, peringatan harian */
(() => {
  const { $, P, store, on, toast, esc, settings, num } = WZ;
  const LN = P.LocalNotifications;
  const L = LANG === 'en' ? 1 : 0;
  const TOTAL = 6236;
  let SUR = null, CUM = null;
  async function idx() {
    if (CUM) return;
    const I = await WZ.quran.index(); SUR = I.sur; CUM = [0];
    SUR.forEach((s, i) => CUM[i + 1] = CUM[i] + s.c);
  }
  const g = (s, a) => CUM[s - 1] + a;                         // 1..6236
  const sa = gi => { gi = Math.max(1, Math.min(TOTAL, gi)); let s = 1; while (CUM[s] < gi) s++; return { s, a: gi - CUM[s - 1] }; };
  const nm = s => WZ.quran.sName(SUR[s - 1]);
  const ref = gi => { const x = sa(gi); return `${nm(x.s)} ${x.s}:${x.a}`; };
  const juzOf = gi => Math.min(30, Math.floor((gi - 1) / (TOTAL / 30)) + 1);
  const plan = () => store.get('khatam', null);
  const savePlan = p => store.set('khatam', p);
  const dk = (d = new Date()) => WZ.dkey(d);
  const daysBetween = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 864e5);
  function pos() { const l = store.get('q_last', null); return l ? g(l.s, l.a) : 0; }

  function calc(p) {
    const now = pos(), cur = Math.max(p.from - 1, now >= p.from - 1 ? now : p.from - 1);
    const elapsed = daysBetween(p.start, dk()), left = Math.max(1, p.days - elapsed);
    p.log = p.log || {};
    if (p.log[dk()] == null) { p.log[dk()] = cur; savePlan(p); }
    const startToday = p.log[dk()], remainStart = TOTAL - startToday, perDay = Math.ceil(remainStart / left);
    const goal = Math.min(TOTAL, startToday + perDay), doneToday = Math.max(0, cur - startToday);
    const pct = Math.round((cur - (p.from - 1)) / (TOTAL - (p.from - 1)) * 100);
    return { cur, elapsed, left, perDay, startToday, goal, doneToday, pct: Math.max(0, Math.min(100, pct)), todayPct: Math.min(100, Math.round(doneToday / Math.max(1, perDay) * 100)) };
  }

  async function render() {
    await idx();
    const p = plan(), cnt = store.get('khatamCount', 0);
    $('#khSetup').classList.toggle('hidden', !!p);
    $('#khPlan').classList.toggle('hidden', !p);
    $('#khCount').textContent = cnt ? t('kh.count', { n: cnt }) : '';
    if (!p) { renderSetup(); return; }
    const c = calc(p);
    if (c.cur >= TOTAL) { done(p); return; }
    const end = new Date(p.start + 'T12:00:00'); end.setDate(end.getDate() + p.days - 1);
    $('#khPlan').innerHTML = `
      <div class="kh-hero"><div class="kh-ring" id="khRing"></div><div><small>${t('kh.day', { n: Math.min(p.days, c.elapsed + 1), d: p.days })}</small><b>${t('kh.target', { d: end.toLocaleDateString(L ? 'en-GB' : 'ms-MY', { day: 'numeric', month: 'short', year: 'numeric' }) })}</b>
        <small>${t('kh.juzNow', { j: juzOf(Math.max(1, c.cur)) })} · ${num(Math.max(0, c.cur - p.from + 1))}/${num(TOTAL - p.from + 1)} ${t('kh.ayat')}</small></div></div>
      <div class="card kh-today"><div class="card-title">${ico('target')} ${t('kh.today')}</div>
        <div class="kh-range"><div><small>${t('kh.from')}</small><b>${esc(ref(c.startToday + 1))}</b></div>${ico('chevron-right')}<div class="r"><small>${t('kh.to')}</small><b>${esc(ref(c.goal))}</b></div></div>
        <div class="kh-bar"><span style="width:${c.todayPct}%"></span></div>
        <p class="muted small">${c.doneToday >= c.perDay ? '✅ ' + t('kh.doneToday') : t('kh.leftToday', { n: num(c.perDay - c.doneToday), j: (c.perDay / (TOTAL / 30)).toFixed(1) })}</p>
        <button class="btn block" id="khRead">${ico('book-open')}<span>${t('kh.read', { r: esc(ref(c.cur + 1)) })}</span></button></div>
      <div class="card"><label class="switch-row"><span>${ico('bell')} ${t('kh.remind')}</span><input type="checkbox" id="khRem" ${p.remind ? 'checked' : ''}></label>
        <div class="two" style="margin-top:6px"><span class="muted small">${t('kh.remTime')}</span><input type="time" id="khTime" value="${p.time || '21:00'}"></div></div>
      <button class="btn soft block" id="khReset">${ico('rotate-ccw')}<span>${t('kh.reset')}</span></button>
      <p class="note">${t('kh.note')}</p>`;
    WZ.ring($('#khRing'), c.pct / 100, `<b>${c.pct}%</b>`, { size: 92, stroke: 10 });
    $('#khRead').onclick = () => { const x = sa(c.cur + 1); WZ.quran.openSurah(x.s, x.a); };
    $('#khRem').onchange = e => { p.remind = e.target.checked; savePlan(p); remind(true); };
    $('#khTime').onchange = e => { p.time = e.target.value; savePlan(p); remind(true); };
    $('#khReset').onclick = () => { if (confirm(t('kh.resetAsk'))) { store.del('khatam'); remind(false); render(); } };
  }
  function renderSetup() {
    const last = pos();
    $('#khDays').innerHTML = [7, 10, 15, 30, 60, 90].map(n => `<button data-d="${n}" class="${n === 30 ? 'active' : ''}">${t('kh.nDays', { n })}</button>`).join('');
    $('#khFrom').innerHTML = `<option value="1">${t('kh.fromStart')}</option>${last ? `<option value="${last + 1}">${t('kh.fromLast', { r: esc(ref(Math.min(TOTAL, last + 1))) })}</option>` : ''}`;
  }
  $('#khDays').addEventListener('click', e => { const b = e.target.closest('[data-d]'); if (!b) return; [...$('#khDays').children].forEach(x => x.classList.toggle('active', x === b)); $('#khCustom').value = ''; });
  $('#khStart').onclick = async () => {
    await idx();
    const days = +$('#khCustom').value || +(($('#khDays .active') || {}).dataset || {}).d || 30;
    if (!(days >= 1 && days <= 730)) return toast(t('kh.badDays'));
    const from = +$('#khFrom').value || 1;
    if (from === 1) store.set('q_last', { s: 1, a: 1, t: Date.now() });
    savePlan({ start: dk(), days, from, remind: !!LN, time: '21:00', log: {} });
    toast(t('kh.started')); render(); remind(true);
  };
  function done(p) {
    const cnt = store.get('khatamCount', 0) + 1; store.set('khatamCount', cnt); store.del('khatam'); remind(false);
    $('#khPlan').innerHTML = `<div class="card kh-done">${ico('party-popper')}<h2>${t('kh.khatam')}</h2><p>${t('kh.khatamS', { n: cnt })}</p><button class="btn" id="khAgain">${t('kh.again')}</button></div>`;
    $('#khAgain').onclick = () => render();
  }

  /* Peringatan harian (Android) */
  async function remind(fromToggle) {
    if (!LN) return;
    try {
      const pend = await LN.getPending(); const old = pend.notifications.filter(n => n.id >= 7100 && n.id < 7200).map(n => ({ id: n.id }));
      if (old.length) await LN.cancel({ notifications: old });
      const p = plan(); if (!p || !p.remind) return;
      if (fromToggle) { const pr = await LN.requestPermissions(); if (pr.display !== 'granted') return; }
      await idx(); const c = calc(p), [h, m] = (p.time || '21:00').split(':').map(Number), list = [], now = new Date();
      for (let i = 0; i < 30 && i < c.left + 1; i++) {
        const at = new Date(now); at.setDate(now.getDate() + i); at.setHours(h, m, 0, 0); if (at <= now) continue;
        list.push({ id: 7100 + i, title: t('kh.nT'), body: t('kh.nB', { n: num(c.perDay), j: (c.perDay / (TOTAL / 30)).toFixed(1) }), schedule: { at, allowWhileIdle: true }, extra: { route: 'khatam' } });
      }
      if (list.length) await LN.schedule({ notifications: list });
      if (fromToggle && list.length) toast(t('kh.remOn'));
    } catch {}
  }
  on('show:khatam', render);
  setTimeout(() => remind(false), 4500);
  WZ.khatam = { render };
})();
