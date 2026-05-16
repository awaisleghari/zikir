import { useState, useEffect } from "react";

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

  /* Vertical — used on desktop. Achieved by rotating the horizontal track,
     which is more reliable across browsers than the orient="vertical" attr. */
  .zk-slider.v {
    width: 160px;
    height: 18px;
    transform: rotate(-90deg);
    transform-origin: center;
  }
  .zk-slider.v::-webkit-slider-runnable-track {
    height: 2px;
    background: rgba(184,193,236,0.18);
    border-radius: 999px;
  }
  .zk-slider.v::-moz-range-track {
    height: 2px;
    background: rgba(184,193,236,0.18);
    border-radius: 999px;
  }

  /* Thumb — accent-colored disc with a subtle halo on hover/active */
  .zk-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 999px;
    background: var(--zk-accent, #b8c1ec);
    border: none;
    margin-top: -6px;
    box-shadow: 0 0 0 1px rgba(0,0,0,0.4), 0 0 12px var(--zk-accent-glow, transparent);
    transition: box-shadow 0.18s ease, transform 0.18s ease;
  }
  .zk-slider::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 999px;
    background: var(--zk-accent, #b8c1ec);
    border: none;
    box-shadow: 0 0 0 1px rgba(0,0,0,0.4), 0 0 12px var(--zk-accent-glow, transparent);
    transition: box-shadow 0.18s ease, transform 0.18s ease;
  }
  .zk-slider:hover::-webkit-slider-thumb,
  .zk-slider:active::-webkit-slider-thumb {
    transform: scale(1.15);
    box-shadow: 0 0 0 1px rgba(0,0,0,0.4), 0 0 18px var(--zk-accent, #b8c1ec);
  }
  .zk-slider:hover::-moz-range-thumb,
  .zk-slider:active::-moz-range-thumb {
    transform: scale(1.15);
    box-shadow: 0 0 0 1px rgba(0,0,0,0.4), 0 0 18px var(--zk-accent, #b8c1ec);
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

function Sidebar({
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
}

function DuaDetail({ dua, lang, setLang, speaking, speak, stop, showT, setShowT, ttsOk, script, setScript, zoom, setZoom, isNarrow }) {
  const accent = duaColor(dua);
  const isUr = lang === "ur";
  const translation = translateOf(dua, lang);
  const z = zoom / 100;

  return (
    <div className="detailIn" style={{ maxWidth: 620, margin: "0 auto" }}>
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

      {/* Arabic — no container. Words float on the page, each carrying a
          subtle accent-colored halo via text-shadow. The hue is the dua's
          mood color at very low intensity, so words feel luminous rather
          than tinted. On recitation, the halo gently pulses up and back. */}
      <div
        className={speaking ? "speaking-glow" : ""}
        style={{
          "--glow": rgba(accent, 0.45),
          "--glow-soft": rgba(accent, 0.22),
          fontFamily: arabicFont(script),
          fontSize: `${2.2 * arabicScale(script) * z}rem`,
          lineHeight: script === "indopak" ? 2.7 : 2.45,
          color: C.text,
          fontFeatureSettings: "'liga' 1, 'calt' 1",
          textAlign: "center",
          direction: "rtl",
          padding: "20px 0 34px",
          transition: "font-family 0.2s ease, font-size 0.18s ease",
        }}
      >
        {dua.arabic.split(/\s+/).filter(Boolean).map((word, i) => (
          // Each word renders inside its own span so the text-shadow halo
          // belongs to the word, not the whole block — giving the floating
          // quality. <wbr> after each word would force a break-here hint;
          // we instead rely on natural Arabic line-break behaviour and use
          // a thin space to keep word boundaries clean.
          <span
            key={i}
            className="zikir-word"
            style={{
              display: "inline-block",
              padding: "0 0.18em",
            }}
          >
            {word}
          </span>
        ))}
      </div>

      {/* Script selector — small, discreet, sits right under the Arabic block */}
      <ScriptSelector
        script={script}
        setScript={setScript}
        accent={accent}
      />

      {/* Mobile-only: font-size slider directly below the script selector.
          Desktop gets the vertical rail rendered by the parent detail pane. */}
      {isNarrow && (
        <FontSizeSlider zoom={zoom} setZoom={setZoom} accent={accent} />
      )}

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
        <button
          onClick={() => (speaking ? stop() : speak(dua.arabic))}
          disabled={!ttsOk}
          style={{
            background: speaking ? accent : rgba(accent, 0.14),
            border: `1px solid ${accent}`,
            borderRadius: 999, padding: "9px 18px",
            cursor: ttsOk ? "pointer" : "not-allowed",
            color: speaking ? C.void : accent,
            fontSize: 13, fontWeight: 600, fontFamily: BODY,
            display: "inline-flex", alignItems: "center", gap: 8,
            opacity: ttsOk ? 1 : 0.5, transition: "all 0.15s",
          }}
        >
          <span style={{ fontSize: 11 }}>{speaking ? "■" : "▶"}</span>
          {speaking ? "Stop" : "Listen in Arabic"}
        </button>

        <button
          onClick={() => setShowT(!showT)}
          style={{
            background: "transparent", border: `1px solid ${C.line}`,
            borderRadius: 999, padding: "9px 14px", cursor: "pointer",
            color: showT ? C.textSub : C.textFaint,
            fontSize: 12, fontFamily: BODY,
          }}
        >
          {showT ? "— Hide" : "+ Show"} transliteration
        </button>

        <div style={{ display: "flex", marginLeft: "auto" }}>
          {[{ id: "en", label: "EN" }, { id: "ur", label: "اردو" }].map((l, i) => (
            <button
              key={l.id}
              onClick={() => setLang(l.id)}
              style={{
                background: lang === l.id ? rgba(accent, 0.14) : "transparent",
                border: `1px solid ${lang === l.id ? rgba(accent, 0.5) : C.line}`,
                borderLeft: i > 0 ? "none" : undefined,
                borderRadius: i === 0 ? "999px 0 0 999px" : "0 999px 999px 0",
                padding: "8px 14px", cursor: "pointer",
                color: lang === l.id ? C.text : C.textFaint,
                fontSize: 12, fontWeight: lang === l.id ? 600 : 400,
                fontFamily: l.id === "ur" ? ARABIC_URDU : BODY,
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transliteration — roman (not italic), slightly muted color for
          differentiation. Source Serif 4 holds up well at this size. */}
      {showT && (
        <div style={{
          fontSize: 15, color: C.textSub,
          fontFamily: BODY, lineHeight: 1.75, marginBottom: 18,
          padding: "14px 0",
          borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}`,
          letterSpacing: "0.005em",
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
function ScriptSelector({ script, setScript, accent }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: 6, marginBottom: 18,
    }}>
      <span style={{
        fontFamily: BODY, fontSize: 10, color: C.textFaint,
        letterSpacing: "0.12em", textTransform: "uppercase",
        marginRight: 4,
      }}>
        Script
      </span>
      {Object.values(SCRIPTS).map((s, i, all) => {
        const active = s.id === script;
        return (
          <button
            key={s.id}
            onClick={() => setScript(s.id)}
            title={s.sublabel}
            style={{
              background: active ? rgba(accent, 0.14) : "transparent",
              border: `1px solid ${active ? rgba(accent, 0.5) : C.line}`,
              borderLeft: i > 0 ? "none" : `1px solid ${active ? rgba(accent, 0.5) : C.line}`,
              borderRadius:
                i === 0 ? "999px 0 0 999px" :
                i === all.length - 1 ? "0 999px 999px 0" : 0,
              padding: "6px 12px",
              cursor: "pointer",
              color: active ? C.text : C.textFaint,
              fontSize: 11.5, fontWeight: active ? 600 : 400,
              fontFamily: BODY, letterSpacing: "0.02em",
              transition: "all 0.15s",
            }}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

// Font-size slider. Range 75–175 (% of baseline Arabic size). Two layouts:
//   • vertical (`vertical: true`)   — desktop rail, parent positions it
//   • horizontal (default)          — mobile, inline below the script selector
// The accent prop themes the thumb color and its glow.
function FontSizeSlider({ zoom, setZoom, accent, vertical = false }) {
  const cssVars = {
    "--zk-accent": accent,
    "--zk-accent-glow": rgba(accent, 0.4),
  };

  if (vertical) {
    // Vertical: a tight stack containing a label, the rotated track, and the
    // current percentage. Total footprint is narrow so it docks cleanly.
    return (
      <div style={{
        ...cssVars,
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 14, userSelect: "none",
      }}>
        <span style={{
          fontFamily: BODY, fontSize: 9.5, color: C.textFaint,
          letterSpacing: "0.18em", textTransform: "uppercase",
          writingMode: "vertical-rl", transform: "rotate(180deg)",
        }}>
          Size
        </span>
        {/* The rotated track lives inside a fixed-height container so the
            rotation doesn't break the parent flow. */}
        <div style={{
          height: 160, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <input
            type="range"
            min={75} max={175} step={1}
            value={zoom}
            onChange={(e) => setZoom(parseInt(e.target.value, 10))}
            className="zk-slider v"
            aria-label="Arabic font size"
          />
        </div>
        <span style={{
          fontFamily: BODY, fontSize: 11, color: accent,
          letterSpacing: "0.04em", fontVariantNumeric: "tabular-nums",
          minWidth: 38, textAlign: "center",
        }}>
          {zoom}%
        </span>
      </div>
    );
  }

  // Horizontal: inline row with a label on the left, slider in the middle,
  // and the current percentage on the right.
  return (
    <div style={{
      ...cssVars,
      display: "flex", alignItems: "center", gap: 14,
      marginBottom: 18, padding: "0 4px",
    }}>
      <span style={{
        fontFamily: BODY, fontSize: 10, color: C.textFaint,
        letterSpacing: "0.12em", textTransform: "uppercase",
        flexShrink: 0,
      }}>
        Size
      </span>
      <input
        type="range"
        min={75} max={175} step={1}
        value={zoom}
        onChange={(e) => setZoom(parseInt(e.target.value, 10))}
        className="zk-slider h"
        style={{ flex: 1 }}
        aria-label="Arabic font size"
      />
      <span style={{
        fontFamily: BODY, fontSize: 11, color: accent,
        letterSpacing: "0.04em", fontVariantNumeric: "tabular-nums",
        flexShrink: 0, minWidth: 38, textAlign: "right",
      }}>
        {zoom}%
      </span>
    </div>
  );
}

function RoutineStep({ step, idx, count, target, onTap, accent, lang, showT, script, zoom }) {
  const done = count >= target;
  const isUr = lang === "ur";
  const z = zoom / 100;
  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${done ? rgba(accent, 0.5) : C.line}`,
      borderRadius: 16,
      padding: "20px 20px 22px",
      marginBottom: 12,
      transition: "border-color 0.25s ease",
      position: "relative",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
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
        fontSize: `${1.6 * arabicScale(script) * z}rem`,
        lineHeight: script === "indopak" ? 2.4 : 2.2,
        direction: "rtl", textAlign: "center", color: C.text,
        marginBottom: showT ? 10 : 6,
        fontFeatureSettings: "'liga' 1, 'calt' 1",
        transition: "font-family 0.2s ease, font-size 0.18s ease",
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
  const z = zoom / 100;

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
    <div className="detailIn" style={{ maxWidth: 620, margin: "0 auto" }}>
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
          fontSize: `${1.5 * arabicScale(script) * z}rem`,
          color: accent, marginLeft: "auto", lineHeight: 1,
          transition: "font-size 0.18s ease",
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

      <ScriptSelector script={script} setScript={setScript} accent={accent} />

      {/* Mobile-only horizontal slider. Desktop gets the vertical rail. */}
      {isNarrow && (
        <FontSizeSlider zoom={zoom} setZoom={setZoom} accent={accent} />
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        <button
          onClick={() => setShowT(!showT)}
          style={{
            background: "transparent", border: `1px solid ${C.line}`,
            borderRadius: 999, padding: "7px 13px", cursor: "pointer",
            color: showT ? C.textSub : C.textFaint, fontSize: 11.5, fontFamily: BODY,
          }}
        >
          {showT ? "— Hide" : "+ Show"} transliteration
        </button>
        <div style={{ display: "flex", marginLeft: "auto" }}>
          {[{ id: "en", label: "EN" }, { id: "ur", label: "اردو" }].map((l, i) => (
            <button
              key={l.id}
              onClick={() => setLang(l.id)}
              style={{
                background: lang === l.id ? rgba(accent, 0.14) : "transparent",
                border: `1px solid ${lang === l.id ? rgba(accent, 0.5) : C.line}`,
                borderLeft: i > 0 ? "none" : undefined,
                borderRadius: i === 0 ? "999px 0 0 999px" : "0 999px 999px 0",
                padding: "7px 13px", cursor: "pointer",
                color: lang === l.id ? C.text : C.textFaint,
                fontSize: 11.5, fontWeight: lang === l.id ? 600 : 400,
                fontFamily: l.id === "ur" ? ARABIC_URDU : BODY,
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {steps.map((s, i) => (
        <RoutineStep
          key={s.id}
          step={s} idx={i}
          count={counts[i]} target={s.count}
          onTap={() => tap(i)}
          accent={accent} lang={lang} showT={showT} script={script}
          zoom={zoom}
        />
      ))}

      {allDone && (
        <div className="fadeIn" style={{
          background: rgba(accent, 0.1),
          border: `1px solid ${rgba(accent, 0.4)}`,
          borderRadius: 14, padding: "18px 20px", textAlign: "center",
          marginTop: 4,
        }}>
          <div style={{
            fontFamily: arabicFont(script),
            fontSize: `${1.5 * arabicScale(script) * z}rem`,
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

  // Arabic-text zoom preference. 100 = baseline. Range clamped to 75–175 so
  // it never goes absurd in either direction. Persisted like the script.
  const [zoom, setZoomRaw] = useState(() => {
    if (typeof window === "undefined") return 100;
    try {
      const n = parseInt(window.localStorage.getItem("zikir.zoom"), 10);
      if (Number.isFinite(n) && n >= 75 && n <= 175) return n;
    } catch {}
    return 100;
  });
  const setZoom = (n) => {
    const clamped = Math.min(175, Math.max(75, Math.round(n)));
    setZoomRaw(clamped);
    try { window.localStorage.setItem("zikir.zoom", String(clamped)); } catch {}
  };

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

  const groups = lens === "routines" ? [] : groupsForLens(lens);
  useEffect(() => {
    if (lens !== "routines" && groups.length) setOpenGroup(groups[0].id);
    else setOpenGroup(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lens]);

  const speak = (text) => {
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
  };
  const stop = () => { window.speechSynthesis?.cancel(); setSpeaking(false); };

  const selectDua = (d) => { stop(); setSelected({ type: "dua", id: d.id, dua: d }); };
  const selectRoutine = (r) => { stop(); setSelected({ type: "routine", id: r.id, routine: r }); };
  const clearSelection = () => { stop(); setSelected(null); };

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && selected) clearSelection(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

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

      {/* Desktop-only vertical font-size rail. Pinned to the right edge of
          the detail pane, vertically centered. Only renders when something
          is selected, so the welcome screen stays uncluttered. */}
      {!overlay && !isNarrow && selected && (
        <div style={{
          position: "fixed",
          right: 24,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 5,
        }}>
          <FontSizeSlider
            zoom={zoom}
            setZoom={setZoom}
            accent={detailAccent}
            vertical
          />
        </div>
      )}
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
