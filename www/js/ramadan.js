/* Mod Ramadan: imsak/berbuka, penjejak puasa & tarawih, puasa ganti, niat & doa, peringatan sahur */
(() => {
  const { $, P, store, on, toast, esc, settings, saveSettings, fmtH, hToDate } = WZ;
  const LN = P.LocalNotifications;
  const L = LANG === 'en' ? 1 : 0;
  const H = () => WZ.hijri;
  const DOAS = [
    { k: 'niat', t: ['Niat Puasa Ramadan', 'Intention for Ramadan fast'],
      a: 'نَوَيْتُ صَوْمَ غَدٍ عَنْ أَدَاءِ فَرْضِ شَهْرِ رَمَضَانَ هٰذِهِ السَّنَةِ لِلّٰهِ تَعَالَى',
      r: "Nawaitu sauma ghadin 'an ada'i fardhi syahri Ramadhana hazihis sanati lillahi ta'ala.",
      m: ['Sahaja aku berpuasa esok hari bagi menunaikan fardhu bulan Ramadan tahun ini kerana Allah Taala.', 'I intend to fast tomorrow to fulfil the obligation of Ramadan this year for the sake of Allah.'] },
    { k: 'buka1', t: ['Doa Berbuka Puasa', 'Du\'a when breaking fast'],
      a: 'ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوْقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللّٰهُ',
      r: "Zahabaz-zama'u wabtallatil-'uruqu wa thabatal-ajru insya-Allah.",
      m: ['Telah hilang dahaga, telah basah urat-urat dan telah tetap pahala, insya-Allah. (HR Abu Daud)', 'The thirst has gone, the veins are moistened and the reward is assured, if Allah wills. (Abu Dawud)'] },
    { k: 'buka2', t: ['Doa Berbuka (lazim di Malaysia)', 'Du\'a when breaking fast (common)'],
      a: 'اَللّٰهُمَّ لَكَ صُمْتُ وَبِكَ آمَنْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ بِرَحْمَتِكَ يَا أَرْحَمَ الرَّاحِمِيْنَ',
      r: "Allahumma laka sumtu wa bika amantu wa 'ala rizqika aftartu birahmatika ya arhamar-rahimin.",
      m: ['Ya Allah, kerana-Mu aku berpuasa, kepada-Mu aku beriman dan dengan rezeki-Mu aku berbuka, dengan rahmat-Mu wahai Yang Maha Penyayang.', 'O Allah, for You I fasted, in You I believe and with Your provision I break my fast, by Your mercy, O Most Merciful.'] },
    { k: 'qadar', t: ['Doa Lailatul Qadar', 'Du\'a for Laylat al-Qadr'],
      a: 'اَللّٰهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّيْ',
      r: "Allahumma innaka 'afuwwun tuhibbul-'afwa fa'fu 'anni.",
      m: ['Ya Allah, sesungguhnya Engkau Maha Pemaaf, suka memaafkan, maka maafkanlah aku. (HR Tirmizi)', 'O Allah, You are Most Forgiving and love forgiveness, so forgive me. (Tirmidhi)'] }
  ];

  /* ---------- Keadaan ---------- */
  function state(now = new Date()) {
    const h = H().parts(now); if (!h) return null;
    const inR = h.m === 9;
    let ry = h.m >= 9 && !inR ? h.y + 1 : h.y; // Ramadan seterusnya
    const days = H().monthDays(inR ? h.y : ry, 9);
    return { h, inR, ry: inR ? h.y : ry, days, day: inR ? h.d : 0 };
  }
  const trk = y => Object.assign({ f: {}, t: {} }, store.get('ram_' + y, {}));
  const saveTrk = (y, v) => store.set('ram_' + y, v);
  const qada = () => Object.assign({ owed: 0, done: 0 }, store.get('qada', {}));

  /* Kiraan mundur imsak/berbuka */
  function next(now = new Date()) {
    const d0 = WZ.solat.getDay(now).t, im = hToDate(now, d0.imsak), mg = hToDate(now, d0.maghrib);
    if (now < im) return { k: 'imsak', at: im };
    if (now < mg) return { k: 'buka', at: mg };
    const tm = new Date(now); tm.setDate(tm.getDate() + 1);
    return { k: 'imsak', at: hToDate(tm, WZ.solat.getDay(tm).t.imsak) };
  }
  const hms = ms => { const s = Math.max(0, Math.floor(ms / 1000)); return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map(x => String(x).padStart(2, '0')).join(':'); };

  /* ---------- Kad Utama ---------- */
  function renderHome() {
    const el = $('#ramHome'); if (!el) return;
    const s = state(); if (!s) return;
    const pre = !s.inR && s.days.length && (s.days[0].date - new Date()) / 864e5 <= 7 && s.days[0].date > new Date();
    if (!s.inR && !pre) { el.classList.add('hidden'); return; }
    el.classList.remove('hidden');
    if (pre) { const n = Math.ceil((H().atNoon(s.days[0].date) - H().atNoon(new Date())) / 864e5); el.innerHTML = `<span class="ram-ic">🌙</span><span class="grow"><b>${t('rm.soon', { n })}</b><small>${t('rm.soonS')}</small></span>${ico('chevron-right', 'chev')}`; return; }
    const n = next();
    el.innerHTML = `<span class="ram-ic">🌙</span><span class="grow"><small>${t('rm.dayN', { n: s.day, y: s.ry })}</small><b>${t(n.k === 'imsak' ? 'rm.toImsak' : 'rm.toBuka')} <span class="ram-cd">${hms(n.at - new Date())}</span></b><small>${t(n.k === 'imsak' ? 'rm.imsakAt' : 'rm.bukaAt', { t: fmtH(n.at.getHours() + n.at.getMinutes() / 60 + n.at.getSeconds() / 3600 + n.at.getMilliseconds() / 3600e3) })}</small></span>${ico('chevron-right', 'chev')}`;
  }

  /* ---------- Halaman ---------- */
  function render() {
    const s = state(); if (!s) return;
    const n = next(), now = new Date();
    if (s.inR) {
      $('#rmHero').innerHTML = `<small>${t('rm.dayN', { n: s.day, y: s.ry })}</small><h2>${t(n.k === 'imsak' ? 'rm.toImsak' : 'rm.toBuka')}</h2><div class="rm-cd" id="rmCd">${hms(n.at - now)}</div>
        <div class="rm-times">${['imsak', 'subuh', 'maghrib', 'isyak'].map(k => `<div><small>${WZ.solat.META[k] ? WZ.solat.META[k].n : t('rm.imsak')}</small><b>${fmtH(WZ.solat.getDay(now).t[k])}</b></div>`).join('')}</div>`;
    } else {
      const d0 = s.days[0], nd = d0 ? Math.round((H().atNoon(d0.date) - H().atNoon(now)) / 864e5) : null;
      $('#rmHero').innerHTML = `<small>${t('rm.next', { y: s.ry })}</small><h2>${nd != null ? t('rm.inDays', { n: nd }) : ''}</h2><p>${d0 ? d0.date.toLocaleDateString(L ? 'en-GB' : 'ms-MY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''}</p><small>${t('rm.estNote')}</small>`;
    }
    // penjejak
    const tr = trk(s.ry), nd = s.days.length || 30;
    const cell = (kind, i) => { const v = tr[kind][i]; return `<button class="rm-d ${kind === 'f' ? (v === 1 ? 'ok' : v === 2 ? 'no' : '') : (v ? 'ok' : '')} ${s.inR && i === s.day ? 'now' : ''}" data-k="${kind}" data-d="${i}" ${s.inR && i > s.day ? 'disabled' : ''}>${i}</button>`; };
    $('#rmFast').innerHTML = Array.from({ length: nd }, (_, i) => cell('f', i + 1)).join('');
    $('#rmTar').innerHTML = Array.from({ length: nd }, (_, i) => cell('t', i + 1)).join('');
    const fOk = Object.values(tr.f).filter(v => v === 1).length, fNo = Object.values(tr.f).filter(v => v === 2).length, tOk = Object.values(tr.t).filter(Boolean).length;
    $('#rmSum').innerHTML = `<div><b>${fOk}</b><small>${t('rm.fasted')}</small></div><div><b>${fNo}</b><small>${t('rm.missed')}</small></div><div><b>${tOk}</b><small>${t('rm.tarawihN')}</small></div>`;
    // puasa ganti
    const q = qada(), rem = Math.max(0, q.owed - q.done);
    $('#rmQada').innerHTML = `<div class="rm-q"><div><small>${t('rm.qOwed')}</small><b>${q.owed}</b><span><button class="icbtn" data-q="owed:-1">${ico('minus')}</button><button class="icbtn" data-q="owed:1">${ico('plus')}</button></span></div>
      <div><small>${t('rm.qDone')}</small><b>${q.done}</b><span><button class="icbtn" data-q="done:-1">${ico('minus')}</button><button class="icbtn solid" data-q="done:1">${ico('plus')}</button></span></div>
      <div class="rm-qr ${rem ? '' : 'ok'}"><small>${t('rm.qLeft')}</small><b>${rem}</b></div></div>`;
    // doa
    $('#rmDoa').innerHTML = DOAS.map((d, i) => `<div class="card doa-item ${i < 2 ? 'open' : ''}"><button class="doa-toggle"><span class="chip-ic g-indigo">${ico('book-heart')}</span><b>${esc(d.t[L])}</b>${ico('chevron-right', 'chev')}</button>
      <div class="doa-body"><p class="arab">${d.a}</p><p class="rumi">${esc(d.r)}</p><p class="maksud">${esc(d.m[L])}</p>
      <div class="row-btns end"><button class="btn soft sm" data-img="${i}">${ico('image')}${t('img.share')}</button></div></div></div>`).join('');
    // jadual
    $('#rmTable').innerHTML = `<div class="rm-tr rm-th"><span>${t('rm.day')}</span><span>${t('rm.date')}</span><span>${t('rm.imsak')}</span><span>${WZ.solat.META.maghrib.n}</span></div>` + s.days.map(x => {
      const tt = WZ.solat.getDay(x.date).t;
      return `<div class="rm-tr ${s.inR && x.h.d === s.day ? 'now' : ''}"><span>${x.h.d}</span><span>${x.date.toLocaleDateString(L ? 'en-GB' : 'ms-MY', { day: 'numeric', month: 'short' })}</span><span>${fmtH(tt.imsak)}</span><span>${fmtH(tt.maghrib)}</span></div>`;
    }).join('');
    $('#rmSahur').checked = !!settings.sahurNotif;
    $('#rmSahurBox').classList.toggle('hidden', !LN);
  }
  $('#rmTrack').addEventListener('click', e => {
    const b = e.target.closest('[data-k]'); if (!b) return;
    const s = state(), tr = trk(s.ry), k = b.dataset.k, d = +b.dataset.d;
    if (k === 'f') { const v = tr.f[d] || 0, nv = (v + 1) % 3, q = qada();
      if (v === 2) q.owed = Math.max(0, q.owed - 1); if (nv === 2) q.owed++; store.set('qada', q);
      if (nv) tr.f[d] = nv; else delete tr.f[d]; }
    else { if (tr.t[d]) delete tr.t[d]; else tr.t[d] = 1; }
    saveTrk(s.ry, tr); render();
  });
  $('#rmQada').addEventListener('click', e => { const b = e.target.closest('[data-q]'); if (!b) return; const [k, v] = b.dataset.q.split(':'), q = qada(); q[k] = Math.max(0, q[k] + +v); store.set('qada', q); render(); });
  $('#rmDoa').addEventListener('click', e => {
    const im = e.target.closest('[data-img]'); if (im) { const d = DOAS[+im.dataset.img]; WZ.shareImage && WZ.shareImage({ title: d.t[L], arab: d.a, rumi: d.r, text: d.m[L] }); return; }
    const tg = e.target.closest('.doa-toggle'); if (tg) tg.parentElement.classList.toggle('open');
  });
  $('#rmSahur').onchange = e => { settings.sahurNotif = e.target.checked; saveSettings(); sahur(true); };

  /* ---------- Peringatan sahur (Android) ---------- */
  async function sahur(fromToggle) {
    if (!LN) return;
    try {
      const pend = await LN.getPending(); const old = pend.notifications.filter(n => n.id >= 7000 && n.id < 7100).map(n => ({ id: n.id }));
      if (old.length) await LN.cancel({ notifications: old });
      if (!settings.sahurNotif) return;
      if (fromToggle) { const p = await LN.requestPermissions(); if (p.display !== 'granted') return; }
      const list = [], now = new Date(); let id = 7000;
      for (let i = 0; i < 14; i++) {
        const d = new Date(now); d.setDate(d.getDate() + i); const h = H().parts(d); if (!h || h.m !== 9) continue;
        const at = new Date(hToDate(d, WZ.solat.getDay(d).t.imsak).getTime() - (+settings.sahurMin || 60) * 60e3);
        if (at > now) list.push({ id: id++, title: t('rm.nSahurT'), body: t('rm.nSahurB', { t: fmtH(WZ.solat.getDay(d).t.imsak) }), schedule: { at, allowWhileIdle: true }, extra: { route: 'ramadan' } });
      }
      if (list.length) await LN.schedule({ notifications: list });
      if (fromToggle) toast(t('rm.nOn'));
    } catch {}
  }

  let tick = null;
  const loop = () => { clearInterval(tick); tick = setInterval(() => {
    if ($('#pg-ramadan').classList.contains('active')) { const n = next(), el = $('#rmCd'); if (el) el.textContent = hms(n.at - new Date()); if (n.at - new Date() < 1000) render(); }
    if ($('#pg-home').classList.contains('active')) renderHome();
  }, 1000); };
  on('show:ramadan', render);
  on('show:home', renderHome);
  on('times', renderHome);
  setTimeout(() => { renderHome(); sahur(false); loop(); }, 2500);
  WZ.ramadan = { state, DOAS };
})();
