import { Box, Stack, Group, Title, Text, SimpleGrid, UnstyledButton } from "@mantine/core";
import { C, LENS_COLOR } from "./palette.js";

// ─── SectionOverview ──────────────────────────────────────────────────────────
// Shown when a lens (Moods, Timings, Sources, Routines) is active but the user
// has not yet opened a specific dua or routine. It explains what the section
// is and how to use it before any prayer appears, replacing the old behavior
// where entering a lens dropped you straight into the first category's list.
//
// Two variants:
//   "panel"  — the desktop right-hand pane. Full intro plus a grid of cards
//              (categories for moods/timings/sources, routines for routines).
//              Picking a category card opens that group in the sidebar; picking
//              a routine card opens the routine.
//   "inline" — the top of the mobile sidebar. Intro text only. The category
//              list that already lives below it in the sidebar serves as the
//              cards, so they are not duplicated here.
//
// Props:
//   lens            — "moods" | "timings" | "sources" | "routines"
//   groups          — [{ id, label, color, duas }]  (empty for routines)
//   routines        — the routines array (used only for the routines lens)
//   onPickGroup(id) — open a category group (sidebar)
//   onSelectRoutine(routine)
//   variant         — "panel" | "inline"

// Palette pulled from the shared tokens (src/palette.js) so the overview tracks
// the app's color world automatically.
const INK = C.text;
const INK_SUB = C.textSub;
const INK_FAINT = C.textMuted;
const LINE = C.line;
const PANEL = C.panel;
const ARABIC_FONT = "'Noto Nastaliq Urdu', 'Amiri', 'Scheherazade New', serif";

