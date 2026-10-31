/* Wazlee — paparan utama, hub, profil, bahasa & permulaan */
(() => {
  const { $, $$, P, store, on, emit, toast, icons, esc, settings, saveSettings, greg, num } = WZ;

  /* ---------- Jubin ---------- */
  const T = {
    solat: { ic: 'clock', g: 'g-blue' }, kiblat: { ic: 'compass', g: 'g-indigo' }, doa: { ic: 'book-heart', g: 'g-purple' },
    zikir: { ic: 'sparkles', g: 'g-orange' }, tasbih: { ic: 'circle-dot', g: 'g-teal' }, langkah: { ic: 'footprints', g: 'g-green' },
    bmi: { ic: 'scale', g: 'g-teal' }, air: { ic: 'glass-water', g: 'g-cyan' }, fx: { ic: 'coins', g: 'g-orange' },
    map: { ic: 'map', g: 'g-pink' }, quran: { ic: 'book-open', g: 'g-teal' }, ilmu: { ic: 'gamepad-2', g: 'g-purple' }, profil: { ic: 'user', g: 'g-blue' }, widgets: { ic: 'layout-grid', g: 'g-indigo' }, ingat: { ic: 'bell', g: 'g-orange' }, nota: { ic: 'notebook-pen', g: 'g-yellow' }, musafir: { ic: 'car', g: 'g-teal' }, hijri: { ic: 'calendar-days', g: 'g-purple' }, mathurat: { ic: 'book-marked', g: 'g-orange' }, panduan: { ic: 'list-checks', g: 'g-blue' }, tahlil: { ic: 'book-heart', g: 'g-green', go: 'panduan', act: () => WZ.panduan && WZ.panduan.set('tahlil') }, hafalan: { ic: 'graduation-cap', g: 'g-pink' }, ramadan: { ic: 'moon', g: 'g-indigo' }, khatam: { ic: 'target', g: 'g-teal' }, jumaat: { ic: 'moon-star', g: 'g-green' }, cuaca: { ic: 'cloud-sun', g: 'g-cyan' }, alarm: { ic: 'alarm-clock', g: 'g-pink' }, masjid: { ic: 'moon-star', g: 'g-green', go: 'map', act: () => setTimeout(() => $('#btnMasjid').click(), 250) }
  };
  const ttl = k => t('tile.' + k), sub = k => t('tile.' + k + '.s', { n: DOA.length });
  const HOME = ['quran', 'solat', 'kiblat', 'doa', 'zikir', 'ilmu', 'langkah', 'cuaca'];
  $('#homeTiles').innerHTML = HOME.map(k => `<button class="tile" data-go="${k}"><span class="t-ic ${T[k].g}">${ico(T[k].ic)}</span>${t('tile.' + k + '.short')}</button>`).join('');
  const lt = keys => keys.map(k => `<button class="lt" data-go="${T[k].go || k}" data-k="${k}"><span class="t-ic ${T[k].g}">${ico(T[k].ic)}</span><span><b>${ttl(k)}</b><small>${sub(k)}</small></span>${ico('chevron-right', 'chev')}</button>`).join('');
  $('#ibadahList').innerHTML = lt(['solat', 'quran', 'khatam', 'jumaat', 'ramadan', 'hijri', 'kiblat', 'musafir', 'mathurat', 'tahlil', 'panduan', 'hafalan', 'doa', 'zikir', 'tasbih']);
  $('#sihatList').innerHTML = lt(['langkah', 'bmi', 'air', 'ingat']);
  $('#alatList').innerHTML = lt(['cuaca', 'nota', 'alarm', 'ingat', 'fx', 'map', 'masjid']);
  $('#lagiSet').innerHTML = lt(['widgets', 'profil']);
  $('#ibadahList').addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (b && T[b.dataset.k].act) T[b.dataset.k].act(); }, true);
  $('#alatList').addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (b && T[b.dataset.k].act) T[b.dataset.k].act(); });

  /* ---------- Utama ---------- */
  function renderHome() {
    const h = new Date().getHours();
    const salam = t(h < 12 ? 'greet.morning' : h < 15 ? 'greet.noon' : h < 19 ? 'greet.evening' : 'greet.night');
    $('#hGreet').textContent = `${salam}${settings.name ? ', ' + settings.name : ''} 👋`;
    $('#hDate').textContent = greg(new Date());
    const d = WZ.doaOfDay(); $('#hDoaT').textContent = d.t; $('#hDoaA').textContent = d.a; $('#hDoaM').textContent = d.m;
    $('#hDoaImg').onclick = e => { e.stopPropagation(); WZ.shareImage({ title: d.t, arab: d.a, rumi: d.r, text: d.m }); };
    $('#locLabel').innerHTML = `${ico('map-pin')} ${esc(WZ.loc.name)}`;
    WZ.sihat.renderStepsWidgets(); WZ.sihat.renderWater();
    WZ.quran.ayatHarian();
  }
  const Q = LANG === 'en' && window.QUOTES_EN ? QUOTES_EN : QUOTES;
  const doy = () => { const n = new Date(), s = new Date(n.getFullYear(), 0, 0); return Math.floor((n - s) / 864e5); };
  let qIdx = doy() % Q.length;
  const showQuote = () => $('#quoteText').textContent = Q[qIdx];
  $('#btnNextQuote').onclick = () => { qIdx = (qIdx + 1) % Q.length; showQuote(); };
  $('#btnShareQuote').onclick = () => WZ.shareText(`${Q[qIdx]}\n\n— via Wazlee`);
  $('#btnImgQuote').onclick = () => { const q = Q[qIdx], m = q.match(/^(.*?)\s*\(([^()]+)\)\s*$/); WZ.shareImage({ title: t('home.quote'), text: m ? m[1] : q, ref: m ? m[2] : '' }); };
  on('show:home', renderHome);
  on('loc', renderHome);

  /* ---------- Bahasa ---------- */
  function setLang(l) {
    if (l === LANG) return;
    setLangPref(l);
    location.reload();
  }
  $('#btnLang').textContent = LANG === 'en' ? 'BM' : 'EN';
  $('#btnLang').onclick = () => setLang(LANG === 'en' ? 'ms' : 'en');
  $$('.lang-seg button').forEach(b => { b.classList.toggle('active', b.dataset.lang === LANG); b.onclick = () => setLang(b.dataset.lang); });

  /* ---------- Profil ---------- */
  function fillProfile() {
    $('#setName').value = settings.name; $('#setH').value = settings.height; $('#setW').value = settings.weight;
    $('#setGoal').value = settings.goal; $('#setFmt').value = settings.fmt;
    $('#notifToggle').checked = !!settings.notif; $('#notifPre').checked = !!settings.notifPre;
    $('#setLat').value = WZ.loc.lat; $('#setLng').value = WZ.loc.lng;
    $('#pfName').textContent = settings.name || t('pf.defaultName');
    $('#pfSub').textContent = settings.height && settings.weight ? t('pf.summary', { h: settings.height, w: settings.weight, g: num(settings.goal) }) : t('pf.complete');
  }
  $('#btnSaveSet').onclick = async () => {
    settings.name = $('#setName').value.trim(); settings.height = $('#setH').value; settings.weight = $('#setW').value;
    settings.goal = Math.max(500, +$('#setGoal').value || 8000); settings.fmt = $('#setFmt').value; saveSettings();
    const la = parseFloat($('#setLat').value), lo = parseFloat($('#setLng').value);
    if (!isNaN(la) && !isNaN(lo) && (Math.abs(la - WZ.loc.lat) > 1e-6 || Math.abs(lo - WZ.loc.lng) > 1e-6)) await WZ.setLoc(la, lo);
    fillProfile(); renderHome(); emit('settings'); emit('times'); WZ.solat.scheduleNotifs();
    toast(t('pf.saved'));
  };
  on('show:profil', fillProfile);
  const WL = [['prayer_full', 'clock', 'g-blue', '4×2'], ['prayer_next', 'timer', 'g-blue', '2×1'], ['ayat', 'book-open', 'g-teal', '4×2'],
    ['activity', 'footprints', 'g-green', '2×2'], ['tasbih', 'circle-dot', 'g-purple', '2×2'], ['zikir', 'sparkles', 'g-orange', '4×1']];
  $('#widgetList').innerHTML = WL.map(([k, ic, g, sz]) => `<div class="lt"><span class="t-ic ${g}">${ico(ic)}</span><span><b>${t('w.n.' + k)} <em class="w-size">${sz}</em></b><small>${t('w.d.' + k)}</small></span></div>`).join('');

  /* ---------- Butang atas ---------- */
  $('#btnBack').innerHTML = ico('chevron-left'); $('#btnBack').onclick = () => WZ.back();
  $('#btnRefreshLoc').innerHTML = ico('locate-fixed'); $('#btnRefreshLoc').onclick = () => WZ.refreshLocation(true);

  /* ---------- Permulaan ---------- */
  applyI18n(document);
  icons(document);
  showQuote();
  WZ.go('home'); renderHome();
  WZ.solat.start();
  WZ.refreshLocation(false);
  WZ.sihat.readSteps();
  WZ.hc.check().then(() => WZ.hc.refresh());
  setTimeout(() => WZ.widget.start(), 600);
  if (P.App) {
    P.App.addListener('backButton', () => { if (!WZ.back()) P.App.exitApp(); });
    P.App.addListener('resume', () => { if (Date.now() - (WZ.lastLocAt || 0) > 20 * 60000) { WZ.lastLocAt = Date.now(); WZ.refreshLocation(false); } WZ.widget.sync().then(() => WZ.widget.push(1500)); WZ.sihat.readSteps(); WZ.hc.refresh(); WZ.solat.tick(); WZ.solat.ensureData(); renderHome(); });
  }
  if (P.StatusBar) { try { P.StatusBar.setBackgroundColor({ color: '#0A3A9E' }); } catch {} }
})();
