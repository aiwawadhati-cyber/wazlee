/* Kongsi sebagai gambar: kad ayat/doa 1080×1350 (status WhatsApp/Instagram) */
(() => {
  const { $, P, toast, isNative } = WZ;
  const W = 1080, H = 1350, PAD = 90;
  let logo = null;
  const loadLogo = () => logo ? Promise.resolve(logo) : new Promise(r => { const i = new Image(); i.onload = () => r(logo = i); i.onerror = () => r(null); i.src = 'img/logo.png'; });

  function wrap(ctx, text, maxW, rtl) {
    const words = String(text || '').split(/\s+/).filter(Boolean), lines = []; let line = '';
    words.forEach(w => { const tst = line ? line + ' ' + w : w; if (ctx.measureText(tst).width > maxW && line) { lines.push(line); line = w; } else line = tst; });
    if (line) lines.push(line); return lines;
  }
  /* Cari saiz fon terbesar yang muat dalam tinggi tersedia */
  function fit(ctx, text, font, maxW, maxH, from, to, lh) {
    for (let s = from; s >= to; s -= 2) { ctx.font = font(s); const ls = wrap(ctx, text, maxW); if (ls.length * s * lh <= maxH) return { s, ls }; }
    ctx.font = font(to); return { s: to, ls: wrap(ctx, text, maxW) };
  }

  async function render({ title, arab, rumi, text, ref }) {
    await Promise.all([document.fonts.load('60px Amiri'), document.fonts.load('900 40px Nunito'), document.fonts.load('600 30px Nunito')]).catch(() => {});
    const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
    // latar
    const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#2F9BFF'); g.addColorStop(0.55, '#1565D8'); g.addColorStop(1, '#0A2F86');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.globalAlpha = 0.08; x.fillStyle = '#fff';
    [[W - 120, 160, 260], [120, H - 140, 220], [W - 60, H - 380, 120]].forEach(([cx, cy, r]) => { x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); });
    x.globalAlpha = 1;
    // kepala
    const lg = await loadLogo();
    if (lg) x.drawImage(lg, PAD, 70, 84, 84);
    x.fillStyle = '#fff'; x.font = '900 46px Nunito, sans-serif'; x.textAlign = 'left'; x.textBaseline = 'middle';
    x.fillText('Wazlee', PAD + (lg ? 104 : 0), 112);
    if (title) { x.font = '800 30px Nunito, sans-serif'; x.globalAlpha = 0.85; x.textAlign = 'right'; x.fillText(title.length > 34 ? title.slice(0, 33) + '…' : title, W - PAD, 112); x.globalAlpha = 1; }
    // kad dalam
    const top = 210, bottom = H - 150, cw = W - PAD * 2;
    x.fillStyle = 'rgba(255,255,255,0.10)'; roundRect(x, PAD - 30, top, cw + 60, bottom - top, 44); x.fill();
    let y = top + 70;
    const hasT = !!(text || rumi), arabH = hasT ? (bottom - top) * 0.52 : (bottom - top) - 140;
    // Arab
    x.direction = 'rtl'; x.textAlign = 'center'; x.textBaseline = 'alphabetic'; x.fillStyle = '#fff';
    const A = fit(x, arab, s => `${s}px Amiri, serif`, cw - 20, arabH, 72, 34, 1.75);
    x.font = `${A.s}px Amiri, serif`;
    A.ls.forEach(l => { y += A.s * 1.75; x.fillText(l, W / 2, y - A.s * 0.45); });
    x.direction = 'ltr';
    // pemisah
    y += 34; x.fillStyle = '#FFD166'; x.beginPath(); x.moveTo(W / 2 - 60, y); x.lineTo(W / 2 + 60, y); x.lineWidth = 4; x.strokeStyle = '#FFD166'; x.stroke();
    x.beginPath(); x.arc(W / 2, y, 7, 0, 7); x.fill(); y += 40;
    // rumi & maksud
    const room = bottom - 70 - y - (ref ? 60 : 0);
    if (rumi) { x.font = 'italic 600 30px Nunito, sans-serif'; x.fillStyle = 'rgba(255,255,255,0.85)'; x.textAlign = 'center';
      const R = fit(x, rumi, s => `italic 600 ${s}px Nunito, sans-serif`, cw - 40, room * (text ? 0.38 : 1), 32, 22, 1.45); x.font = `italic 600 ${R.s}px Nunito, sans-serif`;
      R.ls.forEach(l => { y += R.s * 1.45; x.fillText(l, W / 2, y); }); y += 18; }
    if (text) { x.fillStyle = '#fff'; x.textAlign = 'center';
      const T = fit(x, text, s => `600 ${s}px Nunito, sans-serif`, cw - 40, bottom - 70 - y - (ref ? 60 : 0), 38, 22, 1.45); x.font = `600 ${T.s}px Nunito, sans-serif`;
      T.ls.forEach(l => { y += T.s * 1.45; x.fillText(l, W / 2, y); }); }
    if (ref) { x.font = '900 32px Nunito, sans-serif'; x.fillStyle = '#FFD166'; x.textAlign = 'center'; x.fillText(ref, W / 2, bottom - 50); }
    // kaki
    x.font = '700 28px Nunito, sans-serif'; x.fillStyle = 'rgba(255,255,255,0.8)'; x.textAlign = 'center';
    x.fillText(LANG === 'en' ? 'Wazlee · Daily Muslim Companion' : 'Wazlee · App Harian Muslim', W / 2, H - 70);
    return c;
  }
  function roundRect(x, l, t, w, h, r) { x.beginPath(); x.moveTo(l + r, t); x.arcTo(l + w, t, l + w, t + h, r); x.arcTo(l + w, t + h, l, t + h, r); x.arcTo(l, t + h, l, t, r); x.arcTo(l, t, l + w, t, r); x.closePath(); }

  async function shareImage(o) {
    try {
      toast(t('img.making'));
      const c = await render(o), name = `wazlee-${Date.now()}.png`;
      if (isNative && P.Filesystem && P.Share) {
        const data = c.toDataURL('image/png').split(',')[1];
        const w = await P.Filesystem.writeFile({ path: name, data, directory: 'CACHE' });
        await P.Share.share({ title: 'Wazlee', files: [w.uri], dialogTitle: t('btn.share') });
        return;
      }
      const blob = await new Promise(r => c.toBlob(r, 'image/png')), file = new File([blob], name, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'Wazlee' }); return; }
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 30000); toast(t('img.saved'));
    } catch (e) { if (!/cancel|abort/i.test(String(e && (e.message || e.name)))) toast(t('err.generic') + ' ' + (e.message || e)); }
  }
  WZ.shareImage = shareImage; WZ.renderShareImage = render;
})();
