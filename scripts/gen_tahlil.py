# Jana www/data/tahlil.js — Tahlil ringkas (susunan lazim Malaysia/Nusantara).
# Ayat Al-Quran diambil terus daripada teks Al-Quran Wazlee yang disahkan; potongan ayat (Hud 73, Al-Ahzab 33) dipotong daripada teks tersebut.
import json
AR = str.maketrans('0123456789', '٠١٢٣٤٥٦٧٨٩')
Q = lambda n: json.load(open(f'www/quran/s/{n:03d}.json'))
SN = {1: 'Al-Fatihah', 2: 'Al-Baqarah', 11: 'Hud', 33: 'Al-Ahzab', 112: 'Al-Ikhlas', 113: 'Al-Falaq', 114: 'An-Nas'}
def quran(t, te, s, a1, a2=None, n=1, bism=False, after=None):
    a2 = a2 or a1; d = Q(s); idx = range(a1 - 1, a2)
    a = ' '.join(f'{d["a"][i]} ﴿{str(i+1).translate(AR)}﴾' for i in idx)
    if bism: a = Q(1)['a'][0] + '\n' + a
    o = dict(t=t, te=te, q=f'{SN[s]} {s}:{a1}' + (f'-{a2}' if a2 != a1 else ''), n=n, a=a,
             m=' '.join(d['ms'][i] for i in idx), me=' '.join(d['en'][i] for i in idx))
    if after: o['after'] = after
    return o
def part(t, te, s, a, start, r, m, me):
    d = Q(s); txt = d['a'][a - 1]; i = txt.find(start)
    if start.startswith('#'):  # N perkataan terakhir ayat
        w = txt.split(' '); i = len(' '.join(w[:-int(start[1:])])) + 1
    assert i >= 0, (s, a)
    return dict(t=t, te=te, q=f'{SN[s]} {s}:{a} (sebahagian)', n=1, a=txt[i:] + f' ﴿{str(a).translate(AR)}﴾', r=r, m=m, me=me)
def z(t, te, a, r, m, me, n=1, af=None, rf=None, mf=None, mef=None, note=None):
    o = dict(t=t, te=te, a=a, r=r, m=m, me=me, n=n)
    if af: o['f'] = dict(a=af, r=rf, m=mf, me=mef)
    if note: o['note'] = note
    return o
