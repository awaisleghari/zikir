import { useState, useEffect, useMemo } from "react";

// ─── The 99 Names ────────────────────────────────────────────────────────────
// Standard Tirmidhi enumeration (Tirmidhi 3507). Verify each entry against
// trusted sources (sunnah.com, IslamQA) before production — some translations
// have multiple acceptable renderings.

const ASMA = [
  { i: 1,  ar: "ٱلرَّحْمَٰنُ",        tr: "Ar-Raḥmān",        en: "The Most Compassionate" },
  { i: 2,  ar: "ٱلرَّحِيمُ",          tr: "Ar-Raḥīm",         en: "The Most Merciful" },
  { i: 3,  ar: "ٱلْمَلِكُ",           tr: "Al-Malik",          en: "The Sovereign King" },
  { i: 4,  ar: "ٱلْقُدُّوسُ",         tr: "Al-Quddūs",         en: "The Most Holy" },
  { i: 5,  ar: "ٱلسَّلَامُ",          tr: "As-Salām",          en: "The Source of Peace" },
  { i: 6,  ar: "ٱلْمُؤْمِنُ",         tr: "Al-Muʾmin",         en: "The Granter of Security" },
  { i: 7,  ar: "ٱلْمُهَيْمِنُ",       tr: "Al-Muhaymin",       en: "The Guardian" },
  { i: 8,  ar: "ٱلْعَزِيزُ",          tr: "Al-ʿAzīz",          en: "The Almighty" },
  { i: 9,  ar: "ٱلْجَبَّارُ",          tr: "Al-Jabbār",         en: "The Compeller" },
  { i: 10, ar: "ٱلْمُتَكَبِّرُ",      tr: "Al-Mutakabbir",     en: "The Supreme" },
  { i: 11, ar: "ٱلْخَالِقُ",          tr: "Al-Khāliq",         en: "The Creator" },
  { i: 12, ar: "ٱلْبَارِئُ",          tr: "Al-Bāriʾ",          en: "The Originator" },
  { i: 13, ar: "ٱلْمُصَوِّرُ",        tr: "Al-Muṣawwir",       en: "The Fashioner" },
  { i: 14, ar: "ٱلْغَفَّارُ",         tr: "Al-Ghaffār",        en: "The Ever-Forgiving" },
  { i: 15, ar: "ٱلْقَهَّارُ",         tr: "Al-Qahhār",         en: "The Subduer" },
  { i: 16, ar: "ٱلْوَهَّابُ",         tr: "Al-Wahhāb",         en: "The Bestower" },
  { i: 17, ar: "ٱلرَّزَّاقُ",         tr: "Ar-Razzāq",         en: "The Provider" },
  { i: 18, ar: "ٱلْفَتَّاحُ",         tr: "Al-Fattāḥ",         en: "The Opener" },
  { i: 19, ar: "ٱلْعَلِيمُ",          tr: "Al-ʿAlīm",          en: "The All-Knowing" },
  { i: 20, ar: "ٱلْقَابِضُ",          tr: "Al-Qābiḍ",          en: "The Withholder" },
  { i: 21, ar: "ٱلْبَاسِطُ",          tr: "Al-Bāsiṭ",          en: "The Extender" },
  { i: 22, ar: "ٱلْخَافِضُ",          tr: "Al-Khāfiḍ",         en: "The Abaser" },
  { i: 23, ar: "ٱلرَّافِعُ",          tr: "Ar-Rāfiʿ",          en: "The Exalter" },
  { i: 24, ar: "ٱلْمُعِزُّ",          tr: "Al-Muʿizz",         en: "The Honourer" },
  { i: 25, ar: "ٱلْمُذِلُّ",          tr: "Al-Mudhill",        en: "The Humbler" },
  { i: 26, ar: "ٱلسَّمِيعُ",          tr: "As-Samīʿ",          en: "The All-Hearing" },
  { i: 27, ar: "ٱلْبَصِيرُ",          tr: "Al-Baṣīr",          en: "The All-Seeing" },
  { i: 28, ar: "ٱلْحَكَمُ",           tr: "Al-Ḥakam",          en: "The Judge" },
  { i: 29, ar: "ٱلْعَدْلُ",           tr: "Al-ʿAdl",           en: "The Just" },
  { i: 30, ar: "ٱللَّطِيفُ",          tr: "Al-Laṭīf",          en: "The Subtle One" },
  { i: 31, ar: "ٱلْخَبِيرُ",          tr: "Al-Khabīr",         en: "The All-Aware" },
  { i: 32, ar: "ٱلْحَلِيمُ",          tr: "Al-Ḥalīm",          en: "The Forbearing" },
  { i: 33, ar: "ٱلْعَظِيمُ",          tr: "Al-ʿAẓīm",          en: "The Magnificent" },
  { i: 34, ar: "ٱلْغَفُورُ",          tr: "Al-Ghafūr",         en: "The Forgiving" },
  { i: 35, ar: "ٱلشَّكُورُ",          tr: "Ash-Shakūr",        en: "The Most Appreciative" },
  { i: 36, ar: "ٱلْعَلِيُّ",          tr: "Al-ʿAlī",           en: "The Most High" },
  { i: 37, ar: "ٱلْكَبِيرُ",          tr: "Al-Kabīr",          en: "The Most Great" },
  { i: 38, ar: "ٱلْحَفِيظُ",          tr: "Al-Ḥafīẓ",          en: "The Preserver" },
  { i: 39, ar: "ٱلْمُقِيتُ",          tr: "Al-Muqīt",          en: "The Sustainer" },
  { i: 40, ar: "ٱلْحَسِيبُ",          tr: "Al-Ḥasīb",          en: "The Reckoner" },
  { i: 41, ar: "ٱلْجَلِيلُ",          tr: "Al-Jalīl",          en: "The Majestic" },
  { i: 42, ar: "ٱلْكَرِيمُ",          tr: "Al-Karīm",          en: "The Most Generous" },
  { i: 43, ar: "ٱلرَّقِيبُ",          tr: "Ar-Raqīb",          en: "The Watchful" },
  { i: 44, ar: "ٱلْمُجِيبُ",          tr: "Al-Mujīb",          en: "The Responsive" },
  { i: 45, ar: "ٱلْوَاسِعُ",          tr: "Al-Wāsiʿ",          en: "The All-Encompassing" },
  { i: 46, ar: "ٱلْحَكِيمُ",          tr: "Al-Ḥakīm",          en: "The Most Wise" },
  { i: 47, ar: "ٱلْوَدُودُ",          tr: "Al-Wadūd",          en: "The Most Loving" },
  { i: 48, ar: "ٱلْمَجِيدُ",          tr: "Al-Majīd",          en: "The Most Glorious" },
  { i: 49, ar: "ٱلْبَاعِثُ",          tr: "Al-Bāʿith",         en: "The Resurrector" },
  { i: 50, ar: "ٱلشَّهِيدُ",          tr: "Ash-Shahīd",        en: "The Witness" },
  { i: 51, ar: "ٱلْحَقُّ",            tr: "Al-Ḥaqq",           en: "The Absolute Truth" },
  { i: 52, ar: "ٱلْوَكِيلُ",          tr: "Al-Wakīl",          en: "The Trustee" },
  { i: 53, ar: "ٱلْقَوِيُّ",          tr: "Al-Qawī",           en: "The Most Strong" },
  { i: 54, ar: "ٱلْمَتِينُ",          tr: "Al-Matīn",          en: "The Firm" },
  { i: 55, ar: "ٱلْوَلِيُّ",          tr: "Al-Walī",           en: "The Protecting Friend" },
  { i: 56, ar: "ٱلْحَمِيدُ",          tr: "Al-Ḥamīd",          en: "The Praiseworthy" },
  { i: 57, ar: "ٱلْمُحْصِي",          tr: "Al-Muḥṣī",          en: "The All-Counting" },
  { i: 58, ar: "ٱلْمُبْدِئُ",         tr: "Al-Mubdiʾ",         en: "The Initiator" },
  { i: 59, ar: "ٱلْمُعِيدُ",          tr: "Al-Muʿīd",          en: "The Restorer" },
  { i: 60, ar: "ٱلْمُحْيِي",          tr: "Al-Muḥyī",          en: "The Giver of Life" },
  { i: 61, ar: "ٱلْمُمِيتُ",          tr: "Al-Mumīt",          en: "The Bringer of Death" },
  { i: 62, ar: "ٱلْحَيُّ",            tr: "Al-Ḥayy",           en: "The Ever-Living" },
  { i: 63, ar: "ٱلْقَيُّومُ",         tr: "Al-Qayyūm",         en: "The Self-Sustaining" },
  { i: 64, ar: "ٱلْوَاجِدُ",          tr: "Al-Wājid",          en: "The Finder" },
  { i: 65, ar: "ٱلْمَاجِدُ",          tr: "Al-Mājid",          en: "The Noble" },
  { i: 66, ar: "ٱلْوَاحِدُ",          tr: "Al-Wāḥid",          en: "The One" },
  { i: 67, ar: "ٱلْأَحَدُ",           tr: "Al-Aḥad",           en: "The Unique" },
  { i: 68, ar: "ٱلصَّمَدُ",           tr: "Aṣ-Ṣamad",          en: "The Eternal Refuge" },
  { i: 69, ar: "ٱلْقَادِرُ",          tr: "Al-Qādir",          en: "The Most Capable" },
  { i: 70, ar: "ٱلْمُقْتَدِرُ",       tr: "Al-Muqtadir",       en: "The Most Powerful" },
  { i: 71, ar: "ٱلْمُقَدِّمُ",        tr: "Al-Muqaddim",       en: "The Expediter" },
  { i: 72, ar: "ٱلْمُؤَخِّرُ",        tr: "Al-Muʾakhkhir",     en: "The Delayer" },
  { i: 73, ar: "ٱلْأَوَّلُ",          tr: "Al-Awwal",          en: "The First" },
  { i: 74, ar: "ٱلْآخِرُ",            tr: "Al-Ākhir",          en: "The Last" },
  { i: 75, ar: "ٱلظَّاهِرُ",          tr: "Aẓ-Ẓāhir",          en: "The Manifest" },
  { i: 76, ar: "ٱلْبَاطِنُ",          tr: "Al-Bāṭin",          en: "The Hidden" },
  { i: 77, ar: "ٱلْوَالِي",           tr: "Al-Wālī",           en: "The Governor" },
  { i: 78, ar: "ٱلْمُتَعَالِي",       tr: "Al-Mutaʿālī",       en: "The Most Exalted" },
  { i: 79, ar: "ٱلْبَرُّ",            tr: "Al-Barr",           en: "The Source of Goodness" },
  { i: 80, ar: "ٱلتَّوَّابُ",         tr: "At-Tawwāb",         en: "The Accepter of Repentance" },
  { i: 81, ar: "ٱلْمُنْتَقِمُ",       tr: "Al-Muntaqim",       en: "The Avenger" },
  { i: 82, ar: "ٱلْعَفُوُّ",          tr: "Al-ʿAfū",           en: "The Pardoner" },
  { i: 83, ar: "ٱلرَّءُوفُ",          tr: "Ar-Raʾūf",          en: "The Most Kind" },
  { i: 84, ar: "مَالِكُ ٱلْمُلْكِ",  tr: "Mālik-ul-Mulk",     en: "Master of the Kingdom" },
  { i: 85, ar: "ذُو ٱلْجَلَالِ وَٱلْإِكْرَامِ", tr: "Dhū-l-Jalāli wal-Ikrām", en: "Lord of Majesty and Honour" },
  { i: 86, ar: "ٱلْمُقْسِطُ",         tr: "Al-Muqsiṭ",         en: "The Equitable" },
  { i: 87, ar: "ٱلْجَامِعُ",          tr: "Al-Jāmiʿ",          en: "The Gatherer" },
  { i: 88, ar: "ٱلْغَنِيُّ",          tr: "Al-Ghanī",          en: "The Self-Sufficient" },
  { i: 89, ar: "ٱلْمُغْنِي",          tr: "Al-Mughnī",         en: "The Enricher" },
  { i: 90, ar: "ٱلْمَانِعُ",          tr: "Al-Māniʿ",          en: "The Withholder" },
  { i: 91, ar: "ٱلضَّارُّ",           tr: "Aḍ-Ḍārr",           en: "The Creator of Harm" },
  { i: 92, ar: "ٱلنَّافِعُ",          tr: "An-Nāfiʿ",          en: "The Bringer of Benefit" },
  { i: 93, ar: "ٱلنُّورُ",            tr: "An-Nūr",            en: "The Light" },
  { i: 94, ar: "ٱلْهَادِي",           tr: "Al-Hādī",           en: "The Guide" },
  { i: 95, ar: "ٱلْبَدِيعُ",          tr: "Al-Badīʿ",          en: "The Incomparable Originator" },
  { i: 96, ar: "ٱلْبَاقِي",           tr: "Al-Bāqī",           en: "The Everlasting" },
  { i: 97, ar: "ٱلْوَارِثُ",          tr: "Al-Wārith",         en: "The Inheritor" },
  { i: 98, ar: "ٱلرَّشِيدُ",          tr: "Ar-Rashīd",         en: "The Guide to the Right Path" },
  { i: 99, ar: "ٱلصَّبُورُ",          tr: "Aṣ-Ṣabūr",          en: "The Most Patient" },
];

