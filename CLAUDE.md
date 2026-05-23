# CLAUDE.md — Intuitive Learning Platform

## What This Project Is

A static, zero-build-step web platform that teaches technical AI/ML topics through intuition-first, interactive learning. No backend. No npm. Pure HTML/CSS/JS (ES modules). Deployable on GitHub Pages or opened locally in a browser.

**Designed for practitioners** who want to understand the *why* and *how* of a concept before implementing it. Every topic follows a standardized structure enforced by templates, making it trivial to add new subjects (Transformers, RL, Attention, etc.).

## Repository Structure

```
Intutitive/
├── LICENSE                    (MIT)
├── CLAUDE.md                  (this file — how to work in this repo)
├── SOUL.md                    (mission, principles, voice)
├── SKILLS.md                  (custom Claude Code skills for this project)
├── ERROR.md                   (known error patterns and fixes)
├── RAG/                       (Obsidian source notes — reference only)
└── site/                      (all deliverable static files)
    ├── index.html             (landing page / topic browser)
    ├── design-system/         (tokens.css, components.css, animations.css)
    ├── js/                    (core, components, topics subdirectories)
    ├── topics/                (topic folders: rag/, transformers/, etc.)
    ├── _template/             (copy these when adding a new topic/concept)
    └── assets/                (icons, fonts)
```

## Running Locally

**Option 1: With a local HTTP server** (recommended)
```bash
cd site
python -m http.server 8080
# Then open http://localhost:8080 in your browser
```

**Option 2: Direct from filesystem** (ES modules will fail with CORS error)
```bash
# This will NOT work — see ERROR.md for why
open site/index.html
```

## File Naming Conventions

- **HTML files**: kebab-case (`ingestion-parsing.html`, `search-colbert.html`)
- **JS modules**: kebab-case (`pipeline-viz.js`, `progress-ring.js`)
- **CSS classes**: BEM-lite (`section--hook`, `callout callout--use`, `viz-container`)
- **Data files**: kebab-case + `-data.js` (`baseline-data.js`, `search-colbert-data.js`)
- **CSS custom properties**: lowercase with hyphens (`--color-accent-primary`, `--stage-ingest`)

## How to Add a New Concept Page

1. Read the source note in `RAG/` (or the topic equivalent) to extract TL;DR, When to use/not, Core ideas, Links, and Next steps
2. Copy `site/_template/concept-leaf.html` to `site/topics/<topic>/<concept-slug>.html`
3. Fill in all 7 sections (hook, why-it-matters, interactive-viz, core-mechanism, tradeoffs, connections, check-understanding)
4. Create `site/js/topics/<topic>/<concept-slug>-data.js` with:
   - `stages` array (for pipeline-viz) or other viz-specific config
   - `quiz` array (2–4 MC questions with correct index and explanation)
   - `comparison` object (if the section uses before/after slider)
5. Update `site/js/topics/<topic>/index.html` to add a link card for this concept
6. Update `site/js/topics/registry.js` to add the concept to the reading order array

## How to Add a New Topic

1. Create `site/topics/<topic>/` directory
2. Copy `site/_template/topic-hub.html` → `site/topics/<topic>/index.html`
3. Create `site/js/topics/<topic>/` directory
4. Create `site/js/topics/<topic>/<topic>-data.js` with the full pipeline stages
5. Create `site/js/topics/<topic>/` concept data files as you add pages
6. Add one entry to `site/js/topics/registry.js` with topic metadata
7. No build step. Refresh browser.

## Design System

All CSS values come from `site/design-system/tokens.css` — a single file of custom properties. No magic numbers anywhere else.

Key token files:
- `tokens.css` — 90+ custom properties (colors, fonts, spacing, shadows, timing)
- `components.css` — layout, header, sidebar, cards, callouts (uses tokens only)
- `animations.css` — keyframe library (uses tokens only)

To add a new color, spacing value, or animation duration: define it in `tokens.css` as a custom property, then use it everywhere.

## Accessibility Standards

Every interactive component must have:
- Proper ARIA roles (`role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-label`)
- Keyboard navigation (Tab, Enter, Arrow keys where appropriate)
- Semantic HTML (avoid `<div role="button">` when `<button>` exists)
- Color contrast ratio ≥ 4.5:1 for text, ≥ 3:1 for UI components
- Alt text on all images (`<img alt="description">`) or `aria-label` on interactive elements

Test with: keyboard only (no mouse), screen reader (VoiceOver/NVDA), and a contrast checker.

## Testing a Concept Page

Before marking a page as complete, verify:

- [ ] All 7 sections present and non-empty
- [ ] Interactive viz has a fallback `<noscript>` image
- [ ] Quiz has ≥ 2 questions, correct index set, explanation explains *why*
- [ ] Breadcrumb navigation works
- [ ] `data-viz-type` attribute matches a handler in `pipeline-viz.js`
- [ ] `data-quiz-id` matches the concept slug passed to `initProgress()`
- [ ] Progress ring updates after completing quiz
- [ ] All internal links work (section anchors, concept links, hub link)
- [ ] Page opens in Firefox, Chrome, Safari (recent versions)
- [ ] Keyboard navigation works (Tab through all focusable elements)

## Conventions

1. **No external dependencies** — everything must work offline and from the filesystem (after running a local server)
2. **One quiz per concept** — the quiz is the gate; a concept is "learned" only after passing the quiz
3. **Every failure mode matters** — the `#why-it-matters` section should show what breaks without this technique, not just why it's good
4. **Analogy before mechanism** — the `#interactive-viz` section must work without any technical jargon; teach the concept through the animation first
5. **Progress is persistent** — use localStorage; no backend authentication needed
6. **No redirects** — each HTML file is a standalone page; use relative paths for all links

## Troubleshooting

- **Page is blank or scripts don't load**: You're opening `file:///` directly. Use `python -m http.server 8080` instead. See ERROR.md.
- **Progress ring stays at 0% after quiz**: Check that the quiz `data-quiz-id` matches the slug passed to `initProgress()`. Use browser DevTools → Application → LocalStorage to inspect.
- **Interactive viz doesn't appear**: Check browser console for errors. Ensure `data-viz-type` attribute value exists in `pipeline-viz.js` mountAll() switch statement.
- **Section scroll-spy marks wrong section**: Adjust `rootMargin` in `router.js` IntersectionObserver options. Default is `"-40% 0px -55% 0px"`.

See ERROR.md for more detailed error patterns and solutions.

## Deployment to GitHub Pages

1. Ensure `site/.nojekyll` exists (prevents Jekyll from blocking `_template/` directory)
2. Push to `main` branch
3. In GitHub repo settings: Pages → Source → "Deploy from a branch" → branch: `main`, folder: `/site`
4. Published at `https://github.com-user.github.io/Intutitive/` (check your repo settings for exact URL)

All relative paths in HTML files (e.g., `../../design-system/tokens.css`) work both locally and on GitHub Pages because they're relative.

## Questions?

Refer to SOUL.md for project philosophy and design principles.
Refer to SKILLS.md for what Claude Code can help automate.
