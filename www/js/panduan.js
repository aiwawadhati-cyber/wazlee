/* Panduan Ibadah: Ziarah Kubur, Solat Jenazah (lelaki/perempuan), Ayat Syifa', Tahlil (dengan pengira) */
(() => {
  const { $, store, on, esc } = WZ;
  const L = LANG === 'en' ? 1 : 0;
  const D = Object.assign({}, window.PANDUAN || {}, { tahlil: (window.TAHLIL || {}).items || [] }), TK = (window.TAHLIL || {}).tk;
  const cnt = {};
  let tab = store.get('pd_tab', 'ziarah'), fem = store.get('pd_fem', false), pend = null;
  const TABS = [['ziarah', 'moon-star', 'pd.ziarah'], ['jenazah', 'hand-heart', 'pd.jenazah'], ['syifa', 'heart-pulse', 'pd.syifa'], ['tahlil', 'book-heart', 'pd.tahlil']];

  function card(x, i) {
    if (x.info && !x.a) return `<div class="card pd-info"><div class="card-title">${ico(x.open ? 'book-open' : 'info')} ${esc(L ? x.te : x.t)}</div><ul>${x.info[L].map(p => `<li>${esc(p)}</li>`).join('')}</ul>
      ${x.open ? `<button class="btn block" data-open="${x.open}">${ico('book-open')}<span>${t('pd.openYasin')}</span></button>` : ''}</div>`;
    const v = fem && x.f ? x.f : x;
    return `<div class="card pd-item">
      <div class="pd-h">${x.step ? `<span class="pd-step">${x.step}</span>` : ''}<span class="grow"><b>${esc(L ? x.te : x.t)}</b>${x.q ? `<small>QS ${esc(x.q)}</small>` : x.src ? `<small>${esc(x.src)}</small>` : ''}</span>${x.n > 1 ? `<span class="mth-x">×${x.n}</span>` : ''}</div>
      <p class="arab pd-ar">${esc(v.a).replace(/\n/g, '<br>')}</p>
      ${v.r ? `<p class="rumi">${esc(v.r)}</p>` : ''}<p class="maksud">${esc(L ? v.me : v.m)}</p>
      ${x.after === 'tk' && TK ? `<div class="pd-after"><small>${t('pd.then')}</small><span class="arab">${esc(TK.a)}</span></div>` : ''}
      ${x.note ? `<p class="pd-note">${ico('info')} ${esc(Array.isArray(x.note) ? x.note[L] : x.note)}</p>` : ''}
      <div class="row-btns end">${tab === 'tahlil' && x.n > 1 ? `<button class="pd-cnt ${(cnt[i] || 0) >= x.n ? 'ok' : ''}" data-cnt="${i}">${(cnt[i] || 0) >= x.n ? ico('check') + t('mt.done') : `<b>${cnt[i] || 0}</b>/${x.n}`}</button>` : ''}<button class="btn soft sm" data-img="${i}">${ico('image')}${t('img.share')}</button></div></div>`;
  }
  function render() {
    if (pend) { tab = pend; pend = null; }
    store.set('pd_tab', tab);
    $('#pdTabs').innerHTML = TABS.map(([k, ic, l]) => `<button data-t="${k}" class="${k === tab ? 'active' : ''}">${ico(ic)}<span>${t(l)}</span></button>`).join('');
    $('#pdSex').classList.toggle('hidden', tab === 'syifa');
    $('#pdSex').querySelector('[data-f="0"]').textContent = t(tab === 'jenazah' ? 'pd.male' : 'pd.maleA'); $('#pdSex').querySelector('[data-f="1"]').textContent = t(tab === 'jenazah' ? 'pd.female' : 'pd.femaleA');
    [...$('#pdSex').querySelectorAll('[data-f]')].forEach(b => b.classList.toggle('active', (b.dataset.f === '1') === fem));
    $('#pdList').innerHTML = (D[tab] || []).map(card).join('');
    $('#pdNote').textContent = t('pd.note.' + tab);
  }
  $('#pdTabs').addEventListener('click', e => { const b = e.target.closest('[data-t]'); if (b) { tab = b.dataset.t; render(); window.scrollTo({ top: 0 }); } });
  $('#pdSex').addEventListener('click', e => { const b = e.target.closest('[data-f]'); if (b) { fem = b.dataset.f === '1'; store.set('pd_fem', fem); render(); } });
  $('#pdList').addEventListener('click', e => {
    const o = e.target.closest('[data-open]'); if (o) return WZ.quran.openSurah(+o.dataset.open, 1);
    const c = e.target.closest('[data-cnt]');
    if (c) { const i = +c.dataset.cnt, x = D[tab][i]; if ((cnt[i] || 0) >= x.n) { cnt[i] = 0; } else { cnt[i] = (cnt[i] || 0) + 1; WZ.vibrate(15); }
      c.classList.toggle('ok', cnt[i] >= x.n); c.innerHTML = cnt[i] >= x.n ? ico('check') + t('mt.done') : `<b>${cnt[i]}</b>/${x.n}`; return; }
    const im = e.target.closest('[data-img]'); if (!im) return;
    const x = D[tab][+im.dataset.img], v = fem && x.f ? x.f : x;
    WZ.shareImage({ title: L ? x.te : x.t, arab: v.a.replace(/\n/g, ' '), rumi: v.r, text: L ? v.me : v.m, ref: x.q ? 'QS ' + x.q : x.src || '' });
  });
  on('show:panduan', render);
  WZ.panduan = { open: k => { pend = k; WZ.go('panduan'); }, set: k => { pend = k; } };
})();
