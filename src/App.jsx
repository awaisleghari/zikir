import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";

import DUAS_RAW       from "./content/duas.json";
import ADHKAR_RAW     from "./content/adhkar.json";
import ROUTINES_RAW   from "./content/routines.json";
import TAXONOMY       from "./content/taxonomy.json";

// ─── Style injection (fonts + animations + scrollbars) ───────────────────────

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;0,8..60,600;1,8..60,400&family=Amiri:wght@400;700&family=Amiri+Quran&family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap');

  /* ─── Quran scripts ────────────────────────────────────────────────────────
     Loaded directly from Quran Foundation's CDN — the same source Quran.com
     uses for its rendering. Two scripts are wired up:

       • Uthmani  — KFGQPC Uthmanic Hafs (the official Madani script)
       • IndoPak  — Indopak Nastaleeq (the South Asian standard, Nastaleeq cut)

     Each font is loaded with font-display: swap so the page never blocks
     waiting for them. */

  @font-face {
    font-family: 'UthmanicHafs';
    src: url('https://verses.quran.foundation/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.woff2') format('woff2'),
         url('https://verses.quran.foundation/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.ttf') format('truetype');
    font-display: swap;
  }
  @font-face {
    font-family: 'IndopakNastaleeq';
    src: url('https://verses.quran.foundation/fonts/quran/hafs/nastaleeq/indopak/indopak-nastaleeq-waqf-lazim-v4.2.1.woff2') format('woff2'),
         url('https://verses.quran.foundation/fonts/quran/hafs/nastaleeq/indopak/indopak-nastaleeq-waqf-lazim-v4.2.1.woff') format('woff'),
         url('https://verses.quran.foundation/fonts/quran/hafs/nastaleeq/indopak/indopak-nastaleeq-waqf-lazim-v4.2.1.ttf') format('truetype');
    font-display: swap;
  }

  @keyframes fadeUp   { from { opacity: 0; transform: translateY(8px); }  to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn   { from { opacity: 0; }                              to { opacity: 1; } }
  @keyframes detailIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes drop     { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }

  /* Each Arabic word floats with a faint accent-colored halo. Two layered
     shadows: a tight nimbus that sits close to the letters, and a wider
     gentle bloom that gives the word presence in the surrounding dark.
     Both are very low opacity so the words read white-on-dark with a quiet
     hue, not as colored text. */
  .zikir-word {
    text-shadow:
      0 0 6px  var(--glow),
      0 0 18px var(--glow-soft);
    transition: text-shadow 0.4s ease;
  }

  /* During recitation: the halo gently expands and intensifies, then settles.
     Slow, breath-like — never staccato. */
  @keyframes wordBreathe {
    0%, 100% {
      text-shadow:
        0 0 6px  var(--glow),
        0 0 18px var(--glow-soft);
    }
    50% {
      text-shadow:
        0 0 10px var(--glow),
        0 0 28px var(--glow);
    }
  }
  .speaking-glow .zikir-word {
    animation: wordBreathe 2.4s ease-in-out infinite;
  }

  .listitem  { animation: drop 0.22s ease both; }
  .detailIn  { animation: detailIn 0.34s cubic-bezier(0.16,1,0.3,1) both; }
  .fadeIn    { animation: fadeIn 0.3s ease both; }

  .noscroll::-webkit-scrollbar { width: 0; height: 0; }
  .noscroll { scrollbar-width: none; }

  .thinscroll::-webkit-scrollbar { width: 5px; }
  .thinscroll::-webkit-scrollbar-thumb { background: rgba(184,193,236,0.22); border-radius: 3px; }
  .thinscroll::-webkit-scrollbar-track { background: transparent; }

  /* ─── Font-size slider ───────────────────────────────────────────────
     A native range input restyled to match the app. Used in two orientations:
     vertical (desktop, pinned to the right of the detail pane) and horizontal
     (mobile, inline below the script selector). The thumb's color is set by
     the parent via --zk-accent so the slider themes with the dua/routine. */

  .zk-slider {
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    cursor: pointer;
    margin: 0;
    padding: 0;
    touch-action: none;
  }
  .zk-slider:focus { outline: none; }

  /* Horizontal — used on mobile */
  .zk-slider.h {
    width: 100%;
    height: 18px;
  }
  .zk-slider.h::-webkit-slider-runnable-track {
    height: 2px;
    background: rgba(184,193,236,0.18);
    border-radius: 999px;
  }
  .zk-slider.h::-moz-range-track {
    height: 2px;
    background: rgba(184,193,236,0.18);
    border-radius: 999px;
  }

  /* Vertical — used on desktop. Uses the CSS standard writing-mode property
     for a true vertical slider with proper drag tracking. (The older
     approach of CSS-rotating a horizontal slider breaks drag because the
     browser tracks mouse-Y against the un-rotated horizontal axis.) */
  .zk-slider.v {
    writing-mode: vertical-lr;
    direction: rtl;            /* so larger values are at the top */
    width: 18px;
    height: 160px;
  }
  .zk-slider.v::-webkit-slider-runnable-track {
    width: 2px;
    background: rgba(184,193,236,0.18);
    border-radius: 999px;
  }
  .zk-slider.v::-moz-range-track {
    width: 2px;
    background: rgba(184,193,236,0.18);
    border-radius: 999px;
  }

  /* Thumb — accent-colored disc. Glow intensifies on hover/active, but
     critically the thumb itself does NOT scale: scaling the thumb pseudo
     element during drag re-defines its hit-test region mid-gesture, which
     causes Chromium to treat the cursor as off-thumb and abort the drag.
     Glow-only hover preserves the slide gesture. */
  .zk-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 999px;
    background: var(--zk-accent, #b8c1ec);
    border: none;
    margin-top: -7px;          /* horizontal: pull up onto the 2px track */
    box-shadow: 0 0 0 1px rgba(0,0,0,0.4), 0 0 10px var(--zk-accent-glow, transparent);
    transition: box-shadow 0.2s ease;
  }
  .zk-slider.v::-webkit-slider-thumb {
    margin-top: 0;
    margin-left: -7px;         /* vertical: pull left onto the 2px track */
  }
  .zk-slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 999px;
    background: var(--zk-accent, #b8c1ec);
    border: none;
    box-shadow: 0 0 0 1px rgba(0,0,0,0.4), 0 0 10px var(--zk-accent-glow, transparent);
    transition: box-shadow 0.2s ease;
  }
  .zk-slider:hover::-webkit-slider-thumb,
  .zk-slider:active::-webkit-slider-thumb {
    box-shadow: 0 0 0 1px rgba(0,0,0,0.4), 0 0 18px var(--zk-accent, #b8c1ec);
  }
  .zk-slider:hover::-moz-range-thumb,
  .zk-slider:active::-moz-range-thumb {
    box-shadow: 0 0 0 1px rgba(0,0,0,0.4), 0 0 18px var(--zk-accent, #b8c1ec);
  }

  /* ─── Glass controls ─────────────────────────────────────────────────
     A single button language used across the detail controls row.
     Variants:
       .zk-glass            — base. Frosted surface, hairline border,
                              soft inner highlight, very low-opacity tint.
       .zk-glass.is-active  — picked / on. Adds an accent-tinted wash and
                              a hairline accent border.
       .zk-glass.zk-icon    — circular 36×36 icon button (play, toggle).
       .zk-seg              — wrapper that joins two .zk-glass buttons into
                              a 2-way segmented pill (script, language).

     All buttons resolve to height: 36px so a controls row stays on one
     baseline regardless of which buttons are inside. The accent color is
     consumed from --zk-accent set on a parent. */

  .zk-glass {
    position: relative;
    height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 0 14px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.10);
    background:
      linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 60%, rgba(255,255,255,0.00) 100%),
      rgba(255,255,255,0.025);
    -webkit-backdrop-filter: blur(14px) saturate(140%);
    backdrop-filter: blur(14px) saturate(140%);
    color: rgba(255,254,254,0.78);
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 12.5px;
    font-weight: 500;
    letter-spacing: 0.01em;
    cursor: pointer;
    transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.25s ease, transform 0.2s ease;
    white-space: nowrap;
    /* Performance: promote to its own compositor layer so the expensive
       backdrop-filter blur is rasterized once and cached, instead of being
       re-computed every time a parent re-renders. Without this, clicking
       any nearby control causes every glass button on screen to flicker
       while the browser re-blurs each backdrop. */
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
    will-change: backdrop-filter;
    /* Isolate this element's layout from the surrounding tree so that
       changes inside it (or inside siblings) don't force a re-layout. */
    contain: layout style;
  }
  .zk-glass:hover {
    background:
      linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 60%, rgba(255,255,255,0.00) 100%),
      rgba(255,255,255,0.04);
    border-color: rgba(255,255,255,0.18);
    color: #fffffe;
  }
  .zk-glass:active {
    transform: translateZ(0) scale(0.97);
  }
  .zk-glass:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .zk-glass.is-active {
    background:
      linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 60%, rgba(255,255,255,0.00) 100%),
      var(--zk-glass-tint, rgba(255,255,255,0.05));
    border-color: var(--zk-accent, rgba(255,255,255,0.30));
    color: #fffffe;
  }

  /* Circular 36×36 icon button */
  .zk-glass.zk-icon {
    width: 36px;
    padding: 0;
  }
  .zk-glass.zk-icon svg {
    width: 14px;
    height: 14px;
    display: block;
    fill: currentColor;
  }
  /* Play button — accent glow when idle, brighter when playing */
  .zk-glass.zk-play {
    color: var(--zk-accent, rgba(255,254,254,0.78));
    box-shadow: 0 0 0 0 transparent, inset 0 0 10px rgba(255,255,255,0.04);
  }
  .zk-glass.zk-play:hover {
    color: var(--zk-accent-bright, #fffffe);
    box-shadow: 0 0 18px var(--zk-accent-glow, transparent), inset 0 0 12px rgba(255,255,255,0.06);
  }
  .zk-glass.zk-play.is-playing {
    color: #fffffe;
    background:
      linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 60%, rgba(255,255,255,0.00) 100%),
      var(--zk-glass-tint, rgba(255,255,255,0.06));
    border-color: var(--zk-accent, rgba(255,255,255,0.40));
    box-shadow: 0 0 22px var(--zk-accent-glow, transparent), inset 0 0 12px rgba(255,255,255,0.08);
  }

  /* Segmented 2-way pill: a flex row of two .zk-glass children with the
     inner edge collapsed so they read as one element split in two. */
  .zk-seg {
    display: inline-flex;
    border-radius: 999px;
    isolation: isolate;
  }
  .zk-seg .zk-glass {
    border-radius: 0;
  }
  .zk-seg .zk-glass:first-child {
    border-top-left-radius: 999px;
    border-bottom-left-radius: 999px;
  }
  .zk-seg .zk-glass:last-child {
    border-top-right-radius: 999px;
    border-bottom-right-radius: 999px;
    border-left: none;          /* collapse inner edge */
  }
  /* When the right segment is active, its left edge should still read */
  .zk-seg .zk-glass:last-child.is-active {
    border-left: 1px solid var(--zk-accent, rgba(255,255,255,0.30));
  }

  /* ─── Disclosure (collapsible section) ────────────────────────────────
     A labeled bar that toggles a section underneath. Used for the
     transliteration. The smooth height animation uses the CSS
     grid-template-rows trick: 0fr → 1fr animates the row's "available
     height" rather than its literal height, which works for any content
     length without measuring. The child must have min-height: 0 and
     overflow: hidden so the row clipping is honored. */

  .zk-disclosure-header {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 4px;
    background: transparent;
    border: none;
    border-top: 1px solid rgba(255,255,255,0.06);
    cursor: pointer;
    color: rgba(255,254,254,0.65);
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 10.5px;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    text-align: left;
    transition: color 0.2s ease, border-color 0.2s ease;
  }
  .zk-disclosure-header:hover {
    color: #fffffe;
    border-top-color: rgba(255,255,255,0.14);
  }
  .zk-disclosure-header.is-open {
    color: rgba(255,254,254,0.8);
  }
  .zk-disclosure-header .zk-chev {
    width: 12px;
    height: 12px;
    margin-left: auto;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.6;
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .zk-disclosure-header.is-open .zk-chev {
    transform: rotate(180deg);
  }

  .zk-disclosure-body {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.32s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .zk-disclosure-body.is-open {
    grid-template-rows: 1fr;
  }
  .zk-disclosure-body > .zk-disclosure-inner {
    min-height: 0;
    overflow: hidden;
  }
  /* The actual visible content. Fades + slides slightly on expand so it
     reveals like a page turning, not a hard pop. */
  .zk-disclosure-content {
    padding: 6px 4px 16px;
    opacity: 0;
    transform: translateY(-4px);
    transition: opacity 0.28s ease 0.04s, transform 0.32s cubic-bezier(0.16, 1, 0.3, 1) 0.04s;
  }
  .zk-disclosure-body.is-open .zk-disclosure-content {
    opacity: 1;
    transform: translateY(0);
  }

  * { box-sizing: border-box; }
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function rgba(hex, a) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

// ─── Palette ─────────────────────────────────────────────────────────────────

const C = {
  bg:        "#16161a",
  void:      "#010101",
  panel:     "#1a1f33",
  surface:   "#232946",
  surfaceHi: "#2b3252",
  text:      "#fffffe",
  textSub:   "#b8c1ec",
  textMuted: "#94a1b2",
  textFaint: "#72757e",
  line:      "rgba(184,193,236,0.12)",
  lineHi:    "rgba(184,193,236,0.28)",
};

// Lens tab colors — one signature per top-level tab.
const LENS_COLOR = {
  moods:    "#e58fa0",
  timings:  "#f5b14e",
  sources:  "#3dd0c4",
  routines: "#7f5af0",
};

const SERIF  = "'Cormorant Garamond', Georgia, serif";
const BODY   = "'Source Serif 4', Georgia, serif";

// Urdu translations render in true Nastaliq — the hanging-baseline cursive
// script that Urdu is actually written in, not the Arabic Naskh forms that
// look foreign to Urdu readers. Noto Nastaliq Urdu is Google's professionally
// cut Nastaliq face; fallbacks are Naskh-based and will only show if the web
// font fails to load.
const ARABIC_URDU = "'Noto Nastaliq Urdu', 'Amiri', 'Scheherazade New', serif";

// The Arabic font for dua text is driven by the user's script preference.
// Falls back through the loaded Quran Foundation fonts to Amiri to the
// system serif so something always renders even if remote fonts fail.
const SCRIPTS = {
  uthmani: {
    id: "uthmani",
    label: "Uthmani",
    sublabel: "KFGQPC Hafs",
    font: "'UthmanicHafs', 'Amiri Quran', 'Amiri', serif",
  },
  indopak: {
    id: "indopak",
    label: "IndoPak",
    sublabel: "Nastaleeq",
    font: "'IndopakNastaleeq', 'Amiri', 'Scheherazade New', serif",
  },
};

const arabicFont = (script) => (SCRIPTS[script] || SCRIPTS.uthmani).font;

// IndoPak Nastaleeq renders best at a slightly larger size due to its
// stacked Nastaleeq baseline. This multiplier is applied to every Arabic
// font-size in the app when the script is IndoPak, so the user doesn't
// see the text shrink visually when they switch scripts.
const arabicScale = (script) => (script === "indopak" ? 1.18 : 1);

// ─── Taxonomy lookups (built once from JSON) ─────────────────────────────────

const MOODS      = TAXONOMY.moods;
const TIMINGS    = TAXONOMY.timings;
const SOURCES    = TAXONOMY.sources;
const CAT_LABEL  = TAXONOMY.categories;

const MOOD_COLOR   = Object.fromEntries(MOODS.map(m => [m.id, m.color]));
const TIMING_COLOR = Object.fromEntries(TIMINGS.map(t => [t.id, t.color]));
const SOURCE_COLOR = Object.fromEntries(SOURCES.map(s => [s.id, s.color]));

const LENSES = [
  { id: "moods",    label: "Moods",    glyph: "♡" },
  { id: "timings",  label: "Timings",  glyph: "☾" },
  { id: "sources",  label: "Sources",  glyph: "❖" },
  { id: "routines", label: "Routines", glyph: "✦" },
];

// ─── Content prep (computed once at module load) ─────────────────────────────

// Attach derived `collections` to each dua based on a regex match of `source`.
const DUAS = DUAS_RAW.map(d => ({
  ...d,
  collections: SOURCES
    .filter(s => new RegExp(s.match, "i").test(d.source))
    .map(s => s.id),
}));

const DUA_BY_ID    = Object.fromEntries(DUAS.map(d => [d.id, d]));
const ADHKAR_BY_ID = Object.fromEntries(ADHKAR_RAW.map(a => [a.id, a]));
const ROUTINES     = ROUTINES_RAW;

const duaColor = (d) => MOOD_COLOR[d.moods?.[0]] || C.textSub;

// ─── Content validation ─────────────────────────────────────────────────────
// Runs at module load. Console-warns about typos so editing mistakes are
// caught immediately — wrong mood tag, broken routine reference, etc.

(function validateContent() {
  const moodSet    = new Set(MOODS.map(m => m.id));
  const timingSet  = new Set(TIMINGS.map(t => t.id));
  const catSet     = new Set(Object.keys(CAT_LABEL));
  const issues     = [];

  DUAS.forEach(d => {
    if (!d.id || !d.title || !d.arabic) issues.push(`Dua missing required field: ${JSON.stringify(d.id || d.title || "<unknown>")}`);
    if (!d.translations?.en) issues.push(`Dua "${d.id}" missing English translation`);
    (d.moods || []).forEach(m => { if (!moodSet.has(m)) issues.push(`Dua "${d.id}" has unknown mood "${m}"`); });
    (d.timings || []).forEach(t => { if (!timingSet.has(t)) issues.push(`Dua "${d.id}" has unknown timing "${t}"`); });
    if (d.category && !catSet.has(d.category)) issues.push(`Dua "${d.id}" has unknown category "${d.category}"`);
  });

  ROUTINES.forEach(r => {
    (r.steps || []).forEach(s => {
      if (!DUA_BY_ID[s.ref] && !ADHKAR_BY_ID[s.ref]) {
        issues.push(`Routine "${r.id}" references unknown id "${s.ref}" — must match a dua or dhikr id.`);
      }
    });
  });

  if (issues.length) {
    /* eslint-disable no-console */
    console.warn("[Zikir] content issues found:");
    issues.forEach(i => console.warn("  ·", i));
    /* eslint-enable */
  }
})();

// Resolve a routine step's `ref` into its full content.
const resolveStep = (step) => {
  const c = DUA_BY_ID[step.ref] || ADHKAR_BY_ID[step.ref];
  return { ...c, count: step.count };
};

// Build the navigation groups for a given lens.
function groupsForLens(lens) {
  if (lens === "moods") {
    return MOODS.map(m => ({
      id: m.id, label: m.label, color: m.color,
      duas: DUAS.filter(d => (d.moods || []).includes(m.id)),
    })).filter(g => g.duas.length);
  }
  if (lens === "timings") {
    return TIMINGS.map(t => ({
      id: t.id, label: t.label, color: t.color,
      duas: DUAS.filter(d => (d.timings || []).includes(t.id)),
    })).filter(g => g.duas.length);
  }
  if (lens === "sources") {
    return SOURCES.map(s => ({
      id: s.id, label: s.label, color: s.color,
      duas: DUAS.filter(d => d.collections.includes(s.id)),
    })).filter(g => g.duas.length);
  }
  return [];
}

// Translation helper — gracefully falls back to English if a translation is missing.
const translateOf = (entry, lang) =>
  entry?.translations?.[lang] || entry?.translations?.en || "";

// ─── Components ──────────────────────────────────────────────────────────────

function LensTab({ lens, active, onClick }) {
  const [hov, setHov] = useState(false);
  const col = LENS_COLOR[lens.id];
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: 1,
        background: active ? rgba(col, 0.14) : hov ? C.surfaceHi : "transparent",
        border: `1px solid ${active ? rgba(col, 0.55) : C.line}`,
        borderRadius: 12,
        padding: "9px 4px 8px",
        cursor: "pointer",
        transition: "all 0.16s ease",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
      }}
    >
      <span style={{ fontSize: 13, color: active ? col : C.textMuted }}>{lens.glyph}</span>
      <span style={{
        fontSize: 11, fontFamily: BODY,
        color: active ? C.text : C.textMuted,
        fontWeight: active ? 600 : 400,
        letterSpacing: "0.02em",
      }}>
        {lens.label}
      </span>
    </button>
  );
}

