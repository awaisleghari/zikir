# Editing Zikir's content

This is the practical guide. Every dua, every routine, every category lives in a JSON file under `src/content/`. You don't need to know React or JavaScript to edit them — only to be careful with commas and quotes.

The fastest path: **edit any of these files directly on github.com**. Click the pencil icon, make the change, commit. Cloudflare rebuilds and redeploys in ~30 seconds.

---

## The four files

| File              | What's in it                                                                 |
| ----------------- | ---------------------------------------------------------------------------- |
| `duas.json`       | Every supplication. An array of objects, one per dua.                        |
| `adhkar.json`     | Standalone adhkar (e.g. Sayyid al-Istighfar) that routines pull from.        |
| `routines.json`   | Devotional sequences — ordered steps with repetition counts.                 |
| `taxonomy.json`   | The lenses: moods, timings, source collections, and category labels.        |

---

## JSON: the rules of the road

JSON is strict and unforgiving. The five things that trip people up:

1. **Strings must be in double quotes**: `"title": "..."` — not single quotes, not curly “smart” quotes.
2. **No trailing commas**. The last item in an array or object has no comma after it. `[1, 2, 3]` not `[1, 2, 3,]`.
3. **Keys must be in double quotes**: `"title": "..."` not `title: "..."`.
4. **Special characters inside strings must be escaped**: a literal double quote becomes `\"`, a backslash becomes `\\`. Most prose doesn't hit this.
5. **Arabic, Urdu, transliteration with diacritics — all fine.** UTF-8 is the default; just paste them in.

If you make a syntax mistake, the build will fail and Cloudflare will show the error. The dev server (`npm run dev`) will too, in your terminal. Either way, fix the typo, commit, redeploy.

