/* Musafir: jamak & qasar ikut jarak (rumah → destinasi / lokasi semasa), tempoh, waktu jamak & panduan */
(() => {
  const { $, store, on, toast, esc, fmtH, num } = WZ;
  const L = LANG === 'en' ? 1 : 0;
  const AWAY_KM = 3; // anggaran keluar sempadan kariah
  const st = () => Object.assign({ thr: 91, home: null, dest: null, trip: null }, store.get('musafir', {}));
  const save = s => store.set('musafir', s);
  const km = (a, b) => Prayer.haversine(a.lat, a.lng, b.lat, b.lng);
  const fk = n => num(n, n < 10 ? 1 : 0);

  async function roadKm(a, b) {
    try {
      const r = await fetch(`https://router.project-osrm.org/route/v1/driving/${a.lng},${a.lat};${b.lng},${b.lat}?overview=false`, { headers: WZ_HDR });
      const j = await r.json(); return j.routes && j.routes[0] ? j.routes[0].distance / 1000 : null;
    } catch { return null; }
  }

  /* Status: layak jika jarak perjalanan >= had dan sudah keluar kariah */
  function status() {
    const s = st(), loc = WZ.loc;
    if (!s.home) return { s, code: 'noHome' };
    const nowKm = loc ? km(s.home, loc) : 0;
    const destKm = s.dest ? (s.dest.road || s.dest.line) : 0;
    const tripKm = Math.max(destKm, nowKm);
    const far = tripKm >= s.thr, away = nowKm > AWAY_KM;
    const days = s.trip ? Math.floor((Date.now() - s.trip) / 864e5) + 1 : 0;
    const code = !far ? 'short' : !away ? 'planOk' : days > 3 ? 'long' : 'ok';
    return { s, code, nowKm, tripKm, days, eligible: far && away };
  }

  function renderBanner() {
    const r = status(), b = $('#musBanner'); if (!b) return;
    b.classList.toggle('hidden', !r.eligible);
    if (r.eligible) $('#musBannerS').textContent = t('mu.bannerS', { km: fk(r.nowKm) });
  }

  function render() {
    const r = status(), s = r.s;
    const cls = { ok: 'ok', planOk: 'ok', long: 'warn', short: 'no', noHome: 'no' }[r.code];
    const ic = { ok: 'circle-check', planOk: 'circle-check', long: 'info', short: 'circle-x', noHome: 'house' }[r.code];
    $('#muStatus').className = 'card mus-status ' + cls;
    $('#muStatus').innerHTML = `<div class="mus-top">${ico(ic)}<b>${t('mu.st.' + r.code)}</b></div>` + (s.home ? `
      <div class="mus-nums"><div><small>${t('mu.now')}</small><b>${fk(r.nowKm)} km</b></div><div><small>${t('mu.tripKm')}</small><b>${fk(r.tripKm)} km</b></div><div><small>&nbsp;</small><b class="muted">${t('mu.need', { n: s.thr })}</b></div></div>
      <div class="mus-bar"><span style="width:${Math.min(100, r.tripKm / s.thr * 100)}%"></span></div>` : '');
    $('#muHomeTxt').textContent = s.home ? `${s.home.name} (${s.home.lat.toFixed(4)}, ${s.home.lng.toFixed(4)})` : t('mu.homeNone');
    $('#muDestTxt').innerHTML = s.dest ? `<div class="mus-dest"><span class="chip-ic g-teal">${ico('map-pin')}</span><span class="grow"><b>${esc(s.dest.name)}</b>
      <small>${s.dest.road ? `${t('mu.road')}: ${fk(s.dest.road)} km · ` : ''}${t('mu.line')}: ${fk(s.dest.line)} km${s.dest.road ? '' : ' · ' + t('mu.roadNA')}</small></span>
      <button class="icbtn" id="muClr" aria-label="${t('mu.clearDest')}">${ico('x')}</button></div>` : '';
    $('#muTrip').innerHTML = s.trip
      ? `<p><b>${t('mu.day', { n: r.days, d: new Date(s.trip).toLocaleDateString(L ? 'en-GB' : 'ms-MY', { day: 'numeric', month: 'short' }) })}</b></p><p class="muted small">${t('mu.dayNote')}</p><button class="btn soft block" id="muEnd">${ico('circle-x')}<span>${t('mu.end')}</span></button>`
      : `<p class="muted small">${t('mu.noTrip')}</p><button class="btn block" id="muStart">${ico('play')}<span>${t('mu.start')}</span></button>`;
    $('#muThr').innerHTML = [91, 89, 81].map(n => `<option value="${n}" ${s.thr === n ? 'selected' : ''}>${t('mu.thr' + n)}</option>`).join('');
    renderWin(); renderBanner();
  }

  function renderWin() {
    let d; try { d = WZ.solat.getDay(new Date()).t; } catch { $('#muWin').innerHTML = `<p class="muted small">${t('mu.noLoc')}</p>`; return; }
    const N = k => WZ.solat.META[k].n, rng = (a, b) => `${fmtH(a)} – ${fmtH(b)}`;
    let subuhEsok = d.subuh + 24; try { const x = new Date(); x.setDate(x.getDate() + 1); subuhEsok = WZ.solat.getDay(x).t.subuh + 24; } catch {}
    const row = (p1, p2, a1, b1, a2, b2) => `<div class="mus-win"><b>${N(p1)} + ${N(p2)}</b>
      <div><span class="tag">${t('mu.taqdim')}</span> ${t('mu.inTime', { p: N(p1) })}<small>${rng(a1, b1)}</small></div>
      <div><span class="tag alt">${t('mu.takhir')}</span> ${t('mu.inTime', { p: N(p2) })}<small>${rng(a2, b2)}</small></div></div>`;
    $('#muWin').innerHTML = row('zohor', 'asar', d.zohor, d.asar, d.asar, d.maghrib) + row('maghrib', 'isyak', d.maghrib, d.isyak, d.isyak, subuhEsok);
  }

  /* ---------- Panduan (mazhab Syafi'i) ---------- */
  const G = [
    { ic: 'car', t: ['Syarat qasar', 'Conditions for shortening (qasar)'], b: [
      ['Perjalanan sekurang-kurangnya dua marhalah (lihat had jarak di atas).', 'The journey is at least two marhalah (see threshold above).'],
      ['Tujuan perjalanan harus — bukan untuk maksiat.', 'The purpose is permissible — not for sin.'],
      ['Tahu destinasi yang hendak dituju.', 'You know where you are heading.'],
      ['Sudah keluar dari sempadan kariah/kampung/bandar tempat tinggal.', 'You have left the boundary of your locality.'],
      ['Berniat qasar ketika takbiratul ihram.', 'Intend to shorten at the opening takbir.'],
      ['Tidak bermakmum dengan imam yang solat penuh (mukim) — jika ya, wajib solat penuh.', 'Do not follow an imam praying in full (a resident) — if you do, pray in full.'],
      ['Hanya Zohor, Asar & Isyak dipendekkan kepada 2 rakaat. Subuh (2) & Maghrib (3) tidak diqasar.', 'Only Zuhr, Asr & Isha become 2 rak\'ahs. Fajr (2) & Maghrib (3) are not shortened.']] },
    { ic: 'sunrise', t: ['Syarat jamak taqdim', 'Conditions for combining early (taqdim)'], b: [
      ['Dilakukan dalam waktu solat pertama (Zohor atau Maghrib).', 'Done within the first prayer\'s time (Zuhr or Maghrib).'],
      ['Tertib: solat pertama dahulu, kemudian solat kedua.', 'In order: the first prayer, then the second.'],
      ['Niat jamak dalam solat pertama — sebaik-baiknya ketika takbiratul ihram, dan sebelum salam.', 'Intend to combine during the first prayer — ideally at the opening takbir, and before the salam.'],
      ['Berturut-turut (muwalat) — tiada selang yang lama antara dua solat.', 'Back-to-back — no long gap between the two prayers.'],
      ['Masih musafir sehingga mula solat kedua.', 'Still travelling until you begin the second prayer.']] },
    { ic: 'sunset', t: ['Syarat jamak takhir', 'Conditions for combining late (takhir)'], b: [
      ['Berniat menangguhkan solat pertama ketika masih dalam waktunya (cth: "Sahaja aku takhirkan Zohor untuk dijamak dengan Asar").', 'Intend to delay the first prayer while its time is still in (e.g. "I delay Zuhr to combine it with Asr").'],
      ['Dilakukan dalam waktu solat kedua (Asar atau Isyak); boleh mula dengan mana-mana, disunatkan ikut tertib.', 'Done within the second prayer\'s time (Asr or Isha); either may come first, keeping order is recommended.'],
      ['Masih musafir sehingga selesai kedua-dua solat.', 'Still travelling until both prayers are complete.']] },
    { ic: 'book-heart', t: ['Lafaz niat (rumi)', 'Intentions (transliterated meaning)'], b: [
      ['Zohor (taqdim): "Sahaja aku solat fardhu Zohor dua rakaat qasar, jamak taqdim dengan Asar, tunai kerana Allah Taala."', 'Zuhr (taqdim): "I intend to pray the obligatory Zuhr, two rak\'ahs shortened, combined early with Asr, for the sake of Allah."'],
      ['Asar (taqdim): "Sahaja aku solat fardhu Asar dua rakaat qasar, jamak taqdim dengan Zohor, tunai kerana Allah Taala."', 'Asr (taqdim): "I intend to pray the obligatory Asr, two rak\'ahs shortened, combined early with Zuhr, for the sake of Allah."'],
      ['Zohor (takhir): "Sahaja aku solat fardhu Zohor dua rakaat qasar, jamak takhir dengan Asar, kerana Allah Taala."', 'Zuhr (takhir): "I intend to pray the obligatory Zuhr, two rak\'ahs shortened, combined late with Asr, for the sake of Allah."'],
      ['Maghrib (taqdim): "Sahaja aku solat fardhu Maghrib tiga rakaat, jamak taqdim dengan Isyak, tunai kerana Allah Taala."', 'Maghrib (taqdim): "I intend to pray the obligatory Maghrib, three rak\'ahs, combined early with Isha, for the sake of Allah."'],
      ['Isyak (taqdim): "Sahaja aku solat fardhu Isyak dua rakaat qasar, jamak taqdim dengan Maghrib, tunai kerana Allah Taala."', 'Isha (taqdim): "I intend to pray the obligatory Isha, two rak\'ahs shortened, combined early with Maghrib, for the sake of Allah."'],
      ['Niat sebenar di dalam hati; lafaz hanya membantu.', 'The real intention is in the heart; saying it only helps.']] },
    { ic: 'calendar', t: ['Tempoh & bila berakhir', 'Duration & when it ends'], b: [
      ['Rukhsah bermula selepas keluar sempadan kariah, bukan sebelum bertolak.', 'Concessions begin after leaving your locality, not before departing.'],
      ['Jika berniat menetap 4 hari penuh atau lebih di destinasi (tidak termasuk hari sampai & keluar), jadi mukim sebaik tiba.', 'If you intend to stay 4 full days or more (excluding arrival & departure days), you are resident on arrival.'],
      ['Jika urusan tidak pasti tamat, rukhsah berterusan sehingga 18 hari.', 'If unsure when your business ends, concessions last up to 18 days.'],
      ['Tamat apabila kembali masuk sempadan kariah tempat tinggal.', 'It ends once you re-enter your home locality.'],
      ['Solat yang tertinggal semasa musafir boleh diqada secara qasar jika masih musafir.', 'Prayers missed while travelling may be made up shortened if still travelling.']] }
  ];
  $('#muGuide').innerHTML = G.map((g, i) => `<details class="card mus-g" ${i === 0 ? 'open' : ''}><summary><span class="chip-ic g-teal">${ico(g.ic)}</span><b>${g.t[L]}</b>${ico('chevron-right', 'chev')}</summary><ol>${g.b.map(x => `<li>${esc(x[L])}</li>`).join('')}</ol></details>`).join('');

  /* ---------- Tindakan ---------- */
  $('#muSetHome').onclick = async () => {
    try { await WZ.refreshLocation(true); } catch {}
    const l = WZ.loc; if (!l) return toast(t('mu.noLoc'));
    const s = st(); s.home = { lat: l.lat, lng: l.lng, name: l.name }; save(s);
    if (s.dest) { s.dest.line = km(s.home, s.dest); s.dest.road = await roadKm(s.home, s.dest); save(s); }
    toast(t('mu.homeSet')); render();
  };
  async function search() {
    const q = $('#muQ').value.trim(); if (!q) return;
    $('#muRes').innerHTML = `<p class="muted small">${t('mu.searching')}</p>`;
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=6&accept-language=${LANG}&countrycodes=my,sg,bn,th,id&` + new URLSearchParams({ q }), { headers: WZ_HDR });
      const res = await r.json();
      $('#muRes').innerHTML = res.length ? res.map((p, i) => `<button class="mus-r" data-i="${i}">${ico('map-pin')}<span>${esc(p.display_name)}</span></button>`).join('') : `<p class="muted small">${t('mu.noRes')}</p>`;
      $('#muRes').onclick = async e => {
        const b = e.target.closest('[data-i]'); if (!b) return; const p = res[+b.dataset.i];
        const s = st(); s.dest = { lat: +p.lat, lng: +p.lon, name: p.display_name.split(',').slice(0, 2).join(','), line: 0, road: null };
        $('#muRes').innerHTML = `<p class="muted small">${t('mu.searching')}</p>`;
        if (s.home) { s.dest.line = km(s.home, s.dest); s.dest.road = await roadKm(s.home, s.dest); }
        save(s); $('#muRes').innerHTML = ''; $('#muQ').value = ''; render();
      };
    } catch { $('#muRes').innerHTML = `<p class="muted small">${t('err.generic')}</p>`; }
  }
  $('#muGo').onclick = search;
  $('#muQ').addEventListener('keydown', e => { if (e.key === 'Enter') search(); });
  $('#muDestTxt').addEventListener('click', e => { if (e.target.closest('#muClr')) { const s = st(); s.dest = null; save(s); render(); } });
  $('#muTrip').addEventListener('click', e => {
    const s = st();
    if (e.target.closest('#muStart')) { s.trip = Date.now(); save(s); render(); }
    if (e.target.closest('#muEnd')) { s.trip = null; save(s); render(); }
  });
  $('#muThr').addEventListener('change', e => { const s = st(); s.thr = +e.target.value; save(s); render(); });

  on('show:musafir', render);
  on('show:home', renderBanner);
  on('loc', renderBanner);
  setTimeout(renderBanner, 1500);
  WZ.musafir = { status, render };
})();
