# Wazlee v2.1 — App Harian Muslim (Android)

**Ibadah · Sihat · Alat** dalam satu app bertema biru yang ceria. **Dwibahasa: Bahasa Melayu & English** (tukar di butang EN/BM atas atau Profil → Bahasa).

| Tab | Ciri |
|---|---|
| **Utama** | Kiraan mundur solat, 5 waktu hari ini, langkah & air hari ini, doa hari ini, motivasi, pintasan |
| **Ibadah** | Waktu Solat (zon JAKIM), Arah Kiblat (kompas), Doa Harian (20), Zikir Pagi & Petang (dengan pengira), Tasbih |
| **Sihat** | Langkah harian (sensor pedometer **+ Health Connect**) + km/kalori + carta 7 hari, **Health Connect**: degup jantung, degup rehat, tidur, kalori aktif, berat; Kalkulator BMI (Asia/KKM), Minum Air + peringatan |
| **Alat** | Matawang (30, luar talian), Peta & Jarak A→B, Masjid & surau berdekatan |
| **Profil** | Nama, tinggi/berat, sasaran langkah, zon solat, format masa, peringatan |

## Dapatkan APK (GitHub Actions — percuma)
1. Muat naik **semua** kandungan folder ini (termasuk `.github` dan `native`) ke repo GitHub, branch `main`.
2. Tab **Actions** → *Build Wazlee APK* → tunggu ±6 minit.
3. Muat turun artifact **Wazlee-APK** → pasang `Wazlee-v2.1.0.apk` (benarkan *Install unknown apps*).

Kemas kini app = push semula; nombor versi naik automatik.

## Waktu solat
- **Auto**: zon JAKIM dikesan dari GPS (60 zon, padanan daerah terdekat, tanpa internet).
- **Manual**: Profil/Solat → Zon → pilih Negeri → Zon.
- Data dari **e-Solat JAKIM** (sandaran: api.waktusolat.app), disimpan setahun untuk guna luar talian.
- Di luar Malaysia / tiada data: kiraan GPS (Subuh 20°, Isyak 18°, Asar Syafi'i).

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
  data/              zones.js, doa.js, zikir.js, quotes.js  ← edit kandungan di sini
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
