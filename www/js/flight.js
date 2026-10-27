/* Penerbangan: cari no. penerbangan — kedudukan langsung, laluan, kemajuan & anggaran tiba (adsb.lol, percuma)
   + jadual rasmi berlepas/tiba, status, terminal & gate (AeroDataBox, pilihan — kunci RapidAPI pengguna sendiri) */
(() => {
  const { $, store, on, toast, esc, num, go } = WZ;
  const L = LANG === 'en' ? 1 : 0;
  /* IATA → [ICAO, nama] */
  const AL = {
    MH: ['MAS', 'Malaysia Airlines'], AK: ['AXM', 'AirAsia'], D7: ['XAX', 'AirAsia X'], OD: ['MXD', 'Batik Air Malaysia'], FY: ['FFM', 'Firefly'],
    QZ: ['AWQ', 'Indonesia AirAsia'], FD: ['AIQ', 'Thai AirAsia'], Z2: ['APG', 'Philippines AirAsia'], XJ: ['TAX', 'Thai AirAsia X'],
    SQ: ['SIA', 'Singapore Airlines'], TR: ['TGW', 'Scoot'], '3K': ['JSA', 'Jetstar Asia'], GA: ['GIA', 'Garuda Indonesia'], ID: ['BTK', 'Batik Air'],
    JT: ['LNI', 'Lion Air'], IU: ['SJV', 'Super Air Jet'], QG: ['CTV', 'Citilink'], TG: ['THA', 'Thai Airways'], SL: ['TLM', 'Thai Lion Air'], VZ: ['TVJ', 'Thai Vietjet'],
    PG: ['BKP', 'Bangkok Airways'], VJ: ['VJC', 'VietJet Air'], VN: ['HVN', 'Vietnam Airlines'], PR: ['PAL', 'Philippine Airlines'], '5J': ['CEB', 'Cebu Pacific'],
    BI: ['RBA', 'Royal Brunei'], '8M': ['MMA', 'Myanmar Airways'], CX: ['CPA', 'Cathay Pacific'], UO: ['HKE', 'HK Express'], CI: ['CAL', 'China Airlines'],
    BR: ['EVA', 'EVA Air'], CZ: ['CSN', 'China Southern'], MU: ['CES', 'China Eastern'], CA: ['CCA', 'Air China'], HU: ['CHH', 'Hainan Airlines'], MF: ['CXA', 'XiamenAir'],
    KE: ['KAL', 'Korean Air'], OZ: ['AAR', 'Asiana'], NH: ['ANA', 'ANA'], JL: ['JAL', 'Japan Airlines'], EK: ['UAE', 'Emirates'], QR: ['QTR', 'Qatar Airways'],
    EY: ['ETD', 'Etihad'], FZ: ['FDB', 'flydubai'], SV: ['SVA', 'Saudia'], XY: ['KNE', 'flynas'], F3: ['FAD', 'flyadeal'], WY: ['OMA', 'Oman Air'], GF: ['GFA', 'Gulf Air'],
    KU: ['KAC', 'Kuwait Airways'], TK: ['THY', 'Turkish Airlines'], MS: ['MSR', 'EgyptAir'], ET: ['ETH', 'Ethiopian'], PK: ['PIA', 'PIA'], AI: ['AIC', 'Air India'],
    IX: ['AXB', 'Air India Express'], '6E': ['IGO', 'IndiGo'], UL: ['ALK', 'SriLankan'], BG: ['BBC', 'Biman'], BS: ['UBG', 'US-Bangla'], BA: ['BAW', 'British Airways'],
    KL: ['KLM', 'KLM'], AF: ['AFR', 'Air France'], LH: ['DLH', 'Lufthansa'], QF: ['QFA', 'Qantas'], JQ: ['JST', 'Jetstar'], NZ: ['ANZ', 'Air New Zealand']
  };
  const ICAO2 = Object.fromEntries(Object.entries(AL).map(([k, v]) => [v[0], [k, v[1]]]));
  const R = 'https://api.adsb.lol';
  const fdt = d => d.toLocaleTimeString(L ? 'en-GB' : 'ms-MY', { hour: '2-digit', minute: '2-digit' });
  const km = (a, b) => Prayer.haversine(a.lat, a.lon, b.lat, b.lon);

  function parse(q) {
    q = q.toUpperCase().replace(/[\s-]/g, '');
    let m = q.match(/^([A-Z]{3})(\d{1,4}[A-Z]{0,2})$/);
    if (m && ICAO2[m[1]]) return { cs: m[1] + m[2].replace(/^0+(?=\d)/, ''), iata: ICAO2[m[1]][0] + m[2], airline: ICAO2[m[1]][1] };
    m = q.match(/^([A-Z0-9]{2})(\d{1,4}[A-Z]?)$/);
    if (m && AL[m[1]]) return { cs: AL[m[1]][0] + m[2].replace(/^0+(?=\d)/, ''), iata: m[1] + m[2], airline: AL[m[1]][1] };
    if (/^\d?[A-Z]{1,2}\d?-?[A-Z0-9]{2,5}$/.test(q) && q.length >= 4) return { cs: q, iata: q, reg: q };
    return { cs: q, iata: q };
  }
  async function getJSON(url, opt) {
    const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 12000);
    try { const r = await fetch(url, Object.assign({ signal: ctl.signal }, opt || {})); if (!r.ok) throw new Error(r.status); return await r.json(); } finally { clearTimeout(to); }
  }
  const routeCache = {};
  async function route(cs, lat, lon) {
    cs = (cs || '').trim(); if (!cs) return null;
    if (routeCache[cs]) return routeCache[cs];
    try {
      const j = await getJSON(`${R}/api/0/routeset`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ planes: [{ callsign: cs, lat: lat || 0, lng: lon || 0 }] }) });
      const r = j && j[0]; if (!r || !r._airports || r._airports.length < 2) return null;
      return (routeCache[cs] = r);
    } catch { return null; }
  }
  /* Kemajuan & anggaran tiba dari kedudukan langsung */
  function progress(a, rt) {
    const ap = rt._airports, o = ap[0], d = ap[ap.length - 1], p = { lat: a.lat, lon: a.lon };
    const total = km(o, d), left = km(p, d), flown = Math.max(0, total - left);
    const gnd = a.alt_baro === 'ground', kmh = (a.gs || 0) * 1.852;
    let state = 'air', eta = null;
    if (gnd || kmh < 60) state = left < 25 ? 'landed' : km(p, o) < 25 ? 'atgate' : 'ground';
    else if (kmh > 100) eta = new Date(Date.now() + (left / (kmh * 0.92)) * 3600e3 + 8 * 60e3); // +8 min pendekatan
    return { o, d, total, left, pct: Math.min(100, Math.round(flown / Math.max(1, total) * 100)), state, eta };
  }

  /* ---------- AeroDataBox (pilihan) ---------- */
  const adbKey = () => store.get('adbKey', '');
  async function schedule(iata, dateKey) {
    const k = adbKey(); if (!k) return null;
    const num2 = iata.replace(/^([A-Z0-9]{2})0*/, '$1');
    const r = await getJSON(`https://aerodatabox.p.rapidapi.com/flights/number/${encodeURIComponent(num2)}/${dateKey}?withAircraftImage=false&withLocation=false&dateLocalRole=Both`,
      { headers: { 'x-rapidapi-key': k, 'x-rapidapi-host': 'aerodatabox.p.rapidapi.com' } });
    return Array.isArray(r) ? r : [];
  }
  const tm = (o, k) => { if (!o) return null; const v = o[k + 'Time'] || o[k + 'TimeLocal'] && { local: o[k + 'TimeLocal'] }; return v && (v.local || v.utc) ? v : null; };
  const showT = v => { if (!v) return ''; const s = String(v.local || v.utc); const m = s.match(/(\d{4}-\d\d-\d\d)[ T](\d\d:\d\d)/); return m ? m[2] : s; };
  const STATUS = { Expected: ['Dijadualkan', 'Scheduled'], EnRoute: ['Dalam penerbangan', 'En route'], CheckIn: ['Daftar masuk', 'Check-in'], Boarding: ['Menaiki pesawat', 'Boarding'],
    GateClosed: ['Pintu ditutup', 'Gate closed'], Departed: ['Telah berlepas', 'Departed'], Delayed: ['Lewat', 'Delayed'], Approaching: ['Hampir tiba', 'Approaching'],
    Arrived: ['Telah tiba', 'Arrived'], Canceled: ['Dibatalkan', 'Canceled'], Cancelled: ['Dibatalkan', 'Canceled'], Diverted: ['Dilencongkan', 'Diverted'], CanceledUncertain: ['Mungkin dibatalkan', 'Possibly canceled'], Unknown: ['Tidak diketahui', 'Unknown'] };
  function schedCard(f) {
    const dep = f.departure || {}, arr = f.arrival || {}, st = STATUS[f.status] || [f.status, f.status];
    const ap = x => x && x.airport ? `${esc(x.airport.iata || x.airport.icao || '')} <small>${esc(x.airport.municipalityName || x.airport.shortName || x.airport.name || '')}</small>` : '—';
    const times = x => { const s = tm(x, 'scheduled'), r = tm(x, 'revised') || tm(x, 'predicted'), a = tm(x, 'runway') || tm(x, 'actual');
      return `<div class="fl-t"><span>${t('fl.sched')}</span><b>${showT(s) || '—'}</b></div>${r && showT(r) !== showT(s) ? `<div class="fl-t ${showT(r) > showT(s) ? 'late' : ''}"><span>${t('fl.est')}</span><b>${showT(r)}</b></div>` : ''}${a ? `<div class="fl-t ok"><span>${t('fl.act')}</span><b>${showT(a)}</b></div>` : ''}`; };
    const extra = (x, isArr) => [x.terminal && `${t('fl.term')} ${esc(x.terminal)}`, x.gate && `${t('fl.gate')} ${esc(x.gate)}`, isArr && x.baggageBelt && `${t('fl.belt')} ${esc(x.baggageBelt)}`, !isArr && x.checkInDesk && `${t('fl.desk')} ${esc(x.checkInDesk)}`].filter(Boolean).join(' · ');
    return `<div class="card fl-sched"><div class="fl-sh"><b>${esc(f.number || '')}</b><span class="fl-st st-${esc(f.status || 'Unknown')}">${esc(st[L] || '')}</span></div>
      <div class="fl-cols"><div><small>${t('fl.dep')}</small><div class="fl-ap">${ap(dep)}</div>${times(dep)}<small class="muted">${extra(dep, false)}</small></div>
      <div><small>${t('fl.arr')}</small><div class="fl-ap">${ap(arr)}</div>${times(arr)}<small class="muted">${extra(arr, true)}</small></div></div>
      ${f.aircraft && (f.aircraft.model || f.aircraft.reg) ? `<small class="muted">✈️ ${esc(f.aircraft.model || '')} ${f.aircraft.reg ? '· ' + esc(f.aircraft.reg) : ''}</small>` : ''}</div>`;
  }

  /* ---------- Carian ---------- */
  function liveCard(q, a, rt) {
    const cs = (a.flight || '').trim(), alt = a.alt_baro === 'ground' ? t('rd.ground') : `${num(a.alt_baro)} ft`, spd = a.gs != null ? `${num(Math.round(a.gs * 1.852))} km/j` : '—';
    let body = '';
    if (rt) {
      const p = progress(a, rt), st = { air: t('fl.air'), landed: t('fl.landed'), atgate: t('fl.atgate'), ground: t('rd.ground') }[p.state];
      body = `<div class="fl-route"><div><b>${esc(p.o.iata || p.o.icao)}</b><small>${esc(p.o.location || p.o.name)}</small></div><span class="fl-line"><i style="left:${p.pct}%">${ico('plane')}</i></span><div class="r"><b>${esc(p.d.iata || p.d.icao)}</b><small>${esc(p.d.location || p.d.name)}</small></div></div>
        <div class="fl-st-row"><span class="fl-st ${p.state === 'air' ? 'st-EnRoute' : 'st-Arrived'}">${st}</span>${p.state === 'air' ? `<span>${t('fl.left', { n: num(Math.round(p.left)) })}</span>` : ''}</div>
        ${p.eta ? `<div class="fl-eta"><small>${t('fl.eta')}</small><b>${fdt(p.eta)}</b><small>${t('fl.etaNote')}</small></div>` : ''}`;
    } else body = `<p class="muted small">${t('fl.noRoute')}</p>`;
    return `<div class="card fl-live"><div class="fl-sh"><b>✈️ ${esc(q.iata || cs)}</b><small>${esc(q.airline || '')} ${cs && cs !== q.iata ? '· ' + esc(cs) : ''}</small></div>${body}
      <div class="fl-stats"><div><small>${t('rd.alt')}</small><b>${alt}</b></div><div><small>${t('rd.spd')}</small><b>${spd}</b></div><div><small>${t('rd.type')}</small><b>${esc(a.t || '—')}</b></div><div><small>${t('rd.reg')}</small><b>${esc(a.r || '—')}</b></div></div>
      <button class="btn block" data-track="${esc(a.hex)}" data-lat="${a.lat}" data-lon="${a.lon}">${ico('map')}<span>${t('fl.track')}</span></button></div>`;
  }
  let lastQ = null;
  async function search(raw) {
    raw = (raw || $('#flQ').value).trim(); if (!raw) return;
    const q = parse(raw); lastQ = raw;
    $('#flQ').value = raw.toUpperCase();
    const rec = store.get('flRecent', []).filter(x => x !== raw.toUpperCase()); rec.unshift(raw.toUpperCase()); store.set('flRecent', rec.slice(0, 6)); renderRecent();
    $('#flRes').innerHTML = `<p class="muted center">${t('fl.searching')}</p>`;
    const dk = WZ.dkey(new Date());
    const [live, sch] = await Promise.all([
      (async () => {
        try {
          let j = await getJSON(`${R}/v2/callsign/${encodeURIComponent(q.cs)}`); let ac = (j.ac || []).filter(a => a.lat != null);
          if (!ac.length && q.reg) { j = await getJSON(`${R}/v2/reg/${encodeURIComponent(q.reg)}`); ac = (j.ac || []).filter(a => a.lat != null); }
          return ac[0] || null;
        } catch { return undefined; }
      })(),
      schedule(q.iata, dk).catch(e => ({ err: String(e.message || e) }))
    ]);
    if (lastQ !== raw) return;
    let html = '';
    if (live) { const rt = await route((live.flight || q.cs).trim(), live.lat, live.lon); html += liveCard(q, live, rt); }
    if (sch && sch.err) html += `<p class="note">${t(sch.err.includes('40') ? 'fl.keyErr' : 'fl.schErr')}</p>`;
    else if (sch && sch.length) html += `<h3 class="sec">${t('fl.schedT')}</h3>` + sch.map(schedCard).join('');
    if (!live) html = `<div class="card fl-none">${ico('plane')}<p>${t(live === undefined ? 'fl.netErr' : 'fl.notAir', { f: esc(raw.toUpperCase()) })}</p></div>` + html;
    if (!adbKey()) html += `<p class="note">${t('fl.keyHint')}</p>`;
    html += `<div class="row-btns"><a class="btn soft sm" href="https://www.flightradar24.com/data/flights/${encodeURIComponent(q.iata.toLowerCase())}" target="_blank" rel="noopener">${t('fl.fr24')}</a></div>`;
    $('#flRes').innerHTML = html;
  }
  function renderRecent() {
    const r = store.get('flRecent', []);
    $('#flRecent').innerHTML = r.map(x => `<button data-q="${esc(x)}">${esc(x)}</button>`).join('');
  }
  $('#flGo').onclick = () => search();
  $('#flQ').addEventListener('keydown', e => { if (e.key === 'Enter') search(); });
  $('#flRecent').addEventListener('click', e => { const b = e.target.closest('[data-q]'); if (b) search(b.dataset.q); });
  $('#flRes').addEventListener('click', e => {
    const b = e.target.closest('[data-track]'); if (!b) return;
    go('map'); setTimeout(() => WZ.radar && WZ.radar.track(b.dataset.track, +b.dataset.lat, +b.dataset.lon), 400);
  });
  $('#flKeySave').onclick = () => { store.set('adbKey', $('#flKey').value.trim()); toast(t('fl.keySaved')); };
  on('show:flight', () => { renderRecent(); $('#flKey').value = adbKey(); });

  WZ.flight = { route, progress, search: q => { go('flight'); setTimeout(() => search(q), 300); } };
})();