// ─── Stellar palette ─────────────────────────────────────────────────────────
// Stars at rest are nearly white with a faint hue — like real stars under a
// pitch sky. `hot` is what they bloom into on hover and what their glow is
// tinted with even at rest.

const STAR_COLORS = [
  { base: "#fefdf6", hot: "#ffd97a" },  // warm white  →  gold
  { base: "#fdf5f7", hot: "#ffb3c4" },  // white       →  rose
  { base: "#f3f5fd", hot: "#c5d1ff" },  // white       →  periwinkle
  { base: "#f3fbf6", hot: "#9eecc4" },  // white       →  mint
  { base: "#f9f3fd", hot: "#d6b8ff" },  // white       →  lavender
  { base: "#fdf8ec", hot: "#f5cb6b" },  // cream       →  soft gold
];

// ─── Layout: Poisson-disc-like sampling ──────────────────────────────────────
// Random scatter across the full viewport with a minimum spacing between any
// two stars (so they never clump) and a central elliptical exclusion zone
// (where the brand sits). Deterministic via seeded random so the layout is
// stable across reloads.

function seededRandom(i, salt) {
  const x = Math.sin(i * 9301 + salt * 49297) * 233280;
  return x - Math.floor(x);
}

function layoutPoints(n) {
  const pts = [];
  const MIN_DIST = 6.2;       // % minimum between any two stars
  const C_RX = 26;            // brand exclusion ellipse — horizontal radius
  const C_RY = 21;            //                          vertical radius
  const PAD_X = 5;            // edge margins
  const PAD_Y_TOP = 5;
  const PAD_Y_BOT = 8;        // a touch more bottom so meta tooltip clears

  for (let i = 0; i < n; i++) {
    let placed = false;
    for (let attempt = 0; attempt < 180 && !placed; attempt++) {
      const x = PAD_X + seededRandom(i + 1, attempt * 2 + 1)     * (100 - PAD_X * 2);
      const y = PAD_Y_TOP + seededRandom(i + 1, attempt * 2 + 2) * (100 - PAD_Y_TOP - PAD_Y_BOT);

      // Central brand exclusion
      const cx = (x - 50) / C_RX;
      const cy = (y - 50) / C_RY;
      if (cx * cx + cy * cy < 1) continue;

      // Min-distance from other stars
      let ok = true;
      for (const p of pts) {
        const dx = p.x - x, dy = p.y - y;
        if (dx * dx + dy * dy < MIN_DIST * MIN_DIST) { ok = false; break; }
      }
      if (!ok) continue;

      pts.push({ x, y });
      placed = true;
    }
    // Safety fallback (almost never hits with 99 stars in this much area)
    if (!placed) pts.push({ x: 5 + seededRandom(i, 999) * 90, y: 5 + seededRandom(i, 1000) * 87 });
  }
  return pts;
}

