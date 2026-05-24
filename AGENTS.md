# AGENTS.md — Intuitive Learning Platform

## What This Project Is

A static, zero-build-step web platform that teaches technical AI/ML topics through intuition-first, interactive learning. No npm. Pure HTML/CSS/JS (ES modules). Deployable on GitHub Pages or opened locally in a browser.

Paper chat uses an optional local dev server (`server/dev_server.py`) to proxy Gemini — API key stays in `.env`, never in the browser. All other pages work with plain static hosting.

**Designed for practitioners** who want to understand the *why* and *how* of a concept before implementing it. Every topic follows a standardized structure enforced by templates, making it trivial to add new subjects (Transformers, RL, Attention, etc.).

## Agent Tooling

| File | Used by |
|------|---------|
| AGENTS.md | Cursor, Codex, and other AGENTS.md-compatible agents |
| CLAUDE.md | Claude Code (pointer to this file) |
| SOUL.md | Design philosophy — read before writing content |
| SKILLS.md | Skill catalog and invocation examples |
| ERROR.md | Known runtime errors when developing the site |
| `.cursor/rules/` | Cursor scoped rules |
| `.cursor/skills/` | Cursor executable skills |

## Repository Structure

```
Intutitive/
├── LICENSE                    (MIT)
├── AGENTS.md                  (this file — how to work in this repo)
├── CLAUDE.md                  (Claude Code pointer to AGENTS.md)
├── SOUL.md                    (mission, principles, voice)
├── SKILLS.md                  (project skills catalog)
├── ERROR.md                   (known error patterns and fixes)
├── Papers/                    (Paper-Notes source + PAPER-JOURNEY-STANDARD.md)
├── RAG/                       (Obsidian source notes — reference only)
├── server/                    (dev_server.py + prompts/ for Paper chat)
└── site/                      (all deliverable static files)
    ├── index.html             (landing page / topic browser)
    ├── design-system/         (tokens.css, components.css, animations.css)
    ├── js/                    (core, components, topics subdirectories)
    ├── topics/                (topic folders: rag/, papers/, etc.)
    ├── _template/             (concept-leaf, paper-hub, paper-lab templates)
    └── assets/                (icons, fonts)
```

## Running Locally

**Option 1: Static only** (playgrounds, no paper chat)
```bash
cd site
python -m http.server 8080
# Open http://localhost:8080
```

**Option 2: Dev server with Gemini paper chat**
```bash
pip install -r requirements.txt
# Add GEMINI_API_KEY to .env (see .env.example)
python server/dev_server.py
# Open http://127.0.0.1:8080/topics/papers/dci-agent/lab.html#chat
```

Paper chat calls `/api/chat` on the same origin — the API key stays in `.env` on the server, never in the browser.

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
5. Update `site/topics/<topic>/index.html` to add a link card for this concept
6. Update `site/js/topics/registry.js` to add the concept to the reading order array

Use the `new-concept-page` skill (see SKILLS.md) to automate this workflow.

## How to Add a New Topic

1. Create `site/topics/<topic>/` directory
2. Copy `site/_template/topic-hub.html` → `site/topics/<topic>/index.html`
3. Create `site/js/topics/<topic>/` directory
4. Create `site/js/topics/<topic>/<topic>-data.js` with the full pipeline stages
5. Create `site/js/topics/<topic>/` concept data files as you add pages
6. Add one entry to `site/js/topics/registry.js` with topic metadata
7. No build step. Refresh browser.

Use the `new-topic` skill (see SKILLS.md) to automate this workflow.

## How to Add a Paper Journey

Research papers use a standardized three-part journey (Understand → Verify → Think). **DCI is the gold standard** — every new paper must match its shell and UX.

**Read first:** [Papers/PAPER-JOURNEY-STANDARD.md](Papers/PAPER-JOURNEY-STANDARD.md)

1. Write `Papers/<Paper-Name>/Paper-Notes.md` (assumptions, limits, extensions, benchmark numbers)
2. Copy `site/_template/paper-hub.html` → `site/topics/papers/<paper-id>/index.html`
3. Copy `site/_template/paper-lab.html` → `site/topics/papers/<paper-id>/lab.html`
4. Create `site/js/topics/papers/<paper-id>/`:
   - `journey-data.js`, `lab-data.js`, `playground-configs.js` (with per-paper `labels`)
   - Optional `*-scenarios.js`, concept pages under `concepts/`
5. Add entry to `site/js/topics/paperRegistry.js` (include `understandSectionIds`, `coreVerifyPlaygrounds`, `readinessChecks`, optional `concepts`)
6. Add `server/prompts/<paper-id>.md` for Gemini Paper chat
7. Optional concept deep dives: copy `site/_template/paper-concept.html` → `concepts/<slug>.html` + `concepts/<slug>-data.js`
8. Run `python server/dev_server.py` and audit structure against [DCI lab](site/topics/papers/dci-agent/lab.html)

**Rules:**

- Part 1 (read-only) before any playground
- Reuse shared chrome: journey bar, readiness panel, onboarding, Think pipeline
- Pass all paper content via `lab-data.js` / `playground-configs.js` — never hardcode paper names in shared playground components (use `labels` from `playground-labels.js`)
- No per-paper CSS — design-system tokens only

Use the `new-paper-journey` skill (see SKILLS.md) to automate this workflow.

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

Use the `check-page-completeness` skill for a structured audit.

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

Use the `deploy-to-pages` skill for a full deployment checklist.

## Questions?

Refer to SOUL.md for project philosophy and design principles.
Refer to SKILLS.md for agent workflows and skill invocation.
