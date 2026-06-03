// ─── Palette ─────────────────────────────────────────────────────────────────
// Single source of truth for the app's color world. Two worlds are kept here so
// they can be compared. Exactly one `export const C` block is active; the other
// is commented out. Every surface (App.jsx, SectionOverview.jsx) reads these
// tokens, so flipping which block is active recolors the whole app.
//
// TO SWITCH WORLDS: comment out the active `C` block and uncomment the other.
// Currently active: Celestial dark.  Alternate (commented): Emerald & gold.
//
// LENS_COLOR (the per-section accent colors) is shared by both worlds.

export const LENS_COLOR = {
  moods:    "#e58fa0",  // rose
  timings:  "#f5b14e",  // amber
  sources:  "#3dd0c4",  // teal
  routines: "#7f5af0",  // violet
};

// ─── ACTIVE: Celestial dark ───────────────────────────────────────────────────
// A deep near-black navy with warm ivory ink and the landing's pale gold as the
// signature accent. Echoes the constellation landing.
export const C = {
  void:      "#04050a",  // deepest shadow
  bg:        "#090b14",  // app canvas, near-black navy
  panel:     "#11131e",  // sidebar / raised panel
  surface:   "#1b1f30",  // cards, hover base
  surfaceHi: "#262b40",  // stronger hover / active surface
  text:      "#ece9e1",  // warm ivory ink
  textSub:   "#bcc4dc",  // soft periwinkle
  textMuted: "#888fb0",  // mid slate
  textFaint: "#5d6280",  // faint slate
  line:      "rgba(236,220,166,0.12)",  // gold hairline
  lineHi:    "rgba(236,220,166,0.30)",  // gold hairline, stronger
  gold:      "#ecdca6",  // signature gold (the landing's pale gold)
  goldSoft:  "#f3e8c2",  // light gold, for text and glow
  goldDeep:  "#c9b577",  // deep gold, for borders
};

// ─── ALTERNATE: Emerald & gold ────────────────────────────────────────────────
// A deep emerald night with warm ivory ink and gold. To use it, comment out the
// Celestial dark `C` block above and uncomment this one.
/*
export const C = {
  void:      "#020805",
  bg:        "#0a1611",
  panel:     "#0e1d16",
  surface:   "#163026",
  surfaceHi: "#1e3d30",
  text:      "#f2efe4",
  textSub:   "#bdcbb9",
  textMuted: "#8ea395",
  textFaint: "#647668",
  line:      "rgba(217,184,92,0.12)",
  lineHi:    "rgba(217,184,92,0.32)",
  gold:      "#d9b85c",
  goldSoft:  "#ead29a",
  goldDeep:  "#b8923f",
};
*/