function GroupHeader({ group, open, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: "100%", textAlign: "left",
        background: open ? rgba(group.color, 0.10) : hov ? C.surface : "transparent",
        border: `1px solid ${open ? rgba(group.color, 0.4) : C.line}`,
        borderRadius: 11,
        padding: "11px 13px",
        cursor: "pointer",
        transition: "all 0.15s ease",
        display: "flex", alignItems: "center", gap: 10,
      }}
    >
      <span style={{
        width: 9, height: 9, borderRadius: 3, flexShrink: 0,
        background: group.color,
        boxShadow: open ? `0 0 8px ${rgba(group.color, 0.7)}` : "none",
        transition: "box-shadow 0.2s",
      }} />
      <span style={{
        flex: 1, fontFamily: BODY, fontSize: 13.5,
        color: open ? C.text : C.textSub,
        fontWeight: open ? 600 : 400,
      }}>
        {group.label}
      </span>
      <span style={{
        fontFamily: BODY, fontSize: 10.5,
        color: open ? group.color : C.textFaint,
        letterSpacing: "0.04em",
      }}>
        {group.duas.length}
      </span>
      <span style={{
        color: open ? group.color : C.textFaint, fontSize: 9,
        transform: open ? "rotate(90deg)" : "none",
        transition: "transform 0.2s ease",
      }}>▶</span>
    </button>
  );
}

