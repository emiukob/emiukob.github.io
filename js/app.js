/* =========================================================
   EMIUKOB · PORTFOLYO HARİTASI – ana uygulama
   ========================================================= */
(function () {
  "use strict";

  const D = window.PORTFOLIO;
  const STR = window.I18N;
  const $ = (s, r = document) => r.querySelector(s);
  const reduceMotion = false;
  const store = {
    get: k => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* yok say */ } }
  };

  /* ---------- Durum ---------- */
  const state = {
    lang: store.get("pm_lang") || ((navigator.language || "tr").startsWith("tr") ? "tr" : "en"),
    timeMode: store.get("pm_time") || "auto",
    openId: null,
    hero: { x: 50, y: 52, at: null },   // at: bulunduğu bölge id'si (null = meydan)
    walkingTo: null,
    walkToken: 0,
    filter: "all",
    lastFocus: null
  };

  const t = key => STR[state.lang][key] ?? key;
  const L = v => (v && typeof v === "object" && !Array.isArray(v)) ? (v[state.lang] ?? v.tr) : v;
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const regionById = id => D.regions.find(r => r.id === id);

  const map = $("#map");
  const screen = $(".screen");
  const isMapVisible = () => map.offsetParent !== null;

  /* =========================================================
     YÜKLEME EKRANI
     ========================================================= */
  function runLoader() {
    const loader = $("#loader"), fill = $("#loader-fill"), pct = $("#loader-pct"), tip = $("#loader-tip");
    const tips = t("loadingTips");
    let p = 0, ti = 0, ready = false;
    const start = performance.now();
    const minTime = reduceMotion ? 200 : 1600;

    tip.textContent = tips[0];
    const tipTimer = setInterval(() => { ti = (ti + 1) % tips.length; tip.textContent = tips[ti]; }, 650);

    const img = $(".map__img");
    const imgReady = img.complete ? Promise.resolve() : new Promise(r => { img.onload = r; img.onerror = r; });
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    Promise.all([imgReady, fontsReady]).then(() => { ready = true; });

    return new Promise(resolve => {
      const tick = () => {
        const elapsed = performance.now() - start;
        const cap = ready ? 100 : 88;
        p = Math.min(cap, p + (ready && elapsed > minTime ? 9 : Math.random() * 4));
        fill.style.width = p + "%";
        pct.textContent = Math.floor(p) + "%";
        if (p >= 100) {
          clearInterval(tipTimer);
          setTimeout(() => {
            loader.classList.add("is-done");
            setTimeout(() => { if (loader.parentNode) loader.remove(); }, 650);
            resolve();
          }, 250);
          return;
        }
        setTimeout(tick, 70);
      };
      tick();
    });
  }

  /* =========================================================
     HARİTA – hotspot'lar
     ========================================================= */
  function buildHotspots() {
    const wrap = $("#hotspots");
    wrap.innerHTML = "";
    D.regions.forEach(r => {
      const { left, top, width, height } = r.rect;
      const b = document.createElement("button");
      b.type = "button";
      b.className = "hotspot";
      b.id = "hotspot-" + r.id;
      b.dataset.id = r.id;
      b.style.cssText = `left:${left}%;top:${top}%;width:${width}%;height:${height}%;--c:${r.color}`;
      b.setAttribute("aria-label", `${L(r.title)} (${L(r.subtitle)})`);
      b.setAttribute("aria-haspopup", "dialog");
      // Parlama katmanı: haritanın sadece bu bölgeye denk gelen parçası
      const bgSize = `${(100 / width) * 100}% ${(100 / height) * 100}%`;
      const bgPos = `${(left / (100 - width)) * 100}% ${(top / (100 - height)) * 100}%`;
      b.innerHTML = `
        <span class="hotspot__hl" style="background-size:${bgSize};background-position:${bgPos}"></span>
        <span class="hotspot__label">
          <span class="hotspot__title">${esc(L(r.title)).toLocaleUpperCase(state.lang)}</span>
          <span class="hotspot__sub">(${esc(L(r.subtitle))})</span>
          <span class="hotspot__badge">${t("enterBadge")}</span>
        </span>`;
      b.addEventListener("click", () => goTo(r.id));
      wrap.appendChild(b);
    });
  }

  function buildMobileMenu() {
    $("#mobile-list").innerHTML = D.regions.map(r => `
      <button type="button" class="mbtn" id="mbtn-${r.id}" data-id="${r.id}" style="--c:${r.color}">
        <span class="mbtn__icon" aria-hidden="true" style="background-position:${r.thumb ? r.thumb.bgPos : 'center'};background-size:${r.thumb ? r.thumb.bgSize : 'auto'}"></span>
        <span><span class="mbtn__title">${esc(L(r.title))}</span><span class="mbtn__sub">${esc(L(r.subtitle))}</span></span>
        <span class="mbtn__arrow" aria-hidden="true">▶</span>
      </button>`).join("");
    $("#mobile-list").querySelectorAll(".mbtn").forEach(b => b.addEventListener("click", () => openPanel(b.dataset.id)));
  }

  /* =========================================================
     ATMOSFER & 2D DİNAMİK AYDINLATMA MOTORU
     ========================================================= */
  const lightCanvas = $("#lighting-canvas");
  const lctx = lightCanvas ? lightCanvas.getContext("2d") : null;
  const LW = 1376, LH = 768;

  function drawConeLight(ctx, hx, hy, bx, by, radius, alpha) {
    const angle = Math.atan2(by - hy, bx - hx);
    const dist = Math.hypot(bx - hx, by - hy);
    const spread = 0.42; // radyan açısı (~24 derece)

    const p1x = hx + Math.cos(angle - spread) * dist;
    const p1y = hy + Math.sin(angle - spread) * dist;
    const p2x = hx + Math.cos(angle + spread) * dist;
    const p2y = hy + Math.sin(angle + spread) * dist;

    // 1. Karanlığı del (alttaki haritayı aydınlat)
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    const coneGrad = ctx.createRadialGradient(hx, hy, 4, bx, by, dist);
    coneGrad.addColorStop(0, `rgba(0,0,0,${alpha})`);
    coneGrad.addColorStop(0.7, `rgba(0,0,0,${alpha * 0.75})`);
    coneGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = coneGrad;

    ctx.beginPath();
    ctx.moveTo(hx, hy);
    ctx.lineTo(p1x, p1y);
    ctx.lineTo(p2x, p2y);
    ctx.closePath();
    ctx.fill();

    // Uçtaki dairesel alan
    ctx.beginPath();
    ctx.arc(bx, by, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Sıcak sarı ışık rengi vur
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    const colorGrad = ctx.createRadialGradient(hx, hy, 4, bx, by, dist);
    colorGrad.addColorStop(0, "rgba(255, 235, 170, 0.45)");
    colorGrad.addColorStop(0.6, "rgba(255, 190, 80, 0.25)");
    colorGrad.addColorStop(1, "rgba(255, 140, 30, 0)");
    ctx.fillStyle = colorGrad;
    ctx.beginPath();
    ctx.moveTo(hx, hy);
    ctx.lineTo(p1x, p1y);
    ctx.lineTo(p2x, p2y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawRadialLight(ctx, x, y, r, alpha, tintRgba) {
    // 1. Karanlığı del
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(0,0,0,${alpha})`);
    g.addColorStop(0.5, `rgba(0,0,0,${alpha * 0.65})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Renkli ışık tonu ekle
    if (tintRgba) {
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      const tg = ctx.createRadialGradient(x, y, 0, x, y, r);
      tg.addColorStop(0, tintRgba[0]);
      tg.addColorStop(0.5, tintRgba[1]);
      tg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = tg;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function renderLighting(time) {
    if (!lctx) return;
    const phase = map.dataset.phase || "day";
    if (phase === "day") {
      lctx.clearRect(0, 0, LW, LH);
      return;
    }

    const tSec = (time || performance.now()) / 1000;
    const flicker1 = Math.sin(tSec * 4.5) * 0.04 + Math.sin(tSec * 11) * 0.02;
    const fireFlicker = Math.sin(tSec * 8) * 0.08 + Math.sin(tSec * 19) * 0.05;

    lctx.clearRect(0, 0, LW, LH);

    // Ana karanlık katmanı (Gece)
    lctx.fillStyle = "rgba(10, 18, 52, 0.82)";
    lctx.fillRect(0, 0, LW, LH);

    // --- 1. STÜDYO SPOT IŞIKLARI (Tripod lambalar -> binaya ve kameraya açılı) ---
    drawConeLight(lctx, 350, 226, 460, 275, 45, 0.95 + flicker1);
    drawConeLight(lctx, 600, 226, 460, 275, 45, 0.95 - flicker1);

    // Stüdyo iç mavi ışığı (kapı)
    drawRadialLight(lctx, 465, 226, 50, 0.9, ["rgba(100, 210, 255, 0.6)", "rgba(40, 140, 255, 0.25)"]);
    // REC kırmızı lambaları
    const recPulse = Math.sin(tSec * 5) > 0 ? 0.9 : 0.2;
    drawRadialLight(lctx, 525, 165, 22, recPulse, ["rgba(255, 40, 40, 0.7)", "rgba(255, 0, 0, 0.2)"]);
    drawRadialLight(lctx, 534, 255, 22, recPulse, ["rgba(255, 40, 40, 0.7)", "rgba(255, 0, 0, 0.2)"]);

    // --- 2. KÜTÜPHANE ---
    drawRadialLight(lctx, 922, 104, 55, 0.85, ["rgba(120, 210, 255, 0.55)", "rgba(50, 130, 255, 0.2)"]);
    drawRadialLight(lctx, 832, 222, 65, 0.9 + flicker1, ["rgba(255, 215, 120, 0.6)", "rgba(255, 150, 40, 0.25)"]);
    drawRadialLight(lctx, 1011, 222, 65, 0.9 - flicker1, ["rgba(255, 215, 120, 0.6)", "rgba(255, 150, 40, 0.25)"]);
    drawRadialLight(lctx, 922, 250, 50, 0.85, ["rgba(255, 225, 140, 0.5)", "rgba(255, 160, 50, 0.2)"]);

    // --- 3. ATÖLYE & OCAK ---
    drawRadialLight(lctx, 484, 491, 95, 0.98 + fireFlicker, ["rgba(255, 190, 80, 0.7)", "rgba(255, 90, 20, 0.35)"]);
    drawRadialLight(lctx, 440, 522, 60, 0.85 + fireFlicker, ["rgba(255, 160, 50, 0.4)", "rgba(255, 80, 10, 0.15)"]);

    // --- 4. KAMP ATEŞİ & KULÜBE ---
    drawRadialLight(lctx, 924, 545, 130, 0.98 + fireFlicker, ["rgba(255, 200, 90, 0.75)", "rgba(255, 100, 20, 0.35)"]);
    drawRadialLight(lctx, 1018, 487, 50, 0.88 + flicker1, ["rgba(255, 210, 110, 0.55)", "rgba(255, 140, 40, 0.2)"]);

    // --- 5. ORTA FISKİYE MEYDANI ---
    drawRadialLight(lctx, 688, 375, 60, 0.85, ["rgba(130, 230, 255, 0.5)", "rgba(40, 160, 255, 0.18)"]);

    // --- 6. GEMİLER / FENERLER ---
    drawRadialLight(lctx, 248, 73, 38, 0.85, ["rgba(255, 210, 110, 0.5)", "rgba(255, 140, 40, 0.2)"]);
    drawRadialLight(lctx, 1204, 100, 42, 0.85, ["rgba(255, 210, 110, 0.5)", "rgba(255, 140, 40, 0.2)"]);
    drawRadialLight(lctx, 158, 660, 38, 0.85, ["rgba(255, 210, 110, 0.5)", "rgba(255, 140, 40, 0.2)"]);
  }

  function startLightingLoop() {
    function loop(time) {
      const phase = map ? map.dataset.phase : "day";
      if (phase === "night") {
        renderLighting(time);
      } else if (lctx) {
        lctx.clearRect(0, 0, LW, LH);
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  function buildAtmosphere() {
    let stars = "";
    for (let i = 0; i < 36; i++) {
      let x, y;
      do { x = Math.random() * 100; y = Math.random() * 100; }
      while (!(y < 9 || y > 92 || x < 13 || x > 88));
      stars += `<i class="star" style="left:${x}%;top:${y}%;animation-delay:${(Math.random() * 2.4).toFixed(2)}s"></i>`;
    }
    $("#map-stars").innerHTML = stars;

    const smoke = (x, y) => `<span class="smoke" style="left:${x}%;top:${y}%"><i></i><i></i><i></i></span>`;
    const clouds = [[12, 70, -10], [58, 95, -50], [80, 80, -30]]
      .map(([top, dur, delay]) => `<span class="cloud" style="top:${top}%;animation-duration:${dur}s;animation-delay:${delay}s"></span>`).join("");
    $("#map-fx").innerHTML =
      smoke(34.6, 47.5) + smoke(74.2, 54) +
      `<span class="campglow" style="left:67%;top:70.5%"></span>` + clouds;

    startLightingLoop();
  }

  /* =========================================================
     GÜNDÜZ / GECE
     ========================================================= */
  const TIME_MODES = ["auto", "day", "night"];
  const TIME_ICON = { day: "☀️", night: "🌙" };

  function autoPhase() {
    const h = new Date().getHours();
    return (h >= 20 || h < 6) ? "night" : "day";
  }
  function applyTime() {
    const phase = state.timeMode === "auto" ? autoPhase() : state.timeMode;
    map.dataset.phase = phase;
    screen.dataset.phase = phase;
    $("#time-icon").textContent = TIME_ICON[phase];
    const key = { auto: "timeAuto", day: "timeDay", night: "timeNight" }[state.timeMode];
    $("#time-text").textContent = t(key);
    $("#btn-time").setAttribute("aria-label", `${t("timeLabel")}: ${t(key)}`);
  }
  function cycleTime() {
    state.timeMode = TIME_MODES[(TIME_MODES.indexOf(state.timeMode) + 1) % TIME_MODES.length];
    store.set("pm_time", state.timeMode);
    if (window.AudioEngine) AudioEngine.toggle();
    applyTime();
  }

  /* =========================================================
     KARAKTER
     ========================================================= */
  const heroEl = $("#hero");
  const heroCanvas = $("#hero-canvas");

  function placeHero() {
    heroEl.style.left = state.hero.x + "%";
    heroEl.style.top = state.hero.y + "%";
    const g = $("#guide");
    if (!g.hidden) { g.style.left = state.hero.x + "%"; g.style.top = state.hero.y + "%"; }
  }

  function routeTo(id) {
    const from = state.hero.at ? regionById(state.hero.at) : null;
    const to = regionById(id);
    const pts = [];

    // Eğer zaten yoldaysa ve başka bir binaya tıklanarak yön değiştirildiyse:
    if (state.walkingTo && state.walkingTo !== id) {
      // Karakter mevcut konumundan meydana ({x: 50, y: ...}) dönüp yeni hedefe yönelsin
      const midY = (state.hero.y > 50) ? 52 : 48;
      pts.push({ x: 50, y: midY });
      pts.push(...to.path);
      pts.push(to.door);
      return pts;
    }

    if (from && from.id !== id) pts.push(...from.path.slice().reverse());
    if (!from || from.id !== id) pts.push(...to.path);
    pts.push(to.door);
    return pts;
  }

  function walk(points) {
    const token = ++state.walkToken;
    heroEl.classList.remove("is-idle");
    return new Promise(resolve => {
      if (reduceMotion) {
        const last = points[points.length - 1];
        Object.assign(state.hero, { x: last.x, y: last.y });
        placeHero(); heroEl.classList.add("is-idle"); resolve(true); return;
      }
      let i = 0, frameT = 0, frame = 1, prev = performance.now();
      const step = now => {
        if (token !== state.walkToken) return resolve(false);
        const dt = Math.min(0.05, (now - prev) / 1000); prev = now;
        const target = points[i];
        const W = map.clientWidth, H = map.clientHeight;
        const dxPx = (target.x - state.hero.x) / 100 * W;
        const dyPx = (target.y - state.hero.y) / 100 * H;
        const dist = Math.hypot(dxPx, dyPx);
        const speed = W * 0.22;                     // px / sn
        const move = speed * dt;
        if (Math.abs(dxPx) > 0.5) heroEl.classList.toggle("is-flipped", dxPx < 0);
        if (dist <= move) {
          state.hero.x = target.x; state.hero.y = target.y; i++;
        } else {
          state.hero.x += (dxPx / dist) * move / W * 100;
          state.hero.y += (dyPx / dist) * move / H * 100;
        }
        frameT += dt;
        if (frameT > 0.13) {
          frameT = 0;
          frame = frame === 1 ? 2 : 1;
          Hero.draw(heroCanvas, frame);
          if (window.AudioEngine) AudioEngine.step();
        }
        placeHero();
        if (i >= points.length) {
          Hero.draw(heroCanvas, 0);
          heroEl.classList.add("is-idle");
          return resolve(true);
        }
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  function ping(x, y) {
    const p = document.createElement("span");
    p.className = "ping";
    p.style.left = x + "%"; p.style.top = y + "%";
    map.appendChild(p);
    setTimeout(() => p.remove(), 800);
  }

  async function goTo(id) {
    const r = regionById(id);
    if (!r) return;
    hideGuide(true);
    if (!isMapVisible()) return openPanel(id);

    // Zaten o binadaysak doğrudan paneli aç
    if (state.hero.at === id) {
      return openPanel(id);
    }

    // Aynı binaya art arda hızlıca tıklandıysa rotayı baştan başlatma, yürüyüşe devam etsin
    if (state.walkingTo === id) {
      ping(r.door.x, r.door.y);
      return;
    }

    document.querySelectorAll(".hotspot").forEach(h => h.classList.toggle("is-active", h.dataset.id === id));
    ping(r.door.x, r.door.y);
    if (window.AudioEngine) AudioEngine.selectTarget();

    const targetId = id;
    const pts = routeTo(targetId);
    state.hero.at = null; // Yola çıktı
    state.walkingTo = targetId;

    const arrived = await walk(pts);
    if (!arrived) return; // Başka bir hedefe yönelindiği için iptal edildi

    state.walkingTo = null;
    state.hero.at = targetId;
    openPanel(targetId);
  }

  /* =========================================================
     REHBER
     ========================================================= */
  let guideStep = 0;
  function showGuide() {
    if (!isMapVisible()) return;
    guideStep = 0;
    const g = $("#guide");
    g.hidden = false;
    placeHero();
    renderGuide();
  }
  function renderGuide() {
    const trSteps = STR.tr.guide;
    const enSteps = STR.en.guide;
    $("#guide-tr").textContent = trSteps[guideStep] || "";
    $("#guide-en").textContent = enSteps[guideStep] || "";
    const last = guideStep === trSteps.length - 1;
    $("#guide-next").textContent = last ? "Tamam / Done! ↵" : "İleri / Next ▶";
    $("#guide-skip").textContent = "Geç / Skip";
    $("#guide-skip").hidden = last;
    map.classList.toggle("is-guiding", guideStep === 1);
  }
  function hideGuide(remember) {
    const g = $("#guide");
    if (g.hidden) return;
    g.hidden = true;
    map.classList.remove("is-guiding");
    if (remember) store.set("pm_guide_done", "1");
  }
  $("#guide-next").addEventListener("click", () => {
    if (guideStep < t("guide").length - 1) {
      guideStep++;
      if (window.AudioEngine) AudioEngine.guideNext();
      renderGuide();
    } else {
      if (window.AudioEngine) AudioEngine.guideDone();
      hideGuide(true);
    }
  });
  $("#guide-skip").addEventListener("click", () => {
    if (window.AudioEngine) AudioEngine.closeModal();
    hideGuide(true);
  });

  /* =========================================================
     PANEL
     ========================================================= */
  const panel = $("#panel"), backdrop = $("#panel-backdrop"), body = $("#panel-body");

  function linkBtn(url, label, cls = "") {
    return url ? `<a class="pbtn pbtn--sm ${cls}" href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}</a>` : "";
  }

  const renderers = {
    studyo() {
      const y = D.youtube, l = D.owner.links;
      const videos = (y.videos || []).map((v, i) => {
        const href = v.isShort ? `https://www.youtube.com/shorts/${esc(v.id)}` : `https://www.youtube.com/watch?v=${esc(v.id)}`;
        return `
        <a class="card" style="--c:#ff5d73;animation-delay:${i * 60}ms;text-decoration:none" href="${href}" target="_blank" rel="noopener">
          <span class="card__thumb" style="background:#000;overflow:hidden">
            <img src="https://i.ytimg.com/vi/${esc(v.id)}/hqdefault.jpg" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover">
          </span>
          <div>
            <h4 class="card__title" style="font-size:16px;margin:0 0 6px">${esc(L(v.title))}</h4>
            <div class="card__meta">
              <span class="tag" style="--c:#ff5d73">${esc(v.tag || "⚡ Shorts")}</span>
              <span class="pbtn pbtn--sm pbtn--red" style="margin-left:auto">${t("watch")}</span>
            </div>
          </div>
        </a>`;
      }).join("");
      return `
        <div class="yt-stat">
          <div class="yt-stat__logo" aria-hidden="true">▶</div>
          <div>
            <div class="yt-stat__num" data-count="${esc(y.subscribers)}">${esc(y.subscribers)}</div>
            <div class="yt-stat__lbl">${t("subscribers")} · <span class="yt-handle">@${esc(D.owner.handle.toLowerCase())}</span></div>
          </div>
        </div>
        <p>${esc(L(y.tagline))}</p>
        <h3>${t("formats")}</h3>
        <div class="formats">${y.formats.map(f => `<div class="format"><span aria-hidden="true">${f.icon}</span>${esc(L(f))}</div>`).join("")}</div>
        ${videos ? `<h3>${t("latestVideos")}</h3><div class="cards">${videos}</div>` : ""}
        <div class="btn-row" style="margin-top:22px;gap:14px">
          ${linkBtn(l.youtube, "▶ " + t("visitChannel"), "pbtn--lg pbtn--red")}
          ${linkBtn(l.youtube + "?sub_confirmation=1", "🔔 " + t("subscribe"), "pbtn--lg pbtn--white")}
        </div>`;
    },

    atolye() {
      const cats = ["all", "tool", "game", "mod"];
      const list = D.projects.filter(p => state.filter === "all" || p.category === state.filter);
      const LABELS = { github: "GitHub", demo: "Demo", curseforge: "CurseForge", youtube: "Video" };
      return `
        <div class="chips" role="group">
          ${cats.map(c => `<button type="button" class="chip" data-filter="${c}" aria-pressed="${state.filter === c}">${t(c)}</button>`).join("")}
        </div>
        <div class="cards">
          ${list.map((p, i) => `
            <article class="card" style="--c:${p.color};animation-delay:${i * 50}ms">
              <div class="card__thumb" aria-hidden="true">${p.image ? `<img src="${esc(p.image)}" alt="">` : p.icon}</div>
              <div>
                <h4 class="card__title" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                  ${esc(p.name)}
                  ${p.released ? `<span class="tag tag--released" style="font-size:13px;padding:2px 8px">${t("releasedTag")}</span>` : ""}
                  ${p.wip ? `<span class="tag tag--wip" style="font-size:13px;padding:2px 8px">${t("wipTag")}</span>` : ""}
                </h4>
                <p class="card__desc">${esc(L(p.desc))}</p>
                <div class="card__meta">
                  ${p.tags.map(tg => `<span class="tag">${esc(tg)}</span>`).join("")}
                  <span class="card__links">${Object.entries(p.links || {}).map(([k, u]) => linkBtn(u, LABELS[k] || k)).join("")}</span>
                </div>
              </div>
            </article>`).join("")}
        </div>`;
    },

    kutuphane() {
      const certs = (D.certificates || []).map((c, i) => `
        <article class="card" style="--c:${c.color || "#7cc4ff"};animation-delay:${i * 60}ms">
          <div class="card__thumb" style="background:#fff;padding:6px" aria-hidden="true">
            <img src="${esc(c.logo)}" alt="" style="width:100%;height:100%;object-fit:contain">
          </div>
          <div>
            <h4 class="card__title">${esc(L(c.title))}</h4>
            <p class="card__desc" style="color:var(--amber) !important;font-family:var(--font-term);font-size:17px">${esc(c.issuer)}</p>
            <div class="card__meta">
              <span class="tag">${esc(c.tag)}</span>
            </div>
          </div>
        </article>`).join("");

      const articles = (D.articles || []).map((a, i) => `
        <article class="card" style="--c:#7cc4ff;animation-delay:${(i + 2) * 60}ms">
          <div class="card__thumb" style="overflow:hidden;background:#050a14" aria-hidden="true">
            ${a.image ? `<img src="${esc(a.image)}" alt="" style="width:100%;height:100%;object-fit:cover">` : a.icon}
          </div>
          <div>
            <h4 class="card__title">${esc(L(a.title))}</h4>
            <p class="card__desc">${esc(L(a.desc))}</p>
            <div class="card__meta">
              <span class="tag">${esc(a.date)}</span>
              ${a.tag ? `<span class="tag" style="--c:#ffd76a">${esc(a.tag)}</span>` : ""}
              ${a.url ? `<span class="card__links">${linkBtn(a.url, "IEEE Xplore ↗", "pbtn--amber")}</span>` : `<span class="tag tag--soon">⏳ ${t("soon")}</span>`}
            </div>
          </div>
        </article>`).join("");

      return `
        <h3>${t("certificates")}</h3>
        <div class="cards" style="margin-bottom:20px">${certs}</div>
        <h3>${t("articles")}</h3>
        <div class="cards">${articles}</div>`;
    },

    kamp() {
      const a = D.about, o = D.owner, l = o.links;
      const contacts = [
        ["assets/icons/youtube.svg", "YouTube", l.youtube, "#ff0000"],
        ["assets/icons/github.svg", "GitHub", l.github, "#ffffff"],
        ["assets/icons/curseforge.svg", "CurseForge", l.curseforge, "#f16436"],
        ["assets/icons/linkedin.svg", "LinkedIn", l.linkedin, "#0a66c2"]
      ].filter(c => c[2]);
      return `
        <div class="bio">
          <canvas id="bio-hero" width="12" height="16" aria-hidden="true"></canvas>
          <p>${esc(L(a.bio))}</p>
        </div>
        <h3>${t("contact")}</h3>
        <ul class="contact-list">
          ${contacts.map(([icUrl, n, u, color]) => `
            <li>
              <a href="${esc(u)}" target="_blank" rel="noopener" style="--brand:${color}">
                <span class="contact-icon" aria-hidden="true"><img src="${esc(icUrl)}" alt=""></span>
                <span class="contact-name">${esc(n)}</span>
                <span class="contact-arrow" aria-hidden="true">↗</span>
              </a>
            </li>`).join("")}
        </ul>
        ${o.cv ? `<div class="btn-row">${linkBtn(o.cv, "📄 " + t("downloadCv"), "pbtn--amber")}</div>` : ""}`;
    }
  };

  function afterRender(id) {
    if (id === "atolye") {
      body.querySelectorAll(".chip").forEach(c => c.addEventListener("click", () => {
        if (window.AudioEngine) AudioEngine.toggle();
        state.filter = c.dataset.filter;
        renderPanel(id);
        body.querySelector(`.chip[data-filter="${state.filter}"]`).focus();
      }));
    }
    if (id === "kamp") {
      const bc = $("#bio-hero"); if (bc) Hero.draw(bc, 0);
    }
    body.querySelectorAll("a.pbtn, .card__link, a.chip").forEach(a => {
      a.addEventListener("click", () => {
        if (window.AudioEngine) AudioEngine.linkClick();
      });
    });
    if (id === "studyo") {
      const el = body.querySelector("[data-count]");
      const raw = el.dataset.count, target = parseInt(raw.replace(/\D/g, ""), 10);
      if (!target || reduceMotion) return;
      const suffix = raw.replace(/[\d.,\s]/g, "");
      const fmt = n => n.toLocaleString(state.lang === "tr" ? "tr-TR" : "en-US");
      const t0 = performance.now(), dur = 3300;
      const tick = now => {
        const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3.8);
        el.textContent = fmt(Math.round(target * e)) + (k === 1 ? suffix : "");
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  }

  function renderPanel(id) {
    const r = regionById(id);
    panel.style.setProperty("--c", r.color);
    const iconEl = $("#panel-icon");
    if (r.thumb) {
      iconEl.textContent = "";
      iconEl.style.backgroundImage = 'url("assets/map.jpg")';
      iconEl.style.backgroundPosition = r.thumb.bgPos;
      iconEl.style.backgroundSize = r.thumb.bgSize;
    } else {
      iconEl.style.backgroundImage = "none";
      iconEl.textContent = r.icon;
    }
    $("#panel-title").textContent = L(r.title);
    $("#panel-sub").textContent = L(r.subtitle);
    $("#panel-close").setAttribute("aria-label", t("close"));
    body.innerHTML = renderers[id]();
    afterRender(id);
  }

  function openPanel(id) {
    if (!regionById(id)) return;
    hideGuide(true);
    if (!state.openId) state.lastFocus = document.activeElement;
    state.openId = id;
    renderPanel(id);
    panel.hidden = false; backdrop.hidden = false;
    body.scrollTop = 0;
    if (location.hash !== "#" + id) history.replaceState(null, "", "#" + id);
    if (window.AudioEngine) AudioEngine.openModal();
    $("#panel-close").focus();
  }

  function closePanel() {
    if (!state.openId) return;
    state.openId = null;
    panel.hidden = true; backdrop.hidden = true;
    document.querySelectorAll(".hotspot").forEach(h => h.classList.remove("is-active"));
    history.replaceState(null, "", location.pathname + location.search);
    if (window.AudioEngine) AudioEngine.closeModal();
    if (state.lastFocus && document.contains(state.lastFocus)) state.lastFocus.focus();
  }

  $("#panel-close").addEventListener("click", closePanel);
  backdrop.addEventListener("click", closePanel);

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      if (state.openId) closePanel();
      else hideGuide(true);
    }
    // Panel içinde odak tuzağı
    if (e.key === "Tab" && state.openId) {
      const f = panel.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- Hash ile derin link (#atolye vb.) ---------- */
  function handleHash(initial) {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!regionById(id)) return;
    if (initial || !isMapVisible()) {
      const r = regionById(id);
      Object.assign(state.hero, { x: r.door.x, y: r.door.y, at: id });
      placeHero();
      openPanel(id);
    } else {
      closePanel();
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      goTo(id);
    }
  }
  window.addEventListener("hashchange", () => handleHash(false));

  /* =========================================================
     DİL & SES
     ========================================================= */
  function applySound() {
    const isMuted = window.AudioEngine ? AudioEngine.isMuted : false;
    $("#sound-icon").textContent = isMuted ? "🔇" : "🔊";
    $("#btn-sound").setAttribute("aria-label", t("soundLabel"));
    $("#btn-sound").classList.toggle("is-muted", isMuted);
  }

  function applyLang() {
    document.documentElement.lang = state.lang;
    document.title = t("pageTitle");
    document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
    $("#btn-lang").textContent = t("langBtn");
    $("#btn-lang").setAttribute("aria-label", t("langLabel"));
    $("#btn-guide").setAttribute("aria-label", t("guideBtnLabel"));
    $("#status-text").textContent = t("statusOnline");
    map.setAttribute("aria-label", t("mapAria"));
    buildHotspots();
    buildMobileMenu();
    applyTime();
    applySound();
    if (state.openId) renderPanel(state.openId);
    if (!$("#guide").hidden) renderGuide();
  }
  $("#btn-lang").addEventListener("click", () => {
    state.lang = state.lang === "tr" ? "en" : "tr";
    store.set("pm_lang", state.lang);
    if (window.AudioEngine) AudioEngine.toggle();
    applyLang();
  });
  $("#btn-sound").addEventListener("click", () => {
    if (window.AudioEngine) {
      AudioEngine.toggleMute();
      applySound();
    }
  });
  $("#btn-time").addEventListener("click", cycleTime);
  $("#btn-guide").addEventListener("click", () => {
    if (window.AudioEngine) AudioEngine.toggle();
    closePanel();
    showGuide();
  });

  /* ---------- Saat ---------- */
  function clock() {
    $("#status-clock").textContent = new Date().toLocaleTimeString(state.lang === "tr" ? "tr-TR" : "en-GB");
  }

  /* =========================================================
     BAŞLAT
     ========================================================= */
  Hero.draw(heroCanvas, 0);
  heroEl.classList.add("is-idle");
  placeHero();
  buildAtmosphere();
  applyLang();
  clock();
  setInterval(clock, 1000);
  setInterval(() => { if (state.timeMode === "auto") applyTime(); }, 60000);

  runLoader().then(() => {
    if (location.hash) handleHash(true);
    else if (!store.get("pm_guide_done")) setTimeout(showGuide, 300);
  });
})();
