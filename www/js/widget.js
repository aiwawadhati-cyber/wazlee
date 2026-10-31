/* Jambatan widget skrin utama (Android): hantar data, segerak air/tasbih, laluan dari ketikan widget */
(() => {
  const { $, P, store, on, emit, settings, dkey, pad, fmtH } = WZ;
  const W = P.WzWidget;
  const KEYS = ['imsak', 'subuh', 'syuruk', 'dhuha', 'zohor', 'asar', 'maghrib', 'isyak'];
  const hijriMonth = d => { try { return +new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', { month: 'numeric' }).formatToParts(d).find(p => p.type === 'month').value; } catch { return 0; } };
  const doy = d => Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5);
  const arNum = n => String(n).replace(/\d/g, x => '٠١٢٣٤٥٦٧٨٩'[x]);

  function goRoute(r) {
    if (!r) return;
    const [k, a, b] = String(r).split(':');
    if (k === 'surah') return WZ.quran.openSurah(+a || 1, +b || 1);
    if (k === 'nota' && a && WZ.nota) return WZ.nota.open(+a);
    if (k === 'zikir' && WZ.zikirMode) WZ.zikirMode(a);
    WZ.go(k);
  }

  async function payload() {
    const now = new Date(), days = {};
    for (let i = 0; i < 8; i++) {
      const d = new Date(now); d.setDate(d.getDate() + i);
      const day = WZ.solat.getDay(d);
      days[dkey(d)] = { t: KEYS.map(k => Math.round(day.t[k] * 60)), h: day.hijri, r: hijriMonth(d) === 9 ? 1 : 0 };
    }
    const z = WZ.solat.activeZone();
    const zone = z ? `${z} · ${WZ.loc.name}` : WZ.loc.name;
    // Ayat Hari Ini untuk 7 hari
    const ayat = [];
    try {
      const I = await WZ.quran.index();
      for (let i = 0; i < 7; i++) {
        const d = new Date(now); d.setDate(d.getDate() + i);
        const [s, a] = AYAT_HARIAN[doy(d) % AYAT_HARIAN.length];
        const q = await WZ.quran.surah(s);
        ayat.push({ d: dkey(d), s, a, ar: `${q.a[a - 1]} ﴿${arNum(a)}﴾`, tr: (LANG === 'en' ? q.en : q.ms)[a - 1], ref: `${WZ.quran.sName(I.sur[s - 1])} ${s}:${a}` });
      }
    } catch {}
    // Zikir hari ini
    const zk = {};
    ['pagi', 'petang'].forEach(m => {
      const c = store.get(`zk_${dkey(now)}_${m}`, {});
      const items = ZIKIR.map((x, i) => ({ ...x, i })).filter(x => x.w === 'both' || x.w === m);
      zk[m] = [items.filter(x => (c[x.i] || 0) >= x.n).length, items.length];
    });
    const tas = store.get('tasbih', {});
    const at = new Date();
    return {
      lang: LANG, fmt: settings.fmt, zone, days, ayat, theme: WZ.themeOf(), wcol: settings.wcol || 'tema',
      names: KEYS.map(k => t('p.' + k)),
      steps: { date: dkey(now), n: WZ.sihat.steps || 0, goal: +settings.goal || 8000, at: fmtH(at.getHours() + at.getMinutes() / 60) },
      water: { date: dkey(now), n: store.get('water_' + dkey(now), 0), goal: +settings.waterGoal || 8, t: store.get('water_t', 0) },
      tasbih: { count: tas.count || 0, goal: tas.goal || 33, total: tas.total || 0, dz: tas.dz || 'Subhanallah', t: tas.t || 0 },
      zikir: { date: dkey(now), pagi: zk.pagi, petang: zk.petang },
      lbl: {
        in: t('w.in'), open: t('w.open'), ayat: t('home.ayatToday'), am: t('time.am'), pm: t('time.pm'),
        stepsOpen: t('w.stepsOpen'), updated: t('w.updated'), glasses: t('water.glasses'), total: t('w.total'),
        zkPagi: t('w.zkPagi'), zkPetang: t('w.zkPetang'), zkDone: t('w.zkDone'), zkTap: t('w.zkTap')
      }
    };
  }

  let tmr = null, busy = false;
  function push(delay = 1500) {
    if (!W) return;
    clearTimeout(tmr);
    tmr = setTimeout(async () => {
      if (busy) return push(800);
      busy = true;
      try { await W.update(await payload()); } catch (e) { console.warn('widget', e); }
      busy = false;
    }, delay);
  }

  async function sync() {
    if (!W) return;
    try {
      const s = await W.getState(), today = dkey(new Date());
      if (s.water && s.water.date === today && (s.water.t || 0) > store.get('water_t', 0)) {
        store.set('water_' + today, s.water.n); store.set('water_t', s.water.t);
        WZ.sihat.renderWater();
      }
      const tas = store.get('tasbih', {});
      if (s.tasbih && (s.tasbih.t || 0) > (tas.t || 0)) {
        store.set('tasbih', Object.assign(tas, { count: s.tasbih.count, total: s.tasbih.total, t: s.tasbih.t }));
        if (WZ.tasbih) WZ.tasbih.reload();
      }
    } catch {}
  }

  if (W) {
    W.addListener('route', e => goRoute(e && e.route));
    on('times', () => push()); on('loc', () => push()); on('settings', () => push());
    on('steps', () => push(5000)); on('water', () => push(300)); on('tasbih', () => push(300)); on('zikir', () => push(800));
  }

  WZ.widget = {
    push, sync, goRoute,
    async start() {
      if (!W) return;
      await sync();
      try { const r = await W.consumeRoute(); if (r && r.route) goRoute(r.route); } catch {}
      push(2500);
    }
  };
})();
