/* Hafalan anak-anak: profil anak, ayat hafalan harian, dengar berulang, mod uji, ulangkaji, kemajuan & peringatan pagi */
(() => {
  const { $, P, store, on, toast, esc, num, vibrate, settings, saveSettings } = WZ;
  const LN = P.LocalNotifications;
  const L = LANG === 'en' ? 1 : 0;
  const AUDIO = 'https://everyayah.com/data/';
  const RECS = [['Husary_Muallim_128kbps', 'Al-Husary (Muallim)'], ['Alafasy_128kbps', 'Mishary Alafasy'], ['Minshawy_Teacher_128kbps', 'Al-Minshawi (Muallim)']];
  const COLORS = ['g-pink', 'g-blue', 'g-green', 'g-orange', 'g-purple', 'g-teal'];
  const JUZAMMA = Array.from({ length: 37 }, (_, i) => 114 - i);          // An-Nas → An-Naba'
  const pad3 = n => String(n).padStart(3, '0');
  const st = () => Object.assign({ kids: [], cur: null, time: '07:00', rec: RECS[0][0], remind: false }, store.get('hf', {}));
  const save = s => store.set('hf', s);
  const today = () => WZ.dkey(new Date());
  let IDX = null, hide = false, showTr = true;
  const kid = s => s.kids.find(k => k.id === s.cur) || s.kids[0];
  const sName = n => WZ.quran.sName(IDX.sur[n - 1]);
  const seq = k => k.plan.type === 'surah' ? Array.from({ length: 114 - k.plan.s + 1 }, (_, i) => k.plan.s + i) : JUZAMMA;
  /* N ayat seterusnya yang belum dihafal mengikut susunan rancangan */
  function targets(k, n) {
    const out = [];
    for (const s of seq(k)) { const c = IDX.sur[s - 1].c; for (let a = 1; a <= c && out.length < n; a++) if (!k.mem[`${s}:${a}`]) out.push({ s, a }); if (out.length >= n) break; }
    return out;
  }
  function streak(k) {
    let n = 0; const d = new Date();
    for (let i = 0; i < 400; i++) { const v = k.log[WZ.dkey(d)]; if (v && v.pass) n++; else if (i > 0) break; d.setDate(d.getDate() - 1); }
    return n;
  }
  function reviewPick(k) {
    const keys = Object.keys(k.mem).filter(x => k.mem[x] !== today()); if (!keys.length) return null;
    let h = 0; for (const c of today() + k.id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    const [s, a] = keys[h % keys.length].split(':').map(Number); return { s, a };
  }

  /* ---------- Audio berulang ---------- */
  const au = new Audio(); let queue = [], playingKey = null;
  function playList(list, rep) {
    const s = st(); queue = []; list.forEach(x => { for (let i = 0; i < rep; i++) queue.push(x); });
    playingKey = list.map(x => x.s + ':' + x.a).join(','); next(s.rec);
  }
  function next(rec) {
    const x = queue.shift(); if (!x) { playingKey = null; renderPlay(); return; }
    au.src = `${AUDIO}${rec}/${pad3(x.s)}${pad3(x.a)}.mp3`; au.play().catch(() => { toast(t('hf.audioErr')); queue = []; playingKey = null; renderPlay(); });
    au.onended = () => next(rec); renderPlay();
  }
  function stopAudio() { queue = []; playingKey = null; try { au.pause(); } catch {} renderPlay(); }
  function renderPlay() { document.querySelectorAll('[data-play]').forEach(b => { const on = playingKey === b.dataset.play; b.classList.toggle('on', on); b.innerHTML = ico(on ? 'pause' : 'volume-2') + `<span>${t(on ? 'hf.stop' : 'hf.listen')}</span>`; }); }

  /* ---------- Paparan ---------- */
  async function ayahCard(x, cls, d) {
    const key = `${x.s}:${x.a}`;
    return `<div class="hf-ay ${cls || ''}"><div class="hf-ref">${ico('book-open')} ${esc(sName(x.s))} · ${t('hf.ayah')} ${x.a}</div>
      <p class="arab hf-ar ${hide ? 'hide' : ''}" data-reveal>${d.a[x.a - 1]}</p>${hide ? `<small class="muted">${t('hf.tapReveal')}</small>` : ''}
      ${showTr ? `<p class="maksud">${esc((L ? d.en : d.ms)[x.a - 1])}</p>` : ''}
      <button class="btn soft sm" data-play="${key}">${ico('volume-2')}<span>${t('hf.listen')}</span></button></div>`;
  }
  async function render() {
    if (!IDX) IDX = await WZ.quran.index();
    const s = st();
    $('#hfKids').innerHTML = s.kids.map(k => `<button class="hf-kid ${k.id === (kid(s) || {}).id ? 'active' : ''}" data-kid="${k.id}"><span class="chip-ic ${k.color}">${esc(k.name.slice(0, 1).toUpperCase())}</span>${esc(k.name)}</button>`).join('')
      + `<button class="hf-kid add" id="hfAdd">${ico('plus')}${t('hf.addKid')}</button>`;
    const k = kid(s);
    $('#hfEmpty').classList.toggle('hidden', !!k); $('#hfMain').classList.toggle('hidden', !k);
    if (!k) return;
    const memN = Object.keys(k.mem).length, lg = k.log[today()] || {}, tg = lg.pass ? (lg.items || []) : targets(k, k.plan.per || 1);
    const doneSur = seq(k).filter(n => Array.from({ length: IDX.sur[n - 1].c }, (_, i) => k.mem[`${n}:${i + 1}`]).every(Boolean)).length;
    $('#hfStats').innerHTML = `<div><b>${num(memN)}</b><small>${t('hf.memN')}</small></div><div><b>${doneSur}</b><small>${t('hf.surN')}</small></div><div><b>🔥 ${streak(k)}</b><small>${t('hf.streak')}</small></div>`;
    // ayat hari ini
    let html = `<div class="card-title">${ico('target')} ${t('hf.today', { n: esc(k.name) })}</div>`;
    if (!tg.length) html += `<p>${t('hf.allDone')}</p>`;
    else {
      const ds = {}; for (const x of tg) ds[x.s] = ds[x.s] || await WZ.quran.surah(x.s);
      for (const x of tg) html += await ayahCard(x, '', ds[x.s]);
      if (tg.length > 1) html += `<button class="btn soft sm" data-play="${tg.map(x => x.s + ':' + x.a).join(',')}" data-list="1">${ico('repeat')}<span>${t('hf.listen')}</span></button>`;
      html += lg.pass ? `<div class="hf-pass">${ico('badge-check')} ${t('hf.passed', { n: esc(k.name) })}</div>`
        : `<div class="two hf-act"><button class="btn soft" id="hfAgain">${ico('rotate-ccw')}<span>${t('hf.again')}</span></button><button class="btn" id="hfPass">${ico('check')}<span>${t('hf.pass')}</span></button></div>`;
    }
    $('#hfToday').innerHTML = html;
    // ulangkaji
    const rv = reviewPick(k);
    if (rv) { const d = await WZ.quran.surah(rv.s); $('#hfReview').classList.remove('hidden');
      $('#hfReview').innerHTML = `<div class="card-title">${ico('repeat')} ${t('hf.review')}</div><small class="muted">${t('hf.reviewS')}</small>${await ayahCard(rv, 'rv', d)}
        <div class="two hf-act"><button class="btn soft" data-forgot="${rv.s}:${rv.a}">${ico('x')}<span>${t('hf.forgot')}</span></button><button class="btn soft" data-ok="1">${ico('check')}<span>${t('hf.remember')}</span></button></div>`;
    } else $('#hfReview').classList.add('hidden');
    // kemajuan
    let fresh = 0; const showN = seq(k).filter(n => { const started = Array.from({ length: IDX.sur[n - 1].c }, (_, i) => k.mem[`${n}:${i + 1}`]).some(Boolean); if (started) return true; return fresh++ < 3; });
    $('#hfProg').innerHTML = showN.map(n => { const c = IDX.sur[n - 1].c, m = Array.from({ length: c }, (_, i) => k.mem[`${n}:${i + 1}`]).filter(Boolean).length;
      return `<div class="hf-p ${m === c ? 'ok' : ''}"><span>${esc(sName(n))}</span><i><b style="width:${m / c * 100}%"></b></i><small>${m}/${c}</small></div>`; }).join('');
    // tetapan
    $('#hfPlan').value = k.plan.type === 'surah' ? String(k.plan.s) : 'juzamma';
    $('#hfPer').value = String(k.plan.per || 1); $('#hfRec').value = s.rec; $('#hfTime').value = s.time;
    $('#hfHide').classList.toggle('active', hide); $('#hfTr').classList.toggle('active', showTr);
    $('#hfRem').checked = !!s.remind; $('#hfRemBox').classList.toggle('web', !LN);
    renderPlay();
  }
  function fillSelects() {
    $('#hfPlan').innerHTML = `<option value="juzamma">${t('hf.juzamma')}</option>` + IDX.sur.map(x => `<option value="${x.n}">${t('hf.fromSurah', { s: `${x.n}. ${esc(WZ.quran.sName(x))}` })}</option>`).join('');
    $('#hfRec').innerHTML = RECS.map(([v, n]) => `<option value="${v}">${n}</option>`).join('');
  }
  const upd = fn => { const s = st(), k = kid(s); if (!k) return; fn(k, s); save(s); render(); };

  /* ---------- Tindakan ---------- */
  $('#pg-hafalan').addEventListener('click', e => {
    const kb = e.target.closest('[data-kid]'); if (kb) { const s = st(); s.cur = kb.dataset.kid; save(s); stopAudio(); render(); return; }
    if (e.target.closest('#hfAdd')) { $('#hfForm').classList.remove('hidden'); $('#hfName').focus(); return; }
    const pb = e.target.closest('[data-play]'); if (pb) { if (playingKey === pb.dataset.play) return stopAudio(); playList(pb.dataset.play.split(',').map(x => { const [s, a] = x.split(':').map(Number); return { s, a }; }), +$('#hfRep').value || 3); return; }
    const rv = e.target.closest('[data-reveal]'); if (rv && rv.classList.contains('hide')) { rv.classList.remove('hide'); return; }
    if (e.target.closest('#hfPass')) {
      upd((k) => { const tg = targets(k, k.plan.per || 1); tg.forEach(x => k.mem[`${x.s}:${x.a}`] = today()); k.log[today()] = { pass: 1, items: tg };
        const ks = Object.keys(k.log).sort(); while (ks.length > 400) delete k.log[ks.shift()]; });
      vibrate([60, 40, 60]); toast(t('hf.passToast')); stopAudio(); return;
    }
    if (e.target.closest('#hfAgain')) { upd(k => { k.log[today()] = Object.assign({}, k.log[today()], { tries: ((k.log[today()] || {}).tries || 0) + 1 }); }); toast(t('hf.againToast')); return; }
    const fg = e.target.closest('[data-forgot]'); if (fg) { upd(k => { delete k.mem[fg.dataset.forgot]; }); toast(t('hf.forgotToast')); return; }
    if (e.target.closest('[data-ok]')) { toast(t('hf.okToast')); $('#hfReview').classList.add('hidden'); return; }
    if (e.target.closest('#hfHide')) { hide = !hide; render(); return; }
    if (e.target.closest('#hfTr')) { showTr = !showTr; render(); return; }
    if (e.target.closest('#hfDel')) { const s = st(), k = kid(s); if (k && confirm(t('hf.delAsk', { n: k.name }))) { s.kids = s.kids.filter(x => x.id !== k.id); s.cur = s.kids[0] && s.kids[0].id; save(s); render(); } return; }
    if (e.target.closest('#hfIcs')) { const s = st(); WZ.ics && WZ.ics.weekly([{ title: t('hf.nT'), desc: t('hf.nB'), time: s.time, days: [0, 1, 2, 3, 4, 5, 6] }], 'wazlee-hafalan.ics'); }
  });
  $('#hfSave').onclick = () => {
    const name = $('#hfName').value.trim(); if (!name) return;
    const s = st(), id = 'k' + Date.now().toString(36);
    s.kids.push({ id, name, color: COLORS[s.kids.length % COLORS.length], plan: { type: 'juzamma', per: 1 }, mem: {}, log: {} });
    s.cur = id; save(s); $('#hfName').value = ''; $('#hfForm').classList.add('hidden'); render();
  };
  $('#hfPlan').onchange = e => upd(k => { k.plan = e.target.value === 'juzamma' ? { type: 'juzamma', per: k.plan.per } : { type: 'surah', s: +e.target.value, per: k.plan.per }; });
  $('#hfPer').onchange = e => upd(k => { k.plan.per = +e.target.value; });
  $('#hfRec').onchange = e => { const s = st(); s.rec = e.target.value; save(s); };
  $('#hfTime').onchange = e => { const s = st(); s.time = e.target.value; save(s); remind(true); };
  $('#hfRem').onchange = e => { const s = st(); s.remind = e.target.checked; save(s); remind(true); };

  /* Peringatan pagi (Android) */
  async function remind(fromToggle) {
    if (!LN) return;
    try {
      const pend = await LN.getPending(); const old = pend.notifications.filter(n => n.id >= 7300 && n.id < 7340).map(n => ({ id: n.id }));
      if (old.length) await LN.cancel({ notifications: old });
      const s = st(); if (!s.remind || !s.kids.length) return;
      if (fromToggle) { const p = await LN.requestPermissions(); if (p.display !== 'granted') return; }
      const [h, m] = s.time.split(':').map(Number), now = new Date(), list = [];
      for (let i = 0; i < 14; i++) { const at = new Date(now); at.setDate(now.getDate() + i); at.setHours(h, m, 0, 0); if (at > now) list.push({ id: 7300 + i, title: t('hf.nT'), body: t('hf.nB'), schedule: { at, allowWhileIdle: true }, extra: { route: 'hafalan' } }); }
      if (list.length) await LN.schedule({ notifications: list });
      if (fromToggle) toast(t('hf.remOn'));
    } catch {}
  }
  on('show:hafalan', async () => { if (!IDX) IDX = await WZ.quran.index(); if (!$('#hfPlan').options.length) fillSelects(); render(); });
  on('hide:hafalan', stopAudio);
  setTimeout(() => remind(false), 5000);
})();