function DuaListItem({ dua, selected, onClick }) {
  const [hov, setHov] = useState(false);
  const col = duaColor(dua);
  return (
    <button
      className="listitem"
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: "100%", textAlign: "left",
        background: selected ? rgba(col, 0.12) : hov ? C.surface : "transparent",
        border: `1px solid ${selected ? rgba(col, 0.45) : "transparent"}`,
        borderLeft: `2px solid ${selected || hov ? col : "transparent"}`,
        borderRadius: 9,
        padding: "9px 11px",
        cursor: "pointer",
        transition: "background 0.14s ease, border-color 0.14s ease",
        display: "flex", flexDirection: "column", gap: 3,
      }}
    >
      <span style={{
        fontFamily: SERIF, fontSize: 15,
        color: selected ? C.text : C.textSub,
        fontWeight: 500, lineHeight: 1.25,
      }}>
        {dua.title}
      </span>
      <span style={{
        fontFamily: BODY, fontSize: 11, color: C.textFaint,
        fontStyle: "italic", lineHeight: 1.4,
      }}>
        {dua.use}
      </span>
    </button>
  );
}

function RoutineListItem({ routine, selected, onClick, script }) {
  const [hov, setHov] = useState(false);
  const col = routine.color;
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: "100%", textAlign: "left",
        background: selected ? rgba(col, 0.12) : hov ? C.surface : "transparent",
        border: `1px solid ${selected ? rgba(col, 0.45) : C.line}`,
        borderRadius: 11,
        padding: "13px 14px",
        cursor: "pointer",
        transition: "all 0.15s ease",
        display: "flex", flexDirection: "column", gap: 6,
        marginBottom: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <span style={{
          fontFamily: arabicFont(script), fontSize: `${1.1 * arabicScale(script)}rem`,
          color: col, lineHeight: 1,
        }}>
          {routine.arabic}
        </span>
        <span style={{
          marginLeft: "auto", fontFamily: BODY, fontSize: 10,
          color: C.textFaint, letterSpacing: "0.05em",
        }}>
          {routine.steps.length} steps
        </span>
      </div>
      <span style={{
        fontFamily: SERIF, fontSize: 16, fontWeight: 500,
        color: selected ? C.text : C.textSub, lineHeight: 1.2,
      }}>
        {routine.title}
      </span>
      <span style={{
        fontFamily: BODY, fontSize: 11.5, color: C.textFaint,
        fontStyle: "italic", lineHeight: 1.5,
      }}>
        {routine.when}
      </span>
    </button>
  );
}

