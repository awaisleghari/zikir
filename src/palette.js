// ─── Palette ─────────────────────────────────────────────────────────────────
// Single source of truth for the app's color world. Every surface reads from
// these tokens (App.jsx, SectionOverview.jsx, and theme.js for Mantine), so
// changing the whole palette is a one-file edit here.
//
// Current world: Emerald & Gold. A deep emerald night with warm ivory ink and
// gold as the signature accent. To return to the earlier "celestial dark"
// (navy) world, swap the values below; the structure of every component stays
// the same because nothing hardcodes a base color.
//
//   celestial dark, for reference:
//     bg #16161a · panel #1a1f33 · surface #232946 · text #fffffe
//     textSub #b8c1ec · line rgba(184,193,236,0.12)

export const C = {
  void:      "#020805",  // deepest shadow, near-black green
  bg:        "#0a1611",  // app canvas, deep emerald night
  panel:     "#0e1d16",  // sidebar / raised panel
  surface:   "#163026",  // cards, hover base
  surfaceHi: "#1e3d30",  // stronger hover / active surface
  text:      "#f2efe4",  // warm ivory ink
  textSub:   "#bdcbb9",  // muted sage-ivory
  textMuted: "#8ea395",  // mid sage
  textFaint: "#647668",  // faint sage
  line:      "rgba(217,184,92,0.12)",  // gold hairline
  lineHi:    "rgba(217,184,92,0.32)",  // gold hairline, stronger
  gold:      "#d9b85c",  // signature gold
  goldSoft:  "#ead29a",  // light gold, for text and glow
  goldDeep:  "#b8923f",  // deep gold, for borders
};

// One signature color per top-level tab (lens). Kept vivid so the four sections
// stay distinct against the emerald base. The sources teal sits closest to the
// base hue; revisit if it reads as too similar on the deployed site.
export const LENS_COLOR = {
  moods:    "#e58fa0",  // rose
  timings:  "#f5b14e",  // amber
  sources:  "#3dd0c4",  // teal
  routines: "#7f5af0",  // violet
};