TK = z('Tahlil & takbir', 'Tahlil & takbir', 'لَا إِلٰهَ إِلَّا اللهُ وَاللهُ أَكْبَرُ', 'La ilaha illallahu wallahu akbar.', 'Tiada Tuhan melainkan Allah, dan Allah Maha Besar.', 'There is no god but Allah, and Allah is the Greatest.')
items = [
 dict(t='Pengantar', te='Introduction', info=[['Niatkan pahala bacaan sebagai hadiah kepada junjungan Nabi Muhammad SAW, keluarga & sahabat baginda, serta arwah yang diingati (sebut nama arwah), kemudian bacalah Al-Fatihah.'], ["Intend the reward of the recitation as a gift to the Prophet Muhammad (PBUH), his family & companions, and the deceased being remembered (mention their name), then recite Al-Fatihah."]]),
 quran('Surah Al-Fatihah', 'Surah Al-Fatihah', 1, 1, 7),
 quran('Surah Al-Ikhlas', 'Surah Al-Ikhlas', 112, 1, 4, 3, True, after='tk'),
 quran('Surah Al-Falaq', 'Surah Al-Falaq', 113, 1, 5, 1, True, after='tk'),
 quran('Surah An-Nas', 'Surah An-Nas', 114, 1, 6, 1, True, after='tk'),
 quran('Surah Al-Fatihah', 'Surah Al-Fatihah', 1, 1, 7),
 quran('Al-Baqarah 1–5', 'Al-Baqarah 1–5', 2, 1, 5),
 quran('Al-Baqarah 163', 'Al-Baqarah 163', 2, 163),
 quran('Ayatul Kursi', 'Ayat al-Kursi', 2, 255),
 quran('Al-Baqarah 284–286', 'Al-Baqarah 284–286', 2, 284, 286),
 z('Irhamna', 'Have mercy on us', 'اِرْحَمْنَا يَا أَرْحَمَ الرَّاحِمِيْنَ', 'Irhamna ya arhamar-rahimin.', 'Rahmatilah kami wahai Tuhan Yang Maha Penyayang.', 'Have mercy on us, O Most Merciful of the merciful.', n=3),
 part('Hud 73', 'Hud 73', 11, 73, 'رَحۡمَتُ', "Rahmatullahi wa barakatuhu 'alaikum ahlal-bait, innahu hamidum majid.",
   'Rahmat Allah dan keberkatan-Nya ke atas kamu wahai ahli rumah ini. Sesungguhnya Dia Maha Terpuji lagi Maha Mulia.', "The mercy of Allah and His blessings be upon you, O people of the house. Indeed, He is Praiseworthy and Glorious."),
 part('Al-Ahzab 33', 'Al-Ahzab 33', 33, 33, '#10', "Innama yuridullahu liyuzhiba 'ankumur-rijsa ahlal-baiti wa yutahhirakum tathira.",
   'Sesungguhnya Allah hanya berkehendak menghilangkan kekotoran daripada kamu wahai ahli rumah, dan membersihkan kamu sebersih-bersihnya.', 'Allah only intends to remove impurity from you, O people of the house, and to purify you thoroughly.'),
 quran('Al-Ahzab 56', 'Al-Ahzab 56', 33, 56),
 z('Selawat', 'Salawat', 'اَللّٰهُمَّ صَلِّ أَفْضَلَ صَلَاةٍ عَلَى أَسْعَدِ مَخْلُوْقَاتِكَ سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ وَسَلِّمْ، عَدَدَ مَعْلُوْمَاتِكَ وَمِدَادَ كَلِمَاتِكَ، كُلَّمَا ذَكَرَكَ الذَّاكِرُوْنَ وَغَفَلَ عَنْ ذِكْرِكَ الْغَافِلُوْنَ',
   "Allahumma salli afdala salatin 'ala as'adi makhluqatika sayyidina Muhammadin wa 'ala alihi wa sahbihi wa sallim, 'adada ma'lumatika wa midada kalimatik, kullama zakarakaz-zakirun wa ghafala 'an zikrikal-ghafilun.",
   'Ya Allah, limpahkanlah selawat yang paling utama ke atas makhluk-Mu yang paling bahagia, junjungan kami Muhammad, serta keluarga dan sahabat baginda, dan kurniakanlah kesejahteraan, sebanyak ilmu-Mu dan tinta kalimah-Mu, setiap kali orang yang berzikir mengingati-Mu dan orang yang lalai terlupa daripada mengingati-Mu.',
   'O Allah, send the finest blessings upon the happiest of Your creation, our master Muhammad, his family and companions, and grant them peace, as many as Your knowledge and the ink of Your words, whenever those who remember You remember You and the heedless neglect Your remembrance.', n=3),
 z('Salam kepada para sahabat', 'Peace upon the Companions', 'وَرَضِيَ اللهُ تَعَالَى عَنْ أَصْحَابِ سَيِّدِنَا رَسُوْلِ اللهِ أَجْمَعِيْنَ',
   "Wa radiyallahu ta'ala 'an ashabi sayyidina Rasulillahi ajma'in.", 'Dan semoga Allah Taala meredai sekalian sahabat junjungan kami Rasulullah.', 'And may Allah be pleased with all the Companions of our master, the Messenger of Allah.'),
 z('Hasbunallah', 'Allah suffices us', 'حَسْبُنَا اللهُ وَنِعْمَ الْوَكِيْلُ، نِعْمَ الْمَوْلَى وَنِعْمَ النَّصِيْرُ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ الْعَلِيِّ الْعَظِيْمِ',
   "Hasbunallahu wa ni'mal-wakil, ni'mal-maula wa ni'man-nasir, wa la haula wa la quwwata illa billahil-'aliyyil-'azim.",
   'Cukuplah Allah bagi kami dan Dialah sebaik-baik Pelindung, sebaik-baik Penolong. Tiada daya dan kekuatan melainkan dengan Allah Yang Maha Tinggi lagi Maha Agung.',
   'Allah suffices us and He is the best Disposer of affairs, the best Protector and the best Helper. There is no power nor strength except with Allah, the Most High, the Most Great.'),
 z('Istighfar', 'Seeking forgiveness', 'أَسْتَغْفِرُ اللهَ الْعَظِيْمَ', "Astaghfirullahal-'azim.", 'Aku memohon ampun kepada Allah Yang Maha Agung.', 'I seek forgiveness from Allah, the Most Great.', n=3),
 z('Kelebihan zikir tahlil', 'The best remembrance', 'أَفْضَلُ الذِّكْرِ فَاعْلَمْ أَنَّهُ لَا إِلٰهَ إِلَّا اللهُ',
   "Afdaluz-zikri fa'lam annahu la ilaha illallah.", 'Sebaik-baik zikir, ketahuilah, ialah: Tiada Tuhan melainkan Allah.', 'Know that the best remembrance is: there is no god but Allah.'),
 z('Tahlil', 'Tahlil', 'لَا إِلٰهَ إِلَّا اللهُ', 'La ilaha illallah.', 'Tiada Tuhan melainkan Allah.', 'There is no god but Allah.', n=33, note=['Sesetengah amalan membaca 100 kali atau lebih.', 'Some practices recite it 100 times or more.']),
 z('Dua kalimah syahadah', 'The two testimonies', 'لَا إِلٰهَ إِلَّا اللهُ مُحَمَّدٌ رَسُوْلُ اللهِ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ',
   'La ilaha illallah, Muhammadur-Rasulullah sallallahu alaihi wa sallam.', 'Tiada Tuhan melainkan Allah, Muhammad pesuruh Allah SAW.', 'There is no god but Allah; Muhammad is the Messenger of Allah (PBUH).'),
 z('Tasbih', 'Glorification', 'سُبْحَانَ اللهِ وَبِحَمْدِهِ سُبْحَانَ اللهِ الْعَظِيْمِ', "Subhanallahi wa bihamdihi subhanallahil-'azim.", 'Maha Suci Allah dan segala puji bagi-Nya, Maha Suci Allah Yang Maha Agung.', 'Glory be to Allah and praise be to Him; glory be to Allah, the Most Great.', n=3),
 z('Selawat penutup', 'Closing salawat', 'اَللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ، اَللّٰهُمَّ صَلِّ عَلَيْهِ وَسَلِّمْ',
   "Allahumma salli 'ala sayyidina Muhammad, Allahumma salli 'alaihi wa sallim.", 'Ya Allah, limpahkanlah selawat ke atas junjungan kami Muhammad. Ya Allah, limpahkanlah selawat dan salam ke atas baginda.', 'O Allah, send blessings upon our master Muhammad; O Allah, send blessings and peace upon him.', n=3),
 quran('Surah Al-Fatihah', 'Surah Al-Fatihah', 1, 1, 7),
 z('Doa: rahmat dengan berkat Al-Quran', 'Supplication: mercy through the Quran',
   'اَللّٰهُمَّ ارْحَمْهُ بِالْقُرْآنِ الْعَظِيْمِ رَحْمَةً وَاسِعَةً، وَاغْفِرْ لَهُ مَغْفِرَةً جَامِعَةً، يَا مَالِكَ الدُّنْيَا وَالْآخِرَةِ يَا رَبَّ الْعَالَمِيْنَ',
   "Allahummarhamhu bil-Quranil-'azimi rahmatan wasi'ah, waghfir lahu maghfiratan jami'ah, ya malikad-dunya wal-akhirah, ya Rabbal-'alamin.",
   'Ya Allah, rahmatilah dia dengan berkat Al-Quran yang agung dengan rahmat yang luas, dan ampunilah dia dengan keampunan yang menyeluruh, wahai Penguasa dunia dan akhirat, wahai Tuhan sekalian alam.',
   'O Allah, have abundant mercy on him through the Mighty Quran, and forgive him completely, O Master of this world and the Hereafter, O Lord of the worlds.',
   af='اَللّٰهُمَّ ارْحَمْهَا بِالْقُرْآنِ الْعَظِيْمِ رَحْمَةً وَاسِعَةً، وَاغْفِرْ لَهَا مَغْفِرَةً جَامِعَةً، يَا مَالِكَ الدُّنْيَا وَالْآخِرَةِ يَا رَبَّ الْعَالَمِيْنَ',
   rf="Allahummarhamha bil-Quranil-'azimi rahmatan wasi'ah, waghfir laha maghfiratan jami'ah, ya malikad-dunya wal-akhirah, ya Rabbal-'alamin.",
   mf='Ya Allah, rahmatilah dia (perempuan) dengan berkat Al-Quran yang agung dengan rahmat yang luas, dan ampunilah dia dengan keampunan yang menyeluruh, wahai Penguasa dunia dan akhirat, wahai Tuhan sekalian alam.',
   mef='O Allah, have abundant mercy on her through the Mighty Quran, and forgive her completely, O Master of this world and the Hereafter, O Lord of the worlds.'),
 z('Doa: cahaya di dalam kubur', 'Supplication: light in the grave',
   'اَللّٰهُمَّ أَنْزِلْ فِيْ قَبْرِهِ الرَّحْمَةَ وَالضِّيَاءَ وَالنُّوْرَ وَالْبَهْجَةَ وَالرَّوْحَ وَالرَّيْحَانَ وَالسُّرُوْرَ، مِنْ يَوْمِنَا هٰذَا إِلَى يَوْمِ الْبَعْثِ وَالنُّشُوْرِ، إِنَّكَ مَلِكٌ رَبٌّ غَفُوْرٌ',
   "Allahumma anzil fi qabrihir-rahmata wad-diya'a wan-nura wal-bahjata war-rauha war-raihana was-surur, min yaumina haza ila yaumil-ba'thi wan-nusyur, innaka malikun Rabbun ghafur.",
   'Ya Allah, turunkanlah ke dalam kuburnya rahmat, sinar, cahaya, keceriaan, ketenangan, keharuman dan kegembiraan, dari hari ini hingga hari kebangkitan. Sesungguhnya Engkau Raja, Tuhan Yang Maha Pengampun.',
   'O Allah, send down into his grave mercy, radiance, light, joy, rest, fragrance and happiness, from this day until the Day of Resurrection. You are the King, the Lord, the Forgiving.',
   af='اَللّٰهُمَّ أَنْزِلْ فِيْ قَبْرِهَا الرَّحْمَةَ وَالضِّيَاءَ وَالنُّوْرَ وَالْبَهْجَةَ وَالرَّوْحَ وَالرَّيْحَانَ وَالسُّرُوْرَ، مِنْ يَوْمِنَا هٰذَا إِلَى يَوْمِ الْبَعْثِ وَالنُّشُوْرِ، إِنَّكَ مَلِكٌ رَبٌّ غَفُوْرٌ',
   rf="Allahumma anzil fi qabrihar-rahmata wad-diya'a wan-nura wal-bahjata war-rauha war-raihana was-surur, min yaumina haza ila yaumil-ba'thi wan-nusyur, innaka malikun Rabbun ghafur.",
   mf='Ya Allah, turunkanlah ke dalam kuburnya (perempuan) rahmat, sinar, cahaya, keceriaan, ketenangan, keharuman dan kegembiraan, dari hari ini hingga hari kebangkitan. Sesungguhnya Engkau Raja, Tuhan Yang Maha Pengampun.',
   mef='O Allah, send down into her grave mercy, radiance, light, joy, rest, fragrance and happiness, from this day until the Day of Resurrection. You are the King, the Lord, the Forgiving.'),
 z('Doa: Al-Quran sebagai teman', 'Supplication: the Quran as companion',
   'اَللّٰهُمَّ اجْعَلِ الْقُرْآنَ الْعَظِيْمَ فِيْ قَبْرِهِ مُؤْنِسًا، وَفِي الْقِيَامَةِ شَافِعًا، وَفِي الْحَشْرِ ضِيَاءً وَظِلًّا وَدَلِيْلًا، وَفِي الْمِيْزَانِ رَاجِحًا، وَعَلَى الصِّرَاطِ نُوْرًا وَقَائِدًا، وَعَنِ النَّارِ سِتْرًا وَحِجَابًا، وَفِي الْجَنَّةِ رَفِيْقًا',
   "Allahummaj'alil-Quranal-'azima fi qabrihi mu'nisa, wa fil-qiyamati syafi'a, wa fil-hasyri diya'an wa zillan wa dalila, wa fil-mizani rajiha, wa 'alas-sirati nuran wa qa'ida, wa 'anin-nari sitran wa hijaba, wa fil-jannati rafiqa.",
   'Ya Allah, jadikanlah Al-Quran yang agung sebagai teman di dalam kuburnya, pemberi syafaat pada hari kiamat, cahaya, naungan dan petunjuk di padang mahsyar, pemberat timbangan, cahaya dan pemimpin di atas sirat, pendinding daripada neraka, dan teman di dalam syurga.',
   'O Allah, make the Mighty Quran a companion in his grave, an intercessor on the Day of Judgement, light, shade and guide at the Gathering, weight on the Scale, light and leader on the Bridge, a screen from the Fire, and a companion in Paradise.',
   af='اَللّٰهُمَّ اجْعَلِ الْقُرْآنَ الْعَظِيْمَ فِيْ قَبْرِهَا مُؤْنِسًا، وَفِي الْقِيَامَةِ شَافِعًا، وَفِي الْحَشْرِ ضِيَاءً وَظِلًّا وَدَلِيْلًا، وَفِي الْمِيْزَانِ رَاجِحًا، وَعَلَى الصِّرَاطِ نُوْرًا وَقَائِدًا، وَعَنِ النَّارِ سِتْرًا وَحِجَابًا، وَفِي الْجَنَّةِ رَفِيْقًا',
   rf="Allahummaj'alil-Quranal-'azima fi qabriha mu'nisa, wa fil-qiyamati syafi'a, wa fil-hasyri diya'an wa zillan wa dalila, wa fil-mizani rajiha, wa 'alas-sirati nuran wa qa'ida, wa 'anin-nari sitran wa hijaba, wa fil-jannati rafiqa.",
   mf='Ya Allah, jadikanlah Al-Quran yang agung sebagai teman di dalam kuburnya (perempuan), pemberi syafaat pada hari kiamat, cahaya, naungan dan petunjuk di padang mahsyar, pemberat timbangan, cahaya dan pemimpin di atas sirat, pendinding daripada neraka, dan teman di dalam syurga.',
   mef='O Allah, make the Mighty Quran a companion in her grave, an intercessor on the Day of Judgement, light, shade and guide at the Gathering, weight on the Scale, light and leader on the Bridge, a screen from the Fire, and a companion in Paradise.'),
 z('Doa untuk arwah', 'Supplication for the deceased', 'اَللّٰهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ يَا رَبَّ الْعَالَمِيْنَ',
   "Allahummaghfir lahu warhamhu wa 'afihi wa'fu 'anhu ya Rabbal-'alamin.", 'Ya Allah, ampunilah dia, rahmatilah dia, sejahterakanlah dia dan maafkanlah dia, wahai Tuhan sekalian alam.', 'O Allah, forgive him, have mercy on him, grant him well-being and pardon him, O Lord of the worlds.',
   af='اَللّٰهُمَّ اغْفِرْ لَهَا وَارْحَمْهَا وَعَافِهَا وَاعْفُ عَنْهَا يَا رَبَّ الْعَالَمِيْنَ', rf="Allahummaghfir laha warhamha wa 'afiha wa'fu 'anha ya Rabbal-'alamin.",
   mf='Ya Allah, ampunilah dia (perempuan), rahmatilah dia, sejahterakanlah dia dan maafkanlah dia, wahai Tuhan sekalian alam.', mef='O Allah, forgive her, have mercy on her, grant her well-being and pardon her, O Lord of the worlds.'),
 z('Doa penutup', 'Closing supplication', 'اَللّٰهُمَّ بِفَضْلِكَ عُمَّنَا، وَبِلُطْفِكَ حُفَّنَا، وَعَلَى الْإِسْلَامِ وَالْإِيْمَانِ جَمِيْعًا تَوَفَّنَا وَأَنْتَ رَاضٍ عَنَّا، وَاخْتِمْ بِالصَّالِحَاتِ أَعْمَالَنَا. رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ، بِرَحْمَتِكَ يَا أَرْحَمَ الرَّاحِمِيْنَ، وَالْحَمْدُ لِلّٰهِ رَبِّ الْعَالَمِيْنَ',
   "Allahumma bifadlika 'ummana, wa bilutfika huffana, wa 'alal-Islami wal-imani jami'an tawaffana wa anta radin 'anna, wakhtim bis-salihati a'malana. Rabbana atina fid-dunya hasanah, wa fil-akhirati hasanah, wa qina 'azaban-nar, birahmatika ya arhamar-rahimin, wal-hamdu lillahi Rabbil-'alamin.",
   'Ya Allah, dengan kurnia-Mu liputilah kami, dengan kelembutan-Mu peliharalah kami, matikanlah kami semua dalam Islam dan iman sedang Engkau reda kepada kami, dan akhirilah amalan kami dengan kebaikan. Wahai Tuhan kami, kurniakanlah kami kebaikan di dunia dan kebaikan di akhirat, dan peliharalah kami daripada azab neraka, dengan rahmat-Mu wahai Yang Maha Penyayang. Segala puji bagi Allah, Tuhan sekalian alam.',
   'O Allah, envelop us with Your grace, surround us with Your kindness, take us all in Islam and faith while You are pleased with us, and seal our deeds with good. Our Lord, give us good in this world and good in the Hereafter and protect us from the punishment of the Fire, by Your mercy, O Most Merciful. All praise is for Allah, Lord of the worlds.'),
]
with open('www/data/tahlil.js', 'w') as f:
    f.write("/* Tahlil ringkas. Ayat Al-Quran daripada teks Al-Quran Wazlee yang disahkan; susunan lazim (rujukan: Majmu' Syarif). tk = ulang 'La ilaha illallahu wallahu akbar' selepas surah. f = versi arwah perempuan. */\nwindow.TAHLIL = ")
    json.dump(dict(items=items, tk=TK), f, ensure_ascii=False, indent=0); f.write(';\n')
print(len(items), 'items')
