/* Ibadah: kiblat, doa harian, zikir pagi/petang, tasbih */
(() => {
  const { $, $$, P, store, on, toast, vibrate, esc, dkey, num } = WZ;
  const EN = LANG === 'en';
  const T_ = o => (EN && o.te) || o.t;     // tajuk ikut bahasa
  const M_ = o => (EN && o.me) || o.m;     // maksud ikut bahasa

  /* ---------- Kiblat ---------- */
  let qiblaDeg = 0, compassOn = false, wasAligned = false, gotReading = false;
  function renderQibla() {
    qiblaDeg = Prayer.qibla(WZ.loc.lat, WZ.loc.lng);
    $('#qiblaDeg').textContent = qiblaDeg.toFixed(1) + '°';
    $('#qiblaInfo').textContent = t('qibla.info', { km: num(Math.round(Prayer.kaabaDistance(WZ.loc.lat, WZ.loc.lng))) });
    $('#qiblaNeedle').style.transform = `rotate(${qiblaDeg}deg)`;
  }
  function onOrient(e) {
    let heading = null;
    if (typeof e.webkitCompassHeading === 'number') heading = e.webkitCompassHeading;
    else if ((e.absolute || e.type === 'deviceorientationabsolute') && e.alpha != null) heading = 360 - e.alpha;
    if (heading == null) return;
    gotReading = true;
    heading = (heading + ((screen.orientation && screen.orientation.angle) || 0) + 360) % 360;
    $('#dial').style.transform = `rotate(${-heading}deg)`;
    const rel = (qiblaDeg - heading + 360) % 360, diff = Math.min(rel, 360 - rel), aligned = diff < 4;
    $('#compass').classList.toggle('aligned', aligned);
    $('#compassStatus').textContent = aligned ? t('qibla.aligned') : t(rel < 180 ? 'qibla.turnR' : 'qibla.turnL', { d: Math.round(diff) });
    if (aligned && !wasAligned) vibrate(80);
    wasAligned = aligned;
  }
  function startCompass() {
    if (compassOn) return;
    try { if (typeof DeviceOrientationEvent !== 'undefined' && DeviceOrientationEvent.requestPermission) DeviceOrientationEvent.requestPermission().then(r => { if (r !== 'granted') $('#compassStatus').textContent = t('qibla.nosensor'); }).catch(() => {}); } catch {}
    window.addEventListener('ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation', onOrient);
    compassOn = true; $('#btnCompass').classList.add('hidden');
    setTimeout(() => { if (!gotReading) $('#compassStatus').textContent = t('qibla.nosensor'); }, 3000);
  }
  function stopCompass() {
    window.removeEventListener('deviceorientationabsolute', onOrient); window.removeEventListener('deviceorientation', onOrient);
    compassOn = false; $('#btnCompass').classList.remove('hidden');
  }
  $('#btnCompass').onclick = startCompass;
  $('#dial .ticks').innerHTML = Array.from({ length: 72 }, (_, i) => `<i style="position:absolute;left:50%;top:6px;width:${i % 6 ? 1 : 2}px;height:${i % 6 ? 6 : 11}px;margin-left:-1px;background:var(--muted);opacity:.5;transform-origin:50% 129px;transform:rotate(${i * 5}deg)"></i>`).join('');
  on('show:kiblat', () => { renderQibla(); startCompass(); });
  on('hide:kiblat', stopCompass);
  on('loc', renderQibla);

  /* ---------- Doa ---------- */
  const CAT_EN = { Makan: 'Meals', Tidur: 'Sleep', Rumah: 'Home', Harian: 'Daily', Perjalanan: 'Travel', Masjid: 'Mosque', Keluarga: 'Family', 'Ilmu & Hati': 'Knowledge & Heart' };
  const catLabel = c => c === '*' ? t('doa.all') : (EN ? CAT_EN[c] || c : c);
  let doaCat = '*';
  const cats = ['*', ...new Set(DOA.map(d => d.k))];
  $('#doaCats').innerHTML = cats.map(c => `<button data-c="${esc(c)}" class="${c === doaCat ? 'active' : ''}">${esc(catLabel(c))}</button>`).join('');
  const shareText = async text => {
    try {
      if (P.Share) await P.Share.share({ text, dialogTitle: t('btn.share') });
      else if (navigator.share) await navigator.share({ text });
      else { await navigator.clipboard.writeText(text); toast(t('toast.copied')); }
    } catch {}
  };
  function renderDoa() {
    const q = $('#doaSearch').value.trim().toLowerCase();
    const list = DOA.map((d, i) => ({ ...d, i })).filter(d => (doaCat === '*' || d.k === doaCat) && (!q || (d.t + (d.te || '') + d.r + d.m + (d.me || '')).toLowerCase().includes(q)));
    $('#doaList').innerHTML = list.map(d => `
      <div class="card doa-item" data-i="${d.i}">
        <button class="doa-toggle"><span class="chip-ic g-indigo">${ico(d.ic)}</span><b>${esc(T_(d))}</b>${ico('chevron-right', 'chev')}</button>
        <div class="doa-body"><p class="arab">${d.a}</p><p class="rumi">${esc(d.r)}</p><p class="maksud">${esc(M_(d))}</p>
        <div class="row-btns end"><button class="btn soft sm" data-share="${d.i}">${ico('share-2')}${t('btn.share')}</button></div></div>
      </div>`).join('') || `<p class="muted center">${t('doa.none')}</p>`;
  }
  $('#doaCats').onclick = e => { const b = e.target.closest('[data-c]'); if (!b) return; doaCat = b.dataset.c; $$('#doaCats button').forEach(x => x.classList.toggle('active', x === b)); renderDoa(); };
  $('#doaSearch').oninput = renderDoa;
  $('#doaList').onclick = e => {
    const s = e.target.closest('[data-share]');
    if (s) { const d = DOA[+s.dataset.share]; shareText(`${T_(d)}\n\n${d.a}\n\n${d.r}\n\n${t('doa.meaning')}: ${M_(d)}\n\n— via Wazlee`); return; }
    const tg = e.target.closest('.doa-toggle'); if (tg) tg.parentElement.classList.toggle('open');
  };
  on('show:doa', renderDoa);
  WZ.doaOfDay = () => { const n = new Date(), s = new Date(n.getFullYear(), 0, 0), d = DOA[Math.floor((n - s) / 864e5) % DOA.length]; return { ...d, t: T_(d), m: M_(d) }; };
  WZ.shareText = shareText;

  /* ---------- Zikir ---------- */
  let zMode = new Date().getHours() >= 15 ? 'petang' : 'pagi';
  const zKey = () => `zk_${dkey(new Date())}_${zMode}`;
  let zc = store.get(zKey(), {});
  const zItems = () => ZIKIR.map((z, i) => ({ ...z, i })).filter(z => z.w === 'both' || z.w === zMode);
  function renderZikir() {
    zc = store.get(zKey(), {});
    $$('.zk-seg button').forEach(b => b.classList.toggle('active', b.dataset.z === zMode));
    $('#zikirList').innerHTML = zItems().map(z => {
      const c = zc[z.i] || 0, done = c >= z.n;
      return `<div class="card zk ${done ? 'done' : ''}" data-i="${z.i}">
        <div class="zk-top"><div><b>${esc(T_(z))}</b><br><small class="muted">${z.n}× ${done ? '· ' + t('zk.done') : ''}</small></div><button class="zk-count" data-count="${z.i}">${c}/${z.n}</button></div>
        <p class="arab">${z.a}</p>
        <button class="more" data-more>${t('zk.more')}</button>
        <div class="zk-extra"><p class="rumi">${esc(z.r)}</p><p class="maksud">${esc(M_(z))}</p></div>
      </div>`;
    }).join('');
    updateZProgress();
  }
  function updateZProgress() {
    const items = zItems(), total = items.reduce((a, z) => a + z.n, 0), done = items.reduce((a, z) => a + Math.min(zc[z.i] || 0, z.n), 0);
    const full = items.filter(z => (zc[z.i] || 0) >= z.n).length;
    $('#zkBar').style.width = (done / total * 100) + '%';
    $('#zkProg').textContent = t('zk.progress', { a: full, b: items.length, m: t('zk.' + zMode) });
  }
  $('#zikirList').onclick = e => {
    if (e.target.closest('[data-more]')) { e.target.closest('.zk').classList.toggle('show'); return; }
    const b = e.target.closest('[data-count]'); if (!b) return;
    const i = +b.dataset.count, z = ZIKIR[i], c = (zc[i] || 0);
    if (c >= z.n) return;
    zc[i] = c + 1; store.set(zKey(), zc); WZ.emit('zikir');
    b.textContent = `${zc[i]}/${z.n}`;
    if (zc[i] >= z.n) { vibrate([60, 40, 60]); const card = b.closest('.zk'); card.classList.add('done'); card.querySelector('small').textContent = `${z.n}× · ${t('zk.done')}`; }
    else vibrate(20);
    updateZProgress();
  };
  $$('.zk-seg button').forEach(b => b.onclick = () => { zMode = b.dataset.z; renderZikir(); });
  $('#zkReset').onclick = () => { store.del(zKey()); renderZikir(); WZ.emit('zikir'); };
  on('show:zikir', renderZikir);

  /* ---------- Tasbih ---------- */
  let tas = Object.assign({ count: 0, goal: 33, total: 0, dz: 'Subhanallah' }, store.get('tasbih', {}));
  function renderTas() {
    $('#tasbihCount').textContent = tas.count; $('#tasbihTarget').textContent = `/ ${tas.goal}`;
    $('#tasbihGoal').value = tas.goal; $('#dzikirSel').value = tas.dz;
    $('#tasbihTotal').textContent = t('tasbih.total', { n: num(tas.total) });
    store.set('tasbih', tas);
  }
  $('#tasbihBtn').onclick = () => {
    tas.count++; tas.total++; tas.t = Date.now(); WZ.emit('tasbih');
    if (tas.count >= tas.goal) { vibrate([120, 60, 120]); toast(t('tasbih.done', { d: tas.dz, n: tas.goal })); tas.count = 0; } else vibrate(25);
    renderTas();
  };
  $('#tasbihReset').onclick = () => { tas.count = 0; tas.t = Date.now(); renderTas(); WZ.emit('tasbih'); };
  $('#tasbihGoal').onchange = e => { tas.goal = +e.target.value; tas.count = 0; tas.t = Date.now(); renderTas(); WZ.emit('tasbih'); };
  $('#dzikirSel').onchange = e => { tas.dz = e.target.value; tas.count = 0; tas.t = Date.now(); renderTas(); WZ.emit('tasbih'); };
  renderTas();
  WZ.tasbih = { reload() { tas = Object.assign({ count: 0, goal: 33, total: 0, dz: 'Subhanallah' }, store.get('tasbih', {})); renderTas(); } };
  WZ.zikirMode = m => { if (m === 'pagi' || m === 'petang') zMode = m; };
})();
