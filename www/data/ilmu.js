/* Kandungan Sudut Ilmu — sila semak dengan guru/ustaz sebelum edaran luas.
   Kuiz: { c: kategori, l: tahap (1 mudah, 2 sederhana), q: [BM, EN], o: [[BM, EN] x4], a: indeks jawapan } */
window.QUIZ = [
  // ---------- Akidah ----------
  { c: 'akidah', l: 1, q: ['Berapakah bilangan Rukun Islam?', 'How many Pillars of Islam are there?'], o: [['4', '4'], ['5', '5'], ['6', '6'], ['7', '7']], a: 1 },
  { c: 'akidah', l: 1, q: ['Berapakah bilangan Rukun Iman?', 'How many Pillars of Faith (Iman) are there?'], o: [['5', '5'], ['6', '6'], ['7', '7'], ['4', '4']], a: 1 },
  { c: 'akidah', l: 1, q: ['Apakah Rukun Islam yang pertama?', 'What is the first Pillar of Islam?'], o: [['Solat', 'Prayer'], ['Puasa', 'Fasting'], ['Mengucap dua kalimah syahadah', 'Declaring the two Shahadah'], ['Zakat', 'Zakat']], a: 2 },
  { c: 'akidah', l: 1, q: ['Malaikat yang menyampaikan wahyu kepada para nabi ialah…', 'The angel who delivered revelation to the prophets is…'], o: [['Mikail', 'Mikail'], ['Jibril', 'Jibril (Gabriel)'], ['Israfil', 'Israfil'], ['Malik', 'Malik']], a: 1 },
  { c: 'akidah', l: 2, q: ['Malaikat yang akan meniup sangkakala ialah…', 'The angel who will blow the Trumpet is…'], o: [['Israfil', 'Israfil'], ['Ridwan', 'Ridwan'], ['Jibril', 'Jibril'], ['Raqib', 'Raqib']], a: 0 },
  { c: 'akidah', l: 2, q: ['Malaikat yang ditugaskan menurunkan hujan dan mengagihkan rezeki ialah…', 'The angel tasked with bringing rain and distributing provision is…'], o: [['Izrail', 'Izrail'], ['Munkar', 'Munkar'], ['Mikail', 'Mikail'], ['Atid', 'Atid']], a: 2 },
  { c: 'akidah', l: 1, q: ['Kitab Taurat diturunkan kepada…', 'The Torah (Taurat) was revealed to…'], o: [['Nabi Isa', 'Prophet Isa'], ['Nabi Musa', 'Prophet Musa'], ['Nabi Daud', 'Prophet Daud'], ['Nabi Ibrahim', 'Prophet Ibrahim']], a: 1 },
  { c: 'akidah', l: 1, q: ['Kitab Zabur diturunkan kepada…', 'The Psalms (Zabur) were revealed to…'], o: [['Nabi Daud', 'Prophet Daud'], ['Nabi Sulaiman', 'Prophet Sulaiman'], ['Nabi Musa', 'Prophet Musa'], ['Nabi Nuh', 'Prophet Nuh']], a: 0 },
  { c: 'akidah', l: 1, q: ['Kitab Injil diturunkan kepada…', 'The Gospel (Injil) was revealed to…'], o: [['Nabi Yahya', 'Prophet Yahya'], ['Nabi Musa', 'Prophet Musa'], ['Nabi Isa', 'Prophet Isa'], ['Nabi Zakaria', 'Prophet Zakariya']], a: 2 },
  { c: 'akidah', l: 1, q: ['Siapakah nabi yang pertama?', 'Who was the first prophet?'], o: [['Nabi Nuh', 'Prophet Nuh'], ['Nabi Ibrahim', 'Prophet Ibrahim'], ['Nabi Adam', 'Prophet Adam'], ['Nabi Idris', 'Prophet Idris']], a: 2 },
  { c: 'akidah', l: 1, q: ['Siapakah nabi dan rasul yang terakhir?', 'Who is the last prophet and messenger?'], o: [['Nabi Isa', 'Prophet Isa'], ['Nabi Muhammad ﷺ', 'Prophet Muhammad ﷺ'], ['Nabi Musa', 'Prophet Musa'], ['Nabi Ibrahim', 'Prophet Ibrahim']], a: 1 },
  { c: 'akidah', l: 2, q: ['Berapakah bilangan Rasul Ulul Azmi?', 'How many Ulul Azmi messengers are there?'], o: [['3', '3'], ['4', '4'], ['5', '5'], ['7', '7']], a: 2 },

  // ---------- Ibadah ----------
  { c: 'ibadah', l: 1, q: ['Berapakah waktu solat fardu sehari semalam?', 'How many obligatory prayers are there in a day?'], o: [['3', '3'], ['4', '4'], ['5', '5'], ['6', '6']], a: 2 },
  { c: 'ibadah', l: 1, q: ['Berapakah rakaat solat Subuh?', 'How many rak\'ahs are in the Fajr (Subuh) prayer?'], o: [['2', '2'], ['3', '3'], ['4', '4'], ['1', '1']], a: 0 },
  { c: 'ibadah', l: 1, q: ['Berapakah rakaat solat Maghrib?', 'How many rak\'ahs are in the Maghrib prayer?'], o: [['2', '2'], ['4', '4'], ['3', '3'], ['5', '5']], a: 2 },
  { c: 'ibadah', l: 2, q: ['Berapakah jumlah rakaat solat fardu dalam sehari semalam?', 'What is the total number of obligatory rak\'ahs in a day?'], o: [['15', '15'], ['17', '17'], ['19', '19'], ['20', '20']], a: 1 },
  { c: 'ibadah', l: 1, q: ['Umat Islam berpuasa wajib pada bulan…', 'Muslims observe the obligatory fast in the month of…'], o: [['Syaaban', "Sha'ban"], ['Syawal', 'Shawwal'], ['Ramadan', 'Ramadan'], ['Rejab', 'Rajab']], a: 2 },
  { c: 'ibadah', l: 1, q: ['Ibadah haji dilaksanakan pada bulan…', 'Hajj is performed in the month of…'], o: [['Zulhijah', 'Dhu al-Hijjah'], ['Muharam', 'Muharram'], ['Ramadan', 'Ramadan'], ['Safar', 'Safar']], a: 0 },
  { c: 'ibadah', l: 1, q: ['Ke arah manakah umat Islam menghadap ketika solat?', 'Which direction do Muslims face when praying?'], o: [['Masjid Nabawi', 'Masjid an-Nabawi'], ['Kaabah di Makkah', 'The Kaaba in Makkah'], ['Masjid Al-Aqsa', 'Masjid al-Aqsa'], ['Matahari terbit', 'Sunrise']], a: 1 },
  { c: 'ibadah', l: 2, q: ['Berapakah rukun wuduk menurut mazhab Syafie?', "How many essential pillars of wudu are there in the Shafi'i school?"], o: [['4', '4'], ['5', '5'], ['6', '6'], ['8', '8']], a: 2 },
  { c: 'ibadah', l: 2, q: ['Tayammum dilakukan menggunakan…', 'Tayammum is performed using…'], o: [['Air mawar', 'Rose water'], ['Debu tanah yang suci', 'Clean earth dust'], ['Pasir pantai basah', 'Wet beach sand'], ['Kain bersih', 'A clean cloth']], a: 1 },
  { c: 'ibadah', l: 1, q: ['Hari kebesaran mingguan umat Islam ialah hari…', 'The weekly special day for Muslims is…'], o: [['Isnin', 'Monday'], ['Khamis', 'Thursday'], ['Jumaat', 'Friday'], ['Ahad', 'Sunday']], a: 2 },
  { c: 'ibadah', l: 2, q: ['Zakat fitrah wajib dikeluarkan sebelum…', 'Zakat al-Fitr must be paid before…'], o: [['Solat Aidilfitri', 'The Eid al-Fitr prayer'], ['Awal Ramadan', 'The start of Ramadan'], ['Solat Aidiladha', 'The Eid al-Adha prayer'], ['Tahun baru Hijrah', 'The Hijri new year']], a: 0 },
  { c: 'ibadah', l: 2, q: ['Hari Raya Aidiladha disambut pada…', 'Eid al-Adha is celebrated on…'], o: [['1 Syawal', '1 Shawwal'], ['10 Zulhijah', '10 Dhu al-Hijjah'], ['10 Muharam', '10 Muharram'], ['27 Rejab', '27 Rajab']], a: 1 },
  { c: 'ibadah', l: 2, q: ['Muazzin (tukang azan) pertama dalam Islam ialah…', 'The first muezzin in Islam was…'], o: [['Bilal bin Rabah', 'Bilal ibn Rabah'], ['Abu Bakar', 'Abu Bakr'], ['Ali bin Abi Talib', 'Ali ibn Abi Talib'], ['Zaid bin Harithah', 'Zayd ibn Harithah']], a: 0 },
  { c: 'ibadah', l: 2, q: ['Perintah solat fardu lima waktu diterima ketika peristiwa…', 'The command of the five daily prayers was received during…'], o: [['Hijrah', 'The Hijrah'], ['Perang Badar', 'The Battle of Badr'], ['Israk dan Mikraj', 'Al-Isra wal-Mi\'raj'], ['Fathul Makkah', 'The Conquest of Makkah']], a: 2 },

  // ---------- Al-Quran ----------
  { c: 'quran', l: 1, q: ['Berapakah bilangan surah dalam Al-Quran?', 'How many surahs are in the Quran?'], o: [['110', '110'], ['114', '114'], ['120', '120'], ['99', '99']], a: 1 },
  { c: 'quran', l: 1, q: ['Berapakah bilangan juz dalam Al-Quran?', 'How many juz are in the Quran?'], o: [['20', '20'], ['25', '25'], ['30', '30'], ['40', '40']], a: 2 },
  { c: 'quran', l: 1, q: ['Surah yang paling panjang dalam Al-Quran ialah…', 'The longest surah in the Quran is…'], o: [['Ali Imran', 'Ali Imran'], ['An-Nisa', 'An-Nisa'], ['Al-Baqarah', 'Al-Baqarah'], ['Yasin', 'Yasin']], a: 2 },
  { c: 'quran', l: 1, q: ['Surah yang paling pendek dalam Al-Quran ialah…', 'The shortest surah in the Quran is…'], o: [['Al-Ikhlas', 'Al-Ikhlas'], ['Al-Kautsar', 'Al-Kawthar'], ['An-Nas', 'An-Nas'], ["Al-'Asr", "Al-'Asr"]], a: 1 },
  { c: 'quran', l: 1, q: ['Berapakah bilangan ayat dalam Surah Al-Fatihah?', 'How many verses are in Surah Al-Fatihah?'], o: [['5', '5'], ['6', '6'], ['7', '7'], ['8', '8']], a: 2 },
  { c: 'quran', l: 2, q: ['Surah manakah yang tidak dimulakan dengan Bismillah?', 'Which surah does not begin with Bismillah?'], o: [['At-Taubah', 'At-Tawbah'], ['Al-Anfal', 'Al-Anfal'], ['Yasin', 'Yasin'], ['Al-Mulk', 'Al-Mulk']], a: 0 },
  { c: 'quran', l: 2, q: ['Ayat Kursi terdapat dalam surah…', 'Ayat al-Kursi is found in Surah…'], o: [['Ali Imran', 'Ali Imran'], ['Al-Baqarah', 'Al-Baqarah'], ['Al-Kahfi', 'Al-Kahf'], ['Al-Mulk', 'Al-Mulk']], a: 1 },
  { c: 'quran', l: 2, q: ['Wahyu pertama yang diturunkan ialah awal Surah…', 'The first revelation was the opening of Surah…'], o: [['Al-Fatihah', 'Al-Fatihah'], ["Al-'Alaq", "Al-'Alaq"], ['Al-Muddaththir', 'Al-Muddaththir'], ['Al-Qalam', 'Al-Qalam']], a: 1 },
  { c: 'quran', l: 1, q: ['Surah ke-112 dalam Al-Quran ialah…', 'The 112th surah of the Quran is…'], o: [['Al-Falaq', 'Al-Falaq'], ['An-Nas', 'An-Nas'], ['Al-Ikhlas', 'Al-Ikhlas'], ['Al-Masad', 'Al-Masad']], a: 2 },
  { c: 'quran', l: 2, q: ['Malam Lailatul Qadar lebih baik daripada…', 'Laylat al-Qadr is better than…'], o: [['Seratus hari', 'A hundred days'], ['Seribu bulan', 'A thousand months'], ['Sepuluh tahun', 'Ten years'], ['Seribu hari', 'A thousand days']], a: 1 },
  { c: 'quran', l: 1, q: ['Al-Quran diturunkan dalam bahasa…', 'The Quran was revealed in the language of…'], o: [['Ibrani', 'Hebrew'], ['Parsi', 'Persian'], ['Arab', 'Arabic'], ['Suryani', 'Syriac']], a: 2 },

  // ---------- Sirah & Nabi ----------
  { c: 'sirah', l: 1, q: ['Nabi Muhammad ﷺ dilahirkan di kota…', 'Prophet Muhammad ﷺ was born in the city of…'], o: [['Madinah', 'Madinah'], ['Makkah', 'Makkah'], ['Taif', 'Taif'], ['Baitulmaqdis', 'Jerusalem']], a: 1 },
  { c: 'sirah', l: 1, q: ['Nama ayah Nabi Muhammad ﷺ ialah…', 'The name of Prophet Muhammad\'s ﷺ father was…'], o: [['Abdul Muttalib', 'Abdul Muttalib'], ['Abu Talib', 'Abu Talib'], ['Abdullah', 'Abdullah'], ['Hamzah', 'Hamzah']], a: 2 },
  { c: 'sirah', l: 1, q: ['Nama ibu Nabi Muhammad ﷺ ialah…', 'The name of Prophet Muhammad\'s ﷺ mother was…'], o: [['Aminah', 'Aminah'], ['Halimah', 'Halimah'], ['Khadijah', 'Khadijah'], ['Fatimah', 'Fatimah']], a: 0 },
  { c: 'sirah', l: 1, q: ['Isteri pertama Nabi Muhammad ﷺ ialah…', 'The first wife of Prophet Muhammad ﷺ was…'], o: [['Aisyah', "A'ishah"], ['Khadijah', 'Khadijah'], ['Hafsah', 'Hafsah'], ['Saudah', 'Sawdah']], a: 1 },
  { c: 'sirah', l: 1, q: ['Nabi Muhammad ﷺ menerima wahyu pertama di Gua…', 'Prophet Muhammad ﷺ received the first revelation in the Cave of…'], o: [['Thur', 'Thawr'], ['Hira', "Hira'"], ['Uhud', 'Uhud'], ['Kahfi', 'Kahf']], a: 1 },
  { c: 'sirah', l: 1, q: ['Nabi Muhammad ﷺ berhijrah dari Makkah ke…', 'Prophet Muhammad ﷺ migrated from Makkah to…'], o: [['Taif', 'Taif'], ['Habsyah', 'Abyssinia'], ['Madinah', 'Madinah'], ['Syam', 'Syria']], a: 2 },
  { c: 'sirah', l: 1, q: ['Sahabat yang menemani Nabi ﷺ ketika berhijrah ialah…', 'The companion who accompanied the Prophet ﷺ during the Hijrah was…'], o: [['Abu Bakar As-Siddiq', 'Abu Bakr as-Siddiq'], ['Umar Al-Khattab', 'Umar ibn al-Khattab'], ['Uthman bin Affan', 'Uthman ibn Affan'], ['Ali bin Abi Talib', 'Ali ibn Abi Talib']], a: 0 },
  { c: 'sirah', l: 1, q: ['Siapakah Khulafa Ar-Rasyidin yang pertama?', 'Who was the first of the Rightly Guided Caliphs?'], o: [['Umar Al-Khattab', 'Umar ibn al-Khattab'], ['Abu Bakar As-Siddiq', 'Abu Bakr as-Siddiq'], ['Ali bin Abi Talib', 'Ali ibn Abi Talib'], ['Uthman bin Affan', 'Uthman ibn Affan']], a: 1 },
  { c: 'sirah', l: 2, q: ['Siapakah Khulafa Ar-Rasyidin yang keempat?', 'Who was the fourth Rightly Guided Caliph?'], o: [['Ali bin Abi Talib', 'Ali ibn Abi Talib'], ['Uthman bin Affan', 'Uthman ibn Affan'], ['Umar Al-Khattab', 'Umar ibn al-Khattab'], ['Muawiyah', "Mu'awiyah"]], a: 0 },
  { c: 'sirah', l: 2, q: ['Peperangan pertama dalam sejarah Islam ialah Perang…', 'The first major battle in Islamic history was the Battle of…'], o: [['Uhud', 'Uhud'], ['Khandak', 'Khandaq'], ['Badar', 'Badr'], ['Hunain', 'Hunayn']], a: 2 },
  { c: 'sirah', l: 2, q: ['Kalendar Hijrah bermula dengan bulan…', 'The Hijri calendar begins with the month of…'], o: [['Ramadan', 'Ramadan'], ['Muharam', 'Muharram'], ['Rabiulawal', "Rabi' al-Awwal"], ['Syawal', 'Shawwal']], a: 1 },
  { c: 'sirah', l: 1, q: ['Nabi yang membina bahtera besar atas perintah Allah ialah…', 'The prophet who built a great ark by the command of Allah was…'], o: [['Nabi Nuh', 'Prophet Nuh'], ['Nabi Hud', 'Prophet Hud'], ['Nabi Saleh', 'Prophet Salih'], ['Nabi Lut', 'Prophet Lut']], a: 0 },
  { c: 'sirah', l: 1, q: ['Nabi yang ditelan oleh ikan besar ialah…', 'The prophet who was swallowed by a great fish was…'], o: [['Nabi Ayub', 'Prophet Ayyub'], ['Nabi Yunus', 'Prophet Yunus'], ['Nabi Ilyas', 'Prophet Ilyas'], ['Nabi Yusuf', 'Prophet Yusuf']], a: 1 },
  { c: 'sirah', l: 1, q: ['Nabi yang diselamatkan Allah daripada api yang membakar ialah…', 'The prophet whom Allah saved from the burning fire was…'], o: [['Nabi Musa', 'Prophet Musa'], ['Nabi Ibrahim', 'Prophet Ibrahim'], ['Nabi Ismail', 'Prophet Ismail'], ['Nabi Ishak', 'Prophet Ishaq']], a: 1 },
  { c: 'sirah', l: 2, q: ['Nabi yang memahami bahasa semut dan burung ialah…', 'The prophet who understood the speech of ants and birds was…'], o: [['Nabi Daud', 'Prophet Daud'], ['Nabi Sulaiman', 'Prophet Sulaiman'], ['Nabi Yahya', 'Prophet Yahya'], ['Nabi Zakaria', 'Prophet Zakariya']], a: 1 },
  { c: 'sirah', l: 2, q: ['Masjid yang dibina Nabi ﷺ di Madinah dikenali sebagai…', 'The mosque built by the Prophet ﷺ in Madinah is known as…'], o: [['Masjidil Haram', 'Masjid al-Haram'], ['Masjid Al-Aqsa', 'Masjid al-Aqsa'], ['Masjid Nabawi', 'Masjid an-Nabawi'], ['Masjid Kufah', 'Masjid of Kufa']], a: 2 },

  // ---------- Akhlak & adab ----------
  { c: 'akhlak', l: 1, q: ['Apakah yang kita ucapkan sebelum makan?', 'What do we say before eating?'], o: [['Alhamdulillah', 'Alhamdulillah'], ['Bismillah', 'Bismillah'], ['Subhanallah', 'Subhanallah'], ['Astaghfirullah', 'Astaghfirullah']], a: 1 },
  { c: 'akhlak', l: 1, q: ['Apakah yang diucapkan apabila bersin?', 'What do we say after sneezing?'], o: [['Alhamdulillah', 'Alhamdulillah'], ['Insya-Allah', 'In sha Allah'], ['Masya-Allah', 'Masha Allah'], ['Allahu Akbar', 'Allahu Akbar']], a: 0 },
  { c: 'akhlak', l: 1, q: ['Senyuman kepada saudara kita dikira sebagai…', 'Smiling at our brother or sister is counted as…'], o: [['Riak', 'Showing off'], ['Sedekah', 'Charity'], ['Makruh', 'Disliked'], ['Biasa sahaja', 'Nothing special']], a: 1 },
  { c: 'akhlak', l: 1, q: ['Ucapan salam yang lengkap ialah…', 'The complete Islamic greeting is…'], o: [['Selamat pagi', 'Good morning'], ['Assalamualaikum warahmatullahi wabarakatuh', 'Assalamu alaikum wa rahmatullahi wa barakatuh'], ['Apa khabar', 'How are you'], ['Jumpa lagi', 'See you again']], a: 1 },
  { c: 'akhlak', l: 1, q: ['Ketika masuk ke rumah, kita sepatutnya…', 'When entering a home, we should…'], o: [['Terus masuk tanpa kata', 'Walk in without a word'], ['Memberi salam', 'Give salam'], ['Menjerit memanggil', 'Shout for someone'], ['Mengetuk sekali sahaja dan pergi', 'Knock once and leave']], a: 1 },
  { c: 'akhlak', l: 1, q: ['Tangan manakah yang disunatkan untuk makan?', 'Which hand is recommended for eating?'], o: [['Tangan kanan', 'Right hand'], ['Tangan kiri', 'Left hand'], ['Kedua-duanya', 'Both hands'], ['Mana-mana', 'Either']], a: 0 },
  { c: 'akhlak', l: 2, q: ['Apabila mendengar azan, kita disunatkan untuk…', 'When we hear the adhan, it is recommended to…'], o: [['Menjawab azan', 'Respond to the adhan'], ['Menguatkan muzik', 'Turn up music'], ['Terus tidur', 'Go to sleep'], ['Bercakap kuat', 'Talk loudly']], a: 0 }
];

