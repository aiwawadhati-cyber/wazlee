/* Radar Pesawat: lapisan pesawat langsung (ADS-B) pada Peta — adsb.lol / airplanes.live / adsb.fi */
(() => {
  const { on, esc, num, store } = WZ;
  const SRC = [
    { n: 'adsb.lol', u: (la, lo, r) => `https://api.adsb.lol/v2/point/${la}/${lo}/${r}` },
    { n: 'airplanes.live', u: (la, lo, r) => `https://api.airplanes.live/v2/point/${la}/${lo}/${r}` },
    { n: 'adsb.fi', u: (la, lo, r) => `https://opendata.adsb.fi/api/v2/lat/${la}/lon/${lo}/dist/${r}` }
  ];
  let map = null, layer = null, ctrl = null, status = null, timer = null, active = false, visible = false, src = 0, busy = false;
  const marks = {};
  const PLANE = '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>';
  const color = a => a === 'ground' ? '#94A3B8' : a < 10000 ? '#F59E0B' : a < 25000 ? '#10B981' : '#1565D8';
  function icon(a) {
    const alt = a.alt_baro, rot = (a.track || a.true_heading || 0) - 45;
    return L.divIcon({ className: 'rd-ic', iconSize: [28, 28], iconAnchor: [14, 14],
      html: `<svg viewBox="0 0 24 24" style="transform:rotate(${rot}deg);color:${color(alt)}" fill="currentColor" stroke="#fff" stroke-width="1.2" stroke-linejoin="round">${PLANE}</svg>` });
  }
  function popup(a) {
    const cs = (a.flight || '').trim(), alt = a.alt_baro === 'ground' ? t('rd.ground') : a.alt_baro != null ? `${num(a.alt_baro)} ft (${num(Math.round(a.alt_baro * 0.3048))} m)` : '—';
    const row = (k, v) => v ? `<tr><td>${t(k)}</td><td><b>${esc(String(v))}</b></td></tr>` : '';
    return `<div class="rd-pop"><b class="rd-cs">✈️ ${esc(cs || a.r || a.hex)}</b>${a.desc ? `<small>${esc(a.desc)}</small>` : ''}<table>
      ${row('rd.type', a.t)}${row('rd.reg', a.r)}${row('rd.alt', alt)}${row('rd.spd', a.gs != null ? `${num(Math.round(a.gs * 1.852))} km/j · ${Math.round(a.gs)} kt` : '')}${row('rd.hdg', a.track != null ? Math.round(a.track) + '°' : '')}</table>
      ${cs ? `<a href="https://www.flightradar24.com/${encodeURIComponent(cs)}" target="_blank" rel="noopener">${t('rd.more')} ›</a>` : ''}</div>`;
  }
  const setStatus = s => { if (status) { status.innerHTML = s; status.style.display = active ? '' : 'none'; } };

  async function fetchFrom(i, la, lo, r) {
    const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 9000);
    try { const res = await fetch(SRC[i].u(la, lo, r), { signal: ctl.signal }); if (!res.ok) throw new Error(res.status); const j = await res.json(); return j.ac || j.aircraft || []; }
    finally { clearTimeout(to); }
  }
  async function poll() {
    if (!active || !visible || !map || busy) return;
    busy = true;
    const c = map.getCenter(), b = map.getBounds();
    const r = Math.max(25, Math.min(250, Math.round(map.distance(c, b.getNorthEast()) / 1852)));
    let ac = null;
    for (let k = 0; k < SRC.length && ac == null; k++) {
      const i = (src + k) % SRC.length;
      try { ac = await fetchFrom(i, c.lat.toFixed(4), c.lng.toFixed(4), r); src = i; } catch {}
    }
    busy = false;
    if (!active) return;
    if (ac == null) { setStatus(t('rd.fail')); return; }
    const seen = new Set();
    ac.filter(a => a.lat != null && a.lon != null).slice(0, 400).forEach(a => {
      seen.add(a.hex);
      const m = marks[a.hex];
      if (m) { m.setLatLng([a.lat, a.lon]); m.setIcon(icon(a)); m.getPopup().setContent(popup(a)); }
      else marks[a.hex] = L.marker([a.lat, a.lon], { icon: icon(a), zIndexOffset: 500 }).bindPopup(popup(a)).addTo(layer);
    });
    Object.keys(marks).forEach(h => { if (!seen.has(h)) { layer.removeLayer(marks[h]); delete marks[h]; } });
    setStatus(seen.size ? t('rd.count', { n: num(seen.size), s: SRC[src].n }) : t('rd.none'));
  }
  function loop() { clearInterval(timer); timer = null; if (active && visible) { poll(); timer = setInterval(poll, 10000); } }
  function setActive(v) {
    active = v; store.set('radarOn', v);
    if (ctrl) ctrl.classList.toggle('on', v);
    if (!v) { layer && layer.clearLayers(); Object.keys(marks).forEach(h => delete marks[h]); setStatus(''); }
    else { setStatus(t('rd.loading')); if (map && map.getZoom() > 10) map.setZoom(9); }
    loop();
  }
  on('mapready', m => {
    map = m; layer = L.layerGroup().addTo(map);
    map.attributionControl.addAttribution('✈️ ADS-B: adsb.lol (ODbL) / airplanes.live / adsb.fi');
    const C = L.Control.extend({ options: { position: 'topright' }, onAdd() {
      const d = L.DomUtil.create('div', 'rd-ctrl');
      d.innerHTML = `<button title="${t('tile.radar')}">${ico('plane')}</button><div class="rd-status" style="display:none"></div>`;
      L.DomEvent.disableClickPropagation(d);
      ctrl = d.querySelector('button'); status = d.querySelector('.rd-status');
      ctrl.onclick = () => setActive(!active);
      return d;
    } });
    new C().addTo(map);
    map.on('moveend', () => { if (active) poll(); });
    visible = true;
    if (store.get('radarOn', false)) setActive(true);
  });
  on('show:map', () => { visible = true; loop(); });
  on('hide:map', () => { visible = false; loop(); });
  document.addEventListener('visibilitychange', () => { visible = document.visibilityState === 'visible' && document.getElementById('pg-map').classList.contains('active'); loop(); });
  WZ.radar = { on: () => { if (map) setActive(true); else store.set('radarOn', true); }, off: () => setActive(false) };
})();