When in doubt, paste your file into [jsonlint.com](https://jsonlint.com) before committing — it tells you exactly which line is wrong.

---

## Schema: a single dua

This is the shape every entry in `duas.json` must have:

```json
{
  "id": "p1",
  "category": "provision",
  "moods": ["hopeful"],
  "timings": ["morning"],
  "use": "When you are searching for work",
  "title": "For Lawful Provision",
  "arabic": "اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ، وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ",
  "translit": "Allāhumma-kfinī biḥalālika ʿan ḥarāmika, wa aghninī bifaḍlika ʿamman siwāk",
  "translations": {
    "en": "O Allah, suffice me through what is lawful so I have no need of what is unlawful...",
    "ur": "اے اللہ! مجھے اپنی حلال روزی سے حرام سے بے نیاز کر دے..."
  },
  "source": "Tirmidhi 3563 · Ahmad 1319",
  "benefit": "One of the most recommended duas for those seeking employment..."
}
```

### Field-by-field

| Field          | Required | Notes                                                                                                                                |
| -------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `id`           | yes      | Short unique string. Used by routines to reference this dua. Never reuse, never reorder existing IDs. Examples: `m1`, `h2`, `p3`.    |
| `category`     | yes      | Must match a key in `taxonomy.json` → `categories`. E.g. `morning`, `provision`, `hardship`, `health`, `guidance`, `family`.        |
| `moods`        | yes      | Array of mood ids from the taxonomy. A dua can have several — it'll appear under each. Use `[]` if none apply.                       |
| `timings`      | yes      | Same idea as `moods`, drawn from `taxonomy.json` → `timings`. Use `[]` if none apply.                                                |
| `use`          | yes      | The mini-context line shown above the dua. Short, human. "When you face a real decision," not "Dua for important life choices."     |
| `title`        | yes      | The display title.                                                                                                                   |
| `arabic`       | yes      | Arabic text with diacritics. Paste from a trusted source.                                                                            |
| `translit`     | yes      | Romanized transliteration with proper diacritics (`ʿ`, `ʾ`, `ḥ`, `ṣ`, etc.).                                                         |
| `translations` | yes      | Object with one key per language. `en` is required (it's the fallback). Add `ur`, and any others — they appear in the language toggle. |
| `source`       | yes      | The attribution string. **The Sources lens reads this directly**: any dua whose `source` contains the word "Bukhari" automatically appears under Sahih al-Bukhari, etc. Use `·` (middle dot, U+00B7) as a separator. |
| `benefit`      | yes      | The "When to recite" note shown at the bottom of the detail view.                                                                    |

---

## Worked example 1: fixing a translation

You discover the Urdu translation for `m2` (Gratitude Upon Waking) has a missing comma. To fix it:

1. Open `src/content/duas.json` on github.com.
2. Click the pencil (Edit) icon.
3. Find the entry where `"id": "m2"`.
4. Find the `"ur"` line inside `"translations"`.
5. Make the fix, exactly as you would in a text document. The double quotes around the string must stay.
6. Scroll to the bottom, commit with a message like `Fix Urdu punctuation for m2`.
7. Wait ~30 seconds. Cloudflare rebuilds; refresh the site.

That's the entire workflow for any field on any dua. Veracity edits — adjusting a transliteration diacritic, refining a translation, correcting a source citation — all follow the same pattern.

---

## Worked example 2: adding a new dua

Suppose you want to add a dua "For Travel" sourced from Sahih Muslim.

**Step 1:** Decide on an `id`. Use a short prefix that hints at the category. `tr1` for travel #1 is fine.

**Step 2:** If the dua should appear under a category, mood, or timing that doesn't exist yet, add it to `taxonomy.json` first. (See example 3 below.)

**Step 3:** Open `duas.json`. Find a spot near related duas — order doesn't affect the app, but keeping related duas grouped helps editing.

**Step 4:** Add the new object. **Critical: put a comma after the previous entry's `}` and no comma after the new one if it's the last in the file.**

```json
  {
    "id": "tr1",
    "category": "travel",
    "moods": ["protection"],
    "timings": [],
    "use": "When setting out on a journey",
    "title": "Dua for Travel",
    "arabic": "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا...",
    "translit": "Subḥānal-ladhī sakhkhara lanā hādhā...",
    "translations": {
      "en": "Glory to Him who has subjected this transport to us...",
      "ur": "پاک ہے وہ جس نے اسے ہمارے قابو میں دیا..."
    },
    "source": "Sahih Muslim 1342",
    "benefit": "Recited on setting out — by car, by plane, by any conveyance."
  }
```

**Step 5:** Commit. The dua will now appear:
- Under the Sources lens → Sahih Muslim (automatic, from the `source` string)
- Under the Moods lens → Seeking Protection
- In any routine that references `"tr1"`

---

## Worked example 3: adding a new mood (or timing, or source)

Open `taxonomy.json`. Each top-level key is an array (or, for `categories`, an object). To add a new mood "Travel & Journey":

```json
  "moods": [
    { "id": "anxious",    "label": "Anxious & Fearful",  "color": "#3dd0c4" },
    ...,
    { "id": "travel",     "label": "Travel & Journey",   "color": "#ffd166" }
  ],
```

Pick any hex color you like — it'll theme everything related to that mood (the group header in the sidebar, the dua detail accents, the language toggle borders). Then any dua with `"moods": ["travel"]` will appear under it.

Adding a new **timing** or **source** works identically. For a new **source**, the `match` field is what gets searched (case-insensitive) inside dua `source` strings to determine membership — `"match": "Nasai"` will catch duas whose source contains "Nasai".

Adding a new **category**: open `taxonomy.json` → `categories` and add a key/value pair: `"travel": "Travel & Journeys"`. The key is what you put in a dua's `category` field; the value is what appears in the UI.

---

## Worked example 4: adding a routine

Open `routines.json`. A routine is an ordered list of steps; each step references either a dua (from `duas.json`) or a dhikr (from `adhkar.json`) by `id`, plus a repetition count.

To add a "Friday Routine" that sends 100 blessings on the Prophet ﷺ along with seeking forgiveness:

```json
  {
    "id": "friday",
    "title": "Friday Routine",
    "arabic": "ذِكْرُ ٱلْجُمُعَةِ",
    "color": "#2cb67d",
    "when": "On Friday, especially between Asr and Maghrib",
    "desc": "The sunnah of multiplying blessings on the Prophet ﷺ on the day of Jumuʿah.",
    "steps": [
      { "ref": "durood",    "count": 100 },
      { "ref": "istighfar", "count": 3 }
    ]
  }
```

The `ref` must match an `id` somewhere in `duas.json` or `adhkar.json`. If it doesn't, the app will warn you in the browser console: `[Zikir] Routine "friday" references unknown id "..."`.

---

## When you make a mistake

The validator runs every time the page loads. Open your browser's DevTools (Cmd+Opt+I on Mac, F12 on Windows), click the **Console** tab, and look for lines starting with `[Zikir]`. It will tell you about:

- Duas with a `moods` or `timings` value that doesn't exist in the taxonomy
- Duas with a `category` that doesn't exist
- Routines that reference an unknown `id`
- Duas missing required fields

Fix the issue in the JSON, commit, redeploy.

---

## A note on authenticity

The first principle of Zikir is authenticity. Before adding a new dua:

- Confirm it appears in a recognized collection (the Quran, the six canonical hadith collections, or another reliably-graded source).
- Cite the specific reference number, not just the book name.
- If a dua's chain is graded weak (`ḍaʿīf`), it doesn't belong here. When in doubt, omit.

For sourcing, sunnah.com is the standard reference. For grading, IslamQA and the published works of major muḥaddithīn are useful.

The same standard applies to translations and transliterations. If you're uncertain about a translation, mark the dua's `en` text with a translation you've verified against a trusted English edition (e.g. Yusuf Ali, Sahih International, Maulana Wahiduddin Khan), and add a note in the commit message about where it came from.
