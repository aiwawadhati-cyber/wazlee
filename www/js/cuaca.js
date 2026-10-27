/* Cuaca: ramalan 7 hari, amaran cuaca & gempa bumi — MET Malaysia melalui api.data.gov.my */
(() => {
  const { $, P, store, on, toast, esc, num } = WZ;
  const LN = P.LocalNotifications;
  const L = LANG === 'en' ? 1 : 0;
  const API = 'https://api.data.gov.my/weather';
  const TTL = 3 * 3600e3;

  /* ---------- Teks & ikon ---------- */
  const EN = [
    [/ribut petir/gi, 'thunderstorms'], [/hujan lebat/gi, 'heavy rain'], [/hujan/gi, 'rain'], [/tiada/gi, 'no'], [/berjerebu/gi, 'hazy'],
    [/mendung/gi, 'cloudy'], [/cerah/gi, 'fair'], [/berangin/gi, 'windy'], [/di satu dua tempat/gi, '(isolated)'], [/di beberapa tempat/gi, '(scattered)'],
    [/di kebanyakan tempat/gi, '(widespread)'], [/di kawasan pantai/gi, 'in coastal areas'], [/di kawasan pedalaman/gi, 'inland'],
    [/pagi/gi, 'morning'], [/petang/gi, 'afternoon'], [/malam/gi, 'night'], [/ dan /gi, ' and '], [/sepanjang hari/gi, 'all day']
  ];
  const tr = s => { if (!s) return ''; if (!L) return s; let o = s; EN.forEach(([a, b]) => o = o.replace(a, b)); return o.charAt(0).toUpperCase() + o.slice(1); };
  function icon(s) {
    s = (s || '').toLowerCase();
    if (s.includes('ribut')) return ['cloud-lightning', 'wx-storm'];
    if (s.includes('lebat')) return ['cloud-rain', 'wx-rain'];
    if (s.includes('hujan')) return [s.includes('satu dua') ? 'cloud-drizzle' : 'cloud-rain', 'wx-rain'];
    if (s.includes('jerebu')) return ['haze', 'wx-haze'];
    if (s.includes('angin')) return ['wind', 'wx-cloud'];
    if (s.includes('mendung')) return ['cloud', 'wx-cloud'];
    return ['sun', 'wx-sun'];
  }
  const dayName = (ds, i) => i === 0 ? t('wx.today') : i === 1 ? t('wx.tomorrow') : new Date(ds + 'T00:00:00').toLocaleDateString(L ? 'en-GB' : 'ms-MY', { weekday: 'long', day: 'numeric', month: 'short' });
  const fdt = s => { const d = new Date(String(s).replace(' ', 'T')); return isNaN(d) ? s : d.toLocaleString(L ? 'en-GB' : 'ms-MY', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); };
  const todayKey = () => WZ.dkey(new Date());

  /* ---------- Lokasi untuk dicari ---------- */
  function zoneInfo() {
    try { const c = WZ.solat.activeZone(); return (window.ZONES || []).find(z => z.c === c) || null; } catch { return null; }
  }
  function candidates() {
    const out = [], add = x => { x = (x || '').trim(); if (x && x.length > 2 && !out.some(o => o.toLowerCase() === x.toLowerCase())) out.push(x); };
    const ov = store.get('wxLoc', ''); if (ov) add(ov);
    add((WZ.loc.name || '').split(',')[0]);
    const z = zoneInfo(); if (z) { z.n.split(',').forEach(add); add(z.s); }
    return out.slice(0, 5);
  }
  async function getJSON(url) {
    const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 15000);
    try { const r = await fetch(url, { signal: ctl.signal }); if (!r.ok) throw new Error(r.status); return await r.json(); } finally { clearTimeout(to); }
  }
  const TYPE_RANK = { Tn: 0, Ds: 1, Rc: 2, Dv: 3, St: 4 };
  async function forecastFor(name) {
    const rows = await getJSON(`${API}/forecast?icontains=${encodeURIComponent(name)}@location__location_name&date_start=${todayKey()}@date&sort=date&limit=80`);
    if (!Array.isArray(rows) || !rows.length) return null;
    const groups = {};
    rows.forEach(r => { const id = r.location && r.location.location_id; if (id) (groups[id] = groups[id] || { loc: r.location, days: [] }).days.push(r); });
    const lc = name.toLowerCase();
    const best = Object.values(groups).sort((a, b) => {
      const ea = a.loc.location_name.toLowerCase() === lc ? 0 : 1, eb = b.loc.location_name.toLowerCase() === lc ? 0 : 1;
      return ea - eb || (TYPE_RANK[a.loc.location_id.slice(0, 2)] ?? 9) - (TYPE_RANK[b.loc.location_id.slice(0, 2)] ?? 9);
    })[0];
    best.days.sort((a, b) => a.date < b.date ? -1 : 1);
    return best;
  }
  async function warnings() {
    let rows;
    try { rows = await getJSON(`${API}/warning?sort=-warning_issue__issued&limit=30`); }
    catch { rows = await getJSON(`${API}/warning?limit=100`); }
    const now = Date.now();
    return (rows || []).filter(w => { const v = new Date(String(w.valid_to || '').replace(' ', 'T')).getTime(); return !v || v > now; });
  }
  async function quakes() {
    try { return (await getJSON(`${API}/warning/earthquake?sort=-localdatetime&limit=6`)) || []; } catch { return []; }
  }
  function relevant(w) {
    const z = zoneInfo(), names = [];
    if (z) { names.push(z.s); z.n.split(',').forEach(x => names.push(x.trim())); }
    const nm = (WZ.loc.name || '').split(',')[0].trim(); if (nm) names.push(nm);
    const txt = `${w.heading_bm || ''} ${w.text_bm || ''} ${w.text_en || ''}`.toLowerCase();
    return names.some(n => n && n.length > 2 && txt.includes(n.toLowerCase()));
  }

  /* ---------- Muat & cache ---------- */
  let busy = false;
  async function load(force) {
    const c = store.get('wx', null), key = candidates().join('|');
    if (!force && c && c.key === key && Date.now() - c.at < TTL) return c;
    if (busy) return c; busy = true;
    try {
      let fc = null;
      for (const n of candidates()) { try { fc = await forecastFor(n); } catch {} if (fc) break; }
      const [w, q] = await Promise.all([warnings().catch(() => (c && c.warn) || []), quakes()]);
      const d = { key, at: Date.now(), fc: fc || (c && c.key === key ? c.fc : null), warn: w, quake: q, miss: !fc };
      store.set('wx', d); notifyNew(d); return d;
    } catch { return c; } finally { busy = false; }
  }

  async function notifyNew(d) {
    const seen = store.get('wxSeen', []), fresh = d.warn.filter(relevant).filter(w => !seen.includes(wkey(w)));
    if (!fresh.length) return;
    store.set('wxSeen', [...seen, ...fresh.map(wkey)].slice(-60));
    if (!LN) return;
    try {
      const perm = await LN.checkPermissions(); if (perm.display !== 'granted') return;
      await LN.schedule({ notifications: fresh.slice(0, 3).map((w, i) => ({ id: 6000 + (Date.now() / 1000 + i) % 900 | 0, title: t('wx.notifT'), body: (L ? w.heading_en : w.heading_bm) || (L ? w.warning_issue?.title_en : w.warning_issue?.title_bm) || '', schedule: { at: new Date(Date.now() + 1500 + i * 500) }, extra: { route: 'cuaca' } })) });
    } catch {}
  }
  const wkey = w => `${w.warning_issue && w.warning_issue.issued}|${w.heading_bm || w.heading_en}`;

  /* ---------- Paparan ---------- */
  function renderHome(d) {
    const el = $('#wxHome'); if (!el) return;
    if (!d || !d.fc) { el.classList.add('hidden'); return; }
    const td = d.fc.days[0], [ic, cls] = icon(td.summary_forecast), rel = d.warn.filter(relevant).length;
    el.className = `wx-home ${cls}`;
    el.innerHTML = `<span class="wx-ic">${ico(ic)}</span><span class="grow"><b>${esc(tr(td.summary_forecast))}</b><small>${esc(d.fc.loc.location_name)} · ${td.min_temp}°–${td.max_temp}°C</small></span>
      ${rel ? `<span class="wx-badge">${ico('triangle-alert')}${rel}</span>` : ''}${ico('chevron-right', 'chev')}`;
  }
  function warnCard(w, rel) {
    return `<details class="card wx-warn ${rel ? 'rel' : ''}"><summary>${ico('triangle-alert')}<span class="grow"><b>${esc((L ? w.heading_en : w.heading_bm) || (L ? w.warning_issue?.title_en : w.warning_issue?.title_bm))}</b>
      <small>${t('wx.valid', { a: fdt(w.valid_from), b: fdt(w.valid_to) })}</small></span>${ico('chevron-right', 'chev')}</summary>
      <p>${esc(L ? w.text_en : w.text_bm)}</p>${(L ? w.instruction_en : w.instruction_bm) ? `<p class="muted small">${esc(L ? w.instruction_en : w.instruction_bm)}</p>` : ''}</details>`;
  }
  function render(d) {
    renderHome(d);
    if (!$('#pg-cuaca').classList.contains('active')) return;
    if (!d) { $('#wxHero').innerHTML = `<p class="muted center">${t('wx.loading')}</p>`; return; }
    if (d.fc) {
      const td = d.fc.days[0], [ic, cls] = icon(td.summary_forecast);
      $('#wxHero').className = `wx-hero ${cls}`;
      $('#wxHero').innerHTML = `<div class="wx-hero-top"><div><small>${ico('map-pin')} ${esc(d.fc.loc.location_name)}</small><h2>${td.min_temp}°–${td.max_temp}°C</h2><p>${esc(tr(td.summary_forecast))}${td.summary_when && !/tiada/i.test(td.summary_when) ? ' · ' + esc(tr(td.summary_when)) : ''}</p></div><span class="wx-big">${ico(ic)}</span></div>
        <div class="wx-parts">${[['wx.morning', td.morning_forecast], ['wx.afternoon', td.afternoon_forecast], ['wx.night', td.night_forecast]].map(([k, v]) => `<div>${ico(icon(v)[0])}<small>${t(k)}</small><b>${esc(tr(v))}</b></div>`).join('')}</div>
        <small class="wx-upd">${t('wx.updated', { t: new Date(d.at).toLocaleTimeString(L ? 'en-GB' : 'ms-MY', { hour: '2-digit', minute: '2-digit' }) })}</small>`;
      $('#wxDays').innerHTML = d.fc.days.slice(0, 7).map((r, i) => `<div class="wx-day"><span class="wx-dn">${dayName(r.date, i)}</span><span class="wx-di ${icon(r.summary_forecast)[1]}">${ico(icon(r.summary_forecast)[0])}</span><span class="wx-ds">${esc(tr(r.summary_forecast))}</span><b>${r.min_temp}°/${r.max_temp}°</b></div>`).join('');
    } else {
      $('#wxHero').className = 'wx-hero wx-cloud'; $('#wxHero').innerHTML = `<p>${t(d.miss ? 'wx.noLoc' : 'wx.fail')}</p>`; $('#wxDays').innerHTML = '';
    }
    const rel = d.warn.filter(relevant), other = d.warn.filter(w => !relevant(w));
    $('#wxWarn').innerHTML = (rel.length ? `<h3 class="sec wx-warn-h">${ico('triangle-alert')} ${t('wx.warnN', { n: rel.length })}</h3>${rel.map(w => warnCard(w, true)).join('')}` : `<div class="card wx-ok">${t('wx.noWarn')}</div>`)
      + (other.length ? `<details class="wx-other"><summary>${t('wx.warnOther', { n: other.length })}</summary>${other.map(w => warnCard(w, false)).join('')}</details>` : '');
    $('#wxQuake').innerHTML = d.quake.length ? d.quake.slice(0, 5).map(q => {
      const km = q.lat != null ? Math.round(Prayer.haversine(WZ.loc.lat, WZ.loc.lng, +q.lat, +q.lon)) : null;
      return `<div class="wx-q"><span class="wx-mag ${q.magdefault >= 5 ? 'hi' : ''}">${num(q.magdefault, 1)}</span><span class="grow"><b>${esc(L ? (q.location || q.location_original) : (q.location_original || q.location))}</b><small>${fdt(q.localdatetime)}${km != null ? ' · ' + t('wx.km', { n: num(km) }) : ''}</small></span></div>`;
    }).join('') : `<p class="muted small">${t('wx.noQuake')}</p>`;
  }

  async function refresh(force) {
    if (force && $('#pg-cuaca').classList.contains('active')) $('#wxHero').innerHTML = `<p class="muted center">${t('wx.loading')}</p>`;
    const d = await load(force); render(d);
    if (force && d && !d.fc) toast(t(d.miss ? 'wx.noLoc' : 'wx.fail'));
  }
  $('#wxGo').onclick = () => { store.set('wxLoc', $('#wxQ').value.trim()); refresh(true); };
  $('#wxQ').addEventListener('keydown', e => { if (e.key === 'Enter') $('#wxGo').click(); });
  $('#wxRefresh').onclick = () => refresh(true);
  on('show:cuaca', () => { $('#wxQ').value = store.get('wxLoc', ''); render(store.get('wx', null)); refresh(false); });
  on('show:home', () => renderHome(store.get('wx', null)));
  on('loc', () => refresh(false));
  renderHome(store.get('wx', null));
  setTimeout(() => refresh(false), 4000);
  setInterval(() => refresh(false), 30 * 60e3);
  WZ.cuaca = { refresh, icon, tr };
})();
