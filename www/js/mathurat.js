/* Al-Ma'thurat Sughra: pagi & petang, pengira bacaan, kemajuan harian, rumi/terjemahan, saiz fon */
(() => {
  const { $, store, on, esc, vibrate, toast } = WZ;
  const L = LANG === 'en' ? 1 : 0;
  const D = window.MATHURAT || [];
  const opt = Object.assign({ rumi: true, tr: true, fs: 26 }, store.get('mth_opt', {}));
  const saveOpt = () => store.set('mth_opt', opt);
  let mode = null;
  const autoMode = () => { try { const n = new Date(), t0 = WZ.solat.getDay(n).t; return n < WZ.hToDate(n, t0.asar) ? 'pagi' : 'petang'; } catch { return new Date().getHours() < 15 ? 'pagi' : 'petang'; } };
  const items = () => D.filter(x => x.w === 'both' || x.w === mode);
  const key = () => 'mth_' + WZ.dkey(new Date());
  const st = () => { const s = store.get(key(), {}); s[mode] = s[mode] || {}; return s; };
  const left = (s, it) => Math.max(0, it.n - (s[mode][it.id] || 0));

  function streak(m) {
    let n = 0; const d = new Date();
    for (let i = 0; i < 365; i++) { const s = store.get('mth_' + WZ.dkey(d), null); if (s && s.done && s.done[m]) n++; else if (i > 0) break; d.setDate(d.getDate() - 1); }
    return n;
  }
  function progress() {
    const s = st(), its = items(), done = its.filter(it => !left(s, it)).length;
    $('#mthBar').style.width = Math.round(done / its.length * 100) + '%';
    $('#mthProg').textContent = t('mt.prog', { a: done, b: its.length });
    if (done === its.length && !(s.done && s.done[mode])) { s.done = Object.assign({}, s.done, { [mode]: true }); store.set(key(), s); toast(t('mt.doneT')); vibrate([60, 40, 60]); render(); }
  }
  function card(it, s) {
    const l = left(s, it), dn = !l;
    return `<div class="card mth ${dn ? 'done' : ''}" data-id="${it.id}">
      <div class="mth-h"><span class="mth-no">${items().indexOf(it) + 1}</span><span class="grow"><b>${esc(L ? it.te : it.t)}</b>${it.q ? `<small>QS ${esc(it.q)}</small>` : ''}</span><span class="mth-x">×${it.n}</span></div>
      <div class="mth-b"><p class="arab mth-ar" style="font-size:${opt.fs}px">${esc(it.a).replace(/\n/g, '<br>')}</p>
      ${opt.rumi && it.r ? `<p class="rumi">${esc(it.r)}</p>` : ''}${opt.tr ? `<p class="maksud">${esc(L ? it.me : it.m)}</p>` : ''}
      <div class="mth-f"><button class="icbtn" data-img="${it.id}" aria-label="image">${ico('image')}</button>
      <button class="mth-cnt ${dn ? 'ok' : ''}" data-c="${it.id}">${dn ? ico('check') + t('mt.done') : `<b>${l}</b><small>${t('mt.tap')}</small>`}</button></div></div>
    </div>`;
  }
  function render() {
    if (!mode) mode = autoMode();
    [...document.querySelectorAll('#mthSeg [data-m]')].forEach(b => b.classList.toggle('active', b.dataset.m === mode));
    const s = st();
    $('#mthHero').innerHTML = `<small>${t(mode === 'pagi' ? 'mt.pagiS' : 'mt.petangS')}</small><h2>${t(mode === 'pagi' ? 'mt.pagi' : 'mt.petang')}</h2>
      <div class="mth-prog"><span id="mthBar"></span></div><p><span id="mthProg"></span> · 🔥 ${t('mt.streak', { n: streak(mode) })}</p>`;
    $('#mthRumi').checked = opt.rumi; $('#mthTr').checked = opt.tr;
    $('#mthList').innerHTML = (s.done && s.done[mode] ? `<div class="card mth-fin">${ico('badge-check')}<b>${t('mt.doneT')}</b><small>${t('mt.doneS')}</small></div>` : '') + items().map(it => card(it, s)).join('');
    progress();
  }
  $('#mthSeg').addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (b) { mode = b.dataset.m; render(); window.scrollTo({ top: 0 }); } });
  $('#mthRumi').onchange = e => { opt.rumi = e.target.checked; saveOpt(); render(); };
  $('#mthTr').onchange = e => { opt.tr = e.target.checked; saveOpt(); render(); };
  $('#mthFs').addEventListener('click', e => { const b = e.target.closest('[data-fs]'); if (!b) return; opt.fs = Math.max(20, Math.min(40, opt.fs + +b.dataset.fs)); saveOpt(); document.querySelectorAll('.mth-ar').forEach(p => p.style.fontSize = opt.fs + 'px'); });
  $('#mthReset').onclick = () => { if (!confirm(t('mt.resetAsk'))) return; const s = store.get(key(), {}); delete s[mode]; if (s.done) delete s.done[mode]; store.set(key(), s); render(); };
  $('#mthList').addEventListener('click', e => {
    const im = e.target.closest('[data-img]');
    if (im) { const it = D[+im.dataset.img]; WZ.shareImage({ title: "Al-Ma'thurat", arab: it.a, text: L ? it.me : it.m, ref: it.q ? 'QS ' + it.q : (L ? it.te : it.t) }); return; }
    const c = e.target.closest('[data-c]'); if (!c) return;
    const it = D[+c.dataset.c], s = st(); if (!left(s, it)) return;
    s[mode][it.id] = (s[mode][it.id] || 0) + 1; store.set(key(), s); vibrate(18);
    const cardEl = c.closest('.mth'), l = left(s, it);
    if (l) { c.innerHTML = `<b>${l}</b><small>${t('mt.tap')}</small>`; c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); }
    else {
      c.classList.add('ok'); c.innerHTML = ico('check') + t('mt.done'); cardEl.classList.add('done');
      const nx = [...document.querySelectorAll('#mthList .mth:not(.done)')][0];
      if (nx) setTimeout(() => nx.scrollIntoView({ behavior: 'smooth', block: 'start' }), 250);
    }
    progress();
  });
  $('#mthList').addEventListener('click', e => { const h = e.target.closest('.mth.done .mth-h'); if (h) h.parentElement.classList.toggle('open'); });
  let pend = null;
  on('show:mathurat', () => { mode = pend; pend = null; render(); });
  WZ.mathurat = { open: m => { pend = m; WZ.go('mathurat'); } };
})();
