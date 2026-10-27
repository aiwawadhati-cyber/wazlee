/* Kalendar Hijri: grid bulanan, tarikh penting Islam & hari puasa sunat */
(() => {
  const { $, on, esc, store } = WZ;
  const L = LANG === 'en' ? 1 : 0;
  const DAY = 864e5;
  const P = d => WZ.solat.hijriParts(d);
  const atNoon = d => { const x = new Date(d); x.setHours(12, 0, 0, 0); return x; };
  const addDays = (d, n) => new Date(atNoon(d).getTime() + n * DAY);
  const mName = m => WZ.HMONTHS[m - 1];

  /* Senarai hari Masihi bagi bulan Hijri (y, m) */
  function monthDays(y, m) {
    const today = atNoon(new Date()), tp = P(today); if (!tp) return [];
    const diff = (y * 12 + m) - (tp.y * 12 + tp.m);
    let d = addDays(today, -(tp.d - 1) + Math.round(diff * 29.53));
    for (let k = 0; k < 8; k++) { const p = P(d); if (p.y === y && p.m === m && p.d === 1) break; const off = Math.round(((p.y * 12 + p.m) - (y * 12 + m)) * 29.5) + p.d - 1; d = addDays(d, -(off || 1)); }
    const out = []; for (let i = 0; i < 31; i++) { const x = addDays(d, i), p = P(x); if (p.m !== m) break; out.push({ date: x, h: p }); }
    return out;
  }

  /* Tarikh penting */
  const EV = [
    { m: 1, d: 1, k: 'muharram', ph: 1, t: ['Awal Muharram (Maal Hijrah)', 'Islamic New Year'] },
    { m: 1, d: 10, k: 'asyura', t: ['Hari Asyura', 'Day of Ashura'] },
    { m: 3, d: 12, k: 'maulid', ph: 1, t: ['Maulidur Rasul', "Prophet's Birthday"] },
    { m: 7, d: 27, k: 'israk', t: ['Israk & Mikraj', "Isra' & Mi'raj"] },
    { m: 8, d: 15, k: 'nisfu', t: ['Nisfu Syaaban', "Mid-Sha'ban"] },
    { m: 9, d: 1, k: 'ramadan', t: ['Awal Ramadan', 'First of Ramadan'] },
    { m: 9, d: 17, k: 'nuzul', t: ['Nuzul Al-Quran', 'Nuzul al-Quran'] },
    { m: 10, d: 1, k: 'fitri', ph: 1, t: ['Hari Raya Aidilfitri', 'Eid al-Fitr'] },
    { m: 12, d: 9, k: 'arafah', t: ['Hari Arafah', 'Day of Arafah'] },
    { m: 12, d: 10, k: 'adha', ph: 1, t: ['Hari Raya Aidiladha', 'Eid al-Adha'] }
  ];
  const evOf = h => EV.find(e => e.m === h.m && e.d === h.d);
  /* Puasa: 'sunat' | 'haram' | null */
  function fastOf(date, h) {
    if ((h.m === 10 && h.d === 1) || (h.m === 12 && h.d >= 10 && h.d <= 13)) return { k: 'haram', t: [h.m === 10 ? 'Haram berpuasa (Aidilfitri)' : h.d === 10 ? 'Haram berpuasa (Aidiladha)' : 'Haram berpuasa (Hari Tasyrik)', h.m === 10 ? 'Fasting forbidden (Eid)' : h.d === 10 ? 'Fasting forbidden (Eid)' : 'Fasting forbidden (Tashriq)'] };
    if (h.m === 9) return { k: 'wajib', t: ['Puasa Ramadan', 'Ramadan fast'] };
    if (h.m === 12 && h.d === 9) return { k: 'sunat', t: ['Puasa sunat Arafah', 'Sunnah fast of Arafah'] };
    if (h.m === 1 && (h.d === 9 || h.d === 10)) return { k: 'sunat', t: [h.d === 9 ? 'Puasa sunat Tasua' : 'Puasa sunat Asyura', h.d === 9 ? "Sunnah fast (Tasu'a)" : 'Sunnah fast (Ashura)'] };
    if (h.d >= 13 && h.d <= 15) return { k: 'sunat', t: ['Puasa sunat Ayyamul Bidh', 'Sunnah fast (White Days)'] };
    if (h.m === 10 && h.d >= 2) return { k: 'syawal', t: ['Boleh puasa 6 hari Syawal', 'Six days of Shawwal fast'] };
    const wd = date.getDay(); if (wd === 1 || wd === 4) return { k: 'sunat', t: [wd === 1 ? 'Puasa sunat Isnin' : 'Puasa sunat Khamis', wd === 1 ? 'Sunnah fast (Monday)' : 'Sunnah fast (Thursday)'] };
    return null;
  }
  function upcoming(n = 10, days = 400) {
    const out = [], t0 = atNoon(new Date());
    for (let i = 0; i < days && out.length < n; i++) { const d = addDays(t0, i), h = P(d), e = h && evOf(h); if (e) out.push({ ...e, date: d, h, inDays: i }); }
    return out;
  }

  /* ---------- Paparan ---------- */
  const today0 = () => atNoon(new Date());
  let view = null, sel = null;
  const WD = L ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : ['Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab', 'Ahd'];
  const gfmt = (d, o) => d.toLocaleDateString(L ? 'en-GB' : 'ms-MY', o);
  function render() {
    const tp = P(today0()); if (!tp) return;
    if (!view) view = { y: tp.y, m: tp.m };
    $('#hjToday').innerHTML = `<small>${t('hj.today')}</small><h2>${tp.d} ${esc(mName(tp.m))} ${tp.y}${L ? ' AH' : 'H'}</h2><p>${gfmt(today0(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      ${tp.src === 'calc' ? `<small class="hj-src">${t('hj.calc')}</small>` : ''}`;
    const days = monthDays(view.y, view.m);
    $('#hjTitle').innerHTML = `<b>${esc(mName(view.m))} ${view.y}${L ? ' AH' : 'H'}</b><small>${days.length ? gfmt(days[0].date, { day: 'numeric', month: 'short' }) + ' – ' + gfmt(days[days.length - 1].date, { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</small>`;
    const lead = days.length ? (days[0].date.getDay() + 6) % 7 : 0, tk = WZ.dkey(today0());
    $('#hjGrid').innerHTML = WD.map(w => `<span class="hj-wd">${w}</span>`).join('') + '<span></span>'.repeat(lead) + days.map((x, i) => {
      const e = evOf(x.h), f = fastOf(x.date, x.h), k = WZ.dkey(x.date);
      return `<button class="hj-c ${k === tk ? 'today' : ''} ${x.date.getDay() === 5 ? 'fri' : ''} ${e ? 'ev' : ''} ${sel === k ? 'sel' : ''}" data-i="${i}"><b>${x.h.d}</b><small>${x.date.getDate()}</small>
        <i>${e ? '<em class="d-ev"></em>' : ''}${f && f.k === 'sunat' ? '<em class="d-sn"></em>' : ''}${f && f.k === 'haram' ? '<em class="d-hr"></em>' : ''}</i></button>`;
    }).join('');
    $('#hjGrid').onclick = ev => { const b = ev.target.closest('[data-i]'); if (!b) return; const x = days[+b.dataset.i]; sel = WZ.dkey(x.date); detail(x); $$('#hjGrid .hj-c').forEach(c => c.classList.toggle('sel', c === b)); };
    const s = sel && days.find(x => WZ.dkey(x.date) === sel); detail(s || days.find(x => WZ.dkey(x.date) === tk) || null);
    $('#hjEvents').innerHTML = upcoming(10).map(e => `<div class="hj-ev ${e.ph ? 'ph' : ''}"><span class="hj-ed"><b>${e.h.d}</b><small>${esc(mName(e.h.m)).slice(0, 3)}</small></span>
      <span class="grow"><b>${esc(e.t[L])}</b><small>${gfmt(e.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}${e.ph ? ' · ' + t('hj.ph') : ''}</small></span>
      <span class="hj-in">${e.inDays === 0 ? t('hj.todayShort') : t('hj.inDays', { n: e.inDays })}</span></div>`).join('');
  }
  const $$ = s => [...document.querySelectorAll(s)];
  function detail(x) {
    if (!x) { $('#hjDetail').innerHTML = ''; return; }
    const e = evOf(x.h), f = fastOf(x.date, x.h);
    $('#hjDetail').innerHTML = `<b>${gfmt(x.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</b><small>${x.h.d} ${esc(mName(x.h.m))} ${x.h.y}${L ? ' AH' : 'H'}</small>
      ${e ? `<span class="hj-tag ev">${ico('star')} ${esc(e.t[L])}</span>` : ''}${f ? `<span class="hj-tag ${f.k}">${ico(f.k === 'haram' ? 'circle-x' : 'moon')} ${esc(f.t[L])}</span>` : ''}`;
  }
  const shift = n => { let m = view.m + n, y = view.y; if (m < 1) { m = 12; y--; } if (m > 12) { m = 1; y++; } view = { y, m }; sel = null; render(); };
  $('#hjPrev').onclick = () => shift(-1); $('#hjNext').onclick = () => shift(1);
  $('#hjNow').onclick = () => { view = null; sel = null; render(); };
  on('show:hijri', () => { view = null; render(); });

  WZ.hijri = { parts: P, monthDays, upcoming, fastOf, evOf, addDays, atNoon };
})();
