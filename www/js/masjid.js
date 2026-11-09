/* Masjid & surau berdekatan: senarai ikut jarak (OpenStreetMap/Overpass, sandaran Nominatim) + halaman butiran (Waze, Google Maps, Apple Maps, WhatsApp, Kongsi) */
(() => {
  const { $, P, store, on, esc, toast, openExternal, isNative, num } = WZ;
  const L_ = LANG === 'en' ? 1 : 0;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  let data = store.get('masjid_c', null), filter = 'all', cur = null, dmap = null, dmark = null;

  const km = (a, b, c, d) => Prayer.haversine(a, b, c, d);
  const fmtD = k => k < 1 ? `${Math.round(k * 1000)} m` : `${num(k, k < 10 ? 1 : 0)} km`;
  const kindOf = (n, tags = {}) => /surau|musolla|musalla|musholla|prayer room/i.test(n) || tags.building === 'prayer_room' ? 'surau' : 'masjid';
  const typeLbl = m => m.k === 'surau' ? t('mq.surau') : /jamek|jami/i.test(m.n) ? t('mq.jamek') : /negeri|state|negara|national/i.test(m.n) ? t('mq.negeri') : t('mq.masjid');

  /* ---------- Data ---------- */
  async function overpass(lat, lng, r) {
    const q = `[out:json][timeout:20];nwr["amenity"="place_of_worship"]["religion"="muslim"](around:${r},${lat},${lng});out center tags 120;`;
    const ctl = new AbortController(), tm = setTimeout(() => ctl.abort(), 20000);
    try {
      const res = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: 'data=' + encodeURIComponent(q), headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...WZ_HDR }, signal: ctl.signal });
      if (!res.ok) throw new Error('overpass ' + res.status);
      const j = await res.json();
      return j.elements.map(e => {
        const g = e.tags || {}, la = e.lat ?? (e.center && e.center.lat), lo = e.lon ?? (e.center && e.center.lon);
        const n = (g['name:ms'] || g.name || g['name:en'] || '').trim();
        const addr = [g['addr:housenumber'], g['addr:street'], g['addr:place'] || g['addr:suburb'], g['addr:postcode'], g['addr:city']].filter(Boolean).join(', ');
        return { id: e.type[0] + e.id, n, lat: la, lon: lo, k: kindOf(n, g), addr, ph: g.phone || g['contact:phone'] || '', web: g.website || g['contact:website'] || '', note: g.description || '', den: g.denomination || '' };
      }).filter(m => m.lat && m.lon);
    } finally { clearTimeout(tm); }
  }
  async function nomi(lat, lng) {
    const dd = 0.08, vb = `${lng - dd},${lat + dd},${lng + dd},${lat - dd}`;
    const one = q => fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=40&bounded=1&viewbox=${vb}&accept-language=${LANG}&q=${q}`, { headers: WZ_HDR }).then(r => r.json());
    const [a, b] = await Promise.all([one('masjid'), one('surau')]);
    return [...a, ...b].map(p => { const n = (p.name || p.display_name.split(',')[0]).trim(), ad = p.address || {};
      return { id: 'n' + p.place_id, n, lat: +p.lat, lon: +p.lon, k: kindOf(n), addr: [ad.road, ad.village || ad.suburb || ad.town, ad.postcode, ad.city || ad.county].filter(Boolean).join(', '), ph: '', web: '', note: '' }; });
  }
  async function load(force) {
    const { lat, lng } = WZ.loc;
    if (!force && data && Date.now() - data.at < 3 * 864e5 && km(lat, lng, data.lat, data.lng) < 1) return render();
    $('#mqList').innerHTML = `<div class="mq-load">${ico('locate-fixed')}<span>${t('mq.searching')}</span></div>`;
    let list = [];
    try {
      list = await overpass(lat, lng, 6000);
      if (list.filter(m => m.k === 'masjid').length < 4) list = await overpass(lat, lng, 20000);
    } catch { try { list = await nomi(lat, lng); } catch { list = null; } }
    if (!list) { if (data) return render(); $('#mqList').innerHTML = `<p class="muted center">${t('mq.fail')}</p>`; return; }
    const seen = new Set();
    list = list.map(m => ({ ...m, n: m.n || (m.k === 'surau' ? t('mq.surau') : t('mq.masjid')), noName: !m.n, d: km(lat, lng, m.lat, m.lon) }))
      .sort((a, b) => a.d - b.d).filter(m => { const key = m.n.toLowerCase() + '|' + m.lat.toFixed(3) + m.lon.toFixed(3); return !seen.has(key) && seen.add(key); }).slice(0, 80);
    data = { at: Date.now(), lat, lng, list }; store.set('masjid_c', data); render();
  }

  /* ---------- Senarai ---------- */
  const card = (m, i, d) => `<button class="mq-c" data-mq="${i}"><span class="mq-ic ${m.k}">${ico(m.k === 'surau' ? 'house' : 'moon-star')}</span>
    <span class="grow"><b>${esc(m.n)}</b><small>${typeLbl(m)}${m.addr ? ' · ' + esc(m.addr.split(', ').slice(-2).join(', ')) : ''} · <em>${fmtD(d)}</em></small></span>${ico('chevron-right', 'chev')}</button>`;
  function render() {
    if (!data) return;
    const { lat, lng } = WZ.loc;
    const fav = store.get('jum_fav', null);
    const L = data.list.map((m, i) => ({ m, i, d: km(lat, lng, m.lat, m.lon) })).filter(x => filter === 'all' || x.m.k === filter).filter(x => !x.m.noName || filter === 'surau').sort((a, b) => a.d - b.d);
    $('#mqHead').innerHTML = `<span>${ico('map-pin')} ${esc(WZ.loc.name || '')}</span><small>${t('mq.count', { n: L.length })}</small>`;
    $('#mqList').innerHTML = (fav && filter === 'all' ? `<div class="mq-fav">${ico('star')} ${t('jm.fav')}: <b>${esc(fav.n)}</b></div>` : '')
      + (L.length ? L.slice(0, 40).map(x => card(x.m, x.i, x.d)).join('') : `<p class="muted center">${t('mq.none')}</p>`);
  }
  $('#mqSeg').onclick = e => { const b = e.target.closest('[data-f]'); if (!b) return; filter = b.dataset.f; $('#mqSeg').querySelectorAll('button').forEach(x => x.classList.toggle('active', x === b)); render(); };
  $('#mqRefresh').onclick = () => load(true);
  $('#mqList').onclick = e => { const b = e.target.closest('[data-mq]'); if (b) open(data.list[+b.dataset.mq]); };

  /* ---------- Butiran ---------- */
  const links = m => ({
    waze: `https://waze.com/ul?ll=${m.lat},${m.lon}&navigate=yes`,
    gmaps: `https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lon}&travelmode=driving`,
    apple: `https://maps.apple.com/?daddr=${m.lat},${m.lon}&q=${encodeURIComponent(m.n)}`,
    view: `https://www.google.com/maps/search/?api=1&query=${m.lat},${m.lon}`
  });
  const shareText = m => `🕌 ${m.n}${m.addr ? '\n📍 ' + m.addr : ''}\n\nGoogle Maps: ${links(m).view}\nWaze: https://waze.com/ul?ll=${m.lat},${m.lon}\n\n— ${t('mq.via')}`;
  function open(m) { cur = m; WZ.go('masjidd'); }
  function detail() {
    const m = cur; if (!m) return WZ.back();
    const { lat, lng } = WZ.loc, d = km(lat, lng, m.lat, m.lon), fav = store.get('jum_fav', null), isFav = fav && fav.n === m.n;
    const near = data ? data.list.filter(x => x !== m && x.k === 'masjid' && !x.noName).map(x => ({ x, d: km(m.lat, m.lon, x.lat, x.lon) })).sort((a, b) => a.d - b.d).slice(0, 6) : [];
    $('#mqdHero').innerHTML = `<span class="mq-tag">${typeLbl(m)}</span><h2>${esc(m.n)}</h2>
      <p>${ico('map-pin')} ${esc(m.addr || `${m.lat.toFixed(5)}, ${m.lon.toFixed(5)}`)}</p>
      <div class="mqd-stats"><span><b>${fmtD(d)}</b><small>${t('mq.fromYou')}</small></span><span><b>~${Math.max(1, Math.round(d * 1.3 / 40 * 60))} ${t('mq.min')}</b><small>${t('mq.drive')}</small></span></div>
      <div class="mqd-btns"><button class="mqb waze" data-a="waze">${ico('navigation')}Waze</button><button class="mqb" data-a="gmaps">${ico('map')}Google Maps</button>
      ${isIOS ? `<button class="mqb" data-a="apple">${ico('map-pin')}Apple Maps</button>` : ''}<button class="mqb" data-a="wa">${ico('message-circle')}WhatsApp</button><button class="mqb" data-a="share">${ico('share-2')}${t('btn.share')}</button></div>`;
    $('#mqdInfo').innerHTML = `<button class="lt mqd-row" data-a="fav"><span class="t-ic g-orange">${ico('star')}</span><span><b>${isFav ? t('mq.favOn') : t('mq.favSet')}</b><small>${t('mq.favS')}</small></span></button>
      ${m.ph ? `<button class="lt mqd-row" data-a="tel"><span class="t-ic g-green">${ico('phone')}</span><span><b>${esc(m.ph)}</b><small>${t('mq.call')}</small></span></button>` : ''}
      ${m.web ? `<button class="lt mqd-row" data-a="web"><span class="t-ic g-blue">${ico('globe')}</span><span><b>${esc(m.web.replace(/^https?:\/\//, '').replace(/\/$/, ''))}</b><small>${t('mq.web')}</small></span></button>` : ''}
      <button class="lt mqd-row" data-a="copy"><span class="t-ic g-purple">${ico('copy')}</span><span><b>${t('mq.copy')}</b><small>${m.lat.toFixed(5)}, ${m.lon.toFixed(5)}</small></span></button>`;
    $('#mqdNear').innerHTML = near.length ? `<h3 class="sec">${t('mq.near')}</h3>` + near.map(({ x, d }) => card(x, data.list.indexOf(x), d)).join('') : '';
    $('#mqdNote').textContent = t('mq.src');
    setTimeout(() => miniMap(m), 60);
    if (!m.addr && !m.rev) { m.rev = 1;
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&zoom=17&addressdetails=1&accept-language=${LANG}&lat=${m.lat}&lon=${m.lon}`, { headers: WZ_HDR }).then(r => r.json()).then(j => {
        const a = j.address || {}; m.addr = [a.road, a.village || a.suburb || a.hamlet || a.town, a.postcode, a.city || a.county || a.state_district].filter(Boolean).join(', ');
        if (m.addr) { if (data) store.set('masjid_c', data); if (cur === m) detail(); }
      }).catch(() => {}); }
  }
  function miniMap(m) {
    if (!window.L) return;
    const ll = [m.lat, m.lon], col = getComputedStyle(document.documentElement).getPropertyValue('--blue').trim() || '#1565D8';
    if (!dmap) {
      dmap = L.map('mqdMap', { zoomControl: false, attributionControl: true, dragging: true, scrollWheelZoom: false }).setView(ll, 16);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(dmap);
      dmap.me = L.circleMarker([WZ.loc.lat, WZ.loc.lng], { radius: 8, color: '#fff', weight: 3, fillColor: col, fillOpacity: 1 }).addTo(dmap);
    }
    dmap.invalidateSize(); dmap.me.setLatLng([WZ.loc.lat, WZ.loc.lng]);
    if (dmark) dmark.remove();
    dmark = L.marker(ll, { icon: L.divIcon({ className: '', html: `<div class="mq-pin">${ico('moon-star')}</div>`, iconSize: [36, 36], iconAnchor: [18, 18] }) }).addTo(dmap);
    const d = km(WZ.loc.lat, WZ.loc.lng, m.lat, m.lon);
    if (d < 8) dmap.fitBounds(L.latLngBounds([ll, [WZ.loc.lat, WZ.loc.lng]]).pad(0.25), { maxZoom: 17 }); else dmap.setView(ll, 16);
  }
  async function share(m) {
    const text = shareText(m);
    try {
      if (isNative && P.Share) return await P.Share.share({ title: m.n, text, dialogTitle: t('btn.share') });
      if (navigator.share) return await navigator.share({ title: m.n, text });
      await navigator.clipboard.writeText(text); toast(t('mq.copied'));
    } catch {}
  }
  document.getElementById('pg-masjidd').addEventListener('click', async e => {
    const b = e.target.closest('[data-a]'); const c = e.target.closest('[data-mq]');
    if (c) { cur = data.list[+c.dataset.mq]; detail(); document.querySelector('#pg-masjidd').scrollIntoView(); window.scrollTo(0, 0); return; }
    if (!b || !cur) return; const m = cur, L2 = links(m);
    switch (b.dataset.a) {
      case 'waze': return openExternal(L2.waze);
      case 'gmaps': return openExternal(L2.gmaps);
      case 'apple': return openExternal(L2.apple);
      case 'wa': return openExternal('https://wa.me/?text=' + encodeURIComponent(shareText(m)));
      case 'share': return share(m);
      case 'tel': return openExternal('tel:' + m.ph.replace(/[^\d+]/g, ''));
      case 'web': return openExternal(/^https?:/.test(m.web) ? m.web : 'https://' + m.web);
      case 'copy': try { await navigator.clipboard.writeText(`${m.n}\n${m.lat.toFixed(6)}, ${m.lon.toFixed(6)}\n${L2.view}`); toast(t('mq.copied')); } catch { toast(`${m.lat.toFixed(6)}, ${m.lon.toFixed(6)}`); } return;
      case 'fav': {
        const f = store.get('jum_fav', null), on_ = f && f.n === m.n;
        store.set('jum_fav', on_ ? null : { n: m.n, lat: m.lat, lon: m.lon, km: km(WZ.loc.lat, WZ.loc.lng, m.lat, m.lon) });
        toast(on_ ? t('mq.favOff') : t('jm.favSet')); WZ.emit('jumfav'); return detail();
      }
    }
  });

  on('show:masjid', () => { render(); load(false); });
  on('show:masjidd', detail);
  on('loc', () => { if (data && km(WZ.loc.lat, WZ.loc.lng, data.lat, data.lng) > 1) data = null; });
  WZ.masjid = { open, load, get data() { return data; } };
})();
