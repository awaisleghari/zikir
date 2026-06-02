import { createTheme } from "@mantine/core";

// ─── Mantine theme tokens ─────────────────────────────────────────────────────
// Governs Mantine components (the section overviews, and anything built on
// Mantine from here on). The app's existing inline `C` palette in App.jsx is
// untouched; the two coexist while the redesign proceeds slice by slice.
//
// Fonts match the existing stack so English, Arabic, and Urdu stay consistent
// across old and new screens:
//   - body / UI:   Source Serif 4
//   - display:     Cormorant Garamond (headings)
// Arabic and Urdu shaping is a font-and-direction matter, applied per element
// where that text renders (App.jsx). A component library has no bearing on it,
// so script fonts deliberately stay out of this theme.

export const theme = createTheme({
  fontFamily: "'Source Serif 4', Georgia, serif",
  fontFamilyMonospace: "ui-monospace, SFMono-Regular, monospace",
  headings: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontWeight: "500",
  },
  defaultRadius: "md",
  primaryColor: "zikir",
  primaryShade: { light: 6, dark: 5 },
  colors: {
    // Violet primary, centered on the app's existing #7f5af0 accent.
    zikir: [
      "#f3eefe", "#e1d6fb", "#c4aef6", "#a784f1", "#9063ee",
      "#8150ec", "#7846eb", "#6537d1", "#592eba", "#4c26a3",
    ],
    // Dark surface scale tuned toward the app's navy
    // (bg #16161a, panel #1a1f33, surface #232946).
    dark: [
      "#e7e9f6", "#c8cdec", "#a8aed6", "#8086b0", "#5c628f",
      "#3c4168", "#2a2f4b", "#1a1f33", "#121420", "#0b0c12",
    ],
  },
});
