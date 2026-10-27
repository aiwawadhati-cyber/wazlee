/* Wazlee versi web (PWA) — iPhone & pelayar: pasang ke skrin utama, luar talian, azan semasa app dibuka */
(() => {
  const { $, $$, on, toast, store, settings, isNative } = WZ;
  if (isNative) return;
  const L = LANG === 'en' ? 1 : 0;
  const S = window.I18N_KEYS;
  Object.assign(S, {
    'pwa.installT': ['Pasang Wazlee', 'Install Wazlee'],
    'pwa.ios': ['Di Safari: tekan <b>⋯</b> atau {s} <b>Kongsi</b> → skrol bawah → <b>Tambah ke Skrin Utama</b> → <b>Tambah</b>.<br><small>Dibuka dari WhatsApp? Tekan ikon Safari 🧭 dahulu.</small>', 'In Safari: tap <b>⋯</b> or {s} <b>Share</b> → scroll down → <b>Add to Home Screen</b> → <b>Add</b>.<br><small>Opened from WhatsApp? Tap the Safari 🧭 icon first.</small>'],
    'pwa.iosOther': ['Salin pautan ini & buka dalam <b>Safari</b>, kemudian tekan <b>⋯</b>/Kongsi → <b>Tambah ke Skrin Utama</b>.', 'Copy this link & open it in <b>Safari</b>, then tap <b>⋯</b>/Share → <b>Add to Home Screen</b>.'],
    'pwa.android': ['Pasang sebagai app di skrin utama — pantas & boleh guna luar talian.', 'Install as an app on your home screen — fast & works offline.'],
    'pwa.installBtn': ['Pasang', 'Install'], 'pwa.later': ['Nanti', 'Later'],
    'pwa.azT': ['Azan (versi web)', 'Adhan (web version)'],
    'pwa.azNote': ['Azan berbunyi apabila masuk waktu <b>semasa Wazlee sedang dibuka</b>. Pelayar web tidak membenarkan bunyi apabila app ditutup — untuk azan penuh walaupun telefon terkunci, guna app Android.', 'The adhan plays at prayer time <b>while Wazlee is open</b>. Browsers do not allow sound when the app is closed — for full adhan even when locked, use the Android app.'],
    'pwa.azOn': ['Bunyikan azan semasa app dibuka', 'Play adhan while the app is open'],
    'pwa.test': ['Uji azan', 'Test adhan'], 'pwa.testSubuh': ['Uji azan Subuh', 'Test Fajr adhan'], 'pwa.stop': ['Henti', 'Stop'],
    'pwa.now': ['🕌 Telah masuk waktu {p}', '🕌 It is now time for {p}'],
    'notif.apkOnly': ['Notifikasi berjadual hanya dalam app Android. Versi web: azan berbunyi semasa Wazlee dibuka.', 'Scheduled notifications are only in the Android app. Web version: the adhan plays while Wazlee is open.'],
    'al.apkOnly': ['Penggera hanya dalam app Android. Di iPhone, guna app Jam.', 'Alarms are only in the Android app. On iPhone, use the Clock app.'],
    'ics.ingBtn': ['Tambah {n} peringatan ke Kalendar', 'Add {n} reminders to Calendar'],
    'ics.ingNote': ['Peringatan dimasukkan ke app Kalendar telefon dengan amaran, jadi ia berbunyi walaupun Wazlee ditutup. Jika anda ubah peringatan, padam acara lama "Wazlee" dalam Kalendar dan tambah semula.', 'Reminders are added to your phone\'s Calendar app with alerts, so they sound even when Wazlee is closed. If you change them, delete the old "Wazlee" events in Calendar and add again.'],
    'ics.solatBtn': ['Waktu solat 30 hari ke Kalendar', 'Prayer times for 30 days to Calendar'], 'ics.pre': ['Amaran', 'Alert'],
    'ics.atTime': ['Tepat waktu', 'At prayer time'], 'ics.pre10': ['10 minit sebelum', '10 min before'], 'ics.both': ['Kedua-duanya', 'Both'],
    'ics.solatNote': ['iPhone: Kalendar akan berbunyi pada setiap waktu solat walaupun Wazlee ditutup. Ulang setiap bulan untuk 30 hari berikutnya.', 'iPhone: Calendar alerts at each prayer time even when Wazlee is closed. Repeat monthly for the next 30 days.'],
    'ics.done': ['Fail Kalendar dibuka — tekan "Tambah Semua"', 'Calendar file opened — tap "Add All"'],
    'al.sub': ['Penggera melalui app Kalendar iPhone', 'Alarms via the iPhone Calendar app'],
    'al.note': ['Versi web: "Pasang" menambah acara berulang dengan amaran ke app Kalendar telefon — ia berbunyi walaupun Wazlee ditutup. Untuk ubah atau padam, guna app Kalendar.', 'Web version: "Set" adds a repeating event with an alert to your phone\'s Calendar app — it sounds even when Wazlee is closed. To edit or delete, use the Calendar app.'],
    'pwa.updated': ['Wazlee dikemas kini ✓', 'Wazlee updated ✓'],
    'steps.nWeb': ['Masukkan langkah hari ini dari app Kesihatan (Health) di bawah.', 'Enter today\'s steps from the Health app below.'],
    'pwa.stT': ['Langkah dari app Kesihatan', 'Steps from the Health app'],
    'pwa.stNote': ['iPhone tidak membenarkan laman web membaca sensor langkah atau Apple Health. Buka app <b>Kesihatan</b> → <b>Langkah</b>, kemudian masukkan jumlahnya di sini.', 'iPhone does not let websites read the step sensor or Apple Health. Open the <b>Health</b> app → <b>Steps</b>, then enter the total here.'],
    'pwa.openHealth': ['Buka app Kesihatan', 'Open Health app'], 'pwa.save': ['Simpan', 'Save'], 'pwa.stSaved': ['Langkah disimpan ✓', 'Steps saved ✓'],
    'pwa.today': ['Hari ini', 'Today'], 'pwa.yest': ['Semalam', 'Yesterday'], 'pwa.stPh': ['cth: 6500', 'e.g. 6500'],
    'pwa.hcT': ['Kesihatan di iPhone', 'Health on iPhone'], 'pwa.hcS': ['Health Connect hanya untuk Android. Ketik untuk masukkan langkah dari app Kesihatan.', 'Health Connect is Android-only. Tap to enter steps from the Health app.']
  });
  try { applyI18n(document.body); } catch {}
  const ua = navigator.userAgent, isIOS = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const isSafari = isIOS && !/CriOS|FxiOS|EdgiOS|GSA\/|FBAN|FBAV|Instagram|Line\/|Telegram/.test(ua);
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  if (standalone) document.documentElement.classList.add('pwa-standalone');

  /* ---------- Service worker ---------- */
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('sw.js').then(reg => {
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        nw && nw.addEventListener('statechange', () => { if (nw.state === 'activated' && navigator.serviceWorker.controller) toast(t('pwa.updated')); });
      });
    }).catch(() => {});
  }

  /* ---------- Sembunyi ciri khusus Android ---------- */
  ['widgets'].forEach(k => $$(`[data-go="${k}"]`).forEach(el => el.remove()));
  // Penggera web: tiada pemasa / app Jam — guna Kalendar
  [$('#alTimers'), $('#alShow')].forEach(el => { if (el) (el.closest('.card') && el.id !== 'alShow' ? el.closest('.card') : el).classList.add('hidden'); });
  ['#notifToggle', '#notifPre', '#btnExact'].forEach(s => { const el = $(s); if (el) (el.closest('label') || el).classList.add('hidden'); });


  /* ---------- Langkah manual (iPhone/web) ---------- */
  const hcCard = $('#hcCard');
  if (hcCard) hcCard.outerHTML = `<button class="card hc-card pwa-hc" data-go="langkah"><span class="chip-ic g-pink">${ico('heart-pulse')}</span><span class="grow"><b>${t('pwa.hcT')}</b><small>${t('pwa.hcS')}</small></span>${ico('chevron-right', 'chev')}</button>`;
  const stepMain = $('#pg-langkah .step-main');
  if (stepMain) {
    const c = document.createElement('div'); c.className = 'card'; c.id = 'pwaSteps';
    c.innerHTML = `<div class="card-title">${ico('footprints')} ${t('pwa.stT')}</div><p class="muted small">${t('pwa.stNote')}</p>
      <div class="pwa-st"><select id="pwaStDay"><option value="0">${t('pwa.today')}</option><option value="1">${t('pwa.yest')}</option></select>
      <input type="number" inputmode="numeric" min="0" max="100000" id="pwaStN" placeholder="${t('pwa.stPh')}"><button class="btn" id="pwaStSave">${ico('check')}<span>${t('pwa.save')}</span></button></div>
      ${isIOS ? `<a class="btn soft block" href="x-apple-health://" style="margin-top:10px">${ico('heart-pulse')}<span>${t('pwa.openHealth')}</span></a>` : ''}`;
    stepMain.after(c);
    const dk = off => { const d = new Date(); d.setDate(d.getDate() - off); return WZ.dkey(d); };
    const fill = () => { const h = store.get('steps_hist', {}); const v = h[dk(+$('#pwaStDay').value)]; $('#pwaStN').value = v || ''; };
    $('#pwaStDay').onchange = fill; fill();
    $('#pwaStSave').onclick = () => {
      const n = +$('#pwaStN').value; if (!(n >= 0) || n > 100000) return;
      WZ.sihat.setManual(n, dk(+$('#pwaStDay').value)); toast(t('pwa.stSaved'));
    };
    on('show:langkah', fill);
  }


  /* ---------- Kalendar (.ics): peringatan, penggera & waktu solat berbunyi walaupun app ditutup ---------- */
  const p2 = n => String(n).padStart(2, '0');
  const dt = d => `${d.getFullYear()}${p2(d.getMonth() + 1)}${p2(d.getDate())}T${p2(d.getHours())}${p2(d.getMinutes())}00`;
  const esc2 = x => String(x || '').replace(/[\\;,]/g, m => '\\' + m).replace(/\n/g, '\\n');
  const BYDAY = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
  function vevent(e, i) {
    const end = new Date(e.start.getTime() + (e.dur || 5) * 60000);
    const al = (e.alarms || [0]).map(m => `BEGIN:VALARM\r\nACTION:DISPLAY\r\nDESCRIPTION:${esc2(e.title)}\r\nTRIGGER:-PT${m}M\r\nEND:VALARM`).join('\r\n');
    return ['BEGIN:VEVENT', `UID:wz-${Date.now()}-${i}@wazlee.digitalsys.my`, `DTSTAMP:${dt(new Date())}`, `DTSTART:${dt(e.start)}`, `DTEND:${dt(end)}`,
      `SUMMARY:${esc2(e.title)}`, e.desc ? `DESCRIPTION:${esc2(e.desc)}` : '', e.rrule ? `RRULE:${e.rrule}` : '', 'TRANSP:TRANSPARENT', al, 'END:VEVENT'].filter(Boolean).join('\r\n');
  }
  function download(events, name) {
    if (!events.length) return;
    const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Wazlee//MY', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:Wazlee', ...events.map(vevent), 'END:VCALENDAR'].join('\r\n');
    const url = URL.createObjectURL(new Blob([body], { type: 'text/calendar;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000); toast(t('ics.done'));
  }
  const nextAt = (h, m, days) => {
    const d = new Date(); d.setSeconds(0, 0); d.setHours(h, m);
    for (let i = 0; i < 8; i++) { if (d > new Date() && (!days || !days.length || days.includes(d.getDay()))) return d; d.setDate(d.getDate() + 1); }
    return d;
  };
  WZ.ics = {
    download,
    weekly(list, name) { // [{title, desc, time:'HH:MM', days:[0-6]}]
      download(list.map(e => { const [h, m] = e.time.split(':').map(Number);
        return { title: e.title, desc: e.desc, start: nextAt(h, m, e.days), rrule: e.days.length === 7 ? 'FREQ=DAILY' : `FREQ=WEEKLY;BYDAY=${e.days.map(d => BYDAY[d]).join(',')}` }; }), name);
    },
    alarm(h, m, label, days) {
      download([{ title: '⏰ ' + label, desc: 'Wazlee', start: nextAt(h, m, days), rrule: !days.length ? '' : days.length === 7 ? 'FREQ=DAILY' : `FREQ=WEEKLY;BYDAY=${days.map(d => BYDAY[d]).join(',')}` }], 'wazlee-penggera.ics');
    },
    solat(alarms) {
      const ev = [], now = new Date();
      for (let i = 0; i < 30; i++) {
        const d = new Date(now); d.setDate(d.getDate() + i); const day = WZ.solat.getDay(d);
        WZ.solat.MAIN.forEach(k => { const at = WZ.hToDate(d, day.t[k]); if (at > now) ev.push({ title: `🕌 ${WZ.solat.META[k].n}`, desc: WZ.solat.zoneText(), start: at, alarms }); });
      }
      download(ev, 'wazlee-waktu-solat.ics');
    }
  };

  /* ---------- Gesaan pasang ---------- */
  const SHARE = '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m8 7 4-4 4 4"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>';
  let deferred = null;
  function sheet(html, withBtn) {
    if ($('#pwaSheet') || standalone || store.get('pwaLater', 0) > Date.now()) return;
    const el = document.createElement('div'); el.id = 'pwaSheet'; el.className = 'pwa-sheet';
    el.innerHTML = `<img src="img/pwa/icon-192.png" alt=""><div class="grow"><b>${t('pwa.installT')}</b><p>${html}</p>
      <div class="pwa-btns">${withBtn ? `<button class="btn sm" data-pwa="go">${t('pwa.installBtn')}</button>` : ''}<button class="btn soft sm" data-pwa="later">${t('pwa.later')}</button></div></div>`;
    document.body.appendChild(el);
    el.addEventListener('click', async e => {
      const b = e.target.closest('[data-pwa]'); if (!b) return;
      if (b.dataset.pwa === 'go' && deferred) { deferred.prompt(); try { await deferred.userChoice; } catch {} deferred = null; }
      else store.set('pwaLater', Date.now() + 3 * 864e5);
      el.remove();
    });
  }
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; setTimeout(() => sheet(t('pwa.android'), true), 2500); });
  if (isIOS && !standalone) setTimeout(() => sheet(isSafari ? t('pwa.ios', { s: SHARE }) : t('pwa.iosOther'), false), 2500);

  /* ---------- Azan semasa app dibuka ---------- */
  const audio = new Audio(); audio.preload = 'auto';
  let unlocked = false;
  const unlock = () => { if (unlocked) return; unlocked = true; audio.src = 'sounds/azan.mp3'; audio.muted = true; audio.play().then(() => { audio.pause(); audio.currentTime = 0; audio.muted = false; }).catch(() => { audio.muted = false; }); };
  document.addEventListener('pointerdown', unlock, { once: true, capture: true });
  const webOn = () => store.get('webAzan', true);
  function play(kind) {
    audio.muted = false; audio.src = kind === 'subuh' ? 'sounds/azan_subuh.mp3' : 'sounds/azan.mp3';
    audio.currentTime = 0; return audio.play();
  }
  function stop() { try { audio.pause(); audio.currentTime = 0; } catch {} const b = $('#pwaAzBar'); if (b) b.remove(); }
  function bar(p) {
    stop();
    const el = document.createElement('div'); el.id = 'pwaAzBar'; el.className = 'pwa-azbar';
    el.innerHTML = `<b>${t('pwa.now', { p })}</b><button class="btn sm" id="pwaAzStop">${t('pwa.stop')}</button>`;
    document.body.appendChild(el); $('#pwaAzStop').onclick = stop;
    audio.onended = () => el.remove();
  }
  let next = null;
  function check() {
    try {
      const now = new Date();
      if (!next) next = WZ.solat.nextPrayer(now);
      if (next && now >= next.at) {
        const late = now - next.at, k = next.key; next = WZ.solat.nextPrayer(new Date(now.getTime() + 1000));
        const mode = (settings.azanMode || {})[k] || 'azan';
        if (late < 120000 && webOn() && mode !== 'silent' && document.visibilityState === 'visible') {
          const name = WZ.solat.META[k].n;
          if (mode === 'azan') { bar(name); play(k === 'subuh' ? 'subuh' : 'azan').catch(() => {}); }
          else toast(t('pwa.now', { p: name }));
        }
      }
    } catch {}
  }
  setInterval(check, 10000);
  on('times', () => { next = null; });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') next = null; });

  /* Tetapan azan dalam Profil (gantikan tetapan native) */
  on('show:profil', () => {
    const box = $('#azBox'); if (!box) return;
    box.innerHTML = `<div class="card-sub">${t('pwa.azT')}</div>
      <label class="switch-row"><span>${t('pwa.azOn')}</span><input type="checkbox" id="pwaAzOn" ${webOn() ? 'checked' : ''}></label>
      <div class="two" style="margin:8px 0"><button class="btn soft sm" data-t="azan">${ico('play')}<span>${t('pwa.test')}</span></button><button class="btn soft sm" data-t="subuh">${ico('play')}<span>${t('pwa.testSubuh')}</span></button></div>
      <p class="note">${t('pwa.azNote')}</p>
      <div class="card-sub" style="margin-top:14px">${ico('calendar')} ${t('ics.solatBtn')}</div>
      <div class="two"><select id="icsPre"><option value="0">${t('ics.atTime')}</option><option value="10">${t('ics.pre10')}</option><option value="b">${t('ics.both')}</option></select>
      <button class="btn" id="icsSolat">${ico('calendar')}<span>${t('pwa.save') === 'Save' ? 'Add' : 'Tambah'}</span></button></div>
      <p class="note">${t('ics.solatNote')}</p>`;
    $('#pwaAzOn').onchange = e => store.set('webAzan', e.target.checked);
    $('#icsSolat').onclick = () => { const v = $('#icsPre').value; WZ.ics.solat(v === 'b' ? [0, 10] : [+v]); };
    box.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { unlocked = true; bar(WZ.solat.META[b.dataset.t === 'subuh' ? 'subuh' : 'zohor'].n); play(b.dataset.t).catch(() => {}); });
  });

  WZ.pwa = { isIOS, standalone, play, stop };
})();
