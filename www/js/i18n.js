/* Wazlee — dwibahasa (BM / English). Format: kunci: ['Bahasa Melayu', 'English'] */
(() => {
  const S = {
    // umum
    'tab.home': ['Utama', 'Home'], 'tab.ibadah': ['Ibadah', 'Worship'], 'tab.sihat': ['Sihat', 'Health'], 'tab.alat': ['Alat', 'Tools'], 'tab.profil': ['Profil', 'Profile'],
    'btn.another': ['Lain', 'Another'], 'btn.share': ['Kongsi', 'Share'], 'btn.reset': ['Set semula', 'Reset'],
    'time.am': ['pg', 'am'], 'time.pm': ['ptg', 'pm'], 'unit.h': ['j', 'h'],
    'err.generic': ['Ralat:', 'Error:'], 'toast.copied': ['Disalin ke papan klip', 'Copied to clipboard'],
    'loc.detecting': ['Mengesan lokasi…', 'Detecting location…'], 'loc.updated': ['Lokasi dikemas kini', 'Location updated'],
    'loc.fail': ['GPS tidak tersedia — guna lokasi tersimpan', 'GPS unavailable — using saved location'],
    'greet.morning': ['Selamat pagi', 'Good morning'], 'greet.noon': ['Selamat tengah hari', 'Good afternoon'],
    'greet.evening': ['Selamat petang', 'Good evening'], 'greet.night': ['Selamat malam', 'Good night'],
    'dir.N': ['U', 'N'], 'dir.E': ['T', 'E'], 'dir.S': ['S', 'S'], 'dir.W': ['B', 'W'],
    'dir.8': ['U,TL,T,TG,S,BD,B,BL', 'N,NE,E,SE,S,SW,W,NW'],

    // utama & hub
    'home.next': ['Solat seterusnya', 'Next prayer'], 'home.steps': ['Langkah', 'Steps'], 'home.water': ['Air', 'Water'],
    'home.doaToday': ['Doa Hari Ini', "Today's Du'a"], 'home.quote': ['Motivasi Hari Ini', "Today's Motivation"], 'home.shortcuts': ['Pintasan', 'Shortcuts'],
    'hub.ibadah': ['Waktu solat, kiblat, doa & zikir harian', "Prayer times, qibla, daily du'a & dhikr"],
    'hub.sihat': ['Langkah, Health Connect, BMI & air', 'Steps, Health Connect, BMI & water'],
    'hub.alat': ['Matawang, peta, jarak & masjid berdekatan', 'Currency, maps, distance & nearby mosques'],

    // jubin
    'tile.solat': ['Waktu Solat', 'Prayer Times'], 'tile.solat.s': ['Jadual JAKIM ikut zon & peringatan', 'JAKIM schedule by zone & reminders'], 'tile.solat.short': ['Solat', 'Prayer'],
    'tile.kiblat': ['Arah Kiblat', 'Qibla Direction'], 'tile.kiblat.s': ['Kompas hidup ke Kaabah', 'Live compass to the Kaaba'], 'tile.kiblat.short': ['Kiblat', 'Qibla'],
    'tile.doa': ['Doa Harian', "Daily Du'a"], 'tile.doa.s': ['{n} doa dengan rumi & maksud', "{n} du'a with transliteration & meaning"], 'tile.doa.short': ['Doa', "Du'a"],
    'tile.zikir': ['Zikir Pagi & Petang', 'Morning & Evening Dhikr'], 'tile.zikir.s': ['Dengan pengira bagi setiap zikir', 'With a counter for every dhikr'], 'tile.zikir.short': ['Zikir', 'Dhikr'],
    'tile.tasbih': ['Tasbih Digital', 'Digital Tasbih'], 'tile.tasbih.s': ['Kira zikir dengan getaran', 'Count dhikr with haptic feedback'], 'tile.tasbih.short': ['Tasbih', 'Tasbih'],
    'tile.langkah': ['Langkah Harian', 'Daily Steps'], 'tile.langkah.s': ['Pedometer + Health Connect, km & kalori', 'Pedometer + Health Connect, km & calories'], 'tile.langkah.short': ['Langkah', 'Steps'],
    'tile.bmi': ['Kalkulator BMI', 'BMI Calculator'], 'tile.bmi.s': ['Klasifikasi Asia (KKM)', 'Asian classification (MOH)'], 'tile.bmi.short': ['BMI', 'BMI'],
    'tile.air': ['Minum Air', 'Water Intake'], 'tile.air.s': ['Jejak gelas & peringatan', 'Track glasses & reminders'], 'tile.air.short': ['Air', 'Water'],
    'tile.fx': ['Matawang', 'Currency'], 'tile.fx.s': ['30 matawang, boleh guna luar talian', '30 currencies, works offline'], 'tile.fx.short': ['Matawang', 'Currency'],
    'tile.map': ['Peta & Jarak', 'Map & Distance'], 'tile.map.s': ['Cari tempat, ukur jarak A→B', 'Find places, measure A→B'], 'tile.map.short': ['Peta', 'Map'],
    'tile.masjid': ['Masjid Berdekatan', 'Nearby Mosques'], 'tile.masjid.s': ['Masjid & surau sekitar anda', 'Mosques & surau around you'],

    // tajuk halaman
    'ib.solat': ['Waktu Solat', 'Prayer Times'], 'ib.kiblat': ['Arah Kiblat', 'Qibla Direction'], 'ib.doa': ['Doa Harian', "Daily Du'a"],
    'ib.zikir': ['Zikir Pagi & Petang', 'Morning & Evening Dhikr'], 'ib.tasbih': ['Tasbih Digital', 'Digital Tasbih'],
    'sh.langkah': ['Langkah Harian', 'Daily Steps'], 'sh.bmi': ['Kalkulator BMI', 'BMI Calculator'], 'sh.air': ['Minum Air', 'Water Intake'],
    'al.fxTitle': ['Penukaran Matawang', 'Currency Converter'], 'al.map': ['Peta & Jarak', 'Map & Distance'], 'zon.title': ['Pilih Zon', 'Choose Zone'],

    // solat
    'p.imsak': ['Imsak', 'Imsak'], 'p.subuh': ['Subuh', 'Fajr'], 'p.syuruk': ['Syuruk', 'Sunrise'], 'p.dhuha': ['Dhuha', 'Dhuha'],
    'p.zohor': ['Zohor', 'Dhuhr'], 'p.asar': ['Asar', 'Asr'], 'p.maghrib': ['Maghrib', 'Maghrib'], 'p.isyak': ['Isyak', 'Isha'],
    'p.sub.imsak': ['had sahur', 'end of suhoor'], 'p.sub.syuruk': ['matahari terbit', 'end of Fajr time'], 'p.sub.dhuha': ['solat sunat', 'optional prayer'],
    'solat.today': ['Hari ini', 'Today'], 'solat.reload': ['Muat semula jadual JAKIM', 'Reload JAKIM schedule'],
    'solat.updated': ['Jadual JAKIM dikemas kini', 'JAKIM schedule updated'],
    'solat.loadFail': ['Tidak dapat muat jadual JAKIM — guna kiraan GPS', 'Could not load JAKIM schedule — using GPS calculation'],
    'solat.outside': ['Di luar zon JAKIM — kiraan GPS', 'Outside JAKIM zones — GPS calculation'],
    'solat.srcJakim': ['Sumber: Jadual rasmi e-Solat JAKIM (disimpan untuk guna luar talian).', 'Source: Official JAKIM e-Solat schedule (saved for offline use).'],
    'solat.srcGps': ["Sumber: kiraan astronomi dari GPS (Subuh 20°, Isyak 18°, Asar Syafi'i, ihtiyati +2 min). Mungkin berbeza 1–3 minit daripada jadual rasmi.", "Source: astronomical calculation from GPS (Fajr 20°, Isha 18°, Shafi'i Asr, +2 min precaution). May differ 1–3 minutes from the official schedule."],
    'zon.auto': ['Auto (ikut GPS)', 'Auto (by GPS)'], 'zon.gps': ['Kiraan GPS (luar Malaysia)', 'GPS calculation (outside Malaysia)'],
    'zon.gpsHint': ['Kiraan astronomi, tanpa zon JAKIM', 'Astronomical calculation, no JAKIM zone'], 'zon.state': ['Negeri', 'State'],
    'zon.detected': ['Dikesan: {z} — {n}', 'Detected: {z} — {n}'], 'zon.outside': ['Lokasi di luar Malaysia — kiraan GPS', 'Location outside Malaysia — GPS calculation'],
    'zon.tAuto': ['Zon auto ikut GPS', 'Zone set to auto (GPS)'], 'zon.tGps': ['Kiraan GPS dipilih', 'GPS calculation selected'], 'zon.tPick': ['Zon {z} dipilih', 'Zone {z} selected'],
    'notif.apkOnly': ['Peringatan hanya berfungsi dalam APK.', 'Reminders only work in the APK.'],
    'notif.denied': ['Kebenaran notifikasi ditolak.', 'Notification permission denied.'],
    'notif.in': ['Masuk waktu {p}', "It's time for {p}"], 'notif.pre': ['10 minit lagi waktu {p}', '{p} in 10 minutes'],
    'notif.preBody': ['Bersedia untuk solat {p} ({t})', 'Get ready for {p} ({t})'],
    'notif.scheduled': ['{n} peringatan dijadualkan untuk 7 hari. Ia dikemas kini setiap kali app dibuka.', '{n} reminders scheduled for 7 days. They refresh every time you open the app.'],

    // kiblat
    'qibla.info': ['dari Utara benar · {km} km ke Kaabah', 'from true North · {km} km to the Kaaba'],
    'qibla.hold': ['Pegang telefon rata & jauhkan dari logam', 'Hold your phone flat & away from metal'],
    'qibla.start': ['Aktifkan Kompas', 'Start Compass'], 'qibla.aligned': ['✓ Anda menghadap kiblat', '✓ You are facing the qibla'],
    'qibla.turnR': ['Pusing {d}° ke kanan ↻', 'Turn {d}° right ↻'], 'qibla.turnL': ['Pusing {d}° ke kiri ↺', 'Turn {d}° left ↺'],
    'qibla.nosensor': ['Sensor kompas tidak dikesan — guna darjah di atas dengan kompas lain', 'No compass sensor — use the bearing above with another compass'],

    // doa, zikir, tasbih
    'doa.search': ['Cari doa…', "Search du'a…"], 'doa.all': ['Semua', 'All'], 'doa.none': ['Tiada doa ditemui.', "No du'a found."], 'doa.meaning': ['Maksudnya', 'Meaning'],
    'zk.pagi': ['Pagi', 'Morning'], 'zk.petang': ['Petang', 'Evening'], 'zk.done': ['selesai ✓', 'done ✓'], 'zk.more': ['Rumi & maksud', 'Transliteration & meaning'],
    'zk.progress': ['{a}/{b} zikir selesai · Zikir {m}', '{a}/{b} dhikr completed · {m} dhikr'],
    'tasbih.total': ['Jumlah keseluruhan: {n}', 'All-time total: {n}'], 'tasbih.done': ['{d} ×{n} selesai ✨', '{d} ×{n} completed ✨'],

    // langkah
    'steps.today': ['langkah hari ini', 'steps today'], 'steps.goal': ['sasaran', 'of goal'], 'steps.of': ['daripada {g} langkah', 'of {g} steps'],
    'steps.activeMin': ['minit aktif', 'active min'], 'steps.allow': ['Benarkan Pengira Langkah', 'Allow Step Counter'], 'steps.week': ['7 Hari Lepas', 'Last 7 Days'],
    'steps.total': ['Jumlah', 'Total'], 'steps.avg': ['Purata', 'Average'], 'steps.hit': ['Capai sasaran', 'Goal met'],
    'steps.permNeeded': ['Kebenaran aktiviti fizikal diperlukan', 'Physical activity permission is required'],
    'steps.srcHc': ['Sumber: Health Connect', 'Source: Health Connect'], 'steps.srcSensor': ['Sumber: sensor telefon', 'Source: phone sensor'],
    'steps.nWeb': ['Pengira langkah berfungsi dalam APK Android (menggunakan sensor telefon).', 'The step counter works in the Android APK (using the phone sensor).'],
    'steps.nNoSensor': ['Telefon ini tiada sensor pengira langkah — sambung Health Connect untuk data jam pintar.', 'This phone has no step sensor — connect Health Connect for smartwatch data.'],
    'steps.nPerm': ['Benarkan akses "Aktiviti fizikal" supaya Wazlee boleh membaca langkah anda.', 'Allow "Physical activity" access so Wazlee can read your steps.'],
    'steps.nErr': ['Sensor langkah tidak dapat dibaca buat masa ini.', 'The step sensor cannot be read right now.'], 'steps.nInit': ['Membaca sensor…', 'Reading sensor…'],
    'steps.nDone': ['🎉 Tahniah! Sasaran hari ini tercapai.', "🎉 Well done! Today's goal reached."],
    'steps.nLeft': ['Lagi {n} langkah untuk capai sasaran.', '{n} more steps to reach your goal.'],

    // Health Connect
    'hc.connect': ['Sambung Health Connect', 'Connect Health Connect'], 'hc.install': ['Pasang Health Connect', 'Install Health Connect'],
    'hc.manage': ['Urus kebenaran', 'Manage permissions'], 'hc.connected': ['Health Connect disambung ✓', 'Health Connect connected ✓'],
    'hc.denied': ['Tiada kebenaran diberikan', 'No permission was granted'], 'hc.syncing': ['Menyegerak…', 'Syncing…'], 'hc.synced': ['Data kesihatan dikemas kini', 'Health data updated'],
    'hc.webOnly': ['Tersedia dalam APK Android', 'Available in the Android APK'],
    'hc.notInstalled': ['Health Connect tidak tersedia pada telefon ini', 'Health Connect is not available on this phone'],
    'hc.notConnected': ['Sambung untuk baca langkah jam pintar, degup jantung, tidur & berat', 'Connect to read smartwatch steps, heart rate, sleep & weight'],
    'hc.updatedAt': ['Disambung · dikemas kini {t}', 'Connected · updated {t}'],
    'hc.hrLast': ['Degup jantung', 'Heart rate'], 'hc.rhr': ['Degup rehat', 'Resting HR'], 'hc.sleep': ['Tidur malam tadi', 'Last night sleep'],
    'hc.kcal': ['Kalori aktif', 'Active calories'], 'hc.steps': ['Langkah (HC)', 'Steps (HC)'], 'hc.weight': ['Berat terkini', 'Latest weight'],
    'hc.privacy': ['Data kesihatan hanya dibaca dan disimpan dalam telefon anda — tidak dihantar ke mana-mana pelayan.', 'Health data is only read and stored on your phone — never sent to any server.'],

    // BMI
    'bmi.enter': ['Masukkan tinggi & berat', 'Enter height & weight'],
    'bmi.l1': ['Kurang <18.5', 'Under <18.5'], 'bmi.l2': ['Normal 18.5–22.9', 'Normal 18.5–22.9'], 'bmi.l3': ['Berlebihan 23–27.4', 'Over 23–27.4'], 'bmi.l4': ['Obes ≥27.5', 'Obese ≥27.5'],
    'bmi.c1': ['Kurang berat badan', 'Underweight'], 'bmi.c2': ['Normal', 'Normal'], 'bmi.c3': ['Berat badan berlebihan', 'Overweight'], 'bmi.c4': ['Obes', 'Obese'],
    'bmi.t1': ['Tambah pengambilan makanan berkhasiat & protein secara berperingkat.', 'Gradually increase nutritious food and protein intake.'],
    'bmi.t2': ['Hebat! Kekalkan pemakanan seimbang & aktif bergerak.', 'Great! Keep a balanced diet and stay active.'],
    'bmi.t3': ['Kurangkan gula & makanan bergoreng, sasarkan 8,000+ langkah sehari.', 'Cut sugar and fried food, aim for 8,000+ steps a day.'],
    'bmi.t4': ['Dapatkan nasihat doktor/pakar diet untuk pelan penurunan berat badan yang selamat.', 'Talk to a doctor or dietitian for a safe weight-loss plan.'],
    'bmi.range': ['Julat berat normal untuk tinggi anda: {lo}–{hi} kg.', 'Normal weight range for your height: {lo}–{hi} kg.'],
    'bmi.note': ['Klasifikasi BMI untuk populasi Asia (KKM). Untuk nasihat kesihatan, rujuk doktor.', 'BMI classification for Asian populations (Malaysian MOH). Consult a doctor for medical advice.'],

    // air
    'water.glasses': ['gelas', 'glasses'], 'water.add': ['Tambah gelas', 'Add glass'], 'water.ml': ['{a} ml daripada {b} ml', '{a} ml of {b} ml'],
    'water.notif': ['Peringatan minum air (setiap 2 jam, 8pg–10mlm)', 'Water reminders (every 2 hours, 8am–10pm)'],
    'water.goal': ['Sasaran gelas sehari (250ml)', 'Daily glasses goal (250ml)'], 'water.done': ['💧 Sasaran air hari ini tercapai!', "💧 Today's water goal reached!"],
    'water.nTitle': ['💧 Masa minum air', '💧 Time to drink water'], 'water.nBody': ['Segelas air untuk tubuh yang segar. Tandakan dalam Wazlee!', 'A glass of water keeps you fresh. Log it in Wazlee!'],
    'water.nOn': ['Peringatan minum air diaktifkan', 'Water reminders enabled'],

    // matawang & peta
    'fx.amount': ['Jumlah', 'Amount'], 'fx.popular': ['Kadar popular (1 MYR)', 'Popular rates (1 MYR)'], 'fx.updated': ['Dikemas kini', 'Updated'],
    'fx.offline': ['Tiada sambungan — kadar tidak dapat dimuat', 'Offline — rates could not be loaded'], 'fx.connect': ['Sambung ke internet untuk muat kadar terkini.', 'Connect to the internet to load the latest rates.'],
    'map.search': ['Cari tempat…', 'Search places…'], 'map.go': ['Cari', 'Search'], 'map.mosque': ['Masjid & surau berdekatan', 'Nearby mosques & surau'],
    'map.ptA': ['Titik A', 'Point A'], 'map.ptB': ['Titik B', 'Point B'], 'map.aMe': ['A = Saya', 'A = Me'], 'map.clear': ['Padam', 'Clear'],
    'map.dist': ['Jarak lurus', 'Straight distance'], 'map.bearing': ['Bearing', 'Bearing'], 'map.directions': ['Arah (Google Maps)', 'Directions (Google Maps)'],
    'map.hint': ['Ketik peta untuk tetapkan titik, atau pilih dari hasil carian.', 'Tap the map to set points, or pick from search results.'],
    'map.aSet': ['A = lokasi anda. Ketik peta untuk B.', 'A = your location. Tap the map for B.'], 'map.needB': ['Tetapkan titik B dahulu', 'Set point B first'],
    'map.setA': ['Jadikan A', 'Set as A'], 'map.setB': ['Jadikan B', 'Set as B'], 'map.noResult': ['Tiada hasil ditemui', 'No results found'],
    'map.fail': ['Carian gagal — semak sambungan', 'Search failed — check your connection'], 'map.searchingMosque': ['Mencari masjid & surau berdekatan…', 'Searching nearby mosques & surau…'],
    'map.noMosque': ['Tiada masjid/surau ditemui dalam kawasan ini', 'No mosques/surau found in this area'], 'map.fromYou': ['{km} km dari anda', '{km} km from you'],
    'map.foundMosque': ['{n} masjid/surau ditemui', '{n} mosques/surau found'], 'map.you': ['Lokasi anda', 'Your location'],

    // profil
    'pf.language': ['Bahasa / Language', 'Language / Bahasa'], 'pf.profile': ['Profil', 'Profile'], 'pf.name': ['Nama', 'Name'], 'pf.namePh': ['cth: Wawa', 'e.g. Wawa'],
    'pf.height': ['Tinggi (cm)', 'Height (cm)'], 'pf.weight': ['Berat (kg)', 'Weight (kg)'], 'pf.goal': ['Sasaran langkah harian', 'Daily step goal'],
    'pf.zone': ['Zon', 'Zone'], 'pf.timefmt': ['Format masa', 'Time format'], 'pf.fmt12': ['12 jam (5:45 pg)', '12-hour (5:45 am)'], 'pf.fmt24': ['24 jam (05:45)', '24-hour (05:45)'],
    'pf.notif': ['Peringatan masuk waktu', 'Prayer time reminders'], 'pf.notifPre': ['Peringatan 10 minit sebelum', '10-minute advance reminder'],
    'pf.exact': ['Benarkan penggera tepat', 'Allow exact alarms'], 'pf.manualLoc': ['Lokasi manual', 'Manual location'],
    'pf.manualLocHint': ['Guna jika GPS tidak tersedia.', 'Use if GPS is unavailable.'], 'pf.lat': ['Latitud', 'Latitude'], 'pf.lng': ['Longitud', 'Longitude'],
    'pf.save': ['Simpan Tetapan', 'Save Settings'], 'pf.saved': ['Tetapan disimpan ✓', 'Settings saved ✓'], 'pf.about': ['Tentang Wazlee', 'About Wazlee'],
    'pf.aboutText': ['Versi 2.1 · App harian Muslim — ibadah, kesihatan & alat harian.', 'Version 2.1 · A daily Muslim companion — worship, health & everyday tools.'],
    'pf.credits': ['Waktu solat: e-Solat JAKIM (sandaran kiraan GPS) · Kesihatan: Health Connect · Matawang: open.er-api.com · Peta: © OpenStreetMap, © CARTO · Carian: Nominatim · Ikon: Lucide (ISC) · Fon: Amiri & Nunito (OFL)', 'Prayer times: JAKIM e-Solat (GPS fallback) · Health: Health Connect · Currency: open.er-api.com · Maps: © OpenStreetMap, © CARTO · Search: Nominatim · Icons: Lucide (ISC) · Fonts: Amiri & Nunito (OFL)'],
    'pf.privacy': ['Dasar privasi', 'Privacy policy'], 'pf.defaultName': ['Pengguna Wazlee', 'Wazlee User'], 'pf.complete': ['Lengkapkan profil anda', 'Complete your profile'],
    'pf.summary': ['{h} cm · {w} kg · sasaran {g} langkah', '{h} cm · {w} kg · goal {g} steps']
  };

  const pref = (() => { try { return JSON.parse(localStorage.getItem('wz_lang')); } catch { return null; } })();
  window.LANG = pref || 'ms';
  document.documentElement.lang = LANG;
  const I = LANG === 'en' ? 1 : 0;
  window.t = (k, v) => {
    const e = S[k]; let s = e ? e[I] : k;
    if (v) s = s.replace(/\{(\w+)\}/g, (m, x) => v[x] != null ? v[x] : m);
    return s;
  };
  window.setLangPref = l => { try { localStorage.setItem('wz_lang', JSON.stringify(l)); } catch {} };
  window.applyI18n = root => {
    root.querySelectorAll('[data-i18n]').forEach(el => el.textContent = t(el.dataset.i18n));
    root.querySelectorAll('[data-i18n-ph]').forEach(el => el.placeholder = t(el.dataset.i18nPh));
  };
  window.I18N_KEYS = S;
})();
