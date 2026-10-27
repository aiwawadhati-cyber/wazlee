# Jana www/data/panduan.js — Ziarah Kubur, Solat Jenazah, Ayat Syifa'.
# Ayat Al-Quran diambil terus daripada teks Al-Quran Wazlee yang disahkan (www/quran/s/*.json).
import json
AR = str.maketrans('0123456789', '٠١٢٣٤٥٦٧٨٩')
Q = lambda n: json.load(open(f'www/quran/s/{n:03d}.json'))
SN = {1: 'Al-Fatihah', 9: 'At-Taubah', 10: 'Yunus', 16: 'An-Nahl', 17: 'Al-Isra', 26: "Asy-Syu'ara", 41: 'Fussilat', 59: 'Al-Hasyr', 112: 'Al-Ikhlas', 113: 'Al-Falaq', 114: 'An-Nas'}
def quran(t, te, s, a1, a2=None, n=1, bism=False, note=None, notee=None):
    a2 = a2 or a1; d = Q(s); idx = range(a1 - 1, a2)
    a = ' '.join(f'{d["a"][i]} ﴿{str(i+1).translate(AR)}﴾' for i in idx)
    if bism: a = Q(1)['a'][0] + '\n' + a
    o = dict(t=t, te=te, q=f'{SN.get(s, s)} {s}:{a1}' + (f'-{a2}' if a2 != a1 else ''), n=n, a=a,
             r='', m=' '.join(d['ms'][i] for i in idx), me=' '.join(d['en'][i] for i in idx))
    if note: o['note'] = [note, notee]
    return o
def z(t, te, a, r, m, me, n=1, src='', note=None, notee=None, af=None, rf=None, mf=None, mef=None):
    o = dict(t=t, te=te, a=a, r=r, m=m, me=me, n=n)
    if src: o['src'] = src
    if note: o['note'] = [note, notee]
    if af: o['f'] = dict(a=af, r=rf, m=mf, me=mef)   # versi jenazah perempuan
    return o
def info(t, te, pts, ptse): return dict(t=t, te=te, info=[pts, ptse])

