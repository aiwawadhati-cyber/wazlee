# Wazlee v2.9 — App Harian Muslim (Android)

**Ibadah · Sihat · Alat** dalam satu app bertema biru yang ceria. **Dwibahasa: Bahasa Melayu & English** (tukar di butang EN/BM atas atau Profil → Bahasa).

| Tab | Ciri |
|---|---|
| **Utama** | Kiraan mundur solat, 5 waktu hari ini, langkah & air, **Ayat Hari Ini**, doa hari ini, motivasi, pintasan |
| **Al-Quran** | 114 surah (teks Uthmani disahkan), terjemahan BM Basmeih & EN Sahih International, transliterasi, carian surah/ayat/kata kunci, juz, penanda, sambung bacaan, 6 qari, audio streaming + **muat turun per surah** (luar talian), ulang ayat/surah |
| **Ibadah** | Waktu Solat (zon JAKIM), Arah Kiblat (kompas), Doa Harian (20), Zikir Pagi & Petang (dengan pengira), Tasbih |
| **Sihat** | Langkah harian (sensor pedometer **+ Health Connect**) + km/kalori + carta 7 hari, **Health Connect**: degup jantung, degup rehat, tidur, kalori aktif, berat; Kalkulator BMI (Asia/KKM), Minum Air + peringatan |
| **Lagi** | **Sudut Ilmu** (6 permainan), **Nota**, **Penggera**, Peringatan, Matawang, Peta & Jarak, Masjid berdekatan, Profil & Tetapan |

### Sudut Ilmu — 6 permainan (bintang & 7 lencana)
1. **Kuiz Islamik** — 60 soalan BM/EN (akidah, ibadah, Al-Quran, sirah, adab), pemasa 20s
2. **Sambung Ayat** — lengkapkan perkataan yang hilang (Al-Fatihah & 3 Qul / Surah Lazim / Juz Amma)
3. **Susun Ayat** — susun perkataan ayat mengikut turutan
4. **Asmaul Husna** — padanan memori + senarai 99 nama
5. **Huruf Hijaiyah** — belajar 28 huruf (bentuk awal/tengah/akhir + sebutan suara) & kuiz
6. **Turutan Wuduk & Solat** — susun langkah dengan betul

> Bank soalan kuiz (`www/data/ilmu.js`) wajar disemak oleh guru/ustaz sebelum edaran luas.

## Widget skrin utama (6)
| Widget | Saiz | Fungsi |
|---|---|---|
| Waktu Solat | 4×2 | Tarikh Masihi & Hijri, jam, 6 waktu (seterusnya diserlah, yang lepas dikelabukan), kiraan mundur, zon. Imsak menggantikan Syuruk pada bulan Ramadan |
| Solat Seterusnya | 2×1 | Nama, waktu & kiraan mundur besar |
| Ayat Hari Ini | 4×2 | Teks Arab (fon Amiri) + terjemahan; ketik untuk buka ayat |
| Langkah & Air | 2×2 | Cincin langkah; butang **+1** air berfungsi terus dari widget |
| Tasbih | 2×2 | Ketik widget untuk mengira (getaran), butang set semula |
| Zikir Pagi/Petang | 4×1 | Kemajuan zikir hari ini; bertukar automatik jam 3 petang |

Kod native: `native/android/Wz*Widget*.java`, `native/android/res/`; manifest ditampal oleh `native/android/patch_manifest.py` dalam CI. Widget dikemas kini pada setiap waktu solat, jam 3 petang & tengah malam (AlarmManager), serta setiap kali app dibuka.

## Dapatkan APK (GitHub Actions — percuma)
1. Muat naik **semua** kandungan folder ini (termasuk `.github` dan `native`) ke repo GitHub, branch `main`.
2. Tab **Actions** → *Build Wazlee APK* → tunggu ±6 minit.
3. APK diterbitkan di **Releases**: https://github.com/aiwawadhati-cyber/wazlee/releases/latest/download/Wazlee.apk

Kemas kini app = push semula; nombor versi naik automatik.