// hex (#rrggbb) + alpha -> rgba() string, for accent tints.
function withAlpha(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// Per-lens copy. Written to avoid em dashes, choppy phrasing, and marketing
// patterns. The honorific ﷺ is reserved for the Prophet Muhammad.
const LENS_COPY = {
  moods: {
    label: "Moods",
    glyph: "♡",
    accent: LENS_COLOR.moods,
    tagline: "Find a dua by the state of your heart.",
    what: "These supplications are gathered by the condition of the heart. When you are anxious, grieving, in pain, or full of gratitude, you can turn to words that the Quran and the Sunnah already gave for that very state.",
    how: "Choose the feeling that sits closest to where you are right now, then read slowly through the duas collected beneath it. Begin with whichever one settles you, and return to the others when there is time.",
  },
  timings: {
    label: "Timings",
    glyph: "☾",
    accent: LENS_COLOR.timings,
    tagline: "Find a dua by the hour of your day.",
    what: "Here the supplications are arranged around the hours of the day, from the moment you wake to the close of the evening. They follow the practice of meeting each part of the day with its own remembrance.",
    how: "Open the time of day you are in and read what belongs to it. The morning and evening collections are the fullest, and they reward an unhurried sitting.",
  },
  sources: {
    label: "Library",
    glyph: "❖",
    accent: LENS_COLOR.sources,
    tagline: "Browse by source, or by the prophet who made the dua.",
    what: "The Library opens onto the same collection two ways. Under Sources, the duas are grouped by the work that preserved them, from the Quran itself to the major books of hadith such as Bukhari, Muslim, and Tirmidhi. Under Dua of the Prophets, the supplications the Quran records from the prophets are gathered under each prophet's name. Every entry carries its reference so you can trace it to its origin.",
    how: "Open Sources to study by collection, or when you already know the reference you are looking for. Open Dua of the Prophets to read each prophet's supplication in turn. Choose a heading to expand it, then a name beneath it to see the duas it holds.",
  },
  routines: {
    label: "Routines",
    glyph: "✦",
    accent: LENS_COLOR.routines,
    tagline: "Short sequences meant to be recited together.",
    what: "A routine is a sequence of supplications recited together, in order, a set number of times. Each one gathers several duas into a single sitting, such as the protections of the morning or the salutations sent upon the Prophet ﷺ.",
    how: "Choose a routine to see its steps and the count for each. Move through them in the order given, and let the repetition steady the heart rather than hurrying to the end.",
  },
};

function OverviewCard({ accent, title, meta, arabic, onClick }) {
  return (
    <UnstyledButton
      onClick={onClick}
      style={{
        display: "block",
        padding: "15px 16px",
        borderRadius: 14,
        background: withAlpha(accent, 0.07),
        border: `1px solid ${withAlpha(accent, 0.32)}`,
        borderLeft: `2px solid ${accent}`,
        transition: "background 0.16s ease, transform 0.16s ease",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = withAlpha(accent, 0.14); }}
      onMouseLeave={(e) => { e.currentTarget.style.background = withAlpha(accent, 0.07); }}
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap" gap={10}>
        <Text component="span" style={{ color: INK, fontSize: 16, fontWeight: 500, lineHeight: 1.25 }}>
          {title}
        </Text>
        {arabic ? (
          <Text component="span" dir="rtl" style={{ fontFamily: ARABIC_FONT, color: withAlpha(accent, 0.95), fontSize: 16, lineHeight: 1.2, whiteSpace: "nowrap" }}>
            {arabic}
          </Text>
        ) : null}
      </Group>
      {meta ? (
        <Text component="span" style={{ display: "block", color: INK_FAINT, fontSize: 12.5, marginTop: 5, lineHeight: 1.45 }}>
          {meta}
        </Text>
      ) : null}
    </UnstyledButton>
  );
}

export default function SectionOverview({
  lens, groups = [], sections = [], routines = [], onPickGroup, onSelectRoutine, variant = "panel",
}) {
  const copy = LENS_COPY[lens];
  if (!copy) return null;

  const inline = variant === "inline";

  const intro = (
    <Stack gap={inline ? 8 : 14} style={{ maxWidth: 620 }}>
      <Group gap={10} align="center">
        <span style={{ color: copy.accent, fontSize: inline ? 15 : 18 }}>{copy.glyph}</span>
        <Title
          order={1}
          style={{ color: INK, fontSize: inline ? "1.5rem" : "2.4rem", letterSpacing: "-0.02em", lineHeight: 1.05 }}
        >
          {copy.label}
        </Title>
      </Group>

      <Text style={{ color: copy.accent, fontStyle: "italic", fontSize: inline ? 13.5 : 15.5, lineHeight: 1.5 }}>
        {copy.tagline}
      </Text>

      <Text style={{ color: INK_SUB, fontSize: inline ? 14 : 16, lineHeight: 1.72 }}>
        {copy.what}
      </Text>

      <Box
        style={{
          borderLeft: `2px solid ${withAlpha(copy.accent, 0.5)}`,
          paddingLeft: 14,
          background: withAlpha(copy.accent, 0.04),
          borderRadius: "0 8px 8px 0",
          padding: inline ? "8px 12px" : "10px 14px",
        }}
      >
        <Text style={{ color: INK_FAINT, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
          How to use it
        </Text>
        <Text style={{ color: INK_SUB, fontSize: inline ? 13.5 : 15, lineHeight: 1.65 }}>
          {copy.how}
        </Text>
      </Box>
    </Stack>
  );

  // Mobile: intro only. The sidebar's own category/routine list (rendered
  // below this in the sidebar) is the navigation, so cards are not repeated.
  if (inline) {
    return (
      <Box style={{ padding: "6px 4px 14px", borderBottom: `1px solid ${LINE}`, marginBottom: 10 }}>
        {intro}
      </Box>
    );
  }

  // Desktop panel: intro plus a grid of entry-point cards.
  const cards = lens === "routines"
    ? routines.map((r) => (
        <OverviewCard
          key={r.id}
          accent={r.color}
          title={r.title}
          arabic={r.arabic}
          meta={r.when}
          onClick={() => onSelectRoutine?.(r)}
        />
      ))
    : groups.map((g) => (
        <OverviewCard
          key={g.id}
          accent={g.color}
          title={g.label}
          meta={`${g.duas.length} ${g.duas.length === 1 ? "dua" : "duas"}`}
          onClick={() => onPickGroup?.(g.id)}
        />
      ));

  // The Library lens nests one level deeper: rather than a single grid, it
  // shows each subcategory ("Sources", "Dua of the Prophets") as its own
  // labeled block of cards. Picking a card opens that leaf in the sidebar.
  const begin = lens === "sources" ? (
    <Stack gap={24}>
      {sections.map((section) => (
        <Box key={section.id}>
          <Text style={{ color: C.gold, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
            {section.label}
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={12} verticalSpacing={12}>
            {section.groups.map((g) => (
              <OverviewCard
                key={g.id}
                accent={g.color}
                title={g.label}
                meta={`${g.duas.length} ${g.duas.length === 1 ? "dua" : "duas"}`}
                onClick={() => onPickGroup?.(g.id)}
              />
            ))}
          </SimpleGrid>
        </Box>
      ))}
    </Stack>
  ) : (
    <Box>
      <Text style={{ color: INK_FAINT, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
        {lens === "routines" ? "Choose a routine" : "Choose where to begin"}
      </Text>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={12} verticalSpacing={12}>
        {cards}
      </SimpleGrid>
    </Box>
  );

  return (
    <Box className="detailIn" style={{ maxWidth: 760, margin: "0 auto" }}>
      <Stack gap={28}>
        {intro}
        {begin}
      </Stack>
    </Box>
  );
}
