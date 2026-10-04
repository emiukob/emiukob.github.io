/* =========================================================
   KARAKTER SPRITE'I – 12x16 piksel, kodla çizilir (görsel dosyası yok)
   frame 0: duruş, frame 1-2: yürüme
   ========================================================= */
(function () {
  const W = 12, H = 16;
  const C = {
    hair: "#3b2416", skin: "#f2c29b", eye: "#1a1020",
    shirt: "#3fa9f5", shirtDark: "#2a74b8",
    phones: "#ff5d73", belt: "#2b2b3a", pants: "#3a3f6b", shoe: "#1d1d26",
    outline: "#0b0a12"
  };

  function rect(ctx, color, x, y, w, h) { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); }

  function drawBody(ctx, f) {
    // saç
    rect(ctx, C.hair, 3, 0, 6, 1);
    rect(ctx, C.hair, 2, 1, 8, 2);
    // yüz
    rect(ctx, C.skin, 3, 3, 6, 3);
    rect(ctx, C.hair, 2, 3, 1, 2);
    rect(ctx, C.hair, 9, 3, 1, 2);
    rect(ctx, C.eye, 4, 4, 1, 1);
    rect(ctx, C.eye, 7, 4, 1, 1);
    // kulaklık (YouTuber!)
    rect(ctx, C.phones, 2, 2, 1, 2);
    rect(ctx, C.phones, 9, 2, 1, 2);
    // gövde
    rect(ctx, C.shirt, 3, 6, 6, 4);
    rect(ctx, C.shirtDark, 3, 9, 6, 1);
    // kollar
    const la = f === 1 ? 1 : f === 2 ? -1 : 0;
    rect(ctx, C.shirtDark, 2, 6 + Math.max(0, la), 1, 3);
    rect(ctx, C.skin, 2, 9 + Math.max(0, la), 1, 1);
    rect(ctx, C.shirtDark, 9, 6 + Math.max(0, -la), 1, 3);
    rect(ctx, C.skin, 9, 9 + Math.max(0, -la), 1, 1);
    // kemer
    rect(ctx, C.belt, 3, 10, 6, 1);
    // bacaklar + ayakkabılar
    if (f === 0) {
      rect(ctx, C.pants, 3, 11, 2, 3); rect(ctx, C.shoe, 3, 14, 2, 1);
      rect(ctx, C.pants, 7, 11, 2, 3); rect(ctx, C.shoe, 7, 14, 2, 1);
    } else if (f === 1) {
      rect(ctx, C.pants, 2, 11, 2, 3); rect(ctx, C.shoe, 2, 14, 2, 1);
      rect(ctx, C.pants, 7, 11, 2, 2); rect(ctx, C.shoe, 7, 13, 2, 1);
    } else {
      rect(ctx, C.pants, 3, 11, 2, 2); rect(ctx, C.shoe, 3, 13, 2, 1);
      rect(ctx, C.pants, 8, 11, 2, 3); rect(ctx, C.shoe, 8, 14, 2, 1);
    }
  }

  // Opak piksellerin etrafına 1px kontur
  function outline(ctx) {
    const img = ctx.getImageData(0, 0, W, H);
    const d = img.data;
    const solid = (x, y) => x >= 0 && y >= 0 && x < W && y < H && d[(y * W + x) * 4 + 3] > 0;
    const marks = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (!solid(x, y) && (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1))) marks.push([x, y]);
    }
    ctx.fillStyle = C.outline;
    marks.forEach(([x, y]) => ctx.fillRect(x, y, 1, 1));
  }

  const frames = [0, 1, 2].map(f => {
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const ctx = c.getContext("2d");
    // kontur için 1px iç boşluk: gövdeyi 1px aşağı kaydır
    ctx.translate(0, 1);
    drawBody(ctx, f);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    outline(ctx);
    return c;
  });

  window.Hero = {
    W, H,
    draw(target, f) {
      const ctx = target.getContext("2d");
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(frames[f % 3], 0, 0);
    }
  };
})();