ZIARAH = [
 info('Adab menziarahi kubur', 'Etiquette of visiting graves',
   ['Berniat ikhlas: mengambil iktibar, mengingati mati & mendoakan si mati.', 'Sunat berwuduk dan berpakaian sopan.', 'Memberi salam ketika masuk kawasan perkuburan.', 'Tidak duduk, bersandar atau memijak kubur.', 'Tidak meratap atau berkata yang sia-sia.', 'Berdoa dengan menghadap kiblat atau ke arah kubur.'],
   ['Sincere intention: take lessons, remember death & pray for the deceased.', 'Recommended to have wudu and dress modestly.', 'Give salam on entering the graveyard.', 'Do not sit, lean on or step on graves.', 'Do not wail or speak idly.', 'Supplicate facing the qibla or the grave.']),
 z('Salam ketika masuk kawasan kubur', 'Greeting on entering the graveyard',
   'اَلسَّلَامُ عَلَيْكُمْ أَهْلَ الدِّيَارِ مِنَ الْمُؤْمِنِيْنَ وَالْمُسْلِمِيْنَ، وَإِنَّا إِنْ شَاءَ اللهُ بِكُمْ لَلَاحِقُوْنَ، نَسْأَلُ اللهَ لَنَا وَلَكُمُ الْعَافِيَةَ',
   "Assalamu'alaikum ahlad-diyari minal-mu'minina wal-muslimin, wa inna insya-Allahu bikum lalahiqun, nas'alullaha lana wa lakumul-'afiyah.",
   'Salam sejahtera ke atas kamu wahai penghuni kubur daripada kalangan orang mukmin dan muslim. Kami insya-Allah akan menyusul kamu. Kami memohon kepada Allah keselamatan untuk kami dan kamu.',
   'Peace be upon you, O inhabitants of these dwellings among the believers and Muslims. We will, if Allah wills, join you. We ask Allah for well-being for us and for you.', src='HR Muslim'),
 quran('Surah Al-Fatihah', 'Surah Al-Fatihah', 1, 1, 7),
 dict(t='Surah Yasin', te='Surah Ya-Sin', open=36, info=[['Lazim dibaca ketika menziarahi kubur. Ketik butang untuk membaca Surah Yasin penuh dalam pembaca Al-Quran Wazlee.'], ['Commonly recited when visiting graves. Tap the button to read Surah Ya-Sin in the Wazlee Quran reader.']]),
 quran('Surah Al-Ikhlas', 'Surah Al-Ikhlas', 112, 1, 4, 3, True),
 quran('Surah Al-Falaq', 'Surah Al-Falaq', 113, 1, 5, 1, True),
 quran('Surah An-Nas', 'Surah An-Nas', 114, 1, 6, 1, True),
 z('Doa untuk arwah', 'Supplication for the deceased',
   'اَللّٰهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ، اَللّٰهُمَّ لَا تَحْرِمْنَا أَجْرَهُ وَلَا تَفْتِنَّا بَعْدَهُ وَاغْفِرْ لَنَا وَلَهُ',
   "Allahummaghfir lahu warhamhu wa 'afihi wa'fu 'anhu. Allahumma la tahrimna ajrahu wa la taftinna ba'dahu waghfir lana wa lahu.",
   'Ya Allah, ampunilah dia, rahmatilah dia, sejahterakanlah dia dan maafkanlah dia. Ya Allah, janganlah Engkau halang kami daripada pahalanya, janganlah Engkau timpakan fitnah kepada kami selepasnya, dan ampunilah kami dan dia.',
   'O Allah, forgive him, have mercy on him, grant him well-being and pardon him. O Allah, do not deprive us of his reward, do not test us after him, and forgive us and him.',
   af='اَللّٰهُمَّ اغْفِرْ لَهَا وَارْحَمْهَا وَعَافِهَا وَاعْفُ عَنْهَا، اَللّٰهُمَّ لَا تَحْرِمْنَا أَجْرَهَا وَلَا تَفْتِنَّا بَعْدَهَا وَاغْفِرْ لَنَا وَلَهَا',
   rf="Allahummaghfir laha warhamha wa 'afiha wa'fu 'anha. Allahumma la tahrimna ajraha wa la taftinna ba'daha waghfir lana wa laha.",
   mf='Ya Allah, ampunilah dia, rahmatilah dia, sejahterakanlah dia dan maafkanlah dia. Ya Allah, janganlah Engkau halang kami daripada pahalanya, janganlah Engkau timpakan fitnah kepada kami selepasnya, dan ampunilah kami dan dia.',
   mef='O Allah, forgive her, have mercy on her, grant her well-being and pardon her. O Allah, do not deprive us of her reward, do not test us after her, and forgive us and her.'),
 quran('Doa untuk saudara seiman', 'For our brothers in faith', 59, 10),
]

