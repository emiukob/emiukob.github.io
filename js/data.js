/* =========================================================
   PORTFOLYO İÇERİĞİ
   Yeni proje / makale / link eklemek için sadece bu dosyayı düzenle.
   Her metin alanı { tr: "...", en: "..." } şeklindedir.
   ========================================================= */
window.PORTFOLIO = {
  owner: {
    name: "Emir",
    handle: "Emiukob",
    // TODO: kendi bilgilerinle güncelle
    email: "",                          // ör: "emir@mail.com" – boşsa gösterilmez
    cv: "",                             // ör: "assets/cv.pdf" – boşsa buton gizlenir
    links: {
      youtube: "https://www.youtube.com/@emiukob",
      github: "https://github.com/emiukob?tab=repositories",
      curseforge: "https://www.curseforge.com/members/emiukob/projects",
      linkedin: "https://www.linkedin.com/in/emir-bekar-883410360"
    }
  },

  /* ---------- HARİTA BÖLGELERİ ----------
     rect: haritadaki tıklanabilir alan (% cinsinden: left, top, width, height)
     door: karakterin yürüyeceği son nokta (%)
     path: meydandan (fıskiye) kapıya giden ara noktalar (%)            */
  regions: [
    {
      id: "studyo", icon: "🎬", color: "#ff5d73",
      thumb: { bgPos: "34% 21%", bgSize: "450%" },
      rect: { left: 26, top: 7, width: 18, height: 30 },
      door: { x: 33.5, y: 33 },
      path: [{ x: 50, y: 47 }, { x: 43, y: 42 }, { x: 36, y: 39 }],
      title: { tr: "Kanal", en: "Channel" },
      subtitle: { tr: "Stüdyo", en: "Studio" }
    },
    {
      id: "kutuphane", icon: "📚", color: "#7cc4ff",
      thumb: { bgPos: "68.5% 20%", bgSize: "450%" },
      rect: { left: 56, top: 7, width: 22, height: 32 },
      door: { x: 67, y: 37 },
      path: [{ x: 51, y: 47 }, { x: 57, y: 43 }, { x: 64, y: 40 }],
      title: { tr: "Kütüphane", en: "Library" },
      subtitle: { tr: "Sertifika & Makale", en: "Certs & Articles" }
    },
    {
      id: "atolye", icon: "🔨", color: "#ffb347",
      thumb: { bgPos: "33% 63%", bgSize: "450%" },
      rect: { left: 24, top: 47, width: 17, height: 27 },
      door: { x: 31, y: 69 },
      path: [{ x: 49, y: 55 }, { x: 43.6, y: 59 }, { x: 40, y: 66 }, { x: 37, y: 70 }],
      title: { tr: "Projeler", en: "Projects" },
      subtitle: { tr: "Atölye", en: "Workshop" }
    },
    {
      id: "kamp", icon: "🔥", color: "#9cff7a",
      thumb: { bgPos: "71.5% 67%", bgSize: "450%" },
      rect: { left: 61, top: 52, width: 17, height: 25 },
      door: { x: 65, y: 70 },
      path: [{ x: 51, y: 55 }, { x: 57, y: 59 }, { x: 60, y: 66 }],
      title: { tr: "Hakkımda", en: "About Me" },
      subtitle: { tr: "Ben Emir", en: "I'm Emir" }
    }
  ],

  /* ---------- 🎬 STÜDYO ---------- */
  youtube: {
    subscribers: "12.000+",
    tagline: {
      tr: "Kendi dünyamı inşa edip toplulukla birlikte keşfediyorum.",
      en: "Building my own worlds and exploring them with the community."
    },
    formats: [
      { icon: "🧪", tr: "Simülasyonlar", en: "Simulations" },
      { icon: "🌙", tr: "Uyku Videoları", en: "Sleep Videos" },
      { icon: "🎮", tr: "İnteraktif Oyunlar", en: "Interactive Games" },
      { icon: "🧩", tr: "Mod Geliştirme", en: "Mod Development" }
    ],
    // İstersen son videolarını ekle: { id: "YOUTUBE_VIDEO_ID", title: {tr, en} }
    // id verilirse kapak görseli otomatik çekilir.
    videos: [
      {
        id: "RJjGuy7exfE",
        isShort: true,
        title: {
          tr: "Little Boy",
          en: "Little Boy"
        },
        tag: "⚡ Shorts"
      }
    ]
  },

  /* ---------- 🔨 ATÖLYE ---------- */
  // category: "tool" | "game" | "mod"
  projects: [
    {
      name: "Forza Horizon 6 Mobile Cockpit",
      icon: "🏎️",
      image: "assets/horizon6.png",
      category: "tool",
      released: true,
      color: "#ff6a3d",
      desc: {
        tr: "Telefonu kablosuz 60Hz yarış göstergesine dönüştüren gerçek zamanlı Forza Horizon 6 UDP telemetri paneli.",
        en: "Real-time 60Hz UDP wireless mobile racing telemetry cockpit for Forza Horizon 6."
      },
      tags: ["Node.js", "UDP", "Mobile", "Realtime"],
      links: { github: "https://github.com/emiukob/Forza_Telemetry_Dashboard" }
    },
    {
      name: "Hologram Mod",
      icon: "🧊",
      image: "assets/curseforgehologramblock.png",
      category: "mod",
      released: true,
      color: "#5ee0c0",
      desc: { tr: "Minecraft için hologram yazıları ekleyen mod. CurseForge'da yayında.", en: "Minecraft mod that adds hologram text displays. Published on CurseForge." },
      tags: ["Java", "Minecraft", "Modding"],
      links: { curseforge: "https://www.curseforge.com/minecraft/mc-mods/hologram-mod" }
    },
    {
      name: "LAN Drop",
      icon: "📦",
      category: "tool",
      released: true,
      color: "#c0e06a",
      desc: {
        tr: "Yerel Wi-Fi ağı üzerinden bilgisayar ve mobil cihazlar arasında 8MB parça akışı ile sınırsız boyutta dosya aktaran sıfır kurulumlu Python & FastAPI aracı.",
        en: "Zero-config Python & FastAPI tool for bi-directional local Wi-Fi file streaming with 8MB chunking and unlimited file sizes."
      },
      tags: ["Python", "FastAPI", "Streaming", "Zero-Config"],
      links: { github: "https://github.com/emiukob/LAN_Drop-mobile_phone-" }
    },
    {
      name: "GhostShield", icon: "👻", category: "tool", color: "#8a7dff",
      desc: { tr: "Kendi geliştirdiğim koruma/güvenlik aracı.", en: "A protection / security tool I built." },
      tags: ["Security", "Desktop"], links: {}
    },
    {
      name: "Pixel Studio", icon: "🎨", category: "tool", color: "#ff7ac6",
      desc: { tr: "Pixel-art sprite ve görsel üretim aracı.", en: "Pixel-art sprite and asset generation tool." },
      tags: ["Pixel Art", "Tool"], links: {}
    },
    {
      name: "OmniWall", icon: "🖼️", category: "tool", color: "#4fa3ff",
      desc: { tr: "Windows için canlı/hareketli duvar kağıdı uygulaması.", en: "Live / animated wallpaper app for Windows." },
      tags: ["C#", "WPF", "XAML"], links: {}
    },
    {
      name: "RemoteStream 120Hz", icon: "📡", category: "tool", color: "#36d1dc",
      desc: { tr: "Düşük gecikmeli, yüksek yenileme hızlı uzak ekran yayını.", en: "Low-latency, high refresh-rate remote screen streaming." },
      tags: ["Streaming", "Networking"], links: {}
    },
    {
      name: "Taxi Game", icon: "🚕", category: "game", color: "#ffd23f",
      desc: { tr: "Yol grafiği ve trafik yapay zekası olan şehir taksi oyunu.", en: "City taxi game with a road graph and traffic AI." },
      tags: ["JavaScript", "Game AI"], links: {}
    },
    {
      name: "OmniForge2D", icon: "🧱", category: "game", color: "#ff9f43",
      desc: { tr: "Tarayıcıda çalışan 2D oyun motoru ve tile editörü.", en: "Browser-based 2D game engine and tile editor." },
      tags: ["JavaScript", "Engine"], links: {}
    },
    {
      name: "Realm of Shadows", icon: "🗡️", category: "game", color: "#a06bff",
      desc: { tr: "Prosedürel sprite üretimi ve creative menüsü olan aksiyon RPG.", en: "Action RPG with procedural sprites and a creative menu." },
      tags: ["Python", "Procedural"], links: {}
    },
    {
      name: "AC-130 Gunship Sim",
      icon: "✈️",
      image: "assets/ac130logo.png?v=2",
      category: "game",
      wip: true,
      color: "#5087c7",
      desc: {
        tr: "Unity 6 ile geliştirilen; özel FLIR termal kamera shader'ı, dinamik arazi deformasyonu ve askeri HUD telemetrisi olan AC-130 yakın hava desteği simülasyonu.",
        en: "Close Air Support (AC-130) simulation game built in Unity 6 featuring custom FLIR thermal shaders, dynamic terrain destruction, and avionics HUD."
      },
      tags: ["Unity 6", "C#", "Shaders", "Physics"],
      links: {
        github: "https://github.com/emiukob/Gunship_Game_Unity_6",
        youtube: "https://www.youtube.com/shorts/JPgVjzYVN84"
      }
    },
    {
      name: "Match 3D Framework",
      icon: "🧩",
      image: "assets/match3dlogo.png",
      category: "game",
      wip: true,
      color: "#ff6b8b",
      desc: {
        tr: "Unity 6 ve Blender ile geliştirilen; sıfır GC bellek yönetimi, 3D fizik eşleşmesi ve meta-game (Daily Rewards, Lucky Spin, Store) döngülerine sahip hibrit-casual mobil oyunu.",
        en: "Production-ready hybrid-casual mobile game framework built in Unity 6 and Blender featuring zero-GC pooling, 3D physics matching, and meta-game retention loops."
      },
      tags: ["Unity 6", "C#", "Blender", "Mobile", "URP"],
      links: {
        github: "https://github.com/emiukob/Match3D",
        youtube: "https://youtube.com/shorts/lpJupVP5a8Y"
      }
    }
  ],

  /* ---------- 📚 KÜTÜPHANE (Sertifikalar & Makaleler) ---------- */
  certificates: [
    {
      title: {
        tr: "Basic Python Programming for Business Analytics",
        en: "Basic Python Programming for Business Analytics"
      },
      issuer: "Arizona State University",
      logo: "assets/1631309406468.jfif",
      color: "#8c1d40",
      tag: "Python / Data"
    },
    {
      title: {
        tr: "İHA 0/1 Sportif / Amatör Pilot Lisansı",
        en: "UAV 0/1 Sport / Amateur Pilot License"
      },
      issuer: "SHGM / Sivil Havacılık Genel Müdürlüğü",
      logo: "assets/1631341069264.jfif",
      color: "#0066b3",
      tag: "Aviation / UAV"
    }
  ],

  articles: [
    {
      icon: "🤖",
      image: "assets/1780926969026.jfif",
      date: "IEEE · 2026",
      title: {
        tr: "Multi Agent Reinforcement Learning Based Swarm Navigation",
        en: "Multi Agent Reinforcement Learning Based Swarm Navigation"
      },
      desc: {
        tr: "Çoklu ajan pekiştirmeli öğrenme (MARL) tabanlı sürü robotik navigasyon sistemleri üzerine akademik bildiri.",
        en: "Academic paper on swarm robotic navigation systems based on multi-agent reinforcement learning (MARL)."
      },
      publisher: "IEEE Xplore · HORA Congress",
      tag: "MARL / AI / Robotics",
      url: "https://ieeexplore.ieee.org/document/11537199"
    },
    {
      icon: "🤖",
      image: "assets/Ekran görüntüsü 2026-10-04 003349.png",
      date: "IEEE · 2026",
      title: {
        tr: "Adaptive Formation Control for Collaborative Swarm Robots",
        en: "Adaptive Formation Control for Collaborative Swarm Robots"
      },
      desc: {
        tr: "Dinamik ortamlarda ve dar koridorlarda işbirlikçi sürü robotları için lider-takipçi paradigması, üçgen-çizgi formasyon geçişi ve bulanık mantık (Fuzzy Logic) tabanlı adaptif ACC kontrol mimarisi.",
        en: "This paper proposes an adaptive formation control framework for collaborative swarm robots in dynamic environments and constrained corridors. Features leader-follower tracking, dynamic TRIANGLE-to-LINE formation switching via FSM, and a fuzzy-logic based ACC mechanism eliminating stop-and-go oscillations (validated in Webots)."
      },
      publisher: "IEEE Xplore · HORA Congress",
      tag: "Swarm Robotics / Fuzzy Logic / Webots",
      url: "https://ieeexplore.ieee.org/abstract/document/11537161"
    }
  ],

  /* ---------- 🔥 KAMP ATEŞİ ---------- */
  about: {
    bio: {
      tr: "Selam, ben Emir! YouTube'da Emiukob adıyla Minecraft içerikleri üretiyorum, boş kalan her anımda da oyun, mod ve masaüstü araçları geliştiriyorum. Fikri üretip çalışan bir ürüne dönüştürmeyi seviyorum.",
      en: "Hi, I'm Emir! I make Minecraft content on YouTube as Emiukob, and spend the rest of my time building games, mods and desktop tools. I love coming up with ideas and turning them into working products."
    }
  }
};
