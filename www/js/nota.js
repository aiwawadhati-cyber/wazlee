/* Nota (catatan + senarai semak + peringatan) & Penggera (app Jam sistem) */
(() => {
  const { $, $$, P, store, on, toast, esc, go } = WZ;
  const LN = P.LocalNotifications, AZ = P.WzAzan;
  const L = LANG === 'en' ? 1 : 0;
  const DAYS = [['Ahd', 'Sun'], ['Isn', 'Mon'], ['Sel', 'Tue'], ['Rab', 'Wed'], ['Kha', 'Thu'], ['Jum', 'Fri'], ['Sab', 'Sat']];

  /* ================= NOTA ================= */
  const CATS = ['umum', 'kerja', 'peribadi', 'ibadah', 'belanja', 'idea'];
  const COLORS = ['', '#FFF3B0', '#D6F5E3', '#D9ECFF', '#FFE1EC', '#EDE3FF', '#FFE4C7'];
  const notes = () => store.get('notes', []);
  const saveNotes = a => store.set('notes', a);
  let filter = 'all', cur = null, dirty = false;
  const fmt = ts => new Date(ts).toLocaleString(L ? 'en-GB' : 'ms-MY', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const nid = list => { const used = new Set(list.map(n => n.nid)); for (let i = 5000; i < 5900; i++) if (!used.has(i)) return i; return 5000; };

  function renderBody(txt) {
    return esc(txt).split('\n').slice(0, 8).map(l => {
      const m = l.match(/^\s*[-*]\s*\[( |x)\]\s?(.*)$/i) || l.match(/^\s*[-*]\s(.*)$/);
      if (!m) return `<span>${l || '&nbsp;'}</span>`;
      const done = m.length === 3 && m[1].toLowerCase() === 'x', txt2 = m.length === 3 ? m[2] : m[1];
      return `<span class="nt-ck ${done ? 'done' : ''}">${ico(done ? 'circle-check' : 'circle-dot')}${txt2}</span>`;
    }).join('');
  }
  function renderList() {
    const q = $('#ntSearch').value.trim().toLowerCase();
    $('#ntFilter').innerHTML = ['all', ...CATS].map(c => `<button class="${filter === c ? 'active' : ''}" data-f="${c}">${t(c === 'all' ? 'nt.all' : 'nt.c.' + c)}</button>`).join('');
    const all = notes();
    const list = all.filter(n => (filter === 'all' || n.cat === filter) && (!q || (n.title + ' ' + n.body).toLowerCase().includes(q)))
      .sort((a, b) => (b.pin - a.pin) || (b.upd - a.upd));
    $('#ntList').innerHTML = list.map(n => `<button class="nt-card" data-id="${n.id}" style="${n.color ? '--nc:' + n.color : ''}">
        ${n.pin ? `<span class="nt-pin">${ico('pin')}</span>` : ''}
        <b>${esc(n.title) || `<i class="muted">${t('nt.untitled')}</i>`}</b>
        <div class="nt-body">${renderBody(n.body)}</div>
        <small>${t('nt.c.' + (n.cat || 'umum'))} · ${fmt(n.upd)}${n.rem && n.rem > Date.now() ? ` · ${ico('bell-ring')}` : ''}</small>
      </button>`).join('') || `<p class="muted small center nt-empty">${t(all.length ? 'nt.none' : 'nt.empty')}</p>`;
  }
  function openNote(id) {
    const n = notes().find(x => x.id === id);
    cur = n ? Object.assign({}, n) : { id: Date.now(), title: '', body: '', cat: filter !== 'all' ? filter : 'umum', color: '', pin: false, rem: 0, upd: Date.now(), isNew: true };
    dirty = false;
    $('#ntTitle').value = cur.title; $('#ntBody').value = cur.body; $('#ntPin').checked = !!cur.pin;
    $('#ntRemind').value = cur.rem && cur.rem > Date.now() ? toLocalInput(cur.rem) : '';
    renderEdChips();
    $('#ntMeta').textContent = cur.isNew ? '' : t('nt.edited', { d: fmt(cur.upd) });
    $('#ntDel').classList.toggle('hidden', !!cur.isNew);
    go('notaed');
    if (cur.isNew) setTimeout(() => $('#ntBody').focus(), 300);
  }
  const toLocalInput = ts => { const d = new Date(ts - new Date().getTimezoneOffset() * 60000); return d.toISOString().slice(0, 16); };
  function renderEdChips() {
    $('#ntCats').innerHTML = CATS.map(c => `<button class="${cur.cat === c ? 'active' : ''}" data-c="${c}">${t('nt.c.' + c)}</button>`).join('');
    $('#ntColors').innerHTML = COLORS.map(c => `<button class="nt-sw ${cur.color === c ? 'active' : ''}" data-col="${c}" style="background:${c || 'var(--card)'}" aria-label="colour"></button>`).join('');
    $('#ntEd').style.setProperty('--nc', cur.color || 'var(--card)'); $('#ntEd').classList.toggle('tinted', !!cur.color);
  }
  async function saveCur(silent) {
    if (!cur) return;
    cur.title = $('#ntTitle').value.trim(); cur.body = $('#ntBody').value.replace(/\s+$/, '');
    cur.pin = $('#ntPin').checked;
    const rv = $('#ntRemind').value; cur.rem = rv ? new Date(rv).getTime() : 0;
    if (!cur.title && !cur.body) { if (!silent) WZ.back(); cur = null; return; }
    const all = notes(), i = all.findIndex(x => x.id === cur.id);
    cur.upd = Date.now(); delete cur.isNew;
    if (!cur.nid) cur.nid = nid(all);
    if (i >= 0) all[i] = cur; else all.unshift(cur);
    saveNotes(all); dirty = false;
    await scheduleRem(cur);
    if (!silent) { toast(cur.rem > Date.now() ? t('nt.remSet', { d: fmt(cur.rem) }) : t('nt.saved')); WZ.back(); }
  }
  async function scheduleRem(n) {
    if (!LN) return;
    try {
      await LN.cancel({ notifications: [{ id: n.nid }] });
      if (n.rem && n.rem > Date.now() + 5000) {
        const perm = await LN.requestPermissions(); if (perm.display !== 'granted') return toast(t('notif.denied'));
        await LN.schedule({ notifications: [{ id: n.nid, title: '📝 ' + (n.title || t('nt.untitled')), body: (n.body || '').slice(0, 140) || t('tile.nota'),
          schedule: { at: new Date(n.rem), allowWhileIdle: true }, extra: { route: 'nota:' + n.id } }] });
      }
    } catch {}
  }
  $('#ntNew').onclick = () => openNote(null);
  $('#ntSearch').addEventListener('input', renderList);
  $('#ntFilter').addEventListener('click', e => { const b = e.target.closest('[data-f]'); if (b) { filter = b.dataset.f; renderList(); } });
  $('#ntList').addEventListener('click', e => { const b = e.target.closest('[data-id]'); if (b) openNote(+b.dataset.id); });
  $('#ntCats').addEventListener('click', e => { const b = e.target.closest('[data-c]'); if (b) { cur.cat = b.dataset.c; dirty = true; renderEdChips(); } });
  $('#ntColors').addEventListener('click', e => { const b = e.target.closest('[data-col]'); if (b) { cur.color = b.dataset.col; dirty = true; renderEdChips(); } });
  ['#ntTitle', '#ntBody', '#ntPin', '#ntRemind'].forEach(s => $(s).addEventListener('input', () => dirty = true));
  $('#ntPin').addEventListener('change', () => dirty = true);
  $('#ntRemClr').onclick = () => { $('#ntRemind').value = ''; dirty = true; };
  $('#ntRemind').addEventListener('change', () => { const v = $('#ntRemind').value; if (v && new Date(v) < new Date()) toast(t('nt.remPast')); });
  $('#ntSave').onclick = () => saveCur(false);
  $('#ntDel').onclick = async () => {
    if (!cur || !confirm(t('nt.delAsk'))) return;
    const all = notes(), gone = all.find(x => x.id === cur.id);
    saveNotes(all.filter(x => x.id !== cur.id));
    if (LN && gone && gone.nid) try { await LN.cancel({ notifications: [{ id: gone.nid }] }); } catch {}
    cur = null; dirty = false; toast(t('nt.deleted')); WZ.back();
  };
  /* Senarai semak: ketik baris "- [ ]" dalam pratonton tidak perlu; dalam editor, Enter selepas "- " sambung senarai */
  $('#ntBody').addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const ta = e.target, pos = ta.selectionStart, before = ta.value.slice(0, pos), line = before.split('\n').pop();
    const m = line.match(/^(\s*[-*]\s(\[[ x]\]\s)?)(.*)$/i); if (!m) return;
    e.preventDefault();
    if (!m[3].trim()) { ta.value = before.slice(0, before.length - line.length) + ta.value.slice(pos); ta.selectionStart = ta.selectionEnd = pos - line.length; return; }
    const pre = '\n' + m[1].replace(/\[x\]/i, '[ ]');
    ta.value = before + pre + ta.value.slice(pos); ta.selectionStart = ta.selectionEnd = pos + pre.length; dirty = true;
  });
  on('show:nota', renderList);
  on('hide:notaed', () => { if (cur && dirty) saveCur(true).then(renderList); });

  /* ================= PENGGERA ================= */
  const alHist = () => store.get('alarms', []);
  const pad = n => String(n).padStart(2, '0');
  const hhmm = h => { const tot = Math.round(h * 60); const m = ((tot % 1440) + 1440) % 1440; return [Math.floor(m / 60), m % 60]; };
  async function setAlarm(hour, minute, label, days) {
    if ((!AZ || !AZ.setAlarm) && WZ.ics) {
      WZ.ics.alarm(hour, minute, label, days || []);
      const h = alHist(); h.unshift({ hour, minute, label, days: days || [], at: Date.now() }); store.set('alarms', h.slice(0, 15)); renderHist();
      return;
    }
    if (!AZ || !AZ.setAlarm) return toast(t('al.apkOnly'));
    try {
      await AZ.setAlarm({ hour, minute, label, days: days || [] });
      const h = alHist(); h.unshift({ hour, minute, label, days: days || [], at: Date.now() }); store.set('alarms', h.slice(0, 15));
      toast(t('al.done', { t: `${pad(hour)}:${pad(minute)}` })); renderHist();
    } catch { toast(t('al.noclock')); }
  }
  function subuhTomorrow() {
    const d = new Date(); d.setDate(d.getDate() + 1);
    try { return WZ.solat.getDay(d).t.subuh; } catch { return null; }
  }
  const OFFS = [0, 10, 15, 20, 30, 45, 60, 90];
  function renderAlarm() {
    const s = subuhTomorrow();
    $('#alSubuhInfo').textContent = s != null ? t('al.subuhInfo', { t: hhmm(s).map(pad).join(':'), z: WZ.solat.zoneText() }) : '';
    const off = store.get('alOff', 20);
    $('#alSubuhOff').innerHTML = OFFS.map(n => `<option value="${n}" ${n === off ? 'selected' : ''}>${n ? t('al.before', { n }) : t('al.atTime')}</option>`).join('');
    const sub = s || 6, Q = [
      { k: 'tahajjud', ic: 'moon-star', h: sub - 1.25, days: [] },
      { k: 'sahur', ic: 'utensils', h: sub - 1, days: [] },
      { k: 'dhuha', ic: 'sun', h: 9.5, days: [] },
      { k: 'jumaat', ic: 'calendar', h: 12.75, days: [5] }
    ];
    $('#alQuick').innerHTML = Q.map(q => { const [h, m] = hhmm(q.h); const mm = m - m % 5;
      return `<button class="al-q" data-h="${h}" data-m="${mm}" data-l="${t('al.q.' + q.k)}" data-days="${q.days.join(',')}"><span class="chip-ic g-pink">${ico(q.ic)}</span><b>${t('al.q.' + q.k)}</b><small>${pad(h)}:${pad(mm)}</small></button>`; }).join('');
    $('#alTimers').innerHTML = [1, 5, 10, 15, 20, 30, 45, 60].map(n => `<button class="al-t" data-tm="${n}">${t('al.min', { n })}</button>`).join('');
    if (!$('#alDays').innerHTML) $('#alDays').innerHTML = DAYS.map((d, i) => `<button data-ad="${i}">${d[L]}</button>`).join('');
    renderHist();
  }
  function renderHist() {
    const h = alHist();
    $('#alHist').innerHTML = h.length ? h.map(a => `<div class="al-h"><b>${pad(a.hour)}:${pad(a.minute)}</b><span>${esc(a.label)}</span><small>${a.days.length ? a.days.map(x => DAYS[x][L]).join(', ') : t('al.once')}</small></div>`).join('') : `<p class="muted small">${t('al.histEmpty')}</p>`;
  }
  $('#alSubuhOff').addEventListener('change', e => store.set('alOff', +e.target.value));
  $('#alSubuhBtn').onclick = () => {
    const s = subuhTomorrow(); if (s == null) return;
    const [h, m] = hhmm(s - (+$('#alSubuhOff').value) / 60);
    setAlarm(h, m, '🌅 ' + t('al.subuh'), [0, 1, 2, 3, 4, 5, 6]);
  };
  $('#alQuick').addEventListener('click', e => { const b = e.target.closest('[data-h]'); if (!b) return;
    setAlarm(+b.dataset.h, +b.dataset.m, b.dataset.l, b.dataset.days ? b.dataset.days.split(',').map(Number) : []); });
  $('#alDays').addEventListener('click', e => { const b = e.target.closest('[data-ad]'); if (b) b.classList.toggle('active'); });
  $('#alAddBtn').onclick = () => {
    const v = $('#alTime').value; if (!v) return;
    const [h, m] = v.split(':').map(Number);
    setAlarm(h, m, $('#alLabel').value.trim() || 'Wazlee', $$('#alDays .active').map(b => +b.dataset.ad));
  };
  $('#alTimers').addEventListener('click', async e => {
    const b = e.target.closest('[data-tm]'); if (!b) return;
    if (!AZ || !AZ.setTimer) return toast(t('al.apkOnly'));
    const n = +b.dataset.tm;
    try { await AZ.setTimer({ seconds: n * 60, label: 'Wazlee' }); toast(t('al.timerDone', { n })); } catch { toast(t('al.noclock')); }
  });
  $('#alShow').onclick = async () => { if (!AZ || !AZ.showAlarms) return toast(t('al.apkOnly')); try { await AZ.showAlarms(); } catch { toast(t('al.noclock')); } };
  on('show:alarm', renderAlarm);

  WZ.nota = { open: id => { go('nota'); openNote(id); } };
})();