const Sidebar = React.memo(function Sidebar({
  lens, setLens, groups, openGroup, setOpenGroup,
  selected, onSelectDua, onSelectRoutine, isNarrow, script,
}) {
  return (
    <div style={{
      width: isNarrow ? "100%" : 322,
      flexShrink: 0,
      background: C.panel,
      borderRight: isNarrow ? "none" : `1px solid ${C.line}`,
      height: isNarrow ? "auto" : "100vh",
      display: "flex", flexDirection: "column",
    }}>
      {/* Brand */}
      <div style={{ padding: "20px 20px 14px", borderBottom: `1px solid ${C.line}` }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
          <span style={{
            fontFamily: SERIF, fontSize: 24, fontWeight: 500, color: C.text,
            letterSpacing: "-0.01em",
          }}>
            Zikir
          </span>
          <span style={{
            fontFamily: ARABIC_URDU, fontSize: "1.25rem", color: C.textSub,
            marginLeft: "auto", opacity: 0.8,
          }}>
            ذِكْر
          </span>
        </div>
        <div style={{
          fontFamily: BODY, fontSize: 10.5, color: C.textFaint,
          letterSpacing: "0.04em", marginTop: 4,
        }}>
          Duas from the Quran &amp; Sunnah · authenticated
        </div>
      </div>

      {/* Lens tabs */}
      <div style={{
        display: "flex", gap: 6, padding: "12px 14px 10px",
        borderBottom: `1px solid ${C.line}`,
      }}>
        {LENSES.map(l => (
          <LensTab key={l.id} lens={l} active={lens === l.id} onClick={() => setLens(l.id)} />
        ))}
      </div>

      {/* Lens caption */}
      <div style={{
        padding: "11px 18px 8px",
        fontFamily: BODY, fontSize: 11, color: C.textFaint,
        fontStyle: "italic", letterSpacing: "0.01em",
      }}>
        {lens === "moods"    && "Find a dua by the state of your heart"}
        {lens === "timings"  && "Find a dua by the hour of your day"}
        {lens === "sources"  && "Browse by the collection it comes from"}
        {lens === "routines" && "Short sequences to recite together"}
      </div>

      {/* Scrollable navigation body */}
      <div className="thinscroll" style={{
        flex: 1, overflowY: "auto",
        padding: "2px 14px 22px",
        maxHeight: isNarrow ? "none" : undefined,
      }}>
        {lens === "routines"
          ? ROUTINES.map(r => (
              <RoutineListItem
                key={r.id}
                routine={r}
                selected={selected?.type === "routine" && selected.id === r.id}
                onClick={() => onSelectRoutine(r)}
                script={script}
              />
            ))
          : groups.map(g => (
              <div key={g.id} style={{ marginBottom: 7 }}>
                <GroupHeader
                  group={g}
                  open={openGroup === g.id}
                  onClick={() => setOpenGroup(openGroup === g.id ? null : g.id)}
                />
                {openGroup === g.id && (
                  <div className="fadeIn" style={{
                    display: "flex", flexDirection: "column", gap: 2,
                    padding: "6px 0 4px 6px",
                  }}>
                    {g.duas.map(d => (
                      <DuaListItem
                        key={d.id}
                        dua={d}
                        selected={selected?.type === "dua" && selected.id === d.id}
                        onClick={() => onSelectDua(d)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
      </div>
    </div>
  );
});

function DuaDetail({ dua, lang, setLang, speaking, speak, stop, showT, setShowT, ttsOk, script, setScript, zoom, setZoom, isNarrow }) {
  const accent = duaColor(dua);
  const isUr = lang === "ur";
  const translation = translateOf(dua, lang);

  return (
    <div className="detailIn" style={{ position: "relative", maxWidth: 620, margin: "0 auto" }}>
      <div style={{
        fontFamily: BODY, fontSize: 12.5, color: accent,
        letterSpacing: "0.02em", marginBottom: 6,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ fontSize: 9 }}>✦</span>
        {dua.use}
      </div>
      <div style={{
        fontFamily: BODY, fontSize: 9.5, color: C.textFaint,
        letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 14,
      }}>
        {CAT_LABEL[dua.category]}
      </div>

      <h2 style={{
        margin: "0 0 22px", fontSize: 27, fontWeight: 500,
        fontFamily: SERIF, color: C.text, lineHeight: 1.25,
        letterSpacing: "-0.01em",
      }}>
        {dua.title}
      </h2>

      <div style={{
        textAlign: "center", color: accent, fontSize: 12,
        letterSpacing: "0.55em", marginBottom: 16, opacity: 0.55,
      }}>✦ ✦ ✦</div>

      {/* Arabic block + co-located desktop slider. The grid puts the slider
          beside the Arabic and centers them against each other, so the rail
          is anchored to the text it controls (not floating against the page
          at large). On mobile the grid collapses to a single column and the
          horizontal slider appears further down, below the script selector. */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isNarrow ? "1fr" : "minmax(0, 1fr) 72px",
        alignItems: "center",
        columnGap: isNarrow ? 0 : 56,
        margin: "0 auto",
      }}>
        <div
          className={speaking ? "speaking-glow" : ""}
          style={{
            "--glow": rgba(accent, 0.45),
            "--glow-soft": rgba(accent, 0.22),
            fontFamily: arabicFont(script),
            fontSize: `calc(${2.2 * arabicScale(script)}rem * var(--zk-arabic-scale, 1))`,
            lineHeight: script === "indopak" ? 2.7 : 2.45,
            color: C.text,
            fontFeatureSettings: "'liga' 1, 'calt' 1",
            textAlign: "center",
            direction: "rtl",
            padding: "20px 0 34px",
          }}
        >
          {dua.arabic.split(/\s+/).filter(Boolean).map((word, i) => (
            <span
              key={i}
              className="zikir-word"
              style={{ display: "inline-block", padding: "0 0.18em" }}
            >
              {word}
            </span>
          ))}
        </div>

        {!isNarrow && (
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignSelf: "center",
            transform: "translateX(18px)",
          }}>
            <FontSizeSlider
              zoom={zoom}
              setZoom={setZoom}
              accent={accent}
              vertical
            />
          </div>
        )}
      </div>

      {/* Mobile-only font-size slider. Sits on its own row between the
          Arabic and the controls so the controls row can stay clean. */}
      {isNarrow && (
        <FontSizeSlider zoom={zoom} setZoom={setZoom} accent={accent} />
      )}

      {/* Unified controls row. Two clusters — actions on the left, choices
          on the right — separated by margin-left:auto on the right cluster.
          Every control is a .zk-glass, every control is 36px tall, so the
          row reads as one balanced strip. */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginTop: 4,
        marginBottom: 22,
        flexWrap: "wrap",
        rowGap: 10,
      }}>
        <GlassIconButton
          variant="play"
          onClick={() => (speaking ? stop() : speak(dua.arabic))}
          disabled={!ttsOk}
          active={speaking}
          accent={accent}
          icon={speaking ? ICONS.stop : ICONS.play}
          title={speaking ? "Stop" : "Play Arabic"}
        />

        <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
          <GlassSegmented
            value={script}
            onChange={setScript}
            accent={accent}
            options={SCRIPT_OPTIONS}
          />
          <GlassSegmented
            value={lang}
            onChange={setLang}
            accent={accent}
            options={LANG_OPTIONS}
          />
        </div>
      </div>

      {/* Transliteration — collapsible. The Disclosure header acts as both
          the label and the toggle, so the user can always see that this
          content exists, even when collapsed. */}
      <Disclosure
        label="Transliteration"
        open={showT}
        onToggle={() => setShowT(!showT)}
      >
        <div style={{
          fontSize: 15, color: C.textSub,
          fontFamily: BODY, lineHeight: 1.75,
          letterSpacing: "0.005em",
        }}>
          {dua.translit}
        </div>
      </Disclosure>

      {/* Translation — roman, near-white, regular weight. The translation is
          the meaning; it earns full readability. Italic stays reserved for
          editorial tone (the use-context line, the tagline).
          Urdu renders in Nastaliq, which needs a much taller line-height
          for its sloping baseline and deep descenders to breathe. */}
      <div style={{
        fontSize: isUr ? 20 : 17, color: C.text,
        lineHeight: isUr ? 2.6 : 1.75,
        marginBottom: 24, direction: isUr ? "rtl" : "ltr",
        fontFamily: isUr ? ARABIC_URDU : BODY,
        fontWeight: 400,
      }}>
        {translation}
      </div>

      <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 18, marginBottom: 18 }}>
        <div style={{
          fontSize: 10, color: C.textFaint, textTransform: "uppercase",
          letterSpacing: "0.18em", marginBottom: 6, fontFamily: BODY,
        }}>Source</div>
        <div style={{ fontSize: 13, color: C.textSub, fontFamily: BODY }}>{dua.source}</div>
      </div>

      <div style={{
        background: rgba(MOOD_COLOR.grateful || "#2cb67d", 0.10),
        border: `1px solid ${rgba(MOOD_COLOR.grateful || "#2cb67d", 0.35)}`,
        borderRadius: 14, padding: "16px 18px",
      }}>
        <div style={{
          fontSize: 10, color: MOOD_COLOR.grateful || "#2cb67d",
          textTransform: "uppercase",
          letterSpacing: "0.18em", marginBottom: 8, fontFamily: BODY, fontWeight: 600,
        }}>✦ When to recite</div>
        <div style={{ fontSize: 14, color: C.textSub, lineHeight: 1.7, fontFamily: BODY }}>
          {dua.benefit}
        </div>
      </div>

      {!ttsOk && (
        <div style={{
          marginTop: 16, fontSize: 11, color: C.textFaint, fontFamily: BODY,
          textAlign: "center",
        }}>
          Arabic voice is not available on this device.
        </div>
      )}
    </div>
  );
}

// Small horizontal selector for Quran script. Used inside DuaDetail and
// RoutineDetail. Visually quiet — three labels in a pill row, themed to the
// current accent.
// ─── Glass UI primitives ────────────────────────────────────────────────────
// One button language used across the controls row. Build other controls on
// top of these two — never reach for ad-hoc inline-styled buttons.

// A 2-way segmented pill. Used for script (Uthmani / IndoPak) and language
// (EN / اردو). Pass `options` as [{ id, label, font? }, ...].
const GlassSegmented = React.memo(function GlassSegmented({ value, onChange, options, accent }) {
  return (
    <div
      className="zk-seg"
      style={{
        "--zk-accent": accent,
        "--zk-glass-tint": rgba(accent, 0.10),
      }}
    >
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`zk-glass ${active ? "is-active" : ""}`}
            title={opt.title}
            style={opt.font ? { fontFamily: opt.font } : undefined}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
});

// Circular 36×36 icon button. Pass `icon` as an SVG path (the d= string of a
// single <path>) — kept tiny and inline so we don't need an icon library.
const GlassIconButton = React.memo(function GlassIconButton({ onClick, disabled, active, accent, icon, title, variant }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={`zk-glass zk-icon ${variant === "play" ? "zk-play" : ""} ${active ? (variant === "play" ? "is-playing" : "is-active") : ""}`}
      style={{
        "--zk-accent": accent,
        "--zk-accent-bright": accent,
        "--zk-accent-glow": rgba(accent, 0.45),
        "--zk-glass-tint": rgba(accent, 0.12),
      }}
    >
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d={icon} />
      </svg>
    </button>
  );
});

// Icon path strings — kept here so the components stay clean.
// Disclosure (collapsible section). Pure presentational — the parent owns
// the open state. The expand/collapse is CSS-driven (grid-rows 0fr → 1fr)
// for smooth animation without measuring content height.
const Disclosure = React.memo(function Disclosure({ label, open, onToggle, children }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <button
        type="button"
        onClick={onToggle}
        className={`zk-disclosure-header ${open ? "is-open" : ""}`}
        aria-expanded={open}
      >
        {label}
        <svg className="zk-chev" viewBox="0 0 16 16" aria-hidden="true">
          <path d={ICONS.chevron} />
        </svg>
      </button>
      <div className={`zk-disclosure-body ${open ? "is-open" : ""}`}>
        <div className="zk-disclosure-inner">
          <div className="zk-disclosure-content">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
});

const ICONS = {
  // Equilateral triangle pointing right, optically centered (left edge at x=5
  // so the visual weight sits where the eye expects "play" to be).
  play: "M5 3.5 L12 8 L5 12.5 Z",
  // Two vertical bars — pause/stop.
  stop: "M4.5 3.5 H7 V12.5 H4.5 Z M9 3.5 H11.5 V12.5 H9 Z",
  // Down-pointing chevron. Rotated via CSS transform when expanded.
  chevron: "M3.5 6 L8 10.5 L12.5 6",
};

// Stable option arrays for the script and language segmented pills. Defined
// at module level so their identity is the same across all renders — which
// is what makes React.memo on GlassSegmented actually skip re-render work.
const SCRIPT_OPTIONS = Object.values(SCRIPTS).map(s => ({
  id: s.id, label: s.label, title: s.sublabel,
}));
const LANG_OPTIONS = [
  { id: "en", label: "EN" },
  { id: "ur", label: "اردو", font: ARABIC_URDU },
];

// Font-size slider. Range 75–175 (% of baseline Arabic size). Two layouts:
//   • vertical (`vertical: true`)   — desktop rail, parent positions it
//   • horizontal (default)          — mobile, inline below the script selector
// The accent prop themes the thumb color and its glow.
function FontSizeSlider({ zoom, setZoom, accent, vertical = false }) {
  const pctRef = useRef(null);

  const cssVars = {
    "--zk-accent": accent,
    "--zk-accent-glow": rgba(accent, 0.4),
  };

  const applyZoomLive = (raw) => {
    const n = Math.min(175, Math.max(75, Math.round(Number(raw))));
    document.documentElement.style.setProperty("--zk-arabic-scale", n / 100);
    if (pctRef.current) pctRef.current.textContent = `${n}%`;
    return n;
  };

  const commitZoom = (e) => {
    const n = applyZoomLive(e.currentTarget.value);
    setZoom(n);
  };

  const input = (
    <input
      type="range"
      min={75}
      max={175}
      step={1}
      defaultValue={zoom}
      onInput={(e) => applyZoomLive(e.currentTarget.value)}
      onMouseUp={commitZoom}
      onTouchEnd={commitZoom}
      onKeyUp={commitZoom}
      className={`zk-slider ${vertical ? "v" : "h"}`}
      aria-label="Arabic font size"
      style={vertical ? undefined : { flex: 1 }}
    />
  );

  if (vertical) {
    return (
      <div style={{
        ...cssVars,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        userSelect: "none",
      }}>
        <span style={{
          fontFamily: BODY,
          fontSize: 9.5,
          color: C.textFaint,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          writingMode: "vertical-rl",
          transform: "rotate(180deg)",
        }}>
          Size
        </span>

        <div style={{
          height: 180,
          width: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          {input}
        </div>

        <span
          ref={pctRef}
          style={{
            fontFamily: BODY,
            fontSize: 11,
            color: accent,
            letterSpacing: "0.04em",
            fontVariantNumeric: "tabular-nums",
            minWidth: 38,
            textAlign: "center",
          }}
        >
          {zoom}%
        </span>
      </div>
    );
  }

  return (
    <div style={{
      ...cssVars,
      display: "flex",
      alignItems: "center",
      gap: 14,
      margin: "12px auto 22px",
      padding: "0 4px",
      maxWidth: 460,
      width: "100%",
    }}>
      <span style={{
        fontFamily: BODY,
        fontSize: 10,
        color: C.textFaint,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        flexShrink: 0,
      }}>
        Size
      </span>

      {input}

      <span
        ref={pctRef}
        style={{
          fontFamily: BODY,
          fontSize: 11,
          color: accent,
          letterSpacing: "0.04em",
          fontVariantNumeric: "tabular-nums",
          flexShrink: 0,
          minWidth: 38,
          textAlign: "right",
        }}
      >
        {zoom}%
      </span>
    </div>
  );
}

function RoutineStep({ step, idx, count, target, onTap, accent, lang, showT, script, isLast }) {
  const done = count >= target;
  const isUr = lang === "ur";
  return (
    <div style={{
      // No background, no border, no rounding. The step is a section, not a
      // card. A faint divider below (except on the last step) gives just
      // enough separation between consecutive steps without enclosing them.
      padding: "28px 4px 36px",
      borderBottom: isLast ? "none" : `1px solid ${rgba(C.textSub, 0.08)}`,
      opacity: done ? 0.7 : 1,
      transition: "opacity 0.3s ease",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20 }}>
        <span style={{
          fontFamily: BODY, fontSize: 11, color: C.textFaint,
          letterSpacing: "0.1em", marginTop: 3, flexShrink: 0,
        }}>
          {String(idx + 1).padStart(2, "0")}
        </span>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: SERIF, fontSize: 17, fontWeight: 500,
            color: C.text, lineHeight: 1.25,
          }}>
            {step.title}
          </div>
          <div style={{
            fontFamily: BODY, fontSize: 11, color: C.textFaint, marginTop: 3,
          }}>
            {step.source}
          </div>
        </div>

        <button
          onClick={onTap}
          style={{
            flexShrink: 0, width: 58, height: 58, borderRadius: 999,
            background: done ? accent : rgba(accent, 0.1),
            border: `1.5px solid ${done ? accent : rgba(accent, 0.5)}`,
            cursor: "pointer",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            transition: "all 0.18s ease",
            color: done ? C.void : accent,
          }}
        >
          {done ? (
            <span style={{ fontSize: 20 }}>✓</span>
          ) : (
            <>
              <span style={{ fontFamily: BODY, fontSize: 17, fontWeight: 700, lineHeight: 1 }}>
                {count}
              </span>
              <span style={{ fontFamily: BODY, fontSize: 9.5, opacity: 0.7, marginTop: 1 }}>
                of {target}
              </span>
            </>
          )}
        </button>
      </div>

      <div style={{
        "--glow": rgba(accent, 0.45),
        "--glow-soft": rgba(accent, 0.22),
        fontFamily: arabicFont(script),
        fontSize: `calc(${1.6 * arabicScale(script)}rem * var(--zk-arabic-scale, 1))`,
        lineHeight: script === "indopak" ? 2.4 : 2.2,
        direction: "rtl", textAlign: "center", color: C.text,
        marginBottom: showT ? 10 : 6,
        fontFeatureSettings: "'liga' 1, 'calt' 1",
      }}>
        {step.arabic.split(/\s+/).filter(Boolean).map((word, i) => (
          <span
            key={i}
            className="zikir-word"
            style={{ display: "inline-block", padding: "0 0.18em" }}
          >
            {word}
          </span>
        ))}
      </div>

      {showT && (
        <div style={{
          fontFamily: BODY, fontSize: 13, color: C.textSub,
          textAlign: "center", lineHeight: 1.7, marginBottom: 8,
          letterSpacing: "0.005em",
        }}>
          {step.translit}
        </div>
      )}

      <div style={{
        fontFamily: isUr ? ARABIC_URDU : BODY,
        fontSize: isUr ? 17 : 14,
        color: C.textMuted,
        lineHeight: isUr ? 2.4 : 1.7,
        textAlign: "center",
        direction: isUr ? "rtl" : "ltr",
        maxWidth: 480, margin: "0 auto",
      }}>
        {translateOf(step, lang)}
      </div>

      <div style={{
        fontFamily: BODY, fontSize: 10.5, color: C.textFaint,
        textAlign: "center", marginTop: 12, letterSpacing: "0.04em",
      }}>
        {done ? "completed" : "tap the circle as you recite"}
      </div>
    </div>
  );
}

function RoutineDetail({ routine, lang, setLang, showT, setShowT, script, setScript, zoom, setZoom, isNarrow }) {
  const steps = routine.steps.map(resolveStep);
  const [counts, setCounts] = useState(steps.map(() => 0));
  const accent = routine.color;

  const tap = (i) => {
    setCounts(prev => {
      const next = [...prev];
      next[i] = next[i] >= steps[i].count ? 0 : next[i] + 1;
      return next;
    });
  };

  const completed = counts.filter((c, i) => c >= steps[i].count).length;
  const allDone = completed === steps.length;

  return (
    <div className="detailIn" style={{ position: "relative", maxWidth: 620, margin: "0 auto" }}>
      <div style={{
        fontFamily: BODY, fontSize: 12.5, color: accent,
        letterSpacing: "0.02em", marginBottom: 6,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ fontSize: 9 }}>✦</span>
        Routine · {routine.when}
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 10 }}>
        <h2 style={{
          margin: 0, fontSize: 27, fontWeight: 500, fontFamily: SERIF,
          color: C.text, lineHeight: 1.2, letterSpacing: "-0.01em",
        }}>
          {routine.title}
        </h2>
        <span style={{
          fontFamily: arabicFont(script),
          fontSize: `calc(${1.5 * arabicScale(script)}rem * var(--zk-arabic-scale, 1))`,
          color: accent, marginLeft: "auto", lineHeight: 1,
        }}>
          {routine.arabic}
        </span>
      </div>

      <p style={{
        fontFamily: SERIF, fontSize: 15.5, color: C.textSub, fontStyle: "italic",
        lineHeight: 1.6, margin: "0 0 22px",
      }}>
        {routine.desc}
      </p>

      <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontFamily: BODY, fontSize: 11, color: C.textFaint, letterSpacing: "0.04em" }}>
          {allDone ? "Sequence complete" : `${completed} of ${steps.length} complete`}
        </span>
        <span style={{ fontFamily: BODY, fontSize: 11, color: accent }}>
          {Math.round((completed / steps.length) * 100)}%
        </span>
      </div>
      <div style={{
        height: 5, borderRadius: 999, background: C.surface,
        marginBottom: 18, overflow: "hidden",
      }}>
        <div style={{
          height: "100%", width: `${(completed / steps.length) * 100}%`,
          background: accent, borderRadius: 999,
          boxShadow: `0 0 10px ${rgba(accent, 0.6)}`,
          transition: "width 0.4s cubic-bezier(0.16,1,0.3,1)",
        }} />
      </div>

      {/* Mobile-only font-size slider above the controls row. */}
      {isNarrow && (
        <FontSizeSlider zoom={zoom} setZoom={setZoom} accent={accent} />
      )}

      {/* Unified glass controls row — same pattern as DuaDetail, minus play
          (routines don't have a single Arabic to recite — each step has its
          own). */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginTop: 4,
        marginBottom: 22,
        flexWrap: "wrap",
        rowGap: 10,
      }}>
        <button
          type="button"
          onClick={() => setShowT(!showT)}
          className={`zk-glass ${showT ? "is-active" : ""}`}
          style={{
            "--zk-accent": accent,
            "--zk-glass-tint": rgba(accent, 0.10),
          }}
        >
          {showT ? "Hide" : "Show"} transliteration
        </button>

        <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
          <GlassSegmented
            value={script}
            onChange={setScript}
            accent={accent}
            options={SCRIPT_OPTIONS}
          />
          <GlassSegmented
            value={lang}
            onChange={setLang}
            accent={accent}
            options={LANG_OPTIONS}
          />
        </div>
      </div>

      {/* Steps + co-located desktop slider. Same grid pattern as DuaDetail,
          but the slider sits sticky at the top of the steps column rather
          than centered — routines can be tall, and a center alignment would
          push the slider far below the fold. */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isNarrow ? "1fr" : "minmax(0, 1fr) 72px",
        alignItems: "start",
        columnGap: isNarrow ? 0 : 56,
      }}>
        <div>
          {steps.map((s, i) => (
            <RoutineStep
              key={s.id}
              step={s} idx={i}
              count={counts[i]} target={s.count}
              onTap={() => tap(i)}
              accent={accent} lang={lang} showT={showT} script={script}
              isLast={i === steps.length - 1}
            />
          ))}
        </div>

        {!isNarrow && (
          <div style={{
            display: "flex",
            justifyContent: "center",
            position: "sticky",
            top: 80,
            transform: "translateX(18px)",
          }}>
            <FontSizeSlider
              zoom={zoom}
              setZoom={setZoom}
              accent={accent}
              vertical
            />
          </div>
        )}
      </div>

      {allDone && (
        <div className="fadeIn" style={{
          background: rgba(accent, 0.1),
          border: `1px solid ${rgba(accent, 0.4)}`,
          borderRadius: 14, padding: "18px 20px", textAlign: "center",
          marginTop: 4,
        }}>
          <div style={{
            fontFamily: arabicFont(script),
            fontSize: `calc(${1.5 * arabicScale(script)}rem * var(--zk-arabic-scale, 1))`,
            color: accent, marginBottom: 6,
          }}>
            تَقَبَّلَ ٱللَّهُ
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 15, color: C.textSub, fontStyle: "italic" }}>
            May Allah accept it. The routine is complete.
          </div>
        </div>
      )}

      <div style={{
        fontFamily: BODY, fontSize: 10.5, color: C.textFaint,
        lineHeight: 1.6, marginTop: 18, fontStyle: "italic",
      }}>
        A routine is a suggested sequence assembled from authenticated supplications.
        The order and counts are a practice aid — each supplication carries its own source above.
      </div>
    </div>
  );
}