## Waktu solat
- **Auto**: zon JAKIM dikesan dari GPS (60 zon, padanan daerah terdekat, tanpa internet).
- **Manual**: Profil/Solat → Zon → pilih Negeri → Zon.
- Data dari **e-Solat JAKIM** (sandaran: api.waktusolat.app), disimpan setahun untuk guna luar talian.
- Di luar Malaysia / tiada data: kiraan GPS (Subuh 20°, Isyak 18°, Asar Syafi'i).

## Sumber Al-Quran
Lihat `www/quran/SOURCES.txt`. Teks Arab disemak silang 6236/6236 ayat dengan teks King Fahd Complex. Audio: EveryAyah.com. Terjemahan untuk kegunaan bukan komersial.

## Health Connect
- Sihat → **Sambung Health Connect** → pilih data yang dibenarkan. Android 14+ sudah ada Health Connect; Android 8–13 perlu pasang *Health Connect* dari Play Store (butang disediakan).
- Data jam pintar (Samsung Health, Fitbit, Mi Fitness, dll.) masuk melalui Health Connect jika app tersebut menyegerak ke Health Connect.
- Langkah yang dipaparkan = nilai tertinggi antara sensor telefon dan Health Connect. Berat terkini dari Health Connect mengisi profil secara automatik.
- Data hanya dibaca dan disimpan dalam telefon (lihat `www/privacypolicy.html`).
- Keperluan: Android 8.0+ (minSdk 26).

## Bahasa
Semua teks UI dalam `www/js/i18n.js` (format `kunci: ['BM', 'EN']`). Kandungan: `te`/`me` dalam `data/doa.js` & `data/zikir.js`, `QUOTES_EN` dalam `data/quotes.js`. Bahasa lalai: BM.

## Azan penuh (v2.4)
Profil → Waktu Solat → **Bunyi azan**: pilih fail MP3/M4A azan dari telefon (fail utama + pilihan fail Subuh), uji, dan tetapkan mod setiap solat (Azan penuh / Notifikasi / Senyap). Azan dimainkan oleh servis latar depan native (`WzAzanService`) melalui strim penggera, dengan butang **Henti**, walaupun app ditutup. Sejak v2.6.1, azan terbina (`assets/sounds/azan.mp3` & `azan_subuh.mp3`, dibekalkan oleh pemilik app) dimainkan secara lalai jika tiada fail dipilih.

## Peringatan (v2.4)
Lagi/Sihat → **Peringatan**: tidur, rehat setiap 2 jam (waktu kerja), tahajjud, Dhuha, Al-Kahfi (Jumaat), puasa sunat Isnin/Khamis, zikir pagi/petang, senaman + sehingga 10 peringatan tersuai. Ketik notifikasi untuk terus ke halaman berkaitan.

## Penerbangan (v2.9)
Lagi → **Penerbangan**: cari no. penerbangan (cth: MH1401, AK6205) → laluan asal–destinasi, kedudukan langsung, ketinggian/kelajuan, baki jarak & **anggaran tiba** (adsb.lol, percuma), butang *Jejak di peta*. Pilihan: kunci percuma **AeroDataBox** (RapidAPI, disimpan dalam telefon) untuk jadual rasmi berlepas/tiba, status lewat/batal, terminal, pintu & bagasi. Popup radar kini menunjukkan laluan & anggaran tiba.

## Cuaca & Radar Pesawat (v2.8)
- **Cuaca** (Lagi → Cuaca, kad di Utama): ramalan 7 hari, amaran cuaca aktif (notifikasi jika kawasan anda terlibat) & gempa bumi terkini — MET Malaysia melalui `api.data.gov.my/weather`.
- **Radar Pesawat** (Peta → butang ✈️ atau Lagi → Radar Pesawat): pesawat langsung (ADS-B) dikemas kini setiap 10 saat — adsb.lol (ODbL), sandaran airplanes.live & adsb.fi (bukan komersial).

## Versi web / iPhone (PWA, v2.7)
Workflow `pages.yml` membina `www/` dengan `scripts/build-web.sh` (manifest, service worker luar talian, bunyi azan) dan menerbitkannya ke GitHub Pages. iPhone: buka dalam Safari → Kongsi → **Tambah ke Skrin Utama**. Had versi web: tiada notifikasi berjadual, widget, penggera atau pengira langkah; azan berbunyi semasa app dibuka.
Domain sendiri: rekod DNS `CNAME wazlee → aiwawadhati-cyber.github.io`, kemudian Settings → Pages → Custom domain.

## Musafir (v2.6)
Ibadah → **Musafir**: tetapkan lokasi rumah, cari destinasi (jarak jalan raya OSRM + garis lurus), status jamak/qasar, kiraan hari perjalanan, waktu jamak taqdim/takhir hari ini, panduan syarat & lafaz niat (mazhab Syafi'i). Had dua marhalah: **91 km (lalai, paling berhati-hati)**, 89 km atau 81 km (Muzakarah Fatwa Kebangsaan 2021). Banner di Utama apabila anda musafir.

## Tandatangan APK (v2.6)
APK ditandatangani dengan kunci tetap `native/android/wazlee-debug.keystore` (atau rahsia repo `WZ_KEYSTORE_B64` jika ditetapkan) supaya versi baharu boleh dipasang terus atas versi lama. Untuk Play Store, guna kunci upload berasingan dalam rahsia repo.

## Nota (v2.5)
Lagi → **Nota**: tajuk, isi, kategori (Umum/Kerja/Peribadi/Ibadah/Belanja/Idea), 7 warna, sematkan, carian, senarai semak (`- [ ]` / `- [x]`), dan peringatan pada tarikh & masa tertentu (ketik notifikasi untuk buka nota). Disimpan dalam telefon sahaja.

## Penggera (v2.5)
Lagi → **Penggera**: Bangun Subuh (X minit sebelum Subuh ikut zon), Tahajjud, Sahur, Dhuha, Solat Jumaat, penggera tersuai (label + hari) dan pemasa. Dipasang terus ke **app Jam telefon** (`AlarmClock` intent) supaya berbunyi walaupun telefon senyap/tidur, dengan Tunda & Matikan.

## Peta (v2.4.1)
Peta vektor **OpenFreeMap** (tanpa kunci API) melalui MapLibre GL; sandaran automatik ke jubin OpenStreetMap jika gagal.

## Pengesanan zon (v2.4)
Zon JAKIM dikesan dengan **poligon sempadan daerah** (termasuk enklaf Putrajaya/KL), bukan titik tengah terdekat — membetulkan kes sempadan seperti Nilai (NGS03).

## Kebenaran Android yang diminta
Lokasi (zon/kiblat/peta), Aktiviti fizikal (langkah), Health Connect (baca sahaja), Notifikasi & penggera tepat (peringatan solat/air), Getaran (tasbih/zikir).

## Struktur
```
www/                 Kod app (HTML/CSS/JS, tiada build step)
  js/core.js         Router, storan, lokasi, utiliti
  js/solat.js        Zon JAKIM, e-Solat, notifikasi solat
  js/ibadah.js       Kiblat, doa, zikir, tasbih
  js/i18n.js         Kamus dwibahasa BM/EN
  js/health.js       Health Connect
  js/sihat.js        Langkah, BMI, air
  js/alat.js         Matawang, peta, masjid
  js/quran.js        Al-Quran: pembaca, carian, audio, muat turun
  js/games.js        Sudut Ilmu: 6 permainan, bintang, lencana
  quran/             index.json + s/001–114.json (Arab, BM, EN, transliterasi)
  data/              zones, doa, zikir, quotes, asma (99 nama), ilmu (kuiz, hijaiyah, turutan)  ← edit kandungan di sini
native/android/      Plugin pengira langkah, widget (Java + res), MainActivity, patch_manifest.py
brand/               Logo SVG (3 konsep), ikon & splash sumber
assets/              Ikon/splash PNG untuk penjana Capacitor
```

## Bina sendiri (Android Studio)
```bash
npm install && npx cap add android
cp native/android/*.java android/app/src/main/java/my/digitalsys/wazlee/
# tambah kebenaran — rujuk langkah "Add permissions" dalam .github/workflows/build-apk.yml
npx capacitor-assets generate --android && npx cap sync android && npx cap open android
```
Keperluan: Node 22+, JDK 21.

## Nota
- Langkah dikira oleh sensor perkakasan walaupun app ditutup; buka app sekali sehari untuk rekod harian tepat.
- Teks Arab doa/zikir untuk rujukan harian — semak dengan mushaf/guru untuk bacaan.
- APK ialah *debug build* (sesuai edaran sendiri). Untuk Play Store perlukan keystore & `bundleRelease`.
- Kredit: Ikon Lucide (ISC), fon Amiri & Nunito (OFL), Leaflet (BSD), MapLibre GL (BSD), peta © OpenFreeMap/OpenMapTiles/OpenStreetMap, zon daerah dirujuk silang dengan projek waktusolat.app.
