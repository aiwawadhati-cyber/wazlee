/* Jumaat: kiraan mundur solat Jumaat, amalan sunat, selawat, masjid terdekat & kegemaran, peringatan */
(() => {
  const { $, P, store, on, toast, esc, num, settings, saveSettings, fmtH, hToDate, openExternal, vibrate } = WZ;
  const LN = P.LocalNotifications;
  const L = LANG === 'en' ? 1 : 0;
  const SUNNAH = [
    { k: 'mandi', ic: 'droplet', t: ['Mandi sunat Jumaat', 'Friday ghusl'] },
    { k: 'pakaian', ic: 'shirt', t: ['Pakaian terbaik & wangian', 'Best clothes & perfume'] },
    { k: 'kahfi', ic: 'book-open', t: ['Baca Surah Al-Kahfi', 'Read Surah Al-Kahf'], go: 'surah:18:1' },
    { k: 'selawat', ic: 'heart', t: ['Perbanyak selawat ke atas Nabi SAW', 'Send abundant salawat upon the Prophet (PBUH)'] },
    { k: 'awal', ic: 'footprints', t: ['Pergi awal ke masjid', 'Go early to the mosque'] },
    { k: 'khutbah', ic: 'volume-2', t: ['Dengar khutbah dengan tekun', 'Listen attentively to the khutbah'] },
    { k: 'doa', ic: 'hand-heart', t: ['Berdoa di saat mustajab (akhir waktu Asar)', 'Make du\'a in the accepted hour (late Asr)'] },
    { k: 'sedekah', ic: 'hand-helping', t: ['Bersedekah', 'Give charity'] }
  ];
  const fri = (now = new Date()) => { const d = new Date(now); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7)); return d; };
  const zohorAt = d => hToDate(d, WZ.solat.getDay(d).t.zohor);
  function nextJumaat(now = new Date()) {
    let d = fri(now); let at = zohorAt(d);
    if (now - at > 90 * 60e3) { d = new Date(d.getTime() + 7 * 864e5); at = zohorAt(d); }
    return { d, at };
  }
  const fkey = d => WZ.dkey(d);
  const chk = () => store.get('jum_chk', {});
  const fav = () => store.get('jum_fav', null);
  const hms = ms => { const s = Math.max(0, Math.floor(ms / 1000)), dd = Math.floor(s / 86400); return (dd ? `${dd} ${L ? (dd > 1 ? 'days' : 'day') : 'hari'} · ` : '') + [Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60].map(x => String(x).padStart(2, '0')).join(':'); };
  const fmtAt = at => fmtH(at.getHours() + at.getMinutes() / 60 + at.getSeconds() / 3600 + at.getMilliseconds() / 3600e3);
  const isFriWindow = (now = new Date()) => {
    const wd = now.getDay(), t0 = WZ.solat.getDay(now).t;
    if (wd === 5) return now < hToDate(now, t0.maghrib) ? 'fri' : null;
    if (wd === 4) return now >= hToDate(now, t0.maghrib) ? 'eve' : null;
    return null;
  };

  /* ---------- Kad Utama ---------- */
  function renderHome() {
    const el = $('#jumHome'); if (!el) return;
    const w = isFriWindow(); if (!w) { el.classList.add('hidden'); return; }
    const j = nextJumaat(), f = fav(), c = chk()[fkey(j.d)] || {}, n = SUNNAH.filter(s => c[s.k]).length;
    el.classList.remove('hidden');
    el.innerHTML = `<span class="jum-ic">🕌</span><span class="grow"><b>${t(w === 'eve' ? 'jm.eve' : 'jm.today')}</b><small>${t('jm.at', { t: fmtAt(j.at) })}${f ? ' · ' + esc(f.n) : ''} · ${t('jm.sunnahN', { n, m: SUNNAH.length })}</small></span>${ico('chevron-right', 'chev')}`;
  }

  /* ---------- Halaman ---------- */
  function render() {
    const j = nextJumaat(), now = new Date(), live = now >= j.at;
    $('#jmHero').innerHTML = `<small>${j.d.toLocaleDateString(L ? 'en-GB' : 'ms-MY', { weekday: 'long', day: 'numeric', month: 'long' })}</small>
      <h2>${live ? t('jm.now') : t('jm.in')}</h2>${live ? '' : `<div class="rm-cd" id="jmCd">${hms(j.at - now)}</div>`}<p>${t('jm.at', { t: fmtAt(j.at) })} · ${esc(WZ.solat.zoneText())}</p>`;
    const c = chk()[fkey(j.d)] || {};
    $('#jmList').innerHTML = SUNNAH.map(s => `<label class="jm-i ${c[s.k] ? 'on' : ''}"><input type="checkbox" data-k="${s.k}" ${c[s.k] ? 'checked' : ''}><span class="chip-ic g-green">${ico(s.ic)}</span><span class="grow">${esc(s.t[L])}</span>${s.go ? `<button class="btn soft sm" data-go-r="${s.go}">${t('jm.open')}</button>` : ''}</label>`).join('');
    const sv = store.get('jum_sel', {}), k = WZ.dkey(new Date());
    $('#jmSelN').textContent = num(sv[k] || 0);
    if (LN) $('#jmRem').checked = !!settings.jumNotif;
    else if (WZ.ics && !$('#jmIcs')) {
      $('#jmRemBox').innerHTML = `<div class="card-title">${ico('bell')} ${t('jm.remind')}</div><small class="muted">${t('jm.remindS')}</small><button class="btn soft block" id="jmIcs" style="margin-top:10px">${ico('calendar')}<span>${t('ics.add')}</span></button><small class="muted">${t('ics.webNote')}</small>`;
      $('#jmIcs').onclick = () => { const z = zohorAt(fri()), at = new Date(z.getTime() - 60 * 60e3), f = fav();
        WZ.ics.weekly([{ title: t('jm.nT'), desc: t('jm.nB', { t: fmtAt(z) }) + (f ? ` · ${f.n}` : ''), time: `${at.getHours()}:${String(at.getMinutes()).padStart(2, '0')}`, days: [5] }], 'wazlee-jumaat.ics'); };
    }
    renderFav(); renderMasjid(store.get('jum_m', null));
  }
  $('#jmList').addEventListener('change', e => {
    const i = e.target.closest('[data-k]'); if (!i) return;
    const all = chk(), key = fkey(nextJumaat().d); all[key] = all[key] || {}; all[key][i.dataset.k] = i.checked;
    const keys = Object.keys(all).sort(); while (keys.length > 12) delete all[keys.shift()];
    store.set('jum_chk', all); i.closest('.jm-i').classList.toggle('on', i.checked); vibrate(15); renderHome();
  });
  $('#jmList').addEventListener('click', e => { const b = e.target.closest('[data-go-r]'); if (b) { e.preventDefault(); WZ.widget.goRoute(b.dataset.goR); } });
  $('#jmSel').onclick = () => { const sv = store.get('jum_sel', {}), k = WZ.dkey(new Date()); sv[k] = (sv[k] || 0) + 1; const ks = Object.keys(sv).sort(); while (ks.length > 30) delete sv[ks.shift()]; store.set('jum_sel', sv); $('#jmSelN').textContent = num(sv[k]); vibrate(12); };

  /* ---------- Masjid ---------- */
  function renderFav() {
    const f = fav();
    $('#jmFav').innerHTML = f ? `<div class="jm-fav"><span class="chip-ic g-green">${ico('star')}</span><span class="grow"><b>${esc(f.n)}</b><small>${t('jm.fav')}</small></span><button class="btn sm" data-dir="${f.lat},${f.lon}">${ico('navigation')}${t('jm.dir')}</button></div>` : `<p class="muted small">${t('jm.noFav')}</p>`;
  }
  function renderMasjid(c) {
    if (!c || !c.list) { $('#jmMasjid').innerHTML = `<button class="btn soft block" id="jmFind">${ico('moon-star')}<span>${t('jm.find')}</span></button>`; return; }
    const f = fav();
    $('#jmMasjid').innerHTML = c.list.length ? c.list.map((m, i) => `<div class="jm-m"><span class="grow"><b>${esc(m.n)}</b><small>${num(m.km, m.km < 10 ? 1 : 0)} km</small></span>
      <button class="icbtn ${f && f.n === m.n ? 'solid' : ''}" data-fav="${i}" aria-label="fav">${ico('star')}</button><button class="icbtn" data-dir="${m.lat},${m.lon}" aria-label="directions">${ico('navigation')}</button></div>`).join('')
      + `<button class="btn soft sm" id="jmFind" style="margin-top:8px">${ico('refresh-cw')}<span>${t('jm.refresh')}</span></button>` : `<p class="muted small">${t('jm.none')}</p><button class="btn soft sm" id="jmFind">${t('jm.refresh')}</button>`;
  }
  async function findMasjid() {
    $('#jmMasjid').innerHTML = `<p class="muted center">${t('jm.searching')}</p>`;
    const { lat, lng } = WZ.loc, dd = 0.09, vb = `${lng - dd},${lat + dd},${lng + dd},${lat - dd}`;
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=40&bounded=1&viewbox=${vb}&q=masjid&accept-language=${LANG}`, { headers: WZ_HDR });
      const res = await r.json(), seen = new Set();
      const list = res.map(p => ({ n: (p.name || p.display_name.split(',')[0]).trim(), lat: +p.lat, lon: +p.lon, km: Prayer.haversine(lat, lng, +p.lat, +p.lon) }))
        .filter(m => /masjid|mosque/i.test(m.n) && !seen.has(m.n) && seen.add(m.n)).sort((a, b) => a.km - b.km).slice(0, 8);
      const c = { at: Date.now(), list }; store.set('jum_m', c); renderMasjid(c);
    } catch { $('#jmMasjid').innerHTML = `<p class="muted small">${t('err.generic')}</p><button class="btn soft sm" id="jmFind">${t('jm.refresh')}</button>`; }
  }
  $('#pg-jumaat').addEventListener('click', e => {
    if (e.target.closest('#jmFind')) return findMasjid();
    const d = e.target.closest('[data-dir]'); if (d) return openExternal(`https://www.google.com/maps/dir/?api=1&destination=${d.dataset.dir}&travelmode=driving`);
    const f = e.target.closest('[data-fav]'); if (f) { const m = store.get('jum_m', {}).list[+f.dataset.fav]; store.set('jum_fav', fav() && fav().n === m.n ? null : m); renderFav(); renderMasjid(store.get('jum_m', null)); renderHome(); remind(false); toast(t('jm.favSet')); }
  });
  if ($('#jmRem')) $('#jmRem').onchange = e => { settings.jumNotif = e.target.checked; saveSettings(); remind(true); };

  /* ---------- Peringatan Jumaat (Android) ---------- */
  async function remind(fromToggle) {
    if (!LN) return;
    try {
      const pend = await LN.getPending(); const old = pend.notifications.filter(n => n.id >= 7200 && n.id < 7220).map(n => ({ id: n.id }));
      if (old.length) await LN.cancel({ notifications: old });
      if (!settings.jumNotif) return;
      if (fromToggle) { const p = await LN.requestPermissions(); if (p.display !== 'granted') return; }
      const list = [], now = new Date(), f = fav();
      for (let i = 0; i < 4; i++) {
        const d = new Date(fri(now).getTime() + i * 7 * 864e5), z = zohorAt(d), at = new Date(z.getTime() - 60 * 60e3);
        if (at > now) list.push({ id: 7200 + i, title: t('jm.nT'), body: t('jm.nB', { t: fmtAt(z) }) + (f ? ` · ${f.n}` : ''), schedule: { at, allowWhileIdle: true }, extra: { route: 'jumaat' } });
      }
      if (list.length) await LN.schedule({ notifications: list });
      if (fromToggle) toast(t('jm.nOn'));
    } catch {}
  }

  setInterval(() => {
    if ($('#pg-jumaat').classList.contains('active')) { const el = $('#jmCd'), j = nextJumaat(); if (el) el.textContent = hms(j.at - new Date()); }
  }, 1000);
  on('show:jumaat', () => { render(); const c = store.get('jum_m', null); if (!c || Date.now() - c.at > 7 * 864e5) findMasjid(); });
  on('show:home', renderHome); on('times', renderHome);
  setTimeout(() => { renderHome(); remind(false); }, 3000);
})();