function generateStars(asma) {
  const points = layoutPoints(asma.length);

  return asma.map((name, idx) => {
    const r = (s) => seededRandom(idx + 1, s);
    const palette = STAR_COLORS[Math.floor(r(11) * STAR_COLORS.length)];

    // Four waypoints define a small wandering path. Each waypoint carries its
    // own scale and opacity so the star also breathes in/out (depth).
    const wp = [];
    for (let k = 0; k < 4; k++) {
      wp.push({
        dx: (r(20 + k * 5) - 0.5) * 36,         // -18 → +18 px
        dy: (r(21 + k * 5) - 0.5) * 36,
        sc: 0.65 + r(22 + k * 5) * 0.45,        // 0.65 → 1.10
        op: 0.18 + r(23 + k * 5) * 0.42,        // 0.18 → 0.60 (faint at rest)
      });
    }

    return {
      ...name,
      x: points[idx].x,
      y: points[idx].y,
      size: 9 + r(5) * 5,                       // 9 → 14 px
      baseColor: palette.base,
      hotColor: palette.hot,
      driftDur: 9 + r(6) * 9,                   // 9 → 18 s  (faster than before)
      driftDelay: -r(7) * 18,
      twinkleDur: 2.6 + r(8) * 3.4,             // 2.6 → 6 s
      twinkleDelay: -r(9) * 5,
      waypoints: wp,
      metaAbove: points[idx].y > 78,            // flip tooltip up near bottom edge
    };
  });
}

