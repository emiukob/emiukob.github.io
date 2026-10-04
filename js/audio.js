/* =========================================================
   8-BIT RETRO AUDIO ENGINE (Web Audio API Synthesizer)
   Harici ses dosyası yüklemeden saf osilatörlerle üretilen
   Game Boy / SNES tarzı nostaljik ses efektleri.
   ========================================================= */
(function () {
  let ctx = null;
  let isMuted = localStorage.getItem("pm_sound") === "muted";

  function getContext() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        ctx = new AudioCtx();
      }
    }
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  // İlk kullanıcı etkileşiminde ses bağlamını uyandır (Autoplay politikası için)
  const unlockAudio = () => {
    getContext();
    document.removeEventListener("click", unlockAudio);
    document.removeEventListener("keydown", unlockAudio);
    document.removeEventListener("touchstart", unlockAudio);
  };
  document.addEventListener("click", unlockAudio, { passive: true });
  document.addEventListener("keydown", unlockAudio, { passive: true });
  document.addEventListener("touchstart", unlockAudio, { passive: true });

  const AudioEngine = {
    get isMuted() {
      return isMuted;
    },

    toggleMute() {
      isMuted = !isMuted;
      localStorage.setItem("pm_sound", isMuted ? "muted" : "active");
      if (!isMuted) {
        this.toggle();
      }
      return isMuted;
    },

    /* --- 🚶 Yürüme Adım Sesi (Pıt-Pıt) --- */
    step() {
      if (isMuted) return;
      const ac = getContext();
      if (!ac) return;

      const now = ac.currentTime;
      const osc = ac.createOscillator();
      const gain = ac.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(140 + Math.random() * 40, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.04);

      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ac.destination);

      osc.start(now);
      osc.stop(now + 0.045);
    },

    /* --- 🏠 Binaya Tıklama / Hedef Seçimi (Blip) --- */
    selectTarget() {
      if (isMuted) return;
      const ac = getContext();
      if (!ac) return;

      const now = ac.currentTime;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      const filter = ac.createBiquadFilter();

      osc.type = "square";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.06);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1800, now);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ac.destination);

      osc.start(now);
      osc.stop(now + 0.075);
    },

    /* --- ✨ Kapıya Varış / Panel Açılışı (8-Bit Level Up Arpeggiator) --- */
    openModal() {
      if (isMuted) return;
      const ac = getContext();
      if (!ac) return;

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      const noteDur = 0.045;
      const now = ac.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        const filter = ac.createBiquadFilter();

        const t = now + idx * noteDur;
        osc.type = "square";
        osc.frequency.setValueAtTime(freq, t);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(2400, t);

        gain.gain.setValueAtTime(0.06, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + noteDur * 1.2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ac.destination);

        osc.start(t);
        osc.stop(t + noteDur * 1.3);
      });
    },

    /* --- ❌ Panel Kapatma (Geri Dönüş Çıkışı) --- */
    closeModal() {
      if (isMuted) return;
      const ac = getContext();
      if (!ac) return;

      const now = ac.currentTime;
      const osc = ac.createOscillator();
      const gain = ac.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.exponentialRampToValueAtTime(330, now + 0.09);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(ac.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    },

    /* --- ☀️ Switch / Buton Tıklama (Tok Mekanik Çıtçıt) --- */
    toggle() {
      if (isMuted) return;
      const ac = getContext();
      if (!ac) return;

      const now = ac.currentTime;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      const filter = ac.createBiquadFilter();

      // Tok ve tatlı Game Boy / mekanik buton tınısı
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.04);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1100, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ac.destination);

      osc.start(now);
      osc.stop(now + 0.045);
    },

    /* --- 🪙 Link / Buton Aksiyonu (Retro Coin Pickup) --- */
    linkClick() {
      if (isMuted) return;
      const ac = getContext();
      if (!ac) return;

      const now = ac.currentTime;

      // 1. Nota (B5)
      const osc1 = ac.createOscillator();
      const gain1 = ac.createGain();
      osc1.type = "square";
      osc1.frequency.setValueAtTime(987.77, now);
      gain1.gain.setValueAtTime(0.05, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc1.connect(gain1);
      gain1.connect(ac.destination);
      osc1.start(now);
      osc1.stop(now + 0.06);

      // 2. Nota (E6)
      const osc2 = ac.createOscillator();
      const gain2 = ac.createGain();
      osc2.type = "square";
      osc2.frequency.setValueAtTime(1318.51, now + 0.05);
      gain2.gain.setValueAtTime(0.06, now + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc2.connect(gain2);
      gain2.connect(ac.destination);
      osc2.start(now + 0.05);
      osc2.stop(now + 0.16);
    },

    /* --- 💬 Rehber İleri / Diyalog Geçişi (RPG NPC Dialogue Chirp) --- */
    guideNext() {
      if (isMuted) return;
      const ac = getContext();
      if (!ac) return;

      const now = ac.currentTime;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      const filter = ac.createBiquadFilter();

      osc.type = "square";
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(760, now + 0.04);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1600, now);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ac.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    },

    /* --- 🌟 Rehber Tamamlama / Başlangıç Fanfarı (Mini Level Complete) --- */
    guideDone() {
      if (isMuted) return;
      const ac = getContext();
      if (!ac) return;

      const notes = [587.33, 739.99, 880.00, 1174.66]; // D5, F#5, A5, D6
      const now = ac.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        const filter = ac.createBiquadFilter();

        const t = now + idx * 0.045;
        osc.type = "square";
        osc.frequency.setValueAtTime(freq, t);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(2200, t);

        gain.gain.setValueAtTime(0.06, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ac.destination);

        osc.start(t);
        osc.stop(t + 0.095);
      });
    },

    /* =========================================================
       SAYAÇ SES PRESET'LERİ (4 FARKLI TARZ)
       ========================================================= */
    counterStyle: localStorage.getItem("pm_counter_style") || "slot",

    setCounterStyle(style) {
      if (["slot", "retro", "cyber", "xp"].includes(style)) {
        this.counterStyle = style;
        localStorage.setItem("pm_counter_style", style);
      }
    },

    /* --- 🎰 1. Sayaç Tıklaması (Mevcut stile göre çalar) --- */
    counterTick(progress = 0) {
      if (isMuted) return;
      const ac = getContext();
      if (!ac) return;

      const now = ac.currentTime;

      // STİL 1: 🎰 ARCADE SLOT (Mekanik Çark)
      if (this.counterStyle === "slot") {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        const filter = ac.createBiquadFilter();

        const baseFreq = 360 + (progress * 340);
        osc.type = "triangle";
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, now + 0.02);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1600, now);

        gain.gain.setValueAtTime(0.045, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ac.destination);
        osc.start(now);
        osc.stop(now + 0.03);
      }
      // STİL 2: 🪙 8-BIT CHIPTUNE (Game Boy / Mario Altın Sayacı)
      else if (this.counterStyle === "retro") {
        const osc = ac.createOscillator();
        const gain = ac.createGain();

        // Pentatonik skala basamakları
        const scale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51];
        const noteIdx = Math.min(scale.length - 1, Math.floor(progress * scale.length));
        const freq = scale[noteIdx];

        osc.type = "square";
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.035, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

        osc.connect(gain);
        gain.connect(ac.destination);
        osc.start(now);
        osc.stop(now + 0.035);
      }
      // STİL 3: ⚡ SCI-FI CYBER (Siber Lazer Telemetri)
      else if (this.counterStyle === "cyber") {
        const osc = ac.createOscillator();
        const gain = ac.createGain();

        const startF = 1100 + (progress * 400);
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(startF, now);
        osc.frequency.exponentialRampToValueAtTime(250, now + 0.025);

        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

        osc.connect(gain);
        gain.connect(ac.destination);
        osc.start(now);
        osc.stop(now + 0.03);
      }
      // STİL 4: 🔮 MINECRAFT XP ORBS (Kristal Küre Tınıları)
      else if (this.counterStyle === "xp") {
        const osc = ac.createOscillator();
        const gain = ac.createGain();

        const xpPitch = 600 + Math.sin(progress * Math.PI * 4) * 80 + (progress * 500);
        osc.type = "sine";
        osc.frequency.setValueAtTime(xpPitch, now);

        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(ac.destination);
        osc.start(now);
        osc.stop(now + 0.045);
      }
    },

    /* --- ✨ 2. Sayaç Final Çanı (Mevcut stile göre zafer tınısı) --- */
    counterDing() {
      if (isMuted) return;
      const ac = getContext();
      if (!ac) return;

      const now = ac.currentTime;

      // STİL 1: 🎰 ARCADE SLOT DING
      if (this.counterStyle === "slot") {
        const chord = [659.25, 830.61, 987.77, 1318.51, 1661.22];
        chord.forEach((freq, i) => {
          const osc = ac.createOscillator();
          const gain = ac.createGain();
          const t = now + i * 0.035;
          osc.type = i >= 3 ? "sine" : "triangle";
          osc.frequency.setValueAtTime(freq, t);
          const dur = i >= 3 ? 0.6 : 0.25;
          gain.gain.setValueAtTime(0.05, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
          osc.connect(gain);
          gain.connect(ac.destination);
          osc.start(t);
          osc.stop(t + dur + 0.05);
        });
      }
      // STİL 2: 🪙 8-BIT MARIO 1-UP FANFARE (E5, G5, E6, C6, D6, G6)
      else if (this.counterStyle === "retro") {
        const mario1Up = [
          { f: 659.25, d: 0.08 }, // E5
          { f: 783.99, d: 0.08 }, // G5
          { f: 1318.51, d: 0.08 },// E6
          { f: 1046.50, d: 0.08 },// C6
          { f: 1174.66, d: 0.08 },// D6
          { f: 1567.98, d: 0.35 } // G6
        ];
        let offset = 0;
        mario1Up.forEach(note => {
          const osc = ac.createOscillator();
          const gain = ac.createGain();
          const t = now + offset;
          osc.type = "square";
          osc.frequency.setValueAtTime(note.f, t);
          gain.gain.setValueAtTime(0.05, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);
          osc.connect(gain);
          gain.connect(ac.destination);
          osc.start(t);
          osc.stop(t + note.d + 0.02);
          offset += 0.07;
        });
      }
      // STİL 3: ⚡ SCI-FI CYBER ACCESS GRANTED
      else if (this.counterStyle === "cyber") {
        // Çift fazlı kilit açılma akoru
        [440, 880, 1320, 1760].forEach((freq, idx) => {
          const osc = ac.createOscillator();
          const gain = ac.createGain();
          const t = now + idx * 0.025;
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(freq, t);
          const dur = 0.45;
          gain.gain.setValueAtTime(0.04, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
          osc.connect(gain);
          gain.connect(ac.destination);
          osc.start(t);
          osc.stop(t + dur);
        });
      }
      // STİL 4: 🔮 MINECRAFT LEVEL-UP ANVIL CHIME
      else if (this.counterStyle === "xp") {
        const xpChime = [1046.50, 1318.51, 1567.98, 2093.00];
        xpChime.forEach((freq, i) => {
          const osc = ac.createOscillator();
          const gain = ac.createGain();
          const t = now + i * 0.04;
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, t);
          const dur = 0.8;
          gain.gain.setValueAtTime(0.07, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
          osc.connect(gain);
          gain.connect(ac.destination);
          osc.start(t);
          osc.stop(t + dur + 0.05);
        });
      }
    }
  };

  window.AudioEngine = AudioEngine;
})();
