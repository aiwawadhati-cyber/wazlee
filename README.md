# Wazlee v2.2 — App Harian Muslim (Android)

**Ibadah · Sihat · Alat** dalam satu app bertema biru yang ceria. **Dwibahasa: Bahasa Melayu & English** (tukar di butang EN/BM atas atau Profil → Bahasa).

| Tab | Ciri |
|---|---|
| **Utama** | Kiraan mundur solat, 5 waktu hari ini, langkah & air, **Ayat Hari Ini**, doa hari ini, motivasi, pintasan |
| **Al-Quran** | 114 surah (teks Uthmani disahkan), terjemahan BM Basmeih & EN Sahih International, transliterasi, carian surah/ayat/kata kunci, juz, penanda, sambung bacaan, 6 qari, audio streaming + **muat turun per surah** (luar talian), ulang ayat/surah |
| **Ibadah** | Waktu Solat (zon JAKIM), Arah Kiblat (kompas), Doa Harian (20), Zikir Pagi & Petang (dengan pengira), Tasbih |
| **Sihat** | Langkah harian (sensor pedometer **+ Health Connect**) + km/kalori + carta 7 hari, **Health Connect**: degup jantung, degup rehat, tidur, kalori aktif, berat; Kalkulator BMI (Asia/KKM), Minum Air + peringatan |
| **Lagi** | **Sudut Ilmu** (6 permainan), Matawang, Peta & Jarak, Masjid berdekatan, Profil & Tetapan |

### Sudut Ilmu — 6 permainan (bintang & 7 lencana)
1. **Kuiz Islamik** — 60 soalan BM/EN (akidah, ibadah, Al-Quran, sirah, adab), pemasa 20s
2. **Sambung Ayat** — lengkapkan perkataan yang hilang (Al-Fatihah & 3 Qul / Surah Lazim / Juz Amma)
3. **Susun Ayat** — susun perkataan ayat mengikut turutan
4. **Asmaul Husna** — padanan memori + senarai 99 nama
5. **Huruf Hijaiyah** — belajar 28 huruf (bentuk awal/tengah/akhir + sebutan suara) & kuiz
6. **Turutan Wuduk & Solat** — susun langkah dengan betul

> Bank soalan kuiz (`www/data/ilmu.js`) wajar disemak oleh guru/ustaz sebelum edaran luas.

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

## Bunyi azan (pilihan)
Letak fail anda di `assets/sounds/azan.mp3` (huruf kecil, < 1 MB disyorkan, pastikan anda ada hak guna rakaman itu) dan push. CI akan menjadikannya bunyi notifikasi waktu solat. Tanpa fail, bunyi notifikasi lalai digunakan.

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
native/android/      Plugin pengira langkah (Java) + MainActivity
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
- Kredit: Ikon Lucide (ISC), fon Amiri & Nunito (OFL), Leaflet (BSD), peta © OpenStreetMap/CARTO, zon daerah dirujuk silang dengan projek waktusolat.app.
