/* Sudut Ilmu — 6 permainan Islamik, skor, bintang & lencana */
(() => {
  const { $, $$, P, store, on, toast, vibrate, esc } = WZ;
  const L = LANG === 'en' ? 1 : 0;
  const G = {
    'kuiz': ['Kuiz Islamik', 'Islamic Quiz'], 'kuiz.s': ['Akidah, ibadah, Al-Quran, sirah & adab', 'Faith, worship, Quran, seerah & manners'],
    'sambung': ['Sambung Ayat', 'Complete the Ayah'], 'sambung.s': ['Lengkapkan perkataan yang hilang', 'Fill in the missing word'],
    'susun': ['Susun Ayat', 'Arrange the Ayah'], 'susun.s': ['Susun perkataan mengikut turutan', 'Put the words in order'],
    'asma': ['Asmaul Husna', 'Asma ul Husna'], 'asma.s': ['Padanan memori & 99 nama Allah', 'Memory match & 99 names of Allah'],
    'hijaiyah': ['Huruf Hijaiyah', 'Hijaiyah Letters'], 'hijaiyah.s': ['Kenal & sebut huruf Arab', 'Learn & hear Arabic letters'],
    'turutan': ['Turutan Wuduk & Solat', 'Wudu & Prayer Steps'], 'turutan.s': ['Susun langkah dengan betul', 'Order the steps correctly'],
    'start': ['Mula', 'Start'], 'again': ['Main lagi', 'Play again'], 'back': ['Kembali', 'Back'], 'next': ['Seterusnya', 'Next'],
    'all': ['Semua', 'All'], 'easy': ['Mudah', 'Easy'], 'mixed': ['Campuran', 'Mixed'], 'level': ['Tahap', 'Level'], 'cat': ['Kategori', 'Category'],
    'q': ['Soalan', 'Question'], 'score': ['Markah', 'Score'], 'correct': ['Betul! 🎉', 'Correct! 🎉'], 'wrong': ['Kurang tepat', 'Not quite'],
    'answer': ['Jawapan', 'Answer'], 'timeup': ['Masa tamat', "Time's up"], 'result': ['Keputusan', 'Result'],
    'res': ['{a} daripada {b} betul', '{a} of {b} correct'], 'best': ['Terbaik', 'Best'], 'plays': ['kali dimainkan', 'plays'],
    'range': ['Pilih surah', 'Choose surahs'], 'juzamma': ['Juz Amma (78–114)', 'Juz Amma (78–114)'], 'lazim': ['Surah Lazim', 'Short Surahs'],
    'fatihah': ['Al-Fatihah & 3 Qul', 'Al-Fatihah & the 3 Quls'],
    'listen': ['Dengar', 'Listen'], 'check': ['Semak', 'Check'], 'hint': ['Bantuan', 'Hint'], 'reset': ['Ulang', 'Reset'],
    'tapWords': ['Ketik perkataan mengikut turutan (kanan → kiri)', 'Tap the words in order (right → left)'],
    'memory': ['Padanan Memori', 'Memory Match'], 'learn99': ['Belajar 99 Nama', 'Learn the 99 Names'],
    'moves': ['Langkah', 'Moves'], 'pairs': ['Padankan nama Allah dengan maksudnya', 'Match each Name with its meaning'],
    'learn': ['Belajar Huruf', 'Learn Letters'], 'quizL': ['Kuiz Huruf', 'Letter Quiz'], 'whatLetter': ['Apakah nama huruf ini?', 'What is this letter called?'],
    'findLetter': ['Cari huruf: {n}', 'Find the letter: {n}'], 'forms': ['Bentuk: awal · tengah · akhir', 'Forms: initial · medial · final'],
    'tapToHear': ['Ketik huruf untuk dengar sebutan', 'Tap a letter to hear it'], 'noTts': ['Suara Arab tidak tersedia pada peranti ini', 'Arabic voice is not available on this device'],
    'wuduk': ['Wuduk', 'Wudu'], 'solat': ['Solat', 'Prayer'], 'tapSteps': ['Ketik langkah mengikut turutan yang betul', 'Tap the steps in the correct order'],
    'mistakes': ['Kesilapan', 'Mistakes'], 'wellDone': ['Syabas!', 'Well done!'], 'stars': ['bintang', 'stars'], 'totalStars': ['Jumlah bintang', 'Total stars'],
    'played': ['Permainan dimainkan', 'Games played'], 'locked': ['Belum dibuka', 'Locked'],
    'b.first': ['Langkah Pertama', 'First Step'], 'b.first.d': ['Main mana-mana permainan', 'Play any game'],
    'b.quiz': ['Bijak Pandai', 'Bright Mind'], 'b.quiz.d': ['10/10 dalam Kuiz', '10/10 in the Quiz'],
    'b.hafiz': ['Hafiz Cilik', 'Little Hafiz'], 'b.hafiz.d': ['Sempurna dalam Sambung Ayat', 'Perfect in Complete the Ayah'],
    'b.asma': ['Pencinta Asma', 'Asma Lover'], 'b.asma.d': ['Padanan memori ≤ 8 langkah', 'Memory match in ≤ 8 moves'],
    'b.all6': ['Penjelajah Ilmu', 'Knowledge Explorer'], 'b.all6.d': ['Main kesemua 6 permainan', 'Play all 6 games'],
    'b.s30': ['30 Bintang', '30 Stars'], 'b.s30.d': ['Kumpul 30 bintang', 'Collect 30 stars'],
    'b.s100': ['100 Bintang', '100 Stars'], 'b.s100.d': ['Kumpul 100 bintang', 'Collect 100 stars'],
    'b.new': ['Lencana baharu: {b} 🏅', 'New badge: {b} 🏅']
  };
  const g = (k, v) => { let s = (G[k] || [k, k])[L]; if (v) s = s.replace(/\{(\w+)\}/g, (m, x) => v[x] ?? m); return s; };
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = (a, n) => shuffle(a).slice(0, n);
  const strip = s => s.normalize('NFKD').replace(/[ً-ٰٟۖ-ۭـ]/g, '').replace(/[ٱأإآ]/g, 'ا').replace(/ى/g, 'ي');
  const cleanWord = w => w.replace(/[ۖ-ۜ۞۩]/g, '').trim();
  const GAMES = [
    { id: 'kuiz', ic: 'brain', g: 'g-purple' }, { id: 'sambung', ic: 'puzzle', g: 'g-teal' }, { id: 'susun', ic: 'list-ordered', g: 'g-blue' },
    { id: 'asma', ic: 'star', g: 'g-orange' }, { id: 'hijaiyah', ic: 'type', g: 'g-pink' }, { id: 'turutan', ic: 'droplet', g: 'g-cyan' }
  ];
  const BADGES = [
    ['first', 'zap', st => st.plays > 0], ['quiz', 'brain', st => st.flags.quiz10], ['hafiz', 'book-open', st => st.flags.hafiz],
    ['asma', 'star', st => st.flags.asma8], ['all6', 'award', st => GAMES.every(x => (st.g[x.id] || {}).plays)],
    ['s30', 'medal', st => st.stars >= 30], ['s100', 'crown', st => st.stars >= 100]
  ];

  /* ---------- Skor ---------- */
  const S = () => Object.assign({ stars: 0, plays: 0, g: {}, flags: {}, badges: [] }, store.get('ilmu', {}));
  function record(id, stars, flags = {}) {
    const st = S(), r = st.g[id] || { best: 0, plays: 0 };
    r.plays++; r.best = Math.max(r.best, stars); st.g[id] = r;
    st.stars += stars; st.plays++; Object.assign(st.flags, flags);
    BADGES.forEach(([k, , test]) => { if (!st.badges.includes(k) && test(st)) { st.badges.push(k); setTimeout(() => { toast(g('b.new', { b: g('b.' + k) })); vibrate([80, 50, 120]); }, 900); } });
    store.set('ilmu', st); renderStarsPill();
  }
  const starHtml = n => `<span class="stars">${[1, 2, 3].map(i => `<i class="${i <= n ? 'on' : ''}">★</i>`).join('')}</span>`;
  const renderStarsPill = () => { const el = $('#lagiStars'); if (el) el.textContent = `★ ${S().stars}`; };

  /* ---------- Hub ---------- */
  function renderHub() {
    const st = S();
    $('#ilmuStats').innerHTML = `<div><b>★ ${st.stars}</b><small>${g('totalStars')}</small></div><div><b>${st.plays}</b><small>${g('played')}</small></div><div><b>${st.badges.length}/${BADGES.length}</b><small>🏅</small></div>`;
    $('#gameGrid').innerHTML = GAMES.map(x => { const r = st.g[x.id] || { best: 0, plays: 0 }; return `<button class="game-card" data-game="${x.id}"><span class="t-ic ${x.g}">${ico(x.ic)}</span><b>${g(x.id)}</b><small>${g(x.id + '.s')}</small>${starHtml(r.best)}</button>`; }).join('');
    $('#badgeList').innerHTML = BADGES.map(([k, ic]) => { const has = st.badges.includes(k); return `<div class="badge ${has ? 'on' : ''}"><span>${ico(ic)}</span><b>${g('b.' + k)}</b><small>${has ? g('b.' + k + '.d') : g('locked')}</small></div>`; }).join('');
  }
  $('#gameGrid').addEventListener('click', e => { const b = e.target.closest('[data-game]'); if (b) openGame(b.dataset.game); });
  on('show:ilmu', renderHub);
  on('show:lagi', renderStarsPill);

  /* ---------- Rangka permainan ---------- */
  const root = () => $('#gameRoot');
  let timer = null; const clearT = () => { clearInterval(timer); timer = null; };
  on('hide:game', () => { clearT(); try { P.TextToSpeech && P.TextToSpeech.stop(); } catch {} });
  function openGame(id) {
    clearT();
    const pg = $('#pg-game'); pg.dataset.titleRaw = g(id);
    if (WZ.stack[WZ.stack.length - 1] !== 'game') WZ.go('game'); else $('#tbTitle').textContent = g(id);
    ({ kuiz: kuizSetup, sambung: () => quranSetup('sambung'), susun: () => quranSetup('susun'), asma: asmaSetup, hijaiyah: hijSetup, turutan: turSetup })[id]();
    window.scrollTo(0, 0);
  }
  const head = (id, extra = '') => { const x = GAMES.find(y => y.id === id); return `<div class="g-head ${x.g}"><span class="g-ic">${ico(x.ic)}</span><div><h2>${g(id)}</h2><p>${g(id + '.s')}</p></div>${extra}</div>`; };
  const chips = (name, opts, sel) => `<div class="chips g-chips" data-name="${name}">${opts.map(([v, l]) => `<button data-v="${v}" class="${v === sel ? 'active' : ''}">${esc(l)}</button>`).join('')}</div>`;
  const chipVal = name => { const b = $(`.g-chips[data-name="${name}"] button.active`); return b && b.dataset.v; };
  document.addEventListener('click', e => { const b = e.target.closest('.g-chips button'); if (!b) return; $$('button', b.parentElement).forEach(x => x.classList.toggle('active', x === b)); });
  function result(id, correct, total, stars, extra = '') {
    root().innerHTML = `${head(id)}<div class="card center g-result"><div class="g-big">${starHtml(stars)}</div><h2>${stars === 3 ? g('wellDone') : g('result')}</h2><p class="g-score">${g('res', { a: correct, b: total })}</p>${extra}
      <div class="row-btns"><button class="btn" id="gAgain">${ico('rotate-ccw')}${g('again')}</button><button class="btn soft" data-go="ilmu">${g('back')}</button></div></div>`;
    $('#gAgain').onclick = () => openGame(id);
    if (stars === 3) vibrate([60, 40, 60, 40, 120]);
  }
  const starsOf = (c, n) => c / n >= 0.9 ? 3 : c / n >= 0.7 ? 2 : c / n >= 0.4 ? 1 : 0;

  /* ---------- 1. Kuiz Islamik ---------- */
  function kuizSetup() {
    root().innerHTML = `${head('kuiz')}<div class="card"><label class="lbl">${g('cat')}</label>${chips('cat', [['all', g('all')], ...Object.entries(QUIZ_CATS).map(([k, v]) => [k, v[L]])], 'all')}
      <label class="lbl">${g('level')}</label>${chips('lvl', [['1', g('easy')], ['all', g('mixed')]], 'all')}
      <button class="btn block g-start" id="gStart">${ico('play')}${g('start')}</button></div>`;
    $('#gStart').onclick = () => {
      const c = chipVal('cat'), l = chipVal('lvl');
      let pool = QUIZ.filter(q => (c === 'all' || q.c === c) && (l === 'all' || String(q.l) === l));
      if (pool.length < 5) pool = QUIZ.filter(q => c === 'all' || q.c === c);
      kuizPlay(pick(pool, Math.min(10, pool.length)));
    };
  }
  function kuizPlay(qs) {
    let i = 0, correct = 0, score = 0;
    const show = () => {
      clearT();
      const q = qs[i], order = shuffle([0, 1, 2, 3]); let left = 20, done = false;
      root().innerHTML = `<div class="g-top"><span>${g('q')} ${i + 1}/${qs.length}</span><span>${g('score')}: <b>${score}</b></span></div>
        <div class="g-timer"><div id="gT"></div></div>
        <div class="card g-q"><span class="g-cat">${esc(QUIZ_CATS[q.c][L])}</span><h3>${esc(q.q[L])}</h3></div>
        <div class="g-opts">${order.map(k => `<button class="g-opt" data-k="${k}">${esc(q.o[k][L])}</button>`).join('')}</div><div id="gFb"></div>`;
      const finish = k => {
        if (done) return; done = true; clearT();
        const ok = k === q.a;
        $$('.g-opt').forEach(b => { const kk = +b.dataset.k; b.disabled = true; if (kk === q.a) b.classList.add('ok'); else if (kk === k) b.classList.add('bad'); });
        if (ok) { correct++; score += 10 + left; vibrate(30); } else vibrate([40, 40, 40]);
        $('#gFb').innerHTML = `<div class="g-fb ${ok ? 'ok' : 'bad'}">${k == null ? g('timeup') : ok ? g('correct') : g('wrong')}${ok ? '' : ` · ${g('answer')}: <b>${esc(q.o[q.a][L])}</b>`}</div><button class="btn block" id="gNext">${g('next')}${ico('chevron-right')}</button>`;
        $('#gNext').onclick = () => { i++; if (i < qs.length) show(); else { const s = starsOf(correct, qs.length); record('kuiz', s, correct === qs.length && qs.length >= 10 ? { quiz10: true } : {}); result('kuiz', correct, qs.length, s, `<p class="muted">${g('score')}: ${score}</p>`); } };
      };
      $$('.g-opt').forEach(b => b.onclick = () => finish(+b.dataset.k));
      timer = setInterval(() => { left--; const el = $('#gT'); if (el) el.style.width = (left / 20 * 100) + '%'; if (left <= 0) finish(null); }, 1000);
    };
    show();
  }

  /* ---------- 2 & 3. Sambung Ayat / Susun Ayat ---------- */
  const RANGES = { juzamma: Array.from({ length: 37 }, (_, i) => 78 + i), lazim: [1, ...Array.from({ length: 12 }, (_, i) => 103 + i)], fatihah: [1, 112, 113, 114] };
  function quranSetup(id) {
    root().innerHTML = `${head(id)}<div class="card"><label class="lbl">${g('range')}</label>${chips('rng', [['fatihah', g('fatihah')], ['lazim', g('lazim')], ['juzamma', g('juzamma')]], 'lazim')}
      <button class="btn block g-start" id="gStart">${ico('play')}${g('start')}</button></div>`;
    $('#gStart').onclick = async () => {
      const rng = RANGES[chipVal('rng')], I = await WZ.quran.index();
      const pool = [];
      for (const n of rng) { const d = await WZ.quran.surah(n); d.a.forEach((a, k) => pool.push({ n, a: k + 1, ar: a, tr: (LANG === 'en' ? d.en : d.ms)[k], w: a.split(' ').filter(Boolean), sw: d.a.join(' ').split(' ') })); }
      const name = n => WZ.quran.sName(I.sur[n - 1]);
      if (id === 'sambung') sambungPlay(pick(pool.filter(x => x.w.length >= 3), 8), name);
      else susunPlay(pick(pool.filter(x => x.w.length >= 3 && x.w.length <= 8), 5), name);
    };
  }
  function ayahFoot(it, name) {
    return `<div class="card g-ayah-done"><p class="arab q-ar">${it.ar}</p><p class="maksud">${esc(it.tr)}</p><div class="row-btns"><small class="muted">${esc(name(it.n))} ${it.n}:${it.a}</small><button class="btn soft sm" data-listen="${it.n}:${it.a}">${ico('volume-2')}${g('listen')}</button></div></div>`;
  }
  document.addEventListener('click', e => { const b = e.target.closest('[data-listen]'); if (b) { const [s, a] = b.dataset.listen.split(':').map(Number); WZ.quran.Player.playOne(s, a); } });
  function sambungPlay(items, name) {
    let i = 0, correct = 0;
    const show = () => {
      const it = items[i], idxs = it.w.map((w, k) => k).filter(k => strip(it.w[k]).length >= 2), hide = idxs[Math.floor(Math.random() * idxs.length)];
      const ans = cleanWord(it.w[hide]), seen = new Set([strip(ans)]), opts = [ans];
      for (const w of shuffle(it.sw.map(cleanWord))) { const s = strip(w); if (opts.length >= 4) break; if (s.length >= 2 && !seen.has(s)) { seen.add(s); opts.push(w); } }
      const sh = shuffle(opts);
      root().innerHTML = `<div class="g-top"><span>${g('q')} ${i + 1}/${items.length}</span><span>${esc(name(it.n))} · ${it.n}:${it.a}</span></div>
        <div class="card g-q"><p class="arab q-ar g-ayah">${it.w.map((w, k) => k === hide ? '<span class="g-blank">؟</span>' : w).join(' ')}</p></div>
        <div class="g-opts ar">${sh.map(w => `<button class="g-opt arab" data-w="${esc(w)}">${w}</button>`).join('')}</div><div id="gFb"></div>`;
      $$('.g-opt').forEach(b => b.onclick = () => {
        const ok = strip(b.dataset.w) === strip(ans);
        $$('.g-opt').forEach(x => { x.disabled = true; if (strip(x.dataset.w) === strip(ans)) x.classList.add('ok'); else if (x === b) x.classList.add('bad'); });
        if (ok) { correct++; vibrate(30); } else vibrate([40, 40, 40]);
        $('#gFb').innerHTML = `<div class="g-fb ${ok ? 'ok' : 'bad'}">${ok ? g('correct') : g('wrong')}</div>${ayahFoot(it, name)}<button class="btn block" id="gNext">${g('next')}${ico('chevron-right')}</button>`;
        $('#gNext').onclick = () => { i++; if (i < items.length) show(); else { const s = starsOf(correct, items.length); record('sambung', s, correct === items.length ? { hafiz: true } : {}); result('sambung', correct, items.length, s); } };
      });
    };
    show();
  }
  function susunPlay(items, name) {
    let i = 0, correct = 0;
    const show = () => {
      const it = items[i], words = it.w.map((w, k) => ({ k, w }));
      let bank = shuffle(words); if (words.length > 1 && bank.every((x, j) => x.k === j)) bank = bank.reverse();
      let placed = [], tries = 0;
      const draw = () => {
        root().innerHTML = `<div class="g-top"><span>${g('q')} ${i + 1}/${items.length}</span><span>${esc(name(it.n))} · ${it.n}:${it.a}</span></div>
          <p class="muted small center">${g('tapWords')}</p>
          <div class="card g-answer arab">${placed.map(x => `<button class="g-chip placed" data-k="${x.k}">${x.w}</button>`).join('') || '<span class="muted">…</span>'}</div>
          <div class="g-bank arab">${bank.filter(x => !placed.includes(x)).map(x => `<button class="g-chip" data-k="${x.k}">${x.w}</button>`).join('')}</div>
          <div class="row-btns"><button class="btn soft sm" id="gHint">${ico('lightbulb')}${g('hint')}</button><button class="btn soft sm" id="gReset">${ico('undo-2')}${g('reset')}</button></div><div id="gFb"></div>`;
        $$('.g-bank .g-chip').forEach(b => b.onclick = () => { placed.push(words[+b.dataset.k]); vibrate(15); draw(); if (placed.length === words.length) check(); });
        $$('.g-answer .g-chip').forEach(b => b.onclick = () => { placed = placed.filter(x => x.k !== +b.dataset.k); draw(); });
        $('#gReset').onclick = () => { placed = []; draw(); };
        $('#gHint').onclick = () => { $('#gFb').innerHTML = `<div class="g-fb hint">${esc(it.tr)}</div>`; };
      };
      const check = () => {
        tries++;
        const ok = placed.every((x, j) => strip(x.w) === strip(it.w[j]));
        if (ok) {
          if (tries === 1) correct++;
          vibrate(30);
          $('.g-answer').classList.add('ok');
          $('#gFb').innerHTML = `<div class="g-fb ok">${g('correct')}</div>${ayahFoot(it, name)}<button class="btn block" id="gNext">${g('next')}${ico('chevron-right')}</button>`;
          $$('.g-chip').forEach(b => b.disabled = true);
          $('#gNext').onclick = () => { i++; if (i < items.length) show(); else { const s = starsOf(correct, items.length); record('susun', s); result('susun', correct, items.length, s); } };
        } else {
          vibrate([40, 40, 40]); $('.g-answer').classList.add('shake');
          $('#gFb').innerHTML = `<div class="g-fb bad">${g('wrong')}</div>`;
          setTimeout(() => { const el = $('.g-answer'); if (el) el.classList.remove('shake'); }, 500);
        }
      };
      draw();
    };
    show();
  }

  /* ---------- 4. Asmaul Husna ---------- */
  function asmaSetup() {
    root().innerHTML = `${head('asma')}<div class="g-menu"><button class="lt" id="gMem"><span class="t-ic g-orange">${ico('grid-3x3')}</span><span><b>${g('memory')}</b><small>${g('pairs')}</small></span>${ico('chevron-right', 'chev')}</button>
      <button class="lt" data-go="asmalist"><span class="t-ic g-yellow">${ico('list')}</span><span><b>${g('learn99')}</b><small>Ar-Rahman · Ar-Rahim · Al-Malik…</small></span>${ico('chevron-right', 'chev')}</button></div>`;
    $('#gMem').onclick = asmaMemory;
  }
  function asmaMemory() {
    const picks = pick(ASMA.map((a, i) => ({ ...a, i })), 6);
    const cards = shuffle(picks.flatMap(p => [{ id: p.i, t: 'ar', v: p[0] }, { id: p.i, t: 'm', v: p[2 + L] }]));
    let open = [], matched = new Set(), moves = 0, lock = false;
    const draw = () => {
      root().innerHTML = `<div class="g-top"><span>${g('memory')}</span><span>${g('moves')}: <b>${moves}</b></span></div>
        <div class="mem-grid">${cards.map((c, k) => `<button class="mem ${open.includes(k) || matched.has(c.id) ? 'up' : ''} ${matched.has(c.id) ? 'done' : ''}" data-k="${k}"><span class="back">✦</span><span class="front ${c.t === 'ar' ? 'arab' : ''}">${esc(c.v)}</span></button>`).join('')}</div>`;
      $$('.mem').forEach(b => b.onclick = () => {
        const k = +b.dataset.k; if (lock || open.includes(k) || matched.has(cards[k].id)) return;
        open.push(k); vibrate(10);
        if (open.length === 2) {
          moves++; const [a, c] = open.map(x => cards[x]);
          if (a.id === c.id && a.t !== c.t) { matched.add(a.id); open = []; vibrate(30); if (matched.size === picks.length) return setTimeout(() => {
            const s = moves <= 8 ? 3 : moves <= 12 ? 2 : 1; record('asma', s, moves <= 8 ? { asma8: true } : {});
            result('asma', picks.length, picks.length, s, `<p class="muted">${g('moves')}: ${moves}</p><div class="asma-recap">${picks.map(p => `<div><span class="arab">${p[0]}</span><small>${esc(p[1])} — ${esc(p[2 + L])}</small></div>`).join('')}</div>`);
          }, 500); }
          else { lock = true; setTimeout(() => { open = []; lock = false; draw(); }, 900); }
        }
        draw();
      });
    };
    draw();
  }
  function renderAsmaList() {
    const q = ($('#asmaSearch').value || '').toLowerCase();
    $('#asmaList').innerHTML = ASMA.map((a, i) => ({ a, i })).filter(({ a }) => !q || (a[1] + a[2] + a[3]).toLowerCase().includes(q)).map(({ a, i }) =>
      `<div class="card asma-row"><span class="q-num">${i + 1}</span><span class="grow"><b>${esc(a[1])}</b><small>${esc(a[2 + L])}</small></span><span class="arab asma-ar">${a[0]}</span></div>`).join('');
  }
  $('#asmaSearch').oninput = renderAsmaList;
  on('show:asmalist', renderAsmaList);

  /* ---------- 5. Huruf Hijaiyah ---------- */
  const forms = h => HIJAIYAH_NONJOIN.includes(h) ? [h, 'ـ' + h, 'ـ' + h] : [h + 'ـ', 'ـ' + h + 'ـ', 'ـ' + h];
  async function say(text) {
    try {
      if (P.TextToSpeech) { await P.TextToSpeech.speak({ text, lang: 'ar-SA', rate: 0.8 }); return; }
      if (window.speechSynthesis) { const u = new SpeechSynthesisUtterance(text); u.lang = 'ar-SA'; u.rate = 0.8; speechSynthesis.cancel(); speechSynthesis.speak(u); return; }
      toast(g('noTts'));
    } catch { toast(g('noTts')); }
  }
  function hijSetup() {
    root().innerHTML = `${head('hijaiyah')}<div class="seg2 g-seg"><button data-m="learn" class="active">${g('learn')}</button><button data-m="quiz">${g('quizL')}</button></div><div id="hijBody"></div>`;
    $$('.g-seg button').forEach(b => b.onclick = () => { $$('.g-seg button').forEach(x => x.classList.toggle('active', x === b)); b.dataset.m === 'learn' ? hijLearn() : hijQuiz(); });
    hijLearn();
  }
  function hijLearn() {
    $('#hijBody').innerHTML = `<p class="muted small center">${g('tapToHear')}</p><div class="hij-grid">${HIJAIYAH.map((h, i) => `<button class="hij" data-i="${i}"><span class="arab">${h[0]}</span><small>${esc(h[1 + L])}</small></button>`).join('')}</div><div id="hijDetail"></div>`;
    $$('.hij').forEach(b => b.onclick = () => {
      const h = HIJAIYAH[+b.dataset.i]; $$('.hij').forEach(x => x.classList.toggle('sel', x === b)); say(h[3]);
      $('#hijDetail').innerHTML = `<div class="card center hij-detail"><div class="arab hij-big">${h[0]}</div><b>${esc(h[1 + L])}</b><p class="muted small">${g('forms')}</p><div class="hij-forms arab">${forms(h[0]).map(f => `<span>${f}</span>`).join('')}</div><button class="btn soft sm" id="hijSay">${ico('volume-2')}${g('listen')}</button></div>`;
      $('#hijSay').onclick = () => say(h[3]);
      $('#hijDetail').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }
  function hijQuiz() {
    const items = pick(HIJAIYAH, 10); let i = 0, correct = 0;
    const show = () => {
      const h = items[i], mode = i % 2, opts = shuffle([h, ...pick(HIJAIYAH.filter(x => x !== h), 3)]);
      $('#hijBody').innerHTML = `<div class="g-top"><span>${g('q')} ${i + 1}/10</span><span>✓ ${correct}</span></div>
        <div class="card center g-q">${mode ? `<h3>${g('findLetter', { n: esc(h[1 + L]) })}</h3>` : `<p class="muted">${g('whatLetter')}</p><div class="arab hij-big">${h[0]}</div>`}</div>
        <div class="g-opts ${mode ? 'ar' : ''}">${opts.map(o => `<button class="g-opt ${mode ? 'arab big' : ''}" data-l="${o[0]}">${mode ? o[0] : esc(o[1 + L])}</button>`).join('')}</div><div id="gFb"></div>`;
      $$('.g-opt').forEach(b => b.onclick = () => {
        const ok = b.dataset.l === h[0];
        $$('.g-opt').forEach(x => { x.disabled = true; if (x.dataset.l === h[0]) x.classList.add('ok'); else if (x === b) x.classList.add('bad'); });
        if (ok) { correct++; vibrate(30); } else vibrate([40, 40, 40]);
        say(h[3]);
        $('#gFb').innerHTML = `<div class="g-fb ${ok ? 'ok' : 'bad'}">${ok ? g('correct') : g('wrong')} · <span class="arab">${h[0]}</span> = ${esc(h[1 + L])}</div><button class="btn block" id="gNext">${g('next')}${ico('chevron-right')}</button>`;
        $('#gNext').onclick = () => { i++; if (i < 10) show(); else { const s = starsOf(correct, 10); record('hijaiyah', s); result('hijaiyah', correct, 10, s); } };
      });
    };
    show();
  }

  /* ---------- 6. Turutan Wuduk & Solat ---------- */
  function turSetup() {
    root().innerHTML = `${head('turutan')}<div class="g-menu"><button class="lt" data-t="wuduk"><span class="t-ic g-cyan">${ico('droplet')}</span><span><b>${g('wuduk')}</b><small>${STEPS.wuduk.length} ${L ? 'steps' : 'langkah'}</small></span>${ico('chevron-right', 'chev')}</button>
      <button class="lt" data-t="solat"><span class="t-ic g-indigo">${ico('moon-star')}</span><span><b>${g('solat')}</b><small>${STEPS.solat.length} ${L ? 'steps' : 'langkah'}</small></span>${ico('chevron-right', 'chev')}</button></div>`;
    $$('[data-t]').forEach(b => b.onclick = () => turPlay(b.dataset.t));
  }
  function turPlay(type) {
    const steps = STEPS[type].map((s, k) => ({ k, s: s[L] }));
    const bank = shuffle(steps); let next = 0, mistakes = 0;
    const draw = () => {
      root().innerHTML = `<div class="g-top"><span>${g(type)}</span><span>${g('mistakes')}: <b>${mistakes}</b></span></div><p class="muted small center">${g('tapSteps')}</p>
        <ol class="tur-done">${steps.slice(0, next).map(x => `<li>${esc(x.s)}</li>`).join('')}</ol>
        <div class="tur-bank">${bank.filter(x => x.k >= next).map(x => `<button class="tur" data-k="${x.k}">${esc(x.s)}</button>`).join('')}</div>`;
      $$('.tur').forEach(b => b.onclick = () => {
        if (+b.dataset.k === next) { next++; vibrate(20); if (next === steps.length) { const s = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1; record('turutan', s); result('turutan', steps.length - Math.min(mistakes, steps.length), steps.length, s, `<ol class="tur-done final">${steps.map(x => `<li>${esc(x.s)}</li>`).join('')}</ol>`); return; } draw(); }
        else { mistakes++; vibrate([40, 40, 40]); b.classList.add('shake', 'bad'); setTimeout(() => { b.classList.remove('shake', 'bad'); const m = $('.g-top b'); if (m) m.textContent = mistakes; }, 450); }
      });
    };
    draw();
  }

  WZ.games = { openGame, renderHub, S };
})();