function Welcome({ setLens, script }) {
  return (
    <div className="detailIn" style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
      <div style={{
        fontFamily: arabicFont(script),
        fontSize: `${2.3 * arabicScale(script)}rem`,
        color: C.textSub,
        lineHeight: 1.8, marginBottom: 8,
      }}>
        ٱلدُّعَاءُ مُخُّ ٱلْعِبَادَةِ
      </div>
      <div style={{
        fontFamily: SERIF, fontSize: 13, color: C.textFaint, fontStyle: "italic",
        marginBottom: 38,
      }}>
        "Dua is the very essence of worship" — Tirmidhi 3371
      </div>

      <h1 style={{
        fontFamily: SERIF, fontSize: "2.4rem", fontWeight: 400, color: C.text,
        margin: "0 0 10px", letterSpacing: "-0.02em",
      }}>
        Where would you like to begin?
      </h1>
      <p style={{
        fontFamily: SERIF, fontSize: 15.5, color: C.textSub, fontStyle: "italic",
        margin: "0 0 34px", lineHeight: 1.55,
      }}>
        Navigation is on the left, and it follows your need —<br />
        the state of your heart, the hour of your day, the source, or a routine.
      </p>

      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12,
        textAlign: "left",
      }}>
        {LENSES.map(l => {
          const col = LENS_COLOR[l.id];
          const sub = {
            moods:    "By the state of your heart",
            timings:  "By the hour of your day",
            sources:  "By the collection it comes from",
            routines: "Sequences to recite together",
          }[l.id];
          return (
            <button
              key={l.id}
              onClick={() => setLens(l.id)}
              style={{
                background: rgba(col, 0.08),
                border: `1px solid ${rgba(col, 0.35)}`,
                borderRadius: 14, padding: "16px 16px 15px",
                cursor: "pointer", textAlign: "left",
                display: "flex", flexDirection: "column", gap: 5,
                transition: "all 0.16s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = rgba(col, 0.15); }}
              onMouseLeave={e => { e.currentTarget.style.background = rgba(col, 0.08); }}
            >
              <span style={{ fontSize: 15, color: col }}>{l.glyph}</span>
              <span style={{
                fontFamily: SERIF, fontSize: 18, fontWeight: 500, color: C.text,
              }}>
                {l.label}
              </span>
              <span style={{
                fontFamily: BODY, fontSize: 12, color: C.textMuted, lineHeight: 1.45,
              }}>
                {sub}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────

export default function App() {
  const [lens, setLens] = useState("moods");
  const [openGroup, setOpenGroup] = useState(null);
  const [selected, setSelected] = useState(null);
  const [lang, setLang] = useState("en");
  const [speaking, setSpeaking] = useState(false);
  const [showT, setShowT] = useState(true);
  const [ttsOk, setTtsOk] = useState(true);
  const [isNarrow, setIsNarrow] = useState(false);

  // Quran script preference. Persisted to localStorage so it survives reload.
  // The lazy initializer reads from storage on first mount only.
  const [script, setScriptRaw] = useState(() => {
    if (typeof window === "undefined") return "uthmani";
    try {
      const stored = window.localStorage.getItem("zikir.script");
      if (stored && SCRIPTS[stored]) return stored;
    } catch {}
    return "uthmani";
  });
  const setScript = (s) => {
    setScriptRaw(s);
    try { window.localStorage.setItem("zikir.script", s); } catch {}
  };

  // Arabic-text zoom preference. 100 = baseline. Range clamped to 75–175.
  // The actual font-size change is driven by a CSS variable on <html> that
  // we write directly on every slider drag — bypassing React's render cycle
  // entirely, so dragging the slider doesn't cause the rest of the detail
  // pane to re-render or "blink". React state is kept in sync (for the
  // percentage display and persistence), but localStorage writes are
  // debounced so dragging doesn't hammer storage.
  const [zoom, setZoomState] = useState(() => {
    if (typeof window === "undefined") return 100;
    try {
      const n = parseInt(window.localStorage.getItem("zikir.zoom"), 10);
      if (Number.isFinite(n) && n >= 75 && n <= 175) return n;
    } catch {}
    return 100;
  });
  const setZoom = (n) => {
    const clamped = Math.min(175, Math.max(75, Math.round(n)));
    // Update the DOM immediately — no waiting for React's next paint.
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty("--zk-arabic-scale", clamped / 100);
    }
    setZoomState(clamped);
  };

  // Apply the CSS variable on first mount + on every committed zoom change,
  // so a fresh page load or HMR reload picks up the stored value.
  useEffect(() => {
    document.documentElement.style.setProperty("--zk-arabic-scale", zoom / 100);
  }, [zoom]);

  // Debounce localStorage so rapid drags don't trigger a write on every frame.
  useEffect(() => {
    const t = setTimeout(() => {
      try { window.localStorage.setItem("zikir.zoom", String(zoom)); } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [zoom]);

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = STYLE;
    document.head.appendChild(s);
    setTtsOk("speechSynthesis" in window);
    return () => { s.remove(); window.speechSynthesis?.cancel(); };
  }, []);

  useEffect(() => {
    const check = () => setIsNarrow(window.innerWidth < 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const groups = useMemo(
    () => lens === "routines" ? [] : groupsForLens(lens),
    [lens]
  );
  useEffect(() => {
    if (lens !== "routines" && groups.length) setOpenGroup(groups[0].id);
    else setOpenGroup(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lens]);

  const speak = useCallback((text) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ar-SA";
    u.rate = 0.72;
    u.pitch = 1;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  const selectDua = useCallback((d) => {
    stop();
    setSelected({ type: "dua", id: d.id, dua: d });
  }, [stop]);
  const selectRoutine = useCallback((r) => {
    stop();
    setSelected({ type: "routine", id: r.id, routine: r });
  }, [stop]);
  const clearSelection = useCallback(() => {
    stop();
    setSelected(null);
  }, [stop]);

  // The escape-to-close handler reads the latest `selected` via a ref so the
  // effect doesn't re-mount on every state change.
  const selectedRef = useRef(selected);
  useEffect(() => { selectedRef.current = selected; }, [selected]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && selectedRef.current) clearSelection();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [clearSelection]);

  const detailAccent = !selected
    ? "#7f5af0"
    : selected.type === "routine"
      ? selected.routine.color
      : duaColor(selected.dua);

  const DetailBody = () => {
    if (!selected) return <Welcome setLens={setLens} script={script} />;
    if (selected.type === "routine") {
      return (
        <RoutineDetail
          key={selected.id}
          routine={selected.routine}
          lang={lang} setLang={setLang}
          showT={showT} setShowT={setShowT}
          script={script} setScript={setScript}
          zoom={zoom} setZoom={setZoom}
          isNarrow={isNarrow}
        />
      );
    }
    return (
      <DuaDetail
        dua={selected.dua}
        lang={lang} setLang={setLang}
        speaking={speaking} speak={speak} stop={stop}
        showT={showT} setShowT={setShowT} ttsOk={ttsOk}
        script={script} setScript={setScript}
        zoom={zoom} setZoom={setZoom}
        isNarrow={isNarrow}
      />
    );
  };

  const detailPane = (overlay) => (
    <div
      className="thinscroll"
      style={{
        flex: 1,
        background: C.bg,
        height: "100vh",
        overflowY: "auto",
        position: overlay ? "fixed" : "relative",
        inset: overlay ? 0 : undefined,
        zIndex: overlay ? 100 : 1,
      }}
    >
      <div style={{
        position: "fixed", top: -260,
        left: isNarrow ? "50%" : "calc(50% + 160px)",
        transform: "translateX(-50%)",
        width: 720, height: 460,
        background: `radial-gradient(ellipse at center, ${rgba(detailAccent, 0.13)} 0%, transparent 65%)`,
        pointerEvents: "none", transition: "background 0.5s ease",
      }} />
      <div style={{
        position: "fixed", inset: 0,
        backgroundImage: `radial-gradient(${rgba(C.textSub, 0.08)} 1px, transparent 1px)`,
        backgroundSize: "38px 38px",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", padding: "26px 30px 60px" }}>
        {overlay ? (
          <button
            onClick={clearSelection}
            style={{
              background: "transparent", border: `1px solid ${C.line}`,
              borderRadius: 999, padding: "8px 16px", cursor: "pointer",
              color: C.textSub, fontSize: 12.5, fontFamily: BODY,
              display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 24,
            }}
          >
            <span style={{ fontSize: 13 }}>←</span> Back to navigation
          </button>
        ) : selected ? (
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
            <button
              onClick={clearSelection}
              style={{
                background: "transparent", border: `1px solid ${C.line}`,
                borderRadius: 999, width: 30, height: 30, cursor: "pointer",
                color: C.textFaint, fontSize: 13, fontFamily: BODY,
              }}
            >✕</button>
          </div>
        ) : null}

        <DetailBody />
      </div>
    </div>
  );

  return (
    <div style={{
      background: C.bg, color: C.text, fontFamily: BODY,
      minHeight: "100vh",
      display: "flex",
      overflow: isNarrow ? "visible" : "hidden",
      height: isNarrow ? "auto" : "100vh",
    }}>
      <Sidebar
        lens={lens} setLens={setLens}
        groups={groups}
        openGroup={openGroup} setOpenGroup={setOpenGroup}
        selected={selected}
        onSelectDua={selectDua}
        onSelectRoutine={selectRoutine}
        isNarrow={isNarrow}
        script={script}
      />
      {!isNarrow && detailPane(false)}
      {isNarrow && selected && detailPane(true)}
    </div>
  );
}
