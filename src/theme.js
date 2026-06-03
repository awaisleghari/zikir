import { createTheme } from "@mantine/core";

// ─── Mantine theme tokens ─────────────────────────────────────────────────────
// Governs Mantine components (the section overviews, and anything built on
// Mantine from here on). Colors track the Emerald & Gold world defined in
// src/palette.js; the raw token values there are the source of truth, and these
// Mantine scales are tuned to match. The app's inline `C` tokens and this theme
// coexist while the redesign proceeds.
//
// Fonts match the dashboard's UI typeface so English text stays consistent
// across old and new screens: Inter for body and headings (a clean,
// professional sans, the same default Mantine and Ant Design lean on). The
// elegant serif (Cormorant Garamond) is reserved in App.jsx for the brand
// wordmark and editorial italics, not used here. Arabic and Urdu shaping is a
// font-and-direction matter applied per element in App.jsx, not in this theme.

export const theme = createTheme({
  fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  fontFamilyMonospace: "ui-monospace, SFMono-Regular, monospace",
  headings: {
    fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontWeight: "600",
  },
  defaultRadius: "md",
  // Auto-pick a readable (dark/light) label color on filled/colored surfaces,
  // so active segments read well on gold and on the section colors.
  autoContrast: true,
  primaryColor: "gold",
  primaryShade: { light: 6, dark: 4 },
  colors: {
    // Signature gold (lightest at index 0, deepest at 9).
    gold: [
      "#fbf6e7", "#f3e7c3", "#ebd69d", "#e3c576", "#dcb557",
      "#d6a942", "#bf9239", "#98722d", "#705422", "#4b3815",
    ],
    // Emerald-night surface scale, tuned toward the app's base
    // (bg #0a1611, panel #0e1d16, surface #163026).
    dark: [
      "#dfe8db", "#bcccb7", "#95a892", "#6f876f", "#4d6650",
      "#324a37", "#1c3a2c", "#163026", "#0e1d16", "#0a1611",
    ],
  },
});