JENAZAH = [
 info('Ringkasan solat jenazah', 'Funeral prayer overview',
   ['Hukumnya fardu kifayah.', 'Empat kali takbir, dilakukan berdiri tanpa rukuk dan sujud.', 'Imam berdiri setentang kepala jenazah lelaki, dan setentang punggung jenazah perempuan.', 'Selepas setiap takbir, angkat tangan seperti takbiratul ihram.', 'Pilih Lelaki/Perempuan di atas untuk lafaz yang sesuai.'],
   ['It is a communal obligation (fard kifayah).', 'Four takbirs, performed standing without bowing or prostration.', 'The imam stands level with the head of a male, and the waist of a female.', 'Raise the hands with each takbir as in the opening takbir.', 'Choose Male/Female above for the matching wording.']),
 z('Niat', 'Intention',
   'أُصَلِّيْ عَلَى هٰذَا الْمَيِّتِ أَرْبَعَ تَكْبِيْرَاتٍ فَرْضَ كِفَايَةٍ (مَأْمُوْمًا / إِمَامًا) لِلّٰهِ تَعَالَى',
   "Usalli 'ala hazal-mayyiti arba'a takbiratin fardha kifayatin (ma'muman / imaman) lillahi ta'ala.",
   'Sahaja aku solat ke atas jenazah (lelaki) ini empat takbir fardu kifayah (sebagai makmum / imam) kerana Allah Taala.',
   'I intend to pray over this (male) deceased with four takbirs as a communal obligation (as follower / imam) for the sake of Allah.',
   note='Niat di dalam hati ketika takbiratul ihram; lafaz membantu. Solat jenazah ghaib: "Usalli \'ala mayyiti (sebut nama) al-gha\'ibi…"', notee='The intention is in the heart at the opening takbir; saying it helps. For an absent deceased: "Usalli \'ala mayyiti (name) al-gha\'ibi…"',
   af='أُصَلِّيْ عَلَى هٰذِهِ الْمَيِّتَةِ أَرْبَعَ تَكْبِيْرَاتٍ فَرْضَ كِفَايَةٍ (مَأْمُوْمًا / إِمَامًا) لِلّٰهِ تَعَالَى',
   rf="Usalli 'ala hazihil-mayyitati arba'a takbiratin fardha kifayatin (ma'muman / imaman) lillahi ta'ala.",
   mf='Sahaja aku solat ke atas jenazah (perempuan) ini empat takbir fardu kifayah (sebagai makmum / imam) kerana Allah Taala.',
   mef='I intend to pray over this (female) deceased with four takbirs as a communal obligation (as follower / imam) for the sake of Allah.'),
 dict(**quran('Takbir 1 — Surah Al-Fatihah', 'Takbir 1 — Surah Al-Fatihah', 1, 1, 7), step=1),
 dict(**z('Takbir 2 — Selawat ke atas Nabi', 'Takbir 2 — Salawat upon the Prophet',
   'اَللّٰهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى سَيِّدِنَا إِبْرَاهِيْمَ وَعَلَى آلِ سَيِّدِنَا إِبْرَاهِيْمَ، وَبَارِكْ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى سَيِّدِنَا إِبْرَاهِيْمَ وَعَلَى آلِ سَيِّدِنَا إِبْرَاهِيْمَ، فِي الْعَالَمِيْنَ إِنَّكَ حَمِيْدٌ مَجِيْدٌ',
   "Allahumma salli 'ala sayyidina Muhammadin wa 'ala ali sayyidina Muhammad, kama sallaita 'ala sayyidina Ibrahima wa 'ala ali sayyidina Ibrahim, wa barik 'ala sayyidina Muhammadin wa 'ala ali sayyidina Muhammad, kama barakta 'ala sayyidina Ibrahima wa 'ala ali sayyidina Ibrahim, fil-'alamina innaka hamidun majid.",
   'Ya Allah, limpahkanlah selawat ke atas junjungan kami Muhammad dan keluarganya sebagaimana Engkau limpahkan ke atas Ibrahim dan keluarganya, dan berkatilah Muhammad dan keluarganya sebagaimana Engkau berkati Ibrahim dan keluarganya. Di seluruh alam, sesungguhnya Engkau Maha Terpuji lagi Maha Mulia.',
   'O Allah, send blessings upon our master Muhammad and his family as You sent blessings upon Ibrahim and his family, and bless Muhammad and his family as You blessed Ibrahim and his family. Among all the worlds, You are Praiseworthy and Glorious.',
   note='Sekurang-kurangnya: "Allahumma salli \'ala Muhammad."', notee='At minimum: "Allahumma salli \'ala Muhammad."'), step=2),
 dict(**z('Takbir 3 — Doa untuk jenazah', 'Takbir 3 — Supplication for the deceased',
   'اَللّٰهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ، وَأَكْرِمْ نُزُلَهُ، وَوَسِّعْ مُدْخَلَهُ، وَاغْسِلْهُ بِالْمَاءِ وَالثَّلْجِ وَالْبَرَدِ، وَنَقِّهِ مِنَ الْخَطَايَا كَمَا يُنَقَّى الثَّوْبُ الْأَبْيَضُ مِنَ الدَّنَسِ',
   "Allahummaghfir lahu warhamhu wa 'afihi wa'fu 'anhu, wa akrim nuzulahu, wa wassi' mudkhalahu, waghsilhu bil-ma'i wath-thalji wal-barad, wa naqqihi minal-khataya kama yunaqqath-thaubul-abyadu minad-danas.",
   'Ya Allah, ampunilah dia, rahmatilah dia, sejahterakanlah dia dan maafkanlah dia. Muliakanlah tempat tinggalnya, luaskanlah tempat masuknya, mandikanlah dia dengan air, salji dan embun, dan bersihkanlah dia daripada kesalahan sebagaimana kain putih dibersihkan daripada kotoran.',
   'O Allah, forgive him, have mercy on him, grant him well-being and pardon him. Honour his abode, widen his entrance, wash him with water, snow and hail, and cleanse him of sins as a white garment is cleansed of dirt.',
   src='HR Muslim', note='Sekurang-kurangnya: "Allahummaghfir lahu warhamhu." Doa untuk jenazah kanak-kanak berbeza — rujuk imam.', notee='At minimum: "Allahummaghfir lahu warhamhu." The supplication for a child differs — ask the imam.',
   af='اَللّٰهُمَّ اغْفِرْ لَهَا وَارْحَمْهَا وَعَافِهَا وَاعْفُ عَنْهَا، وَأَكْرِمْ نُزُلَهَا، وَوَسِّعْ مُدْخَلَهَا، وَاغْسِلْهَا بِالْمَاءِ وَالثَّلْجِ وَالْبَرَدِ، وَنَقِّهَا مِنَ الْخَطَايَا كَمَا يُنَقَّى الثَّوْبُ الْأَبْيَضُ مِنَ الدَّنَسِ',
   rf="Allahummaghfir laha warhamha wa 'afiha wa'fu 'anha, wa akrim nuzulaha, wa wassi' mudkhalaha, waghsilha bil-ma'i wath-thalji wal-barad, wa naqqiha minal-khataya kama yunaqqath-thaubul-abyadu minad-danas.",
   mf='Ya Allah, ampunilah dia, rahmatilah dia, sejahterakanlah dia dan maafkanlah dia. Muliakanlah tempat tinggalnya, luaskanlah tempat masuknya, mandikanlah dia dengan air, salji dan embun, dan bersihkanlah dia daripada kesalahan sebagaimana kain putih dibersihkan daripada kotoran.',
   mef='O Allah, forgive her, have mercy on her, grant her well-being and pardon her. Honour her abode, widen her entrance, wash her with water, snow and hail, and cleanse her of sins as a white garment is cleansed of dirt.'), step=3),
 dict(**z('Takbir 4 — Doa', 'Takbir 4 — Supplication',
   'اَللّٰهُمَّ لَا تَحْرِمْنَا أَجْرَهُ وَلَا تَفْتِنَّا بَعْدَهُ وَاغْفِرْ لَنَا وَلَهُ',
   "Allahumma la tahrimna ajrahu wa la taftinna ba'dahu waghfir lana wa lahu.",
   'Ya Allah, janganlah Engkau halang kami daripada pahalanya, janganlah Engkau timpakan fitnah kepada kami selepasnya, dan ampunilah kami dan dia.',
   'O Allah, do not deprive us of his reward, do not test us after him, and forgive us and him.',
   af='اَللّٰهُمَّ لَا تَحْرِمْنَا أَجْرَهَا وَلَا تَفْتِنَّا بَعْدَهَا وَاغْفِرْ لَنَا وَلَهَا',
   rf="Allahumma la tahrimna ajraha wa la taftinna ba'daha waghfir lana wa laha.",
   mf='Ya Allah, janganlah Engkau halang kami daripada pahalanya, janganlah Engkau timpakan fitnah kepada kami selepasnya, dan ampunilah kami dan dia.',
   mef='O Allah, do not deprive us of her reward, do not test us after her, and forgive us and her.'), step=4),
 z('Salam', 'Salam', 'اَلسَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللهِ', "Assalamu'alaikum wa rahmatullah.",
   'Salam sejahtera ke atas kamu dan rahmat Allah. (Toleh ke kanan, kemudian ke kiri.)', 'Peace and the mercy of Allah be upon you. (Turn to the right, then to the left.)'),
]