// ─── Stylesheet ──────────────────────────────────────────────────────────────

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Lora:ital,wght@0,400;0,500;1,400&family=Amiri+Quran&family=Amiri:wght@400;700&display=swap');

  .zk-root {
    position: relative;
    width: 100%;
    height: 100vh;
    min-height: 640px;
    background: #020108;
    color: #fefdf6;
    font-family: 'Lora', Georgia, serif;
    overflow: hidden;
    cursor: default;
    -webkit-font-smoothing: antialiased;
  }

  /* Pitch sky — almost flat black with the faintest directional warmth so the
     scene doesn't read as a solid color block. */
  .zk-sky {
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse 70% 50% at 50% 38%, rgba(20,12,32,0.55) 0%, transparent 65%),
      radial-gradient(ellipse 90% 90% at 50% 60%, #03020a 0%, #010104 100%);
  }

  /* A single barely-there nebula behind the brand. Slow drift gives the sky
     life without becoming colorful. */
  .zk-haze {
    position: absolute;
    left: 50%; top: 48%;
    width: 75vw; height: 75vw;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: radial-gradient(circle, rgba(127,90,240,0.10) 0%, transparent 60%);
    filter: blur(80px);
    pointer-events: none;
    animation: zkHazeDrift 70s ease-in-out infinite;
  }
  @keyframes zkHazeDrift {
    0%, 100% { transform: translate(-50%, -50%) scale(1); }
    50%      { transform: translate(-47%, -52%) scale(1.08); }
  }

  /* Faint film grain so the dark isn't digital-flat */
  .zk-grain {
    position: absolute; inset: 0;
    pointer-events: none;
    opacity: 0.12;
    mix-blend-mode: overlay;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  }

  /* Soft edge vignette */
  .zk-vignette {
    position: absolute; inset: 0;
    pointer-events: none;
    background: radial-gradient(ellipse 85% 75% at 50% 50%, transparent 50%, rgba(1,1,5,0.6) 92%, rgba(1,1,5,0.95) 100%);
  }

  /* ─── Constellation ─────────────────────────────────────────── */

  .zk-constellation {
    position: absolute; inset: 0;
    pointer-events: none;
  }
  .zk-constellation .zk-anchor { pointer-events: auto; }

  /* Three nested elements per star, each with one transform job:
     • .zk-anchor — positions the star (left/top + centering translate)
     • .zk-drift  — wanders (translate, scale, opacity over 4 waypoints)
     • .zk-star   — handles hover scale + glow
     Composing transforms cleanly without conflicts. */

  .zk-anchor {
    position: absolute;
    transform: translate(-50%, -50%);
    transition: opacity 0.5s ease;
    will-change: opacity;
  }

  .zk-drift {
    animation: zkWander var(--drift-dur) ease-in-out infinite;
    animation-delay: var(--drift-delay);
    will-change: transform, opacity;
    transition: opacity 0.4s ease;
  }

  .zk-star {
    display: inline-block;
    font-family: 'Amiri Quran', 'Amiri', serif;
    text-align: center;
    direction: rtl;
    white-space: nowrap;
    color: var(--star-color);
    cursor: pointer;
    user-select: none;
    position: relative;
    transition:
      transform 0.45s cubic-bezier(0.34, 1.5, 0.64, 1),
      color 0.35s ease,
      text-shadow 0.4s ease;
    /* Inherent star-light glow — barely there at rest, blooms on hover */
    text-shadow:
      0 0 3px color-mix(in oklab, var(--star-hot) 22%, transparent),
      0 0 8px color-mix(in oklab, var(--star-hot) 7%, transparent);
    animation: zkTwinkle var(--twinkle-dur) ease-in-out infinite;
    animation-delay: var(--twinkle-delay);
  }

  /* Wander = move through 4 waypoints + breathe in/out via scale/opacity.
     This gives each star its own little aimless path instead of a 1D pendulum. */
  @keyframes zkWander {
    0%   { transform: translate3d(var(--p0x), var(--p0y), 0) scale(var(--p0s)); opacity: var(--p0o); }
    25%  { transform: translate3d(var(--p1x), var(--p1y), 0) scale(var(--p1s)); opacity: var(--p1o); }
    50%  { transform: translate3d(var(--p2x), var(--p2y), 0) scale(var(--p2s)); opacity: var(--p2o); }
    75%  { transform: translate3d(var(--p3x), var(--p3y), 0) scale(var(--p3s)); opacity: var(--p3o); }
    100% { transform: translate3d(var(--p0x), var(--p0y), 0) scale(var(--p0s)); opacity: var(--p0o); }
  }

  @keyframes zkTwinkle {
    0%, 100% { filter: brightness(0.85); }
    50%      { filter: brightness(1.18); }
  }

  /* Meta — the transliteration + meaning that unfurls on hover */
  .zk-meta {
    position: absolute;
    top: 100%; left: 50%;
    transform: translate(-50%, -2px);
    margin-top: 8px;
    direction: ltr;
    text-align: center;
    font-family: 'Lora', serif;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease, transform 0.3s ease;
    white-space: nowrap;
  }
  .zk-star.zk-meta-above .zk-meta {
    top: auto; bottom: 100%;
    margin-top: 0; margin-bottom: 8px;
    transform: translate(-50%, 2px);
  }
  .zk-star.zk-meta-above:hover .zk-meta,
  .zk-star.zk-meta-above.pinned .zk-meta {
    transform: translate(-50%, 0);
  }
  .zk-tr { font-size: 11px; color: var(--star-hot); letter-spacing: 0.05em; font-style: italic; line-height: 1.3; font-weight: 500; }
  .zk-en { font-size: 11px; color: rgba(255, 255, 252, 0.96); line-height: 1.35; margin-top: 3px; }

  /* Hover / pin: a star lit up. White-hot core, saturated colored halo,
     amplified by a brightness filter so the text is unambiguously brilliant
     against the now-dimmed scene. */
  .zk-star:hover,
  .zk-star.pinned {
    transform: scale(1.7);
    color: #ffffff;
    text-shadow:
      0 0 4px  rgba(255, 252, 232, 0.95),
      0 0 12px color-mix(in oklab, var(--star-hot) 100%, transparent),
      0 0 28px color-mix(in oklab, var(--star-hot) 80%, transparent),
      0 0 56px color-mix(in oklab, var(--star-hot) 45%, transparent),
      0 0 110px color-mix(in oklab, var(--star-hot) 18%, transparent);
    filter: brightness(1.4) saturate(1.15);
    z-index: 5;
  }
  .zk-star:hover .zk-meta,
  .zk-star.pinned .zk-meta {
    opacity: 1;
    transform: translate(-50%, 0);
  }

  /* Sky-wide pause when any star is active. Drift + twinkle both freeze so the
     focused star is genuinely still. */
  .zk-constellation:has(.zk-star:hover) .zk-drift,
  .zk-constellation:has(.zk-star.pinned) .zk-drift,
  .zk-constellation:has(.zk-star:hover) .zk-star,
  .zk-constellation:has(.zk-star.pinned) .zk-star {
    animation-play-state: paused;
  }

  /* Dim every other anchor; restore the one that contains the hovered star.
     !important is needed because the dimming rule above has higher specificity
     (it includes the .zk-constellation parent selector). */
  .zk-constellation:has(.zk-star:hover) .zk-anchor,
  .zk-constellation:has(.zk-star.pinned) .zk-anchor {
    opacity: 0.18;
  }
  .zk-anchor:has(.zk-star:hover),
  .zk-anchor:has(.zk-star.pinned) {
    opacity: 1 !important;
  }

  /* When a star is hovered/pinned, force its drift layer to full opacity so
     it never reads as "paused mid-fade". The wander animation pauses at
     whatever opacity the keyframe was at — this override ensures the star is
     unambiguously the brightest thing on screen. */
  .zk-anchor:has(.zk-star:hover) .zk-drift,
  .zk-anchor:has(.zk-star.pinned) .zk-drift {
    opacity: 1 !important;
  }

  /* ─── Central brand ─────────────────────────────────────────── */

  .zk-center {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    z-index: 10;
    padding: 0 24px;
    transition: opacity 0.5s ease;
  }
  .zk-center > * { pointer-events: auto; }

  .zk-arabic-mark {
    font-family: 'Amiri Quran', 'Amiri', serif;
    font-size: clamp(24px, 3.6vw, 38px);
    color: #c9a84c;
    line-height: 1;
    margin-bottom: 22px;
    text-shadow: 0 0 32px rgba(201,168,76,0.4);
    user-select: none;
  }

  .zk-brand {
    font-family: 'Cormorant Garamond', serif;
    font-weight: 400;
    font-size: clamp(64px, 10.5vw, 144px);
    letter-spacing: -0.025em;
    line-height: 0.92;
    margin: 0;
    background: linear-gradient(180deg, #fffbea 0%, #f5cb6b 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    text-shadow: 0 0 70px rgba(245,203,107,0.22);
    user-select: none;
  }

  .zk-tagline {
    font-family: 'Cormorant Garamond', serif;
    font-style: italic;
    font-size: clamp(14px, 1.6vw, 18px);
    color: rgba(254,253,246,0.62);
    margin-top: 22px;
    letter-spacing: 0.015em;
    user-select: none;
  }

  /* CTA — text link, not a button-pill. Sits close to the brand. */
  .zk-cta {
    margin-top: 40px;
    background: none;
    border: none;
    padding: 4px 2px 6px;
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(15px, 1.6vw, 18px);
    font-weight: 400;
    letter-spacing: 0.32em;
    text-transform: uppercase;
    color: rgba(254,253,246,0.85);
    cursor: pointer;
    border-bottom: 1px solid rgba(201,168,76,0.4);
    transition: color 0.4s ease, border-color 0.4s ease, letter-spacing 0.4s ease, text-shadow 0.4s ease;
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }
  .zk-cta:hover {
    color: #f5cb6b;
    border-bottom-color: rgba(245,203,107,0.85);
    letter-spacing: 0.38em;
    text-shadow: 0 0 22px rgba(245,203,107,0.4);
  }
  .zk-cta .arrow {
    display: inline-block;
    transition: transform 0.4s cubic-bezier(0.16,1,0.3,1);
    color: #c9a84c;
  }
  .zk-cta:hover .arrow { transform: translateX(6px); color: #f5cb6b; }

  .zk-footer {
    position: absolute;
    bottom: 26px; left: 50%;
    transform: translateX(-50%);
    font-family: 'Lora', serif;
    font-size: 10.5px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: rgba(254,253,246,0.28);
    z-index: 6;
    pointer-events: none;
    user-select: none;
    transition: opacity 0.5s ease;
  }

  /* When a star is hovered or pinned, EVERYTHING else dims away — including
     the brand. That's the focal contrast: one star, lit and readable, with the
     rest of the scene receding into the dark. */
  .zk-root:has(.zk-star:hover) .zk-center,
  .zk-root:has(.zk-star.pinned) .zk-center {
    opacity: 0.18;
  }
  .zk-root:has(.zk-star:hover) .zk-footer,
  .zk-root:has(.zk-star.pinned) .zk-footer {
    opacity: 0.12;
  }

  /* ─── Entry transition ──────────────────────────────────────── */

  .zk-root.entering .zk-sky,
  .zk-root.entering .zk-haze,
  .zk-root.entering .zk-grain,
  .zk-root.entering .zk-vignette,
  .zk-root.entering .zk-constellation,
  .zk-root.entering .zk-center,
  .zk-root.entering .zk-footer {
    opacity: 0;
    transform: scale(1.015);
    transition: opacity 1.1s ease, transform 1.6s ease;
    pointer-events: none;
  }
  .zk-veil {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    z-index: 50;
    opacity: 0;
    pointer-events: none;
    text-align: center;
  }
  .zk-root.entering .zk-veil {
    opacity: 1;
    pointer-events: auto;
    transition: opacity 0.6s ease 0.4s;
  }
  .zk-veil-content {
    font-family: 'Amiri Quran', 'Amiri', serif;
    color: #f5cb6b;
    font-size: clamp(26px, 4.5vw, 50px);
    direction: rtl;
    line-height: 1.7;
    text-shadow: 0 0 60px rgba(245,203,107,0.55);
    opacity: 0;
    transform: translateY(10px);
  }
  /* Animations only fire once .entering is added (on Enter click).
     Without this gating, they'd run-and-finish on page load and the
     bismillah would already be at opacity 0 by the time it's revealed. */
  .zk-root.entering .zk-veil-content {
    animation:
      zkVeilIn  1.7s cubic-bezier(0.16,1,0.3,1) 0.7s forwards,
      zkVeilOut 0.7s ease 2.8s forwards;
  }
  @keyframes zkVeilIn {
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes zkVeilOut {
    from { opacity: 1; transform: translateY(0); }
    to   { opacity: 0; transform: translateY(-8px); }
  }

  /* Initial appear — fade in once fonts are ready so Arabic doesn't reflow */
  .zk-root.loading > * { opacity: 0; }
  .zk-root:not(.loading) > * { transition: opacity 0.9s ease; }

  /* Smaller screens */
  @media (max-width: 720px) {
    .zk-tr, .zk-en { font-size: 9.5px; }
    .zk-cta { margin-top: 30px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .zk-drift, .zk-star, .zk-haze { animation: none !important; }
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────
//
// Props:
//   onEnter — called once the full entry sequence has played (scene fades,
//             bismillah appears, lingers, fades). The parent should respond
//             by unmounting this component and rendering whatever comes next.
//             If omitted, the landing self-resets after a beat so it can be
//             replayed (useful for standalone preview / development).
//
// Total entry duration is ~3.5s. Tune ENTRY_DURATION_MS if needed.

const ENTRY_DURATION_MS = 3500;

export default function ZikirLanding({ onEnter }) {
  const [pinnedIdx, setPinnedIdx] = useState(null);
  const [entered, setEntered] = useState(false);
  const [ready, setReady] = useState(false);

  const stars = useMemo(() => generateStars(ASMA), []);

  // Wait for fonts before fading the scene in — avoids visible Arabic reflow.
  useEffect(() => {
    let cancelled = false;
    const failsafe = setTimeout(() => !cancelled && setReady(true), 1400);
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(() => { if (!cancelled) setReady(true); });
    } else {
      setReady(true);
    }
    return () => { cancelled = true; clearTimeout(failsafe); };
  }, []);

  // Esc clears any pinned star
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setPinnedIdx(null); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const handleEnter = () => {
    setEntered(true);
    if (onEnter) {
      // Production path — parent unmounts us at this point.
      setTimeout(onEnter, ENTRY_DURATION_MS);
    } else {
      // Standalone preview path — replay after a longer beat.
      setTimeout(() => setEntered(false), 5000);
    }
  };

  // Click on background (anywhere not a star) unpins
  const handleBackgroundClick = (e) => {
    if (e.target.closest(".zk-star")) return;
    setPinnedIdx(null);
  };

  return (
    <>
      <style>{STYLES}</style>
      <div
        className={`zk-root ${entered ? "entering" : ""} ${!ready ? "loading" : ""}`}
        onClick={handleBackgroundClick}
      >
        <div className="zk-sky" />
        <div className="zk-haze" aria-hidden="true" />
        <div className="zk-grain" aria-hidden="true" />

        <div className="zk-constellation">
          {stars.map((s, idx) => {
            const pinned = pinnedIdx === idx;
            const cssVars = {
              left: `${s.x}%`,
              top: `${s.y}%`,
              "--star-color": s.baseColor,
              "--star-hot": s.hotColor,
              "--drift-dur": `${s.driftDur}s`,
              "--drift-delay": `${s.driftDelay}s`,
              "--twinkle-dur": `${s.twinkleDur}s`,
              "--twinkle-delay": `${s.twinkleDelay}s`,
            };
            s.waypoints.forEach((w, k) => {
              cssVars[`--p${k}x`] = `${w.dx}px`;
              cssVars[`--p${k}y`] = `${w.dy}px`;
              cssVars[`--p${k}s`] = w.sc;
              cssVars[`--p${k}o`] = w.op;
            });
            return (
              <div key={s.i} className="zk-anchor" style={cssVars}>
                <div className="zk-drift">
                  <span
                    className={`zk-star${pinned ? " pinned" : ""}${s.metaAbove ? " zk-meta-above" : ""}`}
                    style={{ fontSize: `${s.size}px` }}
                    onClick={(e) => { e.stopPropagation(); setPinnedIdx(pinned ? null : idx); }}
                    aria-label={`${s.tr} — ${s.en}`}
                  >
                    <span className="zk-name">{s.ar}</span>
                    <span className="zk-meta">
                      <span className="zk-tr">{s.tr}</span>
                      <br />
                      <span className="zk-en">{s.en}</span>
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="zk-vignette" aria-hidden="true" />

        <div className="zk-center">
          <div className="zk-arabic-mark">ذِكْر</div>
          <h1 className="zk-brand">Zikir</h1>
          <div className="zk-tagline">Duas from the Quran &amp; Sunnah</div>
          <button className="zk-cta" onClick={handleEnter}>
            <span>Enter</span>
            <span className="arrow">→</span>
          </button>
        </div>

        <div className="zk-veil" aria-hidden={!entered}>
          <div className="zk-veil-content">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </div>
        </div>
      </div>
    </>
  );
}
