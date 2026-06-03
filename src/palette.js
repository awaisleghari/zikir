// ─── Palette ─────────────────────────────────────────────────────────────────
// Single source of truth for the app's color world. Two worlds are kept here so
// they can be compared. Exactly one `export const C` block is active; the other
// is commented out. Every surface (App.jsx, SectionOverview.jsx) reads these
// tokens, so flipping which block is active recolors the whole app.
//
// TO SWITCH WORLDS: comment out the active `C` block and uncomment the other.
// Currently active: Emerald & gold.  Alternate (commented): Celestial dark.
//
// LENS_COLOR (the per-section accent colors) is shared by both worlds.

export const LENS_COLOR = {
  moods:    "#e58fa0",  // rose
  timings:  "#f5b14e",  // amber
  sources:  "#3dd0c4",  // teal
  routines: "#7f5af0",  // violet
};

// ─── ACTIVE: Emerald & gold ───────────────────────────────────────────────────
// A deep emerald night with warm ivory ink and gold as the signature accent.
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

// ─── ALTERNATE: Celestial dark ────────────────────────────────────────────────
// A deep near-black navy with warm ivory ink and the landing's pale gold as the
// signature accent. To use it, comment out the Emerald & gold `C` block above
// and uncomment this one.
/*
export const C = {
  void:      "#04050a",
  bg:        "#090b14",
  panel:     "#11131e",
  surface:   "#1b1f30",
  surfaceHi: "#262b40",
  text:      "#ece9e1",
  textSub:   "#bcc4dc",
  textMuted: "#888fb0",
  textFaint: "#5d6280",
  line:      "rgba(236,220,166,0.12)",
  lineHi:    "rgba(236,220,166,0.30)",
  gold:      "#ecdca6",
  goldSoft:  "#f3e8c2",
  goldDeep:  "#c9b577",
};
*/