SYIFA = [
 info("Tentang Ayat Syifa'", "About the Ayat of Healing",
   ["Enam ayat Al-Quran yang menyebut 'syifa'' (penyembuh), lazim dibaca untuk memohon kesembuhan.", 'Bacalah dengan yakin bahawa kesembuhan hanya daripada Allah, sambil meletakkan tangan di tempat sakit atau meniup pada air.', 'Ia tidak menggantikan rawatan perubatan — berubat & berdoa seiring.'],
   ["Six verses of the Quran that mention 'shifa'' (healing), commonly recited to seek a cure.", 'Recite with conviction that healing is only from Allah, placing the hand on the pain or blowing over water.', 'It does not replace medical treatment — seek treatment and pray together.']),
 quran("Ayat Syifa' 1", "Healing verse 1", 9, 14),
 quran("Ayat Syifa' 2", "Healing verse 2", 10, 57),
 quran("Ayat Syifa' 3", "Healing verse 3", 16, 69),
 quran("Ayat Syifa' 4", "Healing verse 4", 17, 82),
 quran("Ayat Syifa' 5", "Healing verse 5", 26, 80),
 quran("Ayat Syifa' 6", "Healing verse 6", 41, 44),
 z('Doa Nabi SAW untuk orang sakit', "The Prophet's (PBUH) supplication for the sick",
   'اَللّٰهُمَّ رَبَّ النَّاسِ، أَذْهِبِ الْبَأْسَ، اشْفِ أَنْتَ الشَّافِيْ، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمًا',
   "Allahumma Rabban-nas, azhibil-ba's, isyfi antasy-syafi, la syifa'a illa syifa'uk, syifa'an la yughadiru saqama.",
   'Ya Allah, Tuhan sekalian manusia, hilangkanlah penyakit ini. Sembuhkanlah, Engkaulah Yang Maha Menyembuhkan. Tiada kesembuhan melainkan kesembuhan daripada-Mu, kesembuhan yang tidak meninggalkan sebarang penyakit.',
   'O Allah, Lord of mankind, remove the harm and heal, for You are the Healer. There is no healing but Your healing, a healing that leaves no illness behind.', src='HR Bukhari & Muslim'),
 z('Doa ketika menziarahi orang sakit', 'When visiting the sick',
   'أَسْأَلُ اللهَ الْعَظِيْمَ رَبَّ الْعَرْشِ الْعَظِيْمِ أَنْ يَشْفِيَكَ',
   "As'alullahal-'azim, Rabbal-'arsyil-'azim, an yasyfiyak.",
   'Aku memohon kepada Allah Yang Maha Agung, Tuhan Arasy yang agung, agar menyembuhkanmu.',
   'I ask Allah the Mighty, Lord of the Mighty Throne, to cure you.', n=7, src='HR Abu Daud & Tirmizi'),
 z('Doa untuk diri sendiri (letak tangan di tempat sakit)', 'For yourself (hand on the pain)',
   'بِسْمِ اللهِ (٣×)\nأَعُوْذُ بِاللهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ (٧×)',
   "Bismillah (3×). A'uzu billahi wa qudratihi min syarri ma ajidu wa uhazir (7×).",
   'Dengan nama Allah (3 kali). Aku berlindung dengan Allah dan kekuasaan-Nya daripada keburukan yang aku rasai dan yang aku bimbangi (7 kali).',
   'In the name of Allah (3 times). I seek refuge in Allah and His power from the evil of what I feel and what I fear (7 times).', src='HR Muslim'),
]
out = dict(ziarah=ZIARAH, jenazah=JENAZAH, syifa=SYIFA)
with open('www/data/panduan.js', 'w') as f:
    f.write("/* Panduan: Ziarah Kubur, Solat Jenazah, Ayat Syifa'. Ayat Al-Quran daripada teks Al-Quran Wazlee yang disahkan. f = versi jenazah perempuan. */\nwindow.PANDUAN = ")
    json.dump(out, f, ensure_ascii=False, indent=0); f.write(';\n')
print({k: len(v) for k, v in out.items()})
