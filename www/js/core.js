/* Wazlee — teras: utiliti, storan, router, lokasi */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const Cap = window.Capacitor;
  const isNative = !!(Cap && Cap.isNativePlatform && Cap.isNativePlatform());
  const P = (Cap && Cap.Plugins) || {};
  window.WZ_HDR = isNative ? { 'User-Agent': 'Wazlee/2.6 (Android; my.digitalsys.wazlee)' } : {}; // pelayar: elak preflight CORS

  const store = {
    get(k, d) { try { const v = localStorage.getItem('wz_' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('wz_' + k, JSON.stringify(v)); } catch {} },
    del(k) { try { localStorage.removeItem('wz_' + k); } catch {} }
  };

  const bus = {};
  const on = (e, f) => (bus[e] = bus[e] || []).push(f);
  const emit = (e, d) => (bus[e] || []).forEach(f => { try { f(d); } catch (err) { console.error(e, err); } });

  const toast = msg => { const el = $('#toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(el._h); el._h = setTimeout(() => el.classList.remove('show'), 2600); };
  const vibrate = p => { try { navigator.vibrate && navigator.vibrate(p); } catch {} };
  const openExternal = url => { if (isNative) location.href = url; else window.open(url, '_blank'); };
  const icons = (root = document) => $$('[data-ic]', root).forEach(el => { if (!el.dataset.icDone) { el.insertAdjacentHTML('afterbegin', ico(el.dataset.ic)); el.dataset.icDone = 1; } });
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- Tetapan ---------- */
  const settings = Object.assign({ name: '', fmt: '12', height: '', weight: '', goal: 8000, zoneMode: 'auto', zone: '', notif: false, notifPre: false, waterGoal: 8, waterNotif: false, hc: false }, store.get('settings', {}));
  const saveSettings = () => store.set('settings', settings);
  /* Tema warna: pilihan sendiri, atau ikut jantina (perempuan → pink, lelaki → biru) */
  const THEMES = { biru: ['#2F9BFF', '#1565D8', '#0A3A9E'], pink: ['#FF8DB8', '#E83E8C', '#A3155A'], ungu: ['#B18CFF', '#7C3AED', '#4C1D95'],
    hijau: ['#34D399', '#0E9F5A', '#065F46'], teal: ['#3EE0C8', '#0B9488', '#115E59'], jingga: ['#FFB547', '#F2700F', '#9A3412'] };
  const themeOf = () => THEMES[settings.theme] ? settings.theme : settings.gender === 'f' ? 'pink' : 'biru';
  function applyTheme() {
    const th = themeOf(), c = THEMES[th];
    if (th === 'biru') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = th;
    const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = c[1];
    try { if (P.StatusBar) P.StatusBar.setBackgroundColor({ color: c[2] }); } catch {}
  }
  applyTheme();

  /* ---------- Masa, tarikh & nombor (ikut bahasa) ---------- */
  const LOC = LANG === 'en' ? 'en-MY' : 'ms-MY';
  const num = (n, d) => Number(n).toLocaleString(LOC, d != null ? { maximumFractionDigits: d } : undefined);
  const pad = n => String(n).padStart(2, '0');
  const dkey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  function fmtH(h) {
    h = ((h % 24) + 24) % 24;
    let H = Math.floor(h + 1e-9), M = Math.round((h - H) * 60);
    if (M === 60) { M = 0; H = (H + 1) % 24; }
    if (settings.fmt === '24') return `${pad(H)}:${pad(M)}`;
    return `${((H + 11) % 12) + 1}:${pad(M)} ${H < 12 ? t('time.am') : t('time.pm')}`;
  }
  const hToDate = (base, h) => { const d = new Date(base); d.setHours(0, 0, 0, 0); return new Date(d.getTime() + h * 3600000); };
  const HMONTHS = {
    ms: ['Muharam', 'Safar', 'Rabiulawal', 'Rabiulakhir', 'Jamadilawal', 'Jamadilakhir', 'Rejab', 'Syaaban', 'Ramadan', 'Syawal', 'Zulkaedah', 'Zulhijah'],
    en: ['Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani", 'Jumada al-Ula', 'Jumada al-Akhirah', 'Rajab', "Sha'ban", 'Ramadan', 'Shawwal', "Dhu al-Qa'dah", 'Dhu al-Hijjah']
  }[LANG];
  const hfmt = (d, m, y) => `${d} ${HMONTHS[m - 1]} ${y}${LANG === 'en' ? ' AH' : 'H'}`;
  function hijriFromStr(s) { const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s || ''); return m ? hfmt(+m[3], +m[2], m[1]) : ''; }
  function hijriCalc(d) {
    try {
      const parts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'numeric', year: 'numeric' }).formatToParts(d);
      const g = k => +(parts.find(p => p.type === k) || {}).value;
      return hfmt(g('day'), g('month'), g('year'));
    } catch { return ''; }
  }
  const greg = (d, opt) => d.toLocaleDateString(LOC, opt || { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const tz = () => -new Date().getTimezoneOffset() / 60;

  /* ---------- Cincin kemajuan ---------- */
  let ringN = 0;
  function ring(el, pct, inner, opt = {}) {
    const size = el.clientWidth || opt.size || 100, sw = opt.stroke || Math.max(6, size * 0.1), r = (size - sw) / 2, c = 2 * Math.PI * r;
    const p = Math.max(0, Math.min(1, pct || 0)), id = 'rg' + (++ringN);
    const [c1, c2] = opt.colors || ['#34D399', '#0E9F5A'];
    el.classList.add('ring');
    el.innerHTML = `<svg width="${size}" height="${size}"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${opt.track || 'var(--soft)'}" stroke-width="${sw}"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="url(#${id})" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - p)}" style="transition:stroke-dashoffset .6s"/></svg>
      <div class="ring-in">${inner || ''}</div>`;
  }

  /* ---------- Router ---------- */
  const ROOTS = ['home', 'quran', 'ibadah', 'sihat', 'lagi'];
  const PARENT = { solat: 'ibadah', zon: 'ibadah', kiblat: 'ibadah', doa: 'ibadah', zikir: 'ibadah', tasbih: 'ibadah', musafir: 'ibadah', hijri: 'ibadah', mathurat: 'ibadah', panduan: 'ibadah', hafalan: 'ibadah', ramadan: 'ibadah', jumaat: 'ibadah', khatam: 'quran', langkah: 'sihat', bmi: 'sihat', air: 'sihat',
    fx: 'lagi', map: 'lagi', profil: 'lagi', widgets: 'lagi', ingat: 'lagi', nota: 'lagi', cuaca: 'lagi', notaed: 'nota', alarm: 'lagi', ilmu: 'lagi', game: 'lagi', asmalist: 'lagi', surah: 'quran', qset: 'quran' };
  let stack = ['home'];
  const show = id => {
    $$('.page').forEach(p => p.classList.toggle('active', p.id === 'pg-' + id));
    const pg = $('#pg-' + id), isRoot = ROOTS.includes(id);
    document.body.classList.toggle('sub', !isRoot);
    $('#tbTitle').textContent = pg ? (pg.dataset.titleRaw || (pg.dataset.title ? t(pg.dataset.title) : '')) : '';
    document.body.dataset.page = id;
    const tab = isRoot ? id : (PARENT[id] || 'home');
    $$('.bottomnav button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    window.scrollTo(0, 0);
    emit('show:' + id);
  };
  function go(id) {
    if (!$('#pg-' + id)) return;
    const cur = stack[stack.length - 1];
    if (cur === id && $('#pg-' + id).classList.contains('active')) return;
    emit('hide:' + cur);
    if (ROOTS.includes(id)) stack = [id]; else stack.push(id);
    show(id);
  }
  function back() {
    if (stack.length > 1) { emit('hide:' + stack.pop()); show(stack[stack.length - 1]); return true; }
    if (stack[0] !== 'home') { emit('hide:' + stack[0]); stack = ['home']; show('home'); return true; }
    return false;
  }
  document.addEventListener('click', e => {
    const g = e.target.closest('[data-go]'); if (g) { go(g.dataset.go); return; }
    const tb = e.target.closest('[data-tab]'); if (tb) go(tb.dataset.tab);
  });

  /* ---------- Lokasi ---------- */
  const DEFAULT_LOC = { lat: 6.1254, lng: 102.2386, name: 'Kota Bharu' };
  let loc = store.get('loc', null) || DEFAULT_LOC;
  async function getPosition() {
    if (isNative && P.Geolocation) {
      try { await P.Geolocation.requestPermissions(); } catch {}
      const p = await P.Geolocation.getCurrentPosition({ enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 });
      return { lat: p.coords.latitude, lng: p.coords.longitude };
    }
    return new Promise((res, rej) => {
      if (!navigator.geolocation) return rej(new Error('no gps'));
      navigator.geolocation.getCurrentPosition(p => res({ lat: p.coords.latitude, lng: p.coords.longitude }), rej, { timeout: 15000, maximumAge: 300000 });
    });
  }
  async function reverseName(lat, lng) {
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&zoom=10&accept-language=${LANG}&lat=${lat}&lon=${lng}`, { headers: WZ_HDR });
      const j = await r.json(), a = j.address || {};
      return a.city || a.town || a.county || a.state_district || a.state || j.name || '';
    } catch { return ''; }
  }
  async function setLoc(lat, lng, name) {
    loc = { lat, lng, name: name || (await reverseName(lat, lng)) || `${lat.toFixed(3)}, ${lng.toFixed(3)}` };
    store.set('loc', loc); emit('loc', loc);
  }
  async function refreshLocation(manual) {
    $('#locLabel').textContent = t('loc.detecting');
    try {
      const p = await getPosition();
      await setLoc(p.lat, p.lng);
      if (manual) toast(t('loc.updated'));
    } catch {
      if (manual) toast(t('loc.fail'));
      emit('loc', loc);
    }
  }

  window.WZ = {
    $, $$, P, isNative, store, on, emit, toast, vibrate, openExternal, icons, esc, settings, saveSettings, LOC, num,
    pad, dkey, fmtH, hToDate, hijriFromStr, hijriCalc, greg, tz, ring, go, back, refreshLocation, setLoc,
    HMONTHS, THEMES, themeOf, applyTheme, get loc() { return loc; }, get stack() { return stack; }
  };
})();
