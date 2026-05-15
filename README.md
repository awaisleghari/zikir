# Zikir

A browser-based collection of duas from the Quran and Sunnah, organized for moments of need.

**Live site:** _(filled in after first deploy)_

---

## What this is

A single-page React app. Static — no backend, no accounts, no analytics. All content lives in three JSON files under `src/content/`. Push to GitHub, Cloudflare Pages auto-builds and deploys.

The current stack is **React + Vite** (chosen for shipping speed). The longer roadmap moves to **Astro** for a zero-JS-by-default static site; this v0 is the starting point.

## Project layout

```
zikir/
├── README.md             ← this file
├── EDITING.md            ← how to edit content (read this when adding a dua)
├── package.json
├── vite.config.js
├── index.html
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx          ← React entry point
    ├── App.jsx           ← the whole app: layout, components, logic
    └── content/
        ├── duas.json     ← every supplication, one object per dua
        ├── adhkar.json   ← standalone adhkar referenced by routines
        ├── routines.json ← devotional sequences
        └── taxonomy.json ← moods, timings, sources, categories (+ colors)
```

The interesting files for editing are all under `src/content/`. **You should rarely need to touch `App.jsx`** to add or fix content.

## Running it locally

You need Node.js (any version from the last two years). On macOS: `brew install node`. On Windows: install from [nodejs.org](https://nodejs.org).

```bash
npm install        # one-time, installs dependencies
npm run dev        # starts a dev server at http://localhost:5173
```

Edits to any file in `src/` reload instantly in the browser.

```bash
npm run build      # creates a production build in dist/
npm run preview    # serves the production build locally to sanity-check it
```

## How content flows through the app

1. **`taxonomy.json`** defines the navigation lenses — every mood, timing, and source collection, each with its own colour.
2. **`duas.json`** lists every dua. Each dua carries one or more `moods` and `timings` tags that link it back to the taxonomy. The `source` string is matched (case-insensitive substring) against the `match` field of every source in the taxonomy — that's how a dua automatically appears under "Sahih al-Bukhari" without you tagging it.
3. **`adhkar.json`** holds standalone supplications that are too important to live inside a routine but aren't part of the main duas list (e.g. Sayyid al-Istighfar, Durood Ibrahimi).
4. **`routines.json`** assembles duas and adhkar into devotional sequences by referencing their `id`s.

When the app loads, it validates the content and prints any issues to the browser console — broken routine references, mood tags that don't exist in the taxonomy, etc. Open DevTools after editing and look for `[Zikir]` warnings.

**For full editing instructions and examples, see [`EDITING.md`](./EDITING.md).**

## Deploying to Cloudflare Pages

### One-time setup

**1. Create a GitHub repository.**

- Go to [github.com/new](https://github.com/new).
- Name it `zikir` (or whatever you prefer). Keep it public unless you have a reason not to.
- Do not check "Add a README" — we already have one.
- Click "Create repository".

**2. Push the code to GitHub.**

From the project folder, in your terminal:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/zikir.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username. If GitHub prompts for credentials, generate a [Personal Access Token](https://github.com/settings/tokens) with `repo` scope and paste it as the password.

**3. Connect Cloudflare Pages.**

- Sign in to the [Cloudflare dashboard](https://dash.cloudflare.com).
- In the left sidebar, click **Workers & Pages**.
- Click **Create** → **Pages** tab → **Connect to Git**.
- Authorize Cloudflare to read your GitHub repos (first time only).
- Pick the `zikir` repo.
- Configure build settings:

  | Field                   | Value           |
  | ----------------------- | --------------- |
  | Framework preset        | **Vite**        |
  | Build command           | `npm run build` |
  | Build output directory  | `dist`          |
  | Root directory          | _(leave blank)_ |

- Click **Save and Deploy**.

The first build takes about two minutes. When it finishes, Cloudflare gives you a URL like `zikir.pages.dev` (or a randomized subdomain if `zikir` is taken). That's your live site.

### After the initial setup

Every push to `main` triggers a new deploy automatically. You can also edit any file directly on github.com (click the pencil icon on a file, edit, commit) and Cloudflare will pick up the change within 30 seconds.

That is the most useful workflow for content edits: **github.com → edit a JSON file in the browser → commit → wait one minute → it's live.** No need to touch a terminal for content changes.

### Custom domain (optional, later)

In the Cloudflare Pages dashboard, open the project, go to **Custom domains** → **Set up a custom domain**. If your domain is already on Cloudflare, this takes about 30 seconds.

## Roadmap notes

- v0 (this repo): React + Vite single-page app. Ships now.
- v0.x (incremental): tune visuals, add duas/routines, refine UX.
- v1: migrate to Astro (`/dua/[id]` and `/routine/[id]` as static pages for shareability), URL-based language switching (`/en/`, `/ur/`), optional pre-recorded audio with Web Speech fallback.

## License

Content (the duas themselves) is drawn from the Quran and authenticated Sunnah and is freely distributed. Translations and editorial notes in this repo are released under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Code is released under the MIT License.
