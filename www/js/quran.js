/* Al-Quran: senarai surah/juz, pembaca, carian, penanda, audio (stream + muat turun per surah) */
(() => {
  const { $, $$, P, store, on, emit, toast, vibrate, esc, num, isNative } = WZ;
  const EN = LANG === 'en';
  const RECITERS = [
    { id: 'Alafasy_128kbps', n: 'Mishary Rashid Alafasy' },
    { id: 'Abdurrahmaan_As-Sudais_192kbps', n: 'Abdurrahman As-Sudais' },
    { id: 'Minshawy_Murattal_128kbps', n: 'Muhammad Siddiq Al-Minshawi' },
    { id: 'Abu_Bakr_Ash-Shaatree_128kbps', n: 'Abu Bakr Ash-Shatri' },
    { id: 'Husary_128kbps', n: 'Mahmoud Khalil Al-Husary' },
    { id: 'Husary_Muallim_128kbps', n: 'Al-Husary (Muallim — untuk belajar / for learners)' }
  ];
  const AUDIO_BASE = 'https://everyayah.com/data/';
  const qs = Object.assign({ tr: 'auto', tl: false, fs: 28, rec: 'Alafasy_128kbps' }, store.get('qset', {}));
  const saveQs = () => store.set('qset', qs);
  let IDX = null; const cache = new Map();
  const pad3 = n => String(n).padStart(3, '0');
  const arNum = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
  const sName = s => EN ? s.ten : s.tms, sMean = s => EN ? s.men : s.mms;

  async function index() { if (!IDX) IDX = await (await fetch('quran/index.json')).json(); return IDX; }
  async function surah(n) {
    if (cache.has(n)) return cache.get(n);
    const d = await (await fetch(`quran/s/${pad3(n)}.json`)).json();
    cache.set(n, d); if (cache.size > 12) cache.delete(cache.keys().next().value);
    return d;
  }
  const trMode = () => qs.tr === 'auto' ? LANG : qs.tr;
  function trText(d, i) {
    const m = trMode();
    if (m === 'none') return '';
    if (m === 'both') return `<p class="q-tr">${esc(d.ms[i])}</p><p class="q-tr en">${esc(d.en[i])}</p>`;
    return `<p class="q-tr">${esc(d[m][i])}</p>`;
  }
  const applyFs = () => document.documentElement.style.setProperty('--qfs', qs.fs + 'px');
  applyFs();

  /* ---------- Penanda & bacaan terakhir ---------- */
  let bms = store.get('q_bm', []);
  const isBm = (s, a) => bms.includes(`${s}:${a}`);
  function toggleBm(s, a) {
    const k = `${s}:${a}`; bms = isBm(s, a) ? bms.filter(x => x !== k) : [k, ...bms];
    store.set('q_bm', bms); toast(isBm(s, a) ? t('q.bmAdded') : t('q.bmRemoved')); vibrate(20);
  }
  const setLast = (s, a) => store.set('q_last', { s, a, t: Date.now() });

  /* ---------- Senarai ---------- */
  let tab = 'surah';
  const dl = () => store.get('q_dl', {});
  const isDl = (rec, s) => !!(dl()[rec] || {})[s];
  function surahRow(s) {
    return `<button class="q-row" data-s="${s.n}"><span class="q-num">${s.n}</span><span class="q-name"><b>${esc(sName(s))}</b><small>${esc(sMean(s))} · ${s.mk ? t('q.meccan') : t('q.medinan')} · ${t('q.ayahs', { n: s.c })}</small></span>${isDl(qs.rec, s.n) ? `<span class="q-dl">${ico('download')}</span>` : ''}<span class="q-arname">${s.ar}</span></button>`;
  }
  async function renderList() {
    const I = await index(), q = $('#qSearch').value.trim().toLowerCase();
    $$('.q-seg button').forEach(b => b.classList.toggle('active', b.dataset.qt === tab));
    const last = store.get('q_last', null), c = $('#qContinue');
    if (last) {
      const s = I.sur[last.s - 1];
      c.classList.remove('hidden');
      c.innerHTML = `<span class="chip-ic teal">${ico('book-open')}</span><span class="grow"><small class="muted">${t('q.continue')}</small><b>${esc(sName(s))} · ${t('q.ayah')} ${last.a}</b></span>${ico('chevron-right', 'chev')}`;
      c.onclick = () => openSurah(last.s, last.a);
    } else c.classList.add('hidden');
    let html = '';
    if (q) {
      const m = /^(\d{1,3})(?:[:\s.](\d{1,3}))?$/.exec(q);
      if (m && +m[1] >= 1 && +m[1] <= 114) {
        const s = I.sur[+m[1] - 1], a = Math.min(+m[2] || 1, s.c);
        html += `<button class="q-row jump" data-s="${s.n}" data-a="${a}"><span class="q-num">${ico('navigation')}</span><span class="q-name"><b>${t('q.goto')} ${esc(sName(s))} ${s.n}:${a}</b></span></button>`;
      }
      const nq = x => x.toLowerCase().replace(/[^a-z0-9؀-ۿ ]/g, '');
      html += I.sur.filter(s => nq(s.tms + ' ' + s.ten + ' ' + s.mms + ' ' + s.men + ' ' + s.ar).includes(nq(q))).map(surahRow).join('');
      html += `<button class="btn soft block sm q-ftbtn" id="qFullText">${ico('search')}${t('q.searchText', { q: esc(q) })}</button><div id="qFtRes"></div>`;
    } else if (tab === 'surah') html = I.sur.map(surahRow).join('');
    else if (tab === 'juz') html = I.juz.map(([s, a], i) => `<button class="q-row" data-s="${s}" data-a="${a}"><span class="q-num juz">${i + 1}</span><span class="q-name"><b>${t('q.juz')} ${i + 1}</b><small>${esc(sName(I.sur[s - 1]))} ${s}:${a}</small></span>${ico('chevron-right', 'chev')}</button>`).join('');
    else html = bms.length ? bms.map(k => { const [s, a] = k.split(':').map(Number); return `<button class="q-row" data-s="${s}" data-a="${a}"><span class="q-num bm">${ico('bookmark')}</span><span class="q-name"><b>${esc(sName(I.sur[s - 1]))}</b><small>${t('q.ayah')} ${a}</small></span>${ico('chevron-right', 'chev')}</button>`; }).join('') : `<p class="muted center">${t('q.noBm')}</p>`;
    $('#qList').innerHTML = html;
    const ft = $('#qFullText'); if (ft) ft.onclick = () => fullText(q);
  }
  async function fullText(q) {
    const box = $('#qFtRes'), I = await index(), res = [], lq = q.toLowerCase();
    box.innerHTML = `<p class="muted center">${t('q.searching')}</p>`;
    for (const s of I.sur) {
      const d = await surah(s.n);
      for (let i = 0; i < d.a.length && res.length < 60; i++) {
        const txt = (d.ms[i] + ' ' + d.en[i]).toLowerCase();
        if (txt.includes(lq)) res.push({ s, a: i + 1, tx: d[trMode() === 'en' ? 'en' : 'ms'][i] });
      }
      if (res.length >= 60) break;
    }
    const hl = s => esc(s).replace(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig'), m => `<mark>${m}</mark>`);
    box.innerHTML = res.length ? `<p class="muted small">${t('q.found', { n: res.length >= 60 ? '60+' : res.length })}</p>` + res.map(r => `<button class="q-hit" data-s="${r.s.n}" data-a="${r.a}"><b>${esc(sName(r.s))} ${r.s.n}:${r.a}</b><span>${hl(r.tx)}</span></button>`).join('') : `<p class="muted center">${t('doa.none').replace(/doa|du'a/i, '')}</p>`;
  }
  $('#qList').addEventListener('click', e => { const b = e.target.closest('[data-s]'); if (b) openSurah(+b.dataset.s, +b.dataset.a || 1); });
  $$('.q-seg button').forEach(b => b.onclick = () => { tab = b.dataset.qt; renderList(); });
  let st; $('#qSearch').oninput = () => { clearTimeout(st); st = setTimeout(renderList, 200); };
  on('show:quran', renderList);

  /* ---------- Pembaca surah ---------- */
  let cur = null, io = null;
  async function openSurah(n, a = 1) {
    const I = await index(), s = I.sur[n - 1], d = await surah(n);
    cur = { n, s, d };
    const pg = $('#pg-surah'); pg.dataset.titleRaw = `${n}. ${sName(s)}`;
    WZ.go('surah');
    $('#tbTitle').textContent = pg.dataset.titleRaw;
    const sajda = new Set(I.sajda.map(([x, y]) => `${x}:${y}`));
    const fat = n !== 1 && n !== 9 ? (await surah(1)).a[0] : '';
    $('#sHead').innerHTML = `<div class="sh-ar">${s.ar}</div><div class="sh-name">${esc(sName(s))}</div><div class="sh-meta">${esc(sMean(s))} · ${s.mk ? t('q.meccan') : t('q.medinan')} · ${t('q.ayahs', { n: s.c })}</div>
      <div class="row-btns"><button class="btn sm" id="sPlay">${ico('play')}${t('q.playSurah')}</button><button class="btn soft sm" id="sDl"></button><button class="btn soft sm" data-go="qset">${ico('type')}Aa</button></div>
      ${fat ? `<p class="arab q-ar bism">${fat}</p>` : ''}`;
    $('#sAyat').innerHTML = d.a.map((ar, i) => `
      <div class="card ayah ${isBm(n, i + 1) ? 'bm' : ''}" id="ay-${i + 1}" data-a="${i + 1}">
        <div class="ay-top"><span class="ay-ref">${n}:${i + 1}${sajda.has(`${n}:${i + 1}`) ? ` · <em>${t('q.sajda')}</em>` : ''}</span>
          <span class="ay-act"><button data-act="play" aria-label="play">${ico('play')}</button><button data-act="bm" aria-label="bookmark">${ico(isBm(n, i + 1) ? 'bookmark-check' : 'bookmark')}</button><button data-act="share" aria-label="share">${ico('share-2')}</button></span></div>
        <p class="arab q-ar">${ar} <span class="ay-end">﴿${arNum(i + 1)}﴾</span></p>
        ${qs.tl ? `<p class="q-tl">${esc(d.tl[i])}</p>` : ''}
        ${trText(d, i)}
      </div>`).join('');
    const nextS = n < 114 ? I.sur[n] : null, prevS = n > 1 ? I.sur[n - 2] : null;
    $('#sEnd').innerHTML = `<div class="row-btns">${prevS ? `<button class="btn soft sm" data-ns="${n - 1}">${ico('chevron-left')}${esc(sName(prevS))}</button>` : ''}${nextS ? `<button class="btn soft sm" data-ns="${n + 1}">${esc(sName(nextS))}${ico('chevron-right')}</button>` : ''}</div>`;
    $('#sPlay').onclick = () => Player.playSurah(n, 1);
    updateDlBtn();
    if (io) io.disconnect();
    io = new IntersectionObserver(ents => { ents.forEach(en => { if (en.isIntersecting && cur && cur.n === n) setLast(n, +en.target.dataset.a); }); }, { rootMargin: '-40% 0px -55% 0px' });
    $$('#sAyat .ayah').forEach(el => io.observe(el));
    setLast(n, a);
    requestAnimationFrame(() => { const el = $('#ay-' + a); if (a > 1 && el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 140); else window.scrollTo(0, 0); });
    Player.highlight();
  }
  $('#sEnd').addEventListener('click', e => { const b = e.target.closest('[data-ns]'); if (b) { WZ.back(); openSurah(+b.dataset.ns, 1); } });
  $('#sAyat').addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (!b || !cur) return;
    const a = +b.closest('.ayah').dataset.a, n = cur.n;
    if (b.dataset.act === 'play') Player.playSurah(n, a);
    else if (b.dataset.act === 'bm') { toggleBm(n, a); b.innerHTML = ico(isBm(n, a) ? 'bookmark-check' : 'bookmark'); b.closest('.ayah').classList.toggle('bm', isBm(n, a)); }
    else if (b.dataset.act === 'share') {
      const d = cur.d, tr = trMode() === 'none' ? '' : `\n\n${trMode() === 'en' ? d.en[a - 1] : d.ms[a - 1]}`;
      WZ.shareText(`${d.a[a - 1]}${tr}\n\n— ${sName(cur.s)} ${n}:${a} · via Wazlee`);
    }
  });
  on('hide:surah', () => { if (io) io.disconnect(); });

  /* ---------- Audio ---------- */
  const FS = P.Filesystem, FT = P.FileTransfer;
  const canDl = !!(isNative && FS && FT);
  const relPath = (rec, s, a) => `quran-audio/${rec}/${pad3(s)}${pad3(a)}.mp3`;
  async function localUrl(rec, s, a) {
    if (!canDl || !isDl(rec, s) && !(s === 1 && a === 1 && isDl(rec, 'b'))) return null;
    try { const u = await FS.getUri({ directory: 'DATA', path: relPath(rec, s, a) }); return window.Capacitor.convertFileSrc(u.uri); } catch { return null; }
  }
  const Player = (() => {
    const au = new Audio(); au.preload = 'auto';
    let q = [], i = 0, ctx = null, rep = 0, errCount = 0;   // rep: 0 off, 1 ulang ayat, 2 ulang surah
    const ui = () => {
      const bar = $('#qPlayer'); bar.classList.toggle('hidden', !ctx);
      document.body.classList.toggle('has-player', !!ctx);
      if (!ctx) return;
      const it = q[i] || {}, I = IDX;
      $('#qpTitle').textContent = ctx.label;
      $('#qpSub').textContent = it.bism ? 'Bismillah' : `${t('q.ayah')} ${it.a} / ${I ? I.sur[ctx.s - 1].c : ''}`;
      $('#qpPlay').innerHTML = ico(au.paused ? 'play' : 'pause');
      $('#qpRep').innerHTML = ico(rep === 1 ? 'repeat-1' : 'repeat'); $('#qpRep').classList.toggle('on', rep > 0);
    };
    function highlight() {
      $$('#sAyat .ayah.playing').forEach(el => el.classList.remove('playing'));
      if (!ctx || !cur || cur.n !== ctx.s) return;
      const it = q[i]; if (!it || it.bism) return;
      const el = $('#ay-' + it.a); if (!el) return;
      el.classList.add('playing');
      if ($('#pg-surah').classList.contains('active')) { const r = el.getBoundingClientRect(); if (r.top < 90 || r.bottom > innerHeight - 170) window.scrollTo({ top: r.top + scrollY - 150, behavior: 'smooth' }); }
    }
    async function load(play = true) {
      const it = q[i]; if (!it) return stop();
      const src = (await localUrl(qs.rec, it.s, it.a)) || `${AUDIO_BASE}${qs.rec}/${pad3(it.s)}${pad3(it.a)}.mp3`;
      au.src = src; if (play) au.play().catch(() => {});
      highlight(); ui();
      if ('mediaSession' in navigator) {
        try { navigator.mediaSession.metadata = new MediaMetadata({ title: `${ctx.label}${it.bism ? '' : ' · ' + it.a}`, artist: RECITERS.find(r => r.id === qs.rec).n, album: 'Wazlee · Al-Quran' }); } catch {}
      }
    }
    async function playSurah(s, a = 1, opt = {}) {
      const I = await index(), S = I.sur[s - 1];
      q = []; if (a === 1 && s !== 1 && s !== 9 && !opt.single) q.push({ s: 1, a: 1, bism: true });
      const end = opt.single ? a : S.c;
      for (let k = a; k <= end; k++) q.push({ s, a: k });
      i = 0; errCount = 0; ctx = { s, label: `${s}. ${sName(S)}`, single: !!opt.single };
      load(true);
    }
    function stop() { au.pause(); ctx = null; q = []; highlight(); ui(); }
    au.addEventListener('ended', () => {
      errCount = 0;
      if (rep === 1 && !q[i].bism) return load(true);
      if (i < q.length - 1) { i++; load(true); }
      else if (rep === 2 && !ctx.single) { i = q[0].bism ? 1 : 0; load(true); }
      else { au.pause(); ui(); highlight(); }
    });
    au.addEventListener('error', () => {
      if (!ctx) return;
      errCount++;
      if (errCount >= 2) { toast(t(navigator.onLine === false ? 'q.offline' : 'q.audioErr')); au.pause(); ui(); return; }
      if (i < q.length - 1) { i++; load(true); }
    });
    ['play', 'pause'].forEach(e => au.addEventListener(e, ui));
    au.addEventListener('timeupdate', () => { $('#qpBar').style.width = (au.duration ? au.currentTime / au.duration * 100 : 0) + '%'; });
    $('#qpPlay').onclick = () => { if (au.paused) au.play().catch(() => {}); else au.pause(); };
    $('#qpNext').onclick = () => { if (i < q.length - 1) { i++; load(true); } };
    $('#qpPrev').onclick = () => { if (i > 0) { i--; load(true); } };
    $('#qpClose').onclick = stop;
    $('#qpRep').onclick = () => { rep = (rep + 1) % 3; toast(t(['q.repOff', 'q.repAyah', 'q.repSurah'][rep])); ui(); };
    $('#qpInfo').onclick = () => { if (ctx && !ctx.single) openSurah(ctx.s, q[i].bism ? 1 : q[i].a); };
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.setActionHandler('play', () => au.play());
        navigator.mediaSession.setActionHandler('pause', () => au.pause());
        navigator.mediaSession.setActionHandler('nexttrack', () => $('#qpNext').click());
        navigator.mediaSession.setActionHandler('previoustrack', () => $('#qpPrev').click());
      } catch {}
    }
    return { playSurah, stop, highlight, playOne: (s, a) => playSurah(s, a, { single: true }) };
  })();

  /* ---------- Muat turun per surah ---------- */
  let dlJob = null;
  function updateDlBtn() {
    const b = $('#sDl'); if (!b || !cur) return;
    if (dlJob && dlJob.s === cur.n) { b.innerHTML = `${ico('x')}${dlJob.done}/${dlJob.total}`; b.onclick = () => { dlJob.cancel = true; }; return; }
    if (isDl(qs.rec, cur.n)) { b.innerHTML = `${ico('circle-check')}${t('q.downloaded')}`; b.onclick = () => removeDl(qs.rec, cur.n); return; }
    b.innerHTML = `${ico('download')}${t('q.download')}`; b.onclick = () => download(cur.n);
  }
  async function exists(path) { try { await FS.stat({ directory: 'DATA', path }); return true; } catch { return false; } }
  async function download(n) {
    if (!canDl) return toast(t('q.dlApkOnly'));
    if (dlJob) return toast(t('q.dlBusy'));
    const I = await index(), S = I.sur[n - 1], rec = qs.rec;
    const items = []; for (let a = 1; a <= S.c; a++) items.push([n, a]);
    if (n !== 1 && n !== 9) items.push([1, 1]);
    dlJob = { s: n, done: 0, total: items.length, cancel: false };
    toast(t('q.dlStart', { s: sName(S) })); updateDlBtn();
    try {
      for (const [s, a] of items) {
        if (dlJob.cancel) throw new Error('cancel');
        const path = relPath(rec, s, a);
        if (!(await exists(path))) {
          const uri = (await FS.getUri({ directory: 'DATA', path })).uri;
          try { await FS.mkdir({ directory: 'DATA', path: `quran-audio/${rec}`, recursive: true }); } catch {}
          await FT.downloadFile({ url: `${AUDIO_BASE}${rec}/${pad3(s)}${pad3(a)}.mp3`, path: uri });
        }
        dlJob.done++; updateDlBtn();
      }
      const all = dl(); all[rec] = all[rec] || {}; all[rec][n] = Date.now(); all[rec].b = 1; store.set('q_dl', all);
      toast(t('q.dlDone', { s: sName(S) })); vibrate([60, 40, 60]);
    } catch (e) {
      toast(e.message === 'cancel' ? t('q.dlCancel') : t('q.dlFail'));
    }
    dlJob = null; updateDlBtn(); renderDlList();
  }
  async function removeDl(rec, n) {
    if (!canDl) return;
    const I = await index(), S = I.sur[n - 1];
    for (let a = 1; a <= S.c; a++) { try { await FS.deleteFile({ directory: 'DATA', path: relPath(rec, n, a) }); } catch {} }
    const all = dl(); if (all[rec]) delete all[rec][n]; store.set('q_dl', all);
    toast(t('q.dlRemoved', { s: sName(S) })); updateDlBtn(); renderDlList();
  }

  /* ---------- Tetapan Al-Quran ---------- */
  $('#qsRec').innerHTML = RECITERS.map(r => `<option value="${r.id}">${esc(r.n)}</option>`).join('');
  async function renderDlList() {
    const box = $('#qsDlList'); if (!box) return;
    const I = await index(), all = dl(), rows = [];
    Object.entries(all).forEach(([rec, m]) => Object.keys(m).filter(k => k !== 'b').forEach(s => rows.push({ rec, s: +s })));
    $('#qsDlInfo').textContent = canDl ? t('q.dlCount', { n: rows.length }) : t('q.dlApkOnly');
    box.innerHTML = rows.map(r => `<div class="dl-row"><span><b>${esc(sName(I.sur[r.s - 1]))}</b><small class="muted">${esc((RECITERS.find(x => x.id === r.rec) || { n: r.rec }).n)}</small></span><button class="icbtn" data-rm="${r.rec}|${r.s}" aria-label="delete">${ico('trash-2')}</button></div>`).join('');
  }
  $('#qsDlList').addEventListener('click', e => { const b = e.target.closest('[data-rm]'); if (b) { const [rec, s] = b.dataset.rm.split('|'); removeDl(rec, +s); } });
  function fillSettings() {
    $('#qsTr').value = qs.tr; $('#qsTl').checked = qs.tl; $('#qsFs').value = qs.fs; $('#qsFsV').textContent = qs.fs + 'px'; $('#qsRec').value = qs.rec;
    renderDlList();
  }
  const changed = () => { saveQs(); applyFs(); if (cur) cur.dirty = true; };
  $('#qsTr').onchange = e => { qs.tr = e.target.value; changed(); };
  $('#qsTl').onchange = e => { qs.tl = e.target.checked; changed(); };
  $('#qsFs').oninput = e => { qs.fs = +e.target.value; $('#qsFsV').textContent = qs.fs + 'px'; changed(); };
  $('#qsRec').onchange = e => { qs.rec = e.target.value; changed(); toast(t('q.recSet')); };
  on('show:qset', fillSettings);
  on('show:surah', () => { if (cur && cur.dirty) { cur.dirty = false; const last = store.get('q_last', { a: 1 }); openSurah(cur.n, last.s === cur.n ? last.a : 1); } });

  /* ---------- Ayat Hari Ini (skrin utama) ---------- */
  async function ayatHarian() {
    const n = new Date(), doy = Math.floor((n - new Date(n.getFullYear(), 0, 0)) / 864e5);
    const [s, a] = AYAT_HARIAN[doy % AYAT_HARIAN.length];
    try {
      const I = await index(), d = await surah(s);
      $('#hAyatRef').textContent = `${sName(I.sur[s - 1])} ${s}:${a}`;
      $('#hAyatA').innerHTML = `${d.a[a - 1]} <span class="ay-end">﴿${arNum(a)}﴾</span>`;
      $('#hAyatT').textContent = (trMode() === 'en' ? d.en : d.ms)[a - 1];
      $('#hAyat').onclick = e => { if (e.target.closest('#hAyatPlay')) return; openSurah(s, a); };
      $('#hAyatPlay').onclick = () => Player.playOne(s, a);
    } catch {}
  }

  WZ.quran = { index, surah, openSurah, Player, ayatHarian, sName };
})();
