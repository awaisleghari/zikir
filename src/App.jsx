import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";

import DUAS_RAW       from "./content/duas.json";
import ADHKAR_RAW     from "./content/adhkar.json";
import ROUTINES_RAW   from "./content/routines.json";
import TAXONOMY       from "./content/taxonomy.json";
import SectionOverview from "./SectionOverview.jsx";
import { C, LENS_COLOR } from "./palette.js";
import { SegmentedControl, Switch, ActionIcon, NavLink, Button, Badge, RingProgress, UnstyledButton } from "@mantine/core";

// ─── Style injection (fonts + animations + scrollbars) ───────────────────────

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@400;500;600;700&family=Amiri:wght@400;700&family=Amiri+Quran&family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap');

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
    width: 28px;
    height: 240px;
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
    width: 20px;
    height: 20px;
    border-radius: 999px;
    background: var(--zk-accent, #b8c1ec);
    border: none;
    margin-top: -9px;          /* horizontal: pull up onto the 2px track */
    box-shadow: 0 0 0 1px rgba(0,0,0,0.4), 0 0 10px var(--zk-accent-glow, transparent);
    transition: box-shadow 0.2s ease;
  }
  .zk-slider.v::-webkit-slider-thumb {
    margin-top: 0;
    margin-left: -9px;         /* vertical: pull left onto the 2px track */
  }
  .zk-slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
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

  /* Active drag state — a translucent halo around the thumb confirms the
     slider is captured, even if the cursor drifts slightly off the rail
     during a fast drag. The browser captures the pointer correctly the
     whole time; this is the *visual* anchor that makes that obvious. */
  .zk-slider.is-dragging::-webkit-slider-thumb {
    box-shadow:
      0 0 0 6px rgba(255,255,255,0.08),
      0 0 0 1px rgba(0,0,0,0.4),
      0 0 22px var(--zk-accent, #b8c1ec);
  }
  .zk-slider.is-dragging::-moz-range-thumb {
    box-shadow:
      0 0 0 6px rgba(255,255,255,0.08),
      0 0 0 1px rgba(0,0,0,0.4),
      0 0 22px var(--zk-accent, #b8c1ec);
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
    font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 12.5px;
    font-weight: 500;
    letter-spacing: 0.01em;
    cursor: pointer;
    transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.25s ease, transform 0.2s ease;
    white-space: nowrap;
    /* Performance: promote to its own compositor layer so the expensive
       backdrop-filter blur is rasterized once and cached, instead of being
       re-computed every time a parent re-renders. */
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
    will-change: backdrop-filter;
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
    font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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
// C (color tokens) and LENS_COLOR live in ./palette.js, the single source of
// truth for the app's color world (imported at the top of this file). Swapping
// the whole palette is a one-file edit there.

const SERIF  = "'Cormorant Garamond', Georgia, serif";
const BODY   = "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

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


function GroupHeader({ group, open, onClick }) {
  return (
    <NavLink
      label={group.label}
      active={open}
      color={group.color}
      onClick={onClick}
      leftSection={
        <span style={{ width: 9, height: 9, borderRadius: 3, background: group.color, display: "block",
          boxShadow: open ? `0 0 8px ${rgba(group.color, 0.7)}` : "none" }} />
      }
      rightSection={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10.5, fontFamily: BODY, color: open ? group.color : C.textFaint }}>
            {group.duas.length}
          </span>
          <span style={{ fontSize: 9, color: open ? group.color : C.textFaint,
            transform: open ? "rotate(90deg)" : "none", transition: "transform 0.2s ease" }}>▶</span>
        </span>
      }
      styles={{
        root: { borderRadius: 10 },
        label: { fontFamily: BODY, fontSize: 13.5, fontWeight: open ? 600 : 500 },
      }}
    />
  );
}

function DuaListItem({ dua, selected, onClick }) {
  const col = duaColor(dua);
  return (
    <NavLink
      label={dua.title}
      description={dua.use}
      active={selected}
      color={col}
      onClick={onClick}
      leftSection={<span style={{ width: 6, height: 6, borderRadius: "50%", background: col, display: "block" }} />}
      styles={{
        root: { borderRadius: 8 },
        label: { fontFamily: BODY, fontSize: 14, fontWeight: 500, whiteSpace: "normal" },
        description: { fontFamily: BODY, fontSize: 11.5, fontStyle: "italic" },
      }}
    />
  );
}

function RoutineListItem({ routine, selected, onClick }) {
  const col = routine.color;
  return (
    <NavLink
      label={routine.title}
      description={routine.when}
      active={selected}
      color={col}
      onClick={onClick}
      leftSection={<span style={{ width: 8, height: 8, borderRadius: 3, background: col, display: "block" }} />}
      styles={{
        root: { borderRadius: 10, marginBottom: 4 },
        label: { fontFamily: BODY, fontSize: 15, fontWeight: 500, whiteSpace: "normal" },
        description: { fontFamily: BODY, fontSize: 11.5, fontStyle: "italic" },
      }}
    />
  );
}

const Sidebar = React.memo(function Sidebar({
  lens, setLens, groups, openGroup, setOpenGroup,
  selected, onSelectDua, onSelectRoutine, isNarrow, script, hidden, onExitToLanding,
}) {
  return (
    <div style={{
      width: isNarrow ? "100%" : 322,
      flexShrink: 0,
      background: C.panel,
      borderRight: isNarrow ? "none" : `1px solid ${C.line}`,
      height: isNarrow ? "auto" : "100vh",
      // Hidden on mobile while a dua is open: the fixed reading overlay covers
      // the screen, and leaving the scrollable sidebar mounted behind it caused
      // iOS Safari to bleed it through near the toolbar during scroll. Kept
      // mounted (display:none, not unmounted) so its state survives.
      display: hidden ? "none" : "flex", flexDirection: "column",
    }}>
      {/* Brand — clicking the wordmark returns to the landing/entrance */}
      <div style={{ padding: "22px 20px 16px", borderBottom: `1px solid ${C.line}` }}>
        <UnstyledButton
          onClick={onExitToLanding}
          title="Return to the entrance"
          style={{ display: "block", width: "100%" }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
            <span style={{
              fontFamily: SERIF, fontSize: 26, fontWeight: 600, color: C.gold,
              letterSpacing: "0.005em", textShadow: `0 0 26px ${rgba(C.gold, 0.28)}`,
            }}>
              Zikir
            </span>
            <span style={{
              fontFamily: ARABIC_URDU, fontSize: "1.3rem", color: C.goldSoft,
              marginLeft: "auto", opacity: 0.9,
            }}>
              ذِكْر
            </span>
          </div>
        </UnstyledButton>
        <div style={{
          fontFamily: BODY, fontSize: 10, color: C.textMuted,
          letterSpacing: "0.14em", marginTop: 6, textTransform: "uppercase",
        }}>
          Duas from the Quran &amp; Sunnah
        </div>
      </div>

      {/* Lens tabs */}
      <div style={{
        padding: "12px 14px 10px",
        borderBottom: `1px solid ${C.line}`,
      }}>
        <LensTabs value={lens} onChange={setLens} />
      </div>

      {/* Lens caption. Desktop only: on mobile the inline SectionOverview
          below carries the tagline and the how-to-use guidance. */}
      {!isNarrow && (
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
      )}

      {/* Scrollable navigation body */}
      <div className="thinscroll" style={{
        flex: 1, overflowY: "auto",
        padding: "2px 14px 22px",
        maxHeight: isNarrow ? "none" : undefined,
      }}>
        {/* Mobile: the section overview (what this is, how to use it) sits at
            the top of the list so the user is oriented before any prayers. */}
        {isNarrow && <SectionOverview lens={lens} variant="inline" />}
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
    <div className="detailIn" style={{ position: "relative", maxWidth: 620, margin: "0 auto", overflow: "visible" }}>
      <div style={{ marginBottom: 8 }}>
        <Badge
          variant="light"
          radius="sm"
          size="lg"
          leftSection={<span style={{ fontSize: 9 }}>✦</span>}
          styles={{
            root: {
              background: rgba(accent, 0.12),
              border: `1px solid ${rgba(accent, 0.32)}`,
              color: accent,
              textTransform: "none",
              fontFamily: BODY,
              fontWeight: 500,
            },
          }}
        >
          {dua.use}
        </Badge>
      </div>
      <div style={{
        fontFamily: BODY, fontSize: 9.5, color: C.textFaint,
        letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 14,
      }}>
        {CAT_LABEL[dua.category]}
      </div>

      <h2 style={{
        margin: "0 0 22px", fontSize: 27, fontWeight: 600,
        fontFamily: BODY, color: C.text, lineHeight: 1.25,
        letterSpacing: "-0.01em",
      }}>
        {dua.title}
      </h2>

      <div style={{
        textAlign: "center", color: accent, fontSize: 12,
        letterSpacing: "0.55em", marginBottom: 16, opacity: 0.55,
      }}>✦ ✦ ✦</div>

      {/* Arabic block + co-located desktop slider. On desktop, this grid is
          widened beyond the 620px content column via negative margins so
          the slider sits in its own right-side lane, clearly outside the
          column where the controls row below lives. On mobile (isNarrow),
          all desktop-only layout collapses; the wrapper resolves to a
          single full-width column with the Arabic text alone, and the
          horizontal slider appears further down beneath the controls. */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isNarrow ? "1fr" : "minmax(0, 1fr) 96px",
        alignItems: "center",
        columnGap: isNarrow ? 0 : 96,
        width: isNarrow ? "100%" : "calc(100% + 220px)",
        marginLeft: isNarrow ? 0 : "-70px",
        marginRight: isNarrow ? 0 : "-150px",
        overflow: "visible",
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
            transform: "none",
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
        <PlayButton
          playing={speaking}
          onClick={() => (speaking ? stop() : speak(dua.arabic))}
          disabled={!ttsOk}
        />

        <TranslitSwitch checked={showT} onChange={setShowT} />

        <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <ScriptToggle value={script} onChange={setScript} />
          <LangToggle value={lang} onChange={setLang} />
        </div>
      </div>

      {/* Transliteration — shown when the Transliteration switch in the
          controls row above is on. */}
      {showT && dua.translit && (
        <div style={{
          fontSize: 15, color: readableInk(accent),
          fontFamily: BODY, lineHeight: 1.75,
          letterSpacing: "0.01em",
          marginBottom: 16,
        }}>
          {dua.translit}
        </div>
      )}

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

// ─── Mantine control toggles ─────────────────────────────────────────────────
// SegmentedControl + Switch for the script, language, and transliteration
// controls. The zoom slider stays hand-rolled (FontSizeSlider): its
// uncontrolled-input performance design must not become a controlled Mantine
// Slider.
const SCRIPT_DATA = [
  { label: "Uthmani", value: "uthmani" },
  { label: "IndoPak", value: "indopak" },
];
const LANG_DATA = [
  { label: "EN", value: "en" },
  { label: <span style={{ fontFamily: ARABIC_URDU, fontSize: "1.05em", lineHeight: 1 }}>اردو</span>, value: "ur" },
];
const SEG_STYLES = {
  root: { background: "rgba(255,255,255,0.035)", border: `1px solid ${rgba(C.gold, 0.2)}` },
  label: { fontFamily: BODY, fontWeight: 500, fontSize: 12.5 },
};

function ScriptToggle({ value, onChange }) {
  return (
    <SegmentedControl size="sm" radius="xl" color="gold"
      value={value} onChange={onChange} data={SCRIPT_DATA} styles={SEG_STYLES} />
  );
}
function LangToggle({ value, onChange }) {
  return (
    <SegmentedControl size="sm" radius="xl" color="gold"
      value={value} onChange={onChange} data={LANG_DATA} styles={SEG_STYLES} />
  );
}
function TranslitSwitch({ checked, onChange }) {
  return (
    <Switch size="sm" color="gold" checked={checked}
      onChange={(e) => onChange(e.currentTarget.checked)}
      label="Transliteration"
      styles={{ label: { color: C.textSub, fontFamily: BODY, fontSize: 12.5 } }} />
  );
}

// Play / stop the Arabic (Web Speech). Mantine ActionIcon so the controls row
// is one visual language: gold tint when idle, gold fill while playing.
function PlayButton({ playing, onClick, disabled }) {
  return (
    <ActionIcon
      size={36} radius="xl"
      variant={playing ? "filled" : "light"}
      color="gold"
      onClick={onClick}
      disabled={disabled}
      aria-label={playing ? "Stop" : "Play Arabic"}
      title={playing ? "Stop" : "Play Arabic"}
    >
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
        <path d={playing ? ICONS.stop : ICONS.play} fill="currentColor" />
      </svg>
    </ActionIcon>
  );
}

// The four section tabs (Moods / Timings / Sources / Routines) as one Mantine
// SegmentedControl. The active segment is tinted with that section's signature
// color. Used in both the sidebar and the mobile dua header.
const LENS_TABS_DATA = LENSES.map((l) => ({
  value: l.id,
  label: (
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 3, lineHeight: 1.1 }}>
      <span style={{ fontSize: 14 }}>{l.glyph}</span>
      <span style={{ fontSize: 11.5, fontWeight: 500, letterSpacing: "0.01em" }}>{l.label}</span>
    </span>
  ),
}));

function LensTabs({ value, onChange }) {
  return (
    <SegmentedControl
      fullWidth
      radius="md"
      value={value}
      onChange={onChange}
      data={LENS_TABS_DATA}
      color={LENS_COLOR[value]}
      styles={{
        root: { background: "rgba(255,255,255,0.03)", border: `1px solid ${C.line}` },
        label: { fontFamily: BODY, padding: "7px 2px" },
      }}
    />
  );
}

// Icon path strings — kept inline so we don't need an icon library.
const ICONS = {
  // Equilateral triangle pointing right, optically centered (left edge at x=5
  // so the visual weight sits where the eye expects "play" to be).
  play: "M5 3.5 L12 8 L5 12.5 Z",
  // Two vertical bars — pause/stop.
  stop: "M4.5 3.5 H7 V12.5 H4.5 Z M9 3.5 H11.5 V12.5 H9 Z",
};

// Font-size slider. Range 75–175 (% of baseline Arabic size). Two layouts:
//   • vertical (`vertical: true`)   — desktop rail, parent positions it
//   • horizontal (default)          — mobile, inline below the script selector
// The accent prop themes the thumb color and its glow.
function FontSizeSlider({ zoom, setZoom, accent, vertical = false }) {
  const pctRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const cssVars = {
    "--zk-accent": accent,
    "--zk-accent-glow": rgba(accent, 0.4),
  };

  const applyZoomLive = (raw) => {
    const n = Math.min(150, Math.max(80, Math.round(Number(raw))));
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
      min={80}
      max={150}
      step={1}
      defaultValue={zoom}
      onPointerDown={() => setDragging(true)}
      onPointerUp={(e) => { setDragging(false); commitZoom(e); }}
      onPointerCancel={() => setDragging(false)}
      onInput={(e) => applyZoomLive(e.currentTarget.value)}
      onMouseUp={commitZoom}
      onTouchEnd={commitZoom}
      onKeyUp={commitZoom}
      className={`zk-slider ${vertical ? "v" : "h"} ${dragging ? "is-dragging" : ""}`}
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
        }}>
          Zoom
        </span>

        <div style={{
          height: 260,
          width: 56,
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
        Zoom
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

// ─── Color helpers (HSL) ─────────────────────────────────────────────────────
function hexToHsl(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return [h * 360, s, l];
}
function hslToHex(h, s, l) {
  h = (((h % 360) + 360) % 360) / 360;
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const toHex = (x) => Math.round(x * 255).toString(16).padStart(2, "0");
  return "#" + toHex(r) + toHex(g) + toHex(b);
}

// Shift a hex color's hue by `deg` degrees, keeping saturation and lightness.
// Used to give each routine step its own hue within a coherent band.
function shiftHue(hex, deg) {
  const [h, s, l] = hexToHsl(hex);
  return hslToHex(h + deg, s, l);
}

// A readable-on-dark version of a per-step color, for using it as text. The hue
// (the step's identity) is preserved, but lightness is floored so hues that
// drift toward blue/violet stay legible against the dark slate reading canvas.
function readableInk(hex) {
  const [h, s, l] = hexToHsl(hex);
  return hslToHex(h, Math.min(s, 0.7), Math.max(l, 0.72));
}

// Per-step color ramp: step 0 is the routine's own color; later steps step
// through distinct but harmonious neighbors across a bounded hue band, so each
// step in a long routine reads as its own color. Drives the counter ring, the
// numbered station on the spine, and the word-glow.
const STEP_HUE_SPREAD = 100;
const stepColor = (base, i, n) => shiftHue(base, (n > 1 ? i / (n - 1) : 0) * STEP_HUE_SPREAD);

function RoutineStep({ step, idx, count, target, onTap, accent, lang, showT, script, isLast }) {
  const done = count >= target;
  const isUr = lang === "ur";
  const pct = Math.min(100, (count / target) * 100);
  return (
    <div style={{
      padding: "26px 2px 30px",
      borderBottom: isLast ? "none" : `1px solid ${rgba(C.textSub, 0.08)}`,
      opacity: done ? 0.82 : 1, transition: "opacity 0.3s ease",
    }}>
      {/* Title row: step number, title/source, and the count ring */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 18 }}>
        <span style={{
          fontFamily: BODY, fontSize: 11, color: C.textFaint,
          letterSpacing: "0.1em", marginTop: 4, flexShrink: 0,
        }}>
          {String(idx + 1).padStart(2, "0")}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: BODY, fontSize: 17, fontWeight: 600, color: C.text, lineHeight: 1.25 }}>
            {step.title}
          </div>
          <div style={{ fontFamily: BODY, fontSize: 11, color: C.textFaint, marginTop: 3 }}>
            {step.source}
          </div>
        </div>
        <UnstyledButton
          onClick={onTap}
          aria-label={done ? "Completed" : `Recited ${count} of ${target}; tap to count`}
          style={{ flexShrink: 0, borderRadius: 999 }}
        >
          <RingProgress
            size={58}
            thickness={4}
            roundCaps
            sections={[{ value: pct, color: accent }]}
            label={
              <div style={{ textAlign: "center", color: done ? readableInk(accent) : C.text, fontFamily: BODY }}>
                {done ? (
                  <span style={{ fontSize: 18 }}>✓</span>
                ) : (
                  <>
                    <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1 }}>{count}</div>
                    <div style={{ fontSize: 8.5, opacity: 0.7, marginTop: 1 }}>of {target}</div>
                  </>
                )}
              </div>
            }
          />
        </UnstyledButton>
      </div>

      {/* Arabic — full width, page-centered */}
      <div style={{
        "--glow": rgba(accent, 0.45),
        "--glow-soft": rgba(accent, 0.22),
        fontFamily: arabicFont(script),
        fontSize: `calc(${1.6 * arabicScale(script)}rem * var(--zk-arabic-scale, 1))`,
        lineHeight: script === "indopak" ? 2.4 : 2.2,
        direction: "rtl", textAlign: "center", color: C.text,
        margin: showT ? "20px 0 12px" : "20px 0 10px",
        fontFeatureSettings: "'liga' 1, 'calt' 1",
      }}>
        {step.arabic.split(/\s+/).filter(Boolean).map((word, i) => (
          <span key={i} className="zikir-word" style={{ display: "inline-block", padding: "0 0.18em" }}>
            {word}
          </span>
        ))}
      </div>

      {/* Transliteration — in the step's accent color, so it reads clearly apart
          from the translation (the meaning) below it. Roman, not italic. */}
      {showT && (
        <div style={{
          fontFamily: BODY, fontSize: 13, color: readableInk(accent),
          textAlign: "center", lineHeight: 1.7, marginBottom: 10, letterSpacing: "0.01em",
        }}>
          {step.translit}
        </div>
      )}

      {/* Translation — the meaning; brighter for prominence and contrast. */}
      <div style={{
        fontFamily: isUr ? ARABIC_URDU : BODY,
        fontSize: isUr ? 17 : 14.5, color: C.textSub,
        lineHeight: isUr ? 2.4 : 1.75, textAlign: "center",
        direction: isUr ? "rtl" : "ltr", maxWidth: 480, margin: "0 auto",
      }}>
        {translateOf(step, lang)}
      </div>

      <div style={{
        fontFamily: BODY, fontSize: 10.5, color: C.textFaint,
        textAlign: "center", marginTop: 12, letterSpacing: "0.04em",
      }}>
        {done ? "completed" : "tap the ring as you recite"}
      </div>
    </div>
  );
}

function RoutineDetail({ routine, lang, setLang, showT, setShowT, script, setScript, zoom, setZoom, isNarrow }) {
  const steps = routine.steps.map(resolveStep);
  const [counts, setCounts] = useState(steps.map(() => 0));
  const accent = routine.color;
  const stepColors = steps.map((_, i) => stepColor(routine.color, i, steps.length));

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
    <div className="detailIn" style={{ position: "relative", maxWidth: 620, margin: "0 auto", overflow: "visible" }}>
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
          margin: 0, fontSize: 27, fontWeight: 600, fontFamily: BODY,
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
        <TranslitSwitch checked={showT} onChange={setShowT} />

        <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <ScriptToggle value={script} onChange={setScript} />
          <LangToggle value={lang} onChange={setLang} />
        </div>
      </div>

      {/* Steps + co-located desktop slider. Same wider-plane pattern as
          DuaDetail but with slightly more conservative expansion since
          routines can be very tall and the slider is sticky. On mobile
          (isNarrow), everything collapses to a single full-width column. */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isNarrow ? "1fr" : "minmax(0, 1fr) 96px",
        alignItems: "start",
        columnGap: isNarrow ? 0 : 88,
        width: isNarrow ? "100%" : "calc(100% + 180px)",
        marginLeft: isNarrow ? 0 : "-40px",
        marginRight: isNarrow ? 0 : "-140px",
        overflow: "visible",
      }}>
        <div>
          {steps.map((s, i) => (
            <RoutineStep
              key={s.id}
              step={s} idx={i}
              count={counts[i]} target={s.count}
              onTap={() => tap(i)}
              accent={stepColors[i]} lang={lang} showT={showT} script={script}
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
            transform: "none",
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

/*
  Welcome screen, superseded by SectionOverview (which now renders whenever no
  dua or routine is selected). Kept commented out rather than deleted, in case
  we fold it back in later. To restore: remove this opening comment marker and
  the closing marker just below the function, then render <Welcome ... /> again
  from renderDetailBody.

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
*/

// ─── Main App ────────────────────────────────────────────────────────────────

export default function App({ onExitToLanding }) {
  const [lens, setLens] = useState(() => {
    try {
      const v = window.localStorage.getItem("zikir.lens");
      if (LENSES.some(l => l.id === v)) return v;
    } catch {}
    return "moods";
  });
  const [openGroup, setOpenGroup] = useState(null);
  const [selected, setSelected] = useState(() => {
    // Restore the open dua/routine after a refresh. Stored as {type, id} and
    // re-resolved against current content; falls back to nothing if it's gone.
    try {
      const raw = window.localStorage.getItem("zikir.sel");
      if (raw) {
        const { type, id } = JSON.parse(raw);
        if (type === "dua" && DUA_BY_ID[id]) return { type: "dua", id, dua: DUA_BY_ID[id] };
        if (type === "routine") {
          const r = ROUTINES.find(x => x.id === id);
          if (r) return { type: "routine", id, routine: r };
        }
      }
    } catch {}
    return null;
  });
  const [lang, setLang] = useState("en");
  const [speaking, setSpeaking] = useState(false);
  const [showT, setShowT] = useState(true);
  const [ttsOk, setTtsOk] = useState(true);
  const [isNarrow, setIsNarrow] = useState(false);

  // Persist the section and the open dua/routine so a refresh stays in place.
  useEffect(() => {
    try { window.localStorage.setItem("zikir.lens", lens); } catch {}
  }, [lens]);
  useEffect(() => {
    try {
      if (selected) {
        window.localStorage.setItem("zikir.sel", JSON.stringify({ type: selected.type, id: selected.id }));
      } else {
        window.localStorage.removeItem("zikir.sel");
      }
    } catch {}
  }, [selected]);

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
      if (Number.isFinite(n) && n >= 80 && n <= 150) return n;
    } catch {}
    return 100;
  });
  const setZoom = (n) => {
    const clamped = Math.min(150, Math.max(80, Math.round(n)));
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
  // Entering a lens no longer auto-opens the first category. The user lands on
  // the SectionOverview (what this section is, how to use it) and chooses where
  // to begin, instead of being dropped straight into the first category's duas.
  useEffect(() => {
    setOpenGroup(null);
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

  // Switching sections (the lens tabs) is top-level navigation: it closes any
  // open dua/routine and returns to the new section's overview. Without this,
  // clicking a tab while a dua was open changed the sidebar but left the detail
  // pane stuck on the dua, so it looked like nothing happened.
  const pickLens = useCallback((id) => {
    clearSelection();
    setLens(id);
  }, [clearSelection]);

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
    ? C.gold
    : selected.type === "routine"
      ? selected.routine.color
      : duaColor(selected.dua);

  // Render the selected dua, routine, or welcome screen. This is intentionally
  // a plain function (not a nested React component) — defining it as
  // `const DetailBody = () => {...}` inside App was creating a new component
  // type on every render, which forced React to unmount and remount the entire
  // detail subtree on every state change, replaying the entrance animation
  // each time. Using a function call inline keeps the existing DuaDetail /
  // RoutineDetail instances mounted across normal state updates.
  const renderDetailBody = () => {
    if (!selected) {
      return (
        <SectionOverview
          lens={lens}
          groups={groups}
          routines={ROUTINES}
          onPickGroup={setOpenGroup}
          onSelectRoutine={selectRoutine}
          variant="panel"
        />
      );
    }
    if (selected.type === "routine") {
      return (
        <RoutineDetail
          key={`routine-${selected.id}`}
          routine={selected.routine}
          lang={lang}
          setLang={setLang}
          showT={showT}
          setShowT={setShowT}
          script={script}
          setScript={setScript}
          zoom={zoom}
          setZoom={setZoom}
          isNarrow={isNarrow}
        />
      );
    }
    return (
      <DuaDetail
        key={`dua-${selected.id}`}
        dua={selected.dua}
        lang={lang}
        setLang={setLang}
        speaking={speaking}
        speak={speak}
        stop={stop}
        showT={showT}
        setShowT={setShowT}
        ttsOk={ttsOk}
        script={script}
        setScript={setScript}
        zoom={zoom}
        setZoom={setZoom}
        isNarrow={isNarrow}
      />
    );
  };

  const detailPane = (overlay) => (
    <div
      className="thinscroll"
      style={{
        flex: 1,
        background: C.canvas,
        height: "100vh",
        overflowY: "auto",
        position: overlay ? "fixed" : "relative",
        // Mobile overlay: pin top/left/right and let the top-anchored 100vh
        // over-cover the bottom. Using `inset:0` set `bottom:0`, which on iOS
        // pins the overlay to the shrinking visual-viewport bottom; when the
        // Safari toolbar collapses on scroll, the revealed strip showed the
        // page underneath. No `bottom` avoids that.
        top: overlay ? 0 : undefined,
        left: overlay ? 0 : undefined,
        right: overlay ? 0 : undefined,
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
          <div style={{
            position: "sticky",
            top: 0,
            zIndex: 5,
            // Bleed past the content wrapper's 26px/30px padding so the bar
            // spans the full width and pins flush to the top of the overlay.
            margin: "-26px -30px 18px",
            padding: "20px 30px 12px",
            background: C.canvas,
            borderBottom: `1px solid ${C.line}`,
          }}>
            <Button
              onClick={clearSelection}
              variant="default"
              size="xs"
              radius="xl"
              leftSection={<span style={{ fontSize: 13 }}>←</span>}
              styles={{ root: { marginBottom: 12, fontFamily: BODY } }}
            >
              Back to navigation
            </Button>
            {/* Section switcher, sticky so it stays reachable while scrolling a
                long dua. The sidebar tabs are hidden behind this overlay on
                mobile, so these stand in for them. pickLens clears the open
                item, so tapping a tab also closes the overlay and lands on that
                section's overview. */}
            <LensTabs value={lens} onChange={pickLens} />
          </div>
        ) : selected ? (
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
            <ActionIcon
              onClick={clearSelection}
              variant="default"
              radius="xl"
              size={30}
              aria-label="Close"
            >
              <span style={{ fontSize: 13 }}>✕</span>
            </ActionIcon>
          </div>
        ) : null}

        {renderDetailBody()}
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
        lens={lens} setLens={pickLens}
        groups={groups}
        openGroup={openGroup} setOpenGroup={setOpenGroup}
        selected={selected}
        onSelectDua={selectDua}
        onSelectRoutine={selectRoutine}
        isNarrow={isNarrow}
        script={script}
        hidden={isNarrow && !!selected}
        onExitToLanding={onExitToLanding}
      />
      {!isNarrow && detailPane(false)}
      {isNarrow && selected && detailPane(true)}
    </div>
  );
}