window.QUIZ_CATS = { akidah: ['Akidah', 'Faith'], ibadah: ['Ibadah', 'Worship'], quran: ['Al-Quran', 'Quran'], sirah: ['Sirah & Nabi', 'Seerah & Prophets'], akhlak: ['Akhlak & Adab', 'Manners'] };

/* Huruf Hijaiyah: [huruf, nama BM, nama EN, nama Arab (untuk sebutan)] */
window.HIJAIYAH = [
  ['ا', 'Alif', 'Alif', 'ألف'],
  ['ب', 'Ba', "Ba'", 'باء'],
  ['ت', 'Ta', "Ta'", 'تاء'],
  ['ث', 'Tsa', "Tha'", 'ثاء'],
  ['ج', 'Jim', 'Jim', 'جيم'],
  ['ح', 'Ha', "Ha'", 'حاء'],
  ['خ', 'Kha', "Kha'", 'خاء'],
  ['د', 'Dal', 'Dal', 'دال'],
  ['ذ', 'Dzal', 'Dhal', 'ذال'],
  ['ر', 'Ra', "Ra'", 'راء'],
  ['ز', 'Zai', 'Zay', 'زاي'],
  ['س', 'Sin', 'Sin', 'سين'],
  ['ش', 'Syin', 'Shin', 'شين'],
  ['ص', 'Sad', 'Sad', 'صاد'],
  ['ض', 'Dhad', 'Dad', 'ضاد'],
  ['ط', 'Tha', "Ta' (heavy)", 'طاء'],
  ['ظ', 'Zha', "Za' (heavy)", 'ظاء'],
  ['ع', "'Ain", "'Ayn", 'عين'],
  ['غ', 'Ghain', 'Ghayn', 'غين'],
  ['ف', 'Fa', "Fa'", 'فاء'],
  ['ق', 'Qaf', 'Qaf', 'قاف'],
  ['ك', 'Kaf', 'Kaf', 'كاف'],
  ['ل', 'Lam', 'Lam', 'لام'],
  ['م', 'Mim', 'Mim', 'ميم'],
  ['ن', 'Nun', 'Nun', 'نون'],
  ['و', 'Wau', 'Waw', 'واو'],
  ['ه', 'Ha', "Ha' (light)", 'هاء'],
  ['ي', 'Ya', "Ya'", 'ياء']
];
/* huruf yang tidak bersambung ke kiri */
window.HIJAIYAH_NONJOIN = ['ا', 'د', 'ذ', 'ر', 'ز', 'و'];

