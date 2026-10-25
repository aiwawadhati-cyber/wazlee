/* Kiraan waktu solat (algoritma astronomi standard), parameter gaya JAKIM */
(function (g) {
  const D2R = Math.PI / 180, R2D = 180 / Math.PI;
  const sin = d => Math.sin(d * D2R), cos = d => Math.cos(d * D2R), tan = d => Math.tan(d * D2R);
  const asin = x => Math.asin(x) * R2D, acos = x => Math.acos(x) * R2D, atan2 = (y, x) => Math.atan2(y, x) * R2D;
  const acot = x => Math.atan(1 / x) * R2D;
  const fix = (a, b) => { a = a - b * Math.floor(a / b); return a < 0 ? a + b : a; };

  function julian(y, m, d) {
    if (m <= 2) { y -= 1; m += 12; }
    const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
  }
  function sunPos(jd) {
    const D = jd - 2451545.0;
    const gq = fix(357.529 + 0.98560028 * D, 360);
    const q = fix(280.459 + 0.98564736 * D, 360);
    const L = fix(q + 1.915 * sin(gq) + 0.020 * sin(2 * gq), 360);
    const e = 23.439 - 0.00000036 * D;
    const RA = fix(atan2(cos(e) * sin(L), cos(L)) / 15, 24);
    return { decl: asin(sin(e) * sin(L)), eqt: q / 15 - RA };
  }

  /**
   * @param {Date} date  tarikh tempatan
   * @param {number} lat
   * @param {number} lng
   * @param {number} tz  zon waktu (jam), cth 8
   * @returns {{imsak,subuh,syuruk,dhuha,zohor,asar,maghrib,isyak}} masa dalam jam perpuluhan
   */
  function compute(date, lat, lng, tz) {
    const cfg = { fajr: 20, isha: 18, asr: 1, ihtiyati: 2 / 60 };
    const jd = julian(date.getFullYear(), date.getMonth() + 1, date.getDate()) - lng / (15 * 24);
    const mid = t => fix(12 - sunPos(jd + t).eqt, 24);
    const angleTime = (angle, t, ccw) => {
      const decl = sunPos(jd + t).decl, noon = mid(t);
      const c = (-sin(angle) - sin(decl) * sin(lat)) / (cos(decl) * cos(lat));
      const T = acos(Math.max(-1, Math.min(1, c))) / 15;
      return noon + (ccw ? -T : T);
    };
    const asrTime = (factor, t) => {
      const decl = sunPos(jd + t).decl;
      return angleTime(-acot(factor + tan(Math.abs(lat - decl))), t);
    };
    // dua lelaran untuk ketepatan
    let t = { f: 5, sr: 6, d: 12, a: 13, ss: 18, i: 18 };
    for (let k = 0; k < 2; k++) {
      const p = x => x / 24;
      t = {
        f: angleTime(cfg.fajr, p(t.f), true),
        sr: angleTime(0.833, p(t.sr), true),
        d: mid(p(t.d)),
        a: asrTime(cfg.asr, p(t.a)),
        ss: angleTime(0.833, p(t.ss)),
        i: angleTime(cfg.isha, p(t.i))
      };
    }
    const adj = tz - lng / 15, h = cfg.ihtiyati;
    const subuh = t.f + adj + h, syuruk = t.sr + adj - h;
    return {
      imsak: subuh - 10 / 60,
      subuh,
      syuruk,
      dhuha: syuruk + 28 / 60,
      zohor: t.d + adj + h,
      asar: t.a + adj + h,
      maghrib: t.ss + adj + h,
      isyak: t.i + adj + h
    };
  }

  function qibla(lat, lng) {
    const kLat = 21.4225, kLng = 39.8262;
    const y = sin(kLng - lng), x = cos(lat) * tan(kLat) - sin(lat) * cos(kLng - lng);
    return fix(atan2(y, x), 360);
  }
  function kaabaDistance(lat, lng) { return haversine(lat, lng, 21.4225, 39.8262); }
  function haversine(a1, o1, a2, o2) {
    const R = 6371.0088, dA = (a2 - a1) * D2R, dO = (o2 - o1) * D2R;
    const s = Math.sin(dA / 2) ** 2 + Math.cos(a1 * D2R) * Math.cos(a2 * D2R) * Math.sin(dO / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(s));
  }
  function bearing(a1, o1, a2, o2) {
    const y = sin(o2 - o1) * cos(a2), x = cos(a1) * sin(a2) - sin(a1) * cos(a2) * cos(o2 - o1);
    return fix(atan2(y, x), 360);
  }
  g.Prayer = { compute, qibla, haversine, bearing, kaabaDistance };
})(window);
