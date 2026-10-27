/* Alat: penukaran matawang, peta & jarak, masjid berdekatan */
(() => {
  const { $, $$, store, on, emit, toast, openExternal, esc, num, LOC } = WZ;

  /* ---------- Matawang ---------- */
  const CUR_MS = { MYR: 'Ringgit Malaysia', USD: 'Dolar AS', SGD: 'Dolar Singapura', EUR: 'Euro', GBP: 'Paun British', SAR: 'Riyal Saudi', AED: 'Dirham UAE', JPY: 'Yen Jepun', CNY: 'Yuan China', KRW: 'Won Korea', THB: 'Baht Thai', IDR: 'Rupiah Indonesia', BND: 'Dolar Brunei', PHP: 'Peso Filipina', VND: 'Dong Vietnam', INR: 'Rupee India', PKR: 'Rupee Pakistan', BDT: 'Taka Bangladesh', AUD: 'Dolar Australia', NZD: 'Dolar NZ', CAD: 'Dolar Kanada', CHF: 'Franc Swiss', HKD: 'Dolar Hong Kong', TWD: 'Dolar Taiwan', TRY: 'Lira Turki', EGP: 'Paun Mesir', QAR: 'Riyal Qatar', KWD: 'Dinar Kuwait', JOD: 'Dinar Jordan', OMR: 'Rial Oman' };
  const CUR_EN = { MYR: 'Malaysian Ringgit', USD: 'US Dollar', SGD: 'Singapore Dollar', EUR: 'Euro', GBP: 'British Pound', SAR: 'Saudi Riyal', AED: 'UAE Dirham', JPY: 'Japanese Yen', CNY: 'Chinese Yuan', KRW: 'Korean Won', THB: 'Thai Baht', IDR: 'Indonesian Rupiah', BND: 'Brunei Dollar', PHP: 'Philippine Peso', VND: 'Vietnamese Dong', INR: 'Indian Rupee', PKR: 'Pakistani Rupee', BDT: 'Bangladeshi Taka', AUD: 'Australian Dollar', NZD: 'NZ Dollar', CAD: 'Canadian Dollar', CHF: 'Swiss Franc', HKD: 'Hong Kong Dollar', TWD: 'Taiwan Dollar', TRY: 'Turkish Lira', EGP: 'Egyptian Pound', QAR: 'Qatari Riyal', KWD: 'Kuwaiti Dinar', JOD: 'Jordanian Dinar', OMR: 'Omani Rial' };
  const CUR = LANG === 'en' ? CUR_EN : CUR_MS;
  let rates = store.get('rates', null), loading = false;
  const fill = sel => sel.innerHTML = Object.entries(CUR).map(([c, n]) => `<option value="${c}">${c} · ${n}</option>`).join('');
  fill($('#fxFrom')); fill($('#fxTo'));
  $('#fxFrom').value = store.get('fxFrom', 'MYR'); $('#fxTo').value = store.get('fxTo', 'SAR');
  async function loadRates() {
    if ((rates && Date.now() - rates.t < 6 * 3600e3) || loading) return convert();
    loading = true;
    try {
      const j = await (await fetch('https://open.er-api.com/v6/latest/MYR')).json();
      if (j.result !== 'success') throw new Error();
      rates = { t: Date.now(), upd: j.time_last_update_unix * 1000, r: j.rates }; store.set('rates', rates);
    } catch { if (!rates) toast(t('fx.offline')); }
    loading = false; convert();
  }
  function convert() {
    if (!rates) { $('#fxResult').textContent = '—'; $('#fxUpdated').textContent = t('fx.connect'); return; }
    const a = parseFloat($('#fxAmount').value) || 0, f = $('#fxFrom').value, to = $('#fxTo').value;
    const v = a * rates.r[to] / rates.r[f];
    $('#fxResult').textContent = `${num(v, v < 1 ? 6 : 2)} ${to}`;
    $('#fxUpdated').textContent = `1 ${f} = ${(rates.r[to] / rates.r[f]).toFixed(4)} ${to} · ${t('fx.updated')} ${new Date(rates.upd).toLocaleString(LOC)}`;
    $('#fxPopular').innerHTML = ['USD', 'SGD', 'SAR', 'EUR', 'GBP', 'IDR', 'THB', 'JPY'].map(c => `<li><span>${c}</span><b>${num(rates.r[c], 4)}</b></li>`).join('');
    store.set('fxFrom', f); store.set('fxTo', to);
  }
  ['#fxAmount', '#fxFrom', '#fxTo'].forEach(s => $(s).addEventListener('input', convert));
  $('#fxSwap').onclick = () => { const f = $('#fxFrom').value; $('#fxFrom').value = $('#fxTo').value; $('#fxTo').value = f; convert(); };
  on('show:fx', loadRates);

  /* ---------- Peta & jarak ---------- */
  let map, mA, mB, line, meMarker, resultLayer, mode = 'A';
  const pin = (txt, col) => L.divIcon({ className: '', html: `<div style="background:${col};color:#fff;width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:grid;place-items:center;box-shadow:0 3px 8px #0005;border:2.5px solid #fff"><b style="transform:rotate(45deg);font-family:Nunito,sans-serif">${txt}</b></div>`, iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -30] });
  const mosque = () => L.divIcon({ className: '', html: `<div style="background:linear-gradient(135deg,#34D399,#0E9F5A);color:#fff;width:30px;height:30px;border-radius:10px;display:grid;place-items:center;box-shadow:0 3px 8px #0005;border:2px solid #fff">${ico('moon-star')}</div>`, iconSize: [30, 30], iconAnchor: [15, 15] });
  /* Peta asas: OpenFreeMap (vektor, percuma tanpa API key) → sandaran jubin OpenStreetMap */
  const loadScript = src => new Promise((res, rej) => { const el = document.createElement('script'); el.src = src; el.onload = res; el.onerror = rej; document.head.appendChild(el); });
  let baseDone = false;
  function osmBase() {
    if (baseDone) return; baseDone = true;
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(map);
  }
  async function addBase() {
    try {
      const cv = document.createElement('canvas');
      if (!(cv.getContext('webgl2') || cv.getContext('webgl'))) throw new Error('no webgl');
      if (!window.maplibregl) {
        const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'lib/maplibre-gl.css'; document.head.appendChild(css);
        await loadScript('lib/maplibre-gl.js');
        await loadScript('lib/leaflet-maplibre-gl.js');
      }
      const gl = L.maplibreGL({ style: 'https://tiles.openfreemap.org/styles/liberty', attribution: '<a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> © OpenMapTiles · © OpenStreetMap' }).addTo(map);
      const m = gl.getMaplibreMap();
      let loaded = false;
      const fail = () => { if (loaded || baseDone) return; try { map.removeLayer(gl); } catch {} osmBase(); };
      m.once('load', () => { loaded = true; baseDone = true; });
      m.on('error', fail);
      setTimeout(fail, 12000);
    } catch { osmBase(); }
  }
  function initMap() {
    if (map) { setTimeout(() => map.invalidateSize(), 80); return; }
    map = L.map('map').setView([WZ.loc.lat, WZ.loc.lng], 13);
    addBase();
    meMarker = L.circleMarker([WZ.loc.lat, WZ.loc.lng], { radius: 9, color: '#fff', weight: 3, fillColor: '#1565D8', fillOpacity: 1 }).addTo(map).bindPopup(t('map.you'));
    resultLayer = L.layerGroup().addTo(map);
    map.on('click', e => setPoint(mode, e.latlng));
    setTimeout(() => map.invalidateSize(), 120);
    WZ.map = map; emit('mapready', map);
  }
  function setPoint(which, ll) {
    if (which === 'A') { if (mA) mA.setLatLng(ll); else mA = L.marker(ll, { icon: pin('A', '#1565D8'), draggable: true }).addTo(map).on('dragend', updateDist); setMode('B'); }
    else { if (mB) mB.setLatLng(ll); else mB = L.marker(ll, { icon: pin('B', '#FF7A00'), draggable: true }).addTo(map).on('dragend', updateDist); }
    updateDist();
  }
  function updateDist() {
    if (!(mA && mB)) { $('#distKm').textContent = '—'; $('#distBearing').textContent = '—'; if (line) { map.removeLayer(line); line = null; } return; }
    const a = mA.getLatLng(), b = mB.getLatLng(), km = Prayer.haversine(a.lat, a.lng, b.lat, b.lng), br = Prayer.bearing(a.lat, a.lng, b.lat, b.lng);
    $('#distKm').textContent = km < 1 ? `${Math.round(km * 1000)} m` : `${num(km, 2)} km`;
    $('#distBearing').textContent = `${Math.round(br)}° ${t('dir.8').split(',')[Math.round(br / 45) % 8]}`;
    if (line) line.setLatLngs([a, b]); else line = L.polyline([a, b], { color: '#1565D8', weight: 4, dashArray: '8 8' }).addTo(map);
    map.fitBounds(L.latLngBounds([a, b]).pad(0.3));
  }
  function setMode(m) { mode = m; $$('.seg-btn[data-mode]').forEach(b => b.classList.toggle('active', b.dataset.mode === m)); }
  $$('.seg-btn[data-mode]').forEach(b => b.onclick = () => setMode(b.dataset.mode));
  $('#btnMeA').onclick = () => { setPoint('A', L.latLng(WZ.loc.lat, WZ.loc.lng)); toast(t('map.aSet')); };
  $('#btnClear').onclick = () => { [mA, mB].forEach(m => m && map.removeLayer(m)); mA = mB = null; resultLayer.clearLayers(); updateDist(); setMode('A'); };
  $('#btnDirections').onclick = () => {
    if (!mB) return toast(t('map.needB'));
    const a = mA ? mA.getLatLng() : L.latLng(WZ.loc.lat, WZ.loc.lng), b = mB.getLatLng();
    openExternal(`https://www.google.com/maps/dir/?api=1&origin=${a.lat},${a.lng}&destination=${b.lat},${b.lng}`);
  };
  function popupFor(name, ll, extra = '') {
    const el = document.createElement('div');
    el.innerHTML = `<b>${esc(name)}</b>${extra}<br><button class="btn" data-w="A">${t('map.setA')}</button><button class="btn" data-w="B">${t('map.setB')}</button>`;
    el.querySelectorAll('button').forEach(b => b.onclick = () => { setPoint(b.dataset.w, ll); map.closePopup(); });
    return el;
  }
  async function nominatim(params) {
    const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&accept-language=${LANG}&` + new URLSearchParams(params), { headers: WZ_HDR });
    return r.json();
  }
  async function search() {
    const q = $('#mapSearch').value.trim(); if (!q) return;
    try {
      const res = await nominatim({ q, limit: 6 });
      resultLayer.clearLayers();
      if (!res.length) return toast(t('map.noResult'));
      const pts = res.map(p => { const ll = L.latLng(+p.lat, +p.lon); L.marker(ll, { icon: pin('•', '#8B5CF6') }).addTo(resultLayer).bindPopup(popupFor(p.display_name.split(',').slice(0, 2).join(','), ll)); return ll; });
      map.fitBounds(L.latLngBounds(pts).pad(0.2), { maxZoom: 14 });
      resultLayer.getLayers()[0].openPopup();
    } catch { toast(t('map.fail')); }
  }
  async function masjid() {
    const { lat, lng } = WZ.loc, d = 0.06;
    toast(t('map.searchingMosque'));
    try {
      const vb = `${lng - d},${lat + d},${lng + d},${lat - d}`;
      const [a, b] = await Promise.all([nominatim({ q: 'masjid', viewbox: vb, bounded: 1, limit: 25 }), nominatim({ q: 'surau', viewbox: vb, bounded: 1, limit: 25 })]);
      const seen = new Set(), list = [...a, ...b].filter(p => !seen.has(p.place_id) && seen.add(p.place_id));
      resultLayer.clearLayers();
      if (!list.length) return toast(t('map.noMosque'));
      const pts = list.map(p => {
        const ll = L.latLng(+p.lat, +p.lon), km = Prayer.haversine(lat, lng, ll.lat, ll.lng);
        L.marker(ll, { icon: mosque() }).addTo(resultLayer).bindPopup(popupFor(p.display_name.split(',')[0], ll, `<br><small>${t('map.fromYou', { km: km.toFixed(2) })}</small>`));
        return ll;
      });
      pts.push(L.latLng(lat, lng));
      map.fitBounds(L.latLngBounds(pts).pad(0.15));
      toast(t('map.foundMosque', { n: list.length }));
    } catch { toast(t('map.fail')); }
  }
  $('#btnSearch').onclick = search;
  $('#btnMasjid').onclick = () => { initMap(); masjid(); };
  $('#mapSearch').addEventListener('keydown', e => { if (e.key === 'Enter') { e.target.blur(); search(); } });
  on('show:map', initMap);
  on('loc', () => { if (meMarker) meMarker.setLatLng([WZ.loc.lat, WZ.loc.lng]); });
})();