/* Turutan wuduk & solat (mazhab Syafie, ringkas) — [BM, EN] */
window.STEPS = {
  wuduk: [
    ['Membaca Bismillah & membasuh kedua tapak tangan', 'Say Bismillah & wash both hands'],
    ['Berkumur-kumur', 'Rinse the mouth'],
    ['Memasukkan air ke hidung & menghembusnya', 'Rinse the nose'],
    ['Berniat & membasuh muka', 'Make the intention & wash the face'],
    ['Membasuh kedua tangan hingga ke siku', 'Wash both arms up to the elbows'],
    ['Menyapu sebahagian kepala', 'Wipe part of the head'],
    ['Menyapu kedua telinga', 'Wipe both ears'],
    ['Membasuh kedua kaki hingga ke buku lali', 'Wash both feet up to the ankles'],
    ['Membaca doa selepas wuduk', "Recite the du'a after wudu"]
  ],
  solat: [
    ['Berdiri betul & berniat', 'Stand upright & make the intention'],
    ['Takbiratul Ihram (Allahu Akbar)', 'Takbiratul Ihram (Allahu Akbar)'],
    ['Membaca doa iftitah & Al-Fatihah', 'Recite the opening supplication & Al-Fatihah'],
    ['Rukuk', "Ruku' (bowing)"],
    ['Iktidal (bangun dari rukuk)', "I'tidal (rising from bowing)"],
    ['Sujud pertama', 'First prostration (sujud)'],
    ['Duduk antara dua sujud', 'Sitting between the two prostrations'],
    ['Sujud kedua', 'Second prostration'],
    ['Duduk tahiyat akhir', 'Final sitting (tashahhud)'],
    ['Memberi salam', 'Give salam (taslim)']
  ]
};

/* Ayat Hari Ini — rujukan [surah, ayat]; teks diambil terus daripada data Al-Quran */
window.AYAT_HARIAN = [[2, 286], [94, 5], [94, 6], [13, 28], [39, 53], [2, 152], [2, 153], [3, 139], [65, 3], [2, 186], [40, 60], [29, 69], [16, 97], [49, 13], [17, 23], [31, 14], [3, 159], [25, 63], [103, 1], [20, 114], [2, 45], [8, 46], [7, 56], [55, 13], [93, 5], [64, 16], [11, 115], [42, 43], [3, 200], [24, 22]];
