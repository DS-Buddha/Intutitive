# SKILLS.md — Custom Claude Code Skills for This Project

When you invoke a skill with `/skillname`, Claude Code uses a specialized prompt to help you accomplish a task in this specific codebase. Below are the skills designed for the Intuitive Learning Platform.

## Skill: `new-concept-page`

**When to use:** "Add a concept page for X" / "Create the Y page under topic Z" / "Build a page for [technique name]"

**What Claude Code does:**
1. Reads the source note in `RAG/` or the topic equivalent
2. Extracts the TL;DR, When to use/not, Core ideas, Links, and Next steps sections
3. Copies `site/_template/concept-leaf.html` to the correct `site/topics/<topic>/` path with correct filenames
4. Fills in: page title, breadcrumb topic, meta description, all 7 section contents (hook, why-it-matters, interactive-viz, core-mechanism, tradeoffs, connections, check-understanding)
5. Creates `site/js/topics/<topic>/<concept-slug>-data.js` with:
   - `stages` array or other viz-specific config (what the interactive component needs)
   - `quiz` array (2–4 MC questions, each with `question`, `options`, `correct` index, `explanation`)
   - `comparison` object (if the `#tradeoffs` section uses a before/after slider)
6. Updates the topic hub `site/topics/<topic>/index.html` to add a link card for this concept
7. Updates `site/js/topics/registry.js` to add the concept to the reading order array

**Output:** A fully working concept page that passes the `check-page-completeness` skill

---

## Skill: `new-topic`

**When to use:** "Start a new topic on X" / "Add Transformers / RL / etc." / "Create a new subject for the platform"

**What Claude Code does:**
1. Creates `site/topics/<topic>/` directory
2. Copies `site/_template/topic-hub.html` to `site/topics/<topic>/index.html` and fills in topic name, description, icon
3. Creates `site/js/topics/<topic>/` directory
4. Creates `site/js/topics/<topic>/<topic>-data.js` with the full pipeline/stages config
5. Adds one entry to `site/js/topics/registry.js` with:
   - `id`: kebab-case topic id
   - `title`: user-facing topic name
   - `description`: one-sentence hook
   - `icon`: SVG icon name
   - `hubPath`: path to the hub page
   - `conceptCount`: initially 0 (updates as concepts are added)
   - `readingOrder`: initially empty array (populates as concepts are added)

**Output:** A new topic that shows up on the landing page with 0% progress, 0 concepts

---

## Skill: `check-page-completeness`

**When to use:** "Review the X page" / "Is Y complete?" / "Check if this page is ready" / "Audit the baseline page"

**Standards checked:**
- [ ] All 7 sections present and have real content (not Lorem ipsum)
- [ ] Each section heading uses the correct id (`id="hook"`, `id="why-it-matters"`, etc.)
- [ ] Interactive viz has a `data-viz-type` attribute
- [ ] Interactive viz has a fallback `<noscript>` image for users with JS disabled
- [ ] Quiz container has `data-quiz-id` attribute matching the concept slug
- [ ] Quiz data module (`*-data.js`) exports `quiz` array with ≥ 2 questions
- [ ] Each quiz question has: `question`, `options` (array), `correct` (index 0–3), `explanation`
- [ ] Breadcrumb navigation is correct and links work
- [ ] `data-progress-ring` attribute matches the topic id in registry.js
- [ ] All internal links are relative paths and work when clicked
- [ ] Page opens without console errors in Chrome, Firefox, Safari
- [ ] Keyboard navigation: Tab through all focusable elements works, Enter activates buttons, Arrow keys navigate tabs
- [ ] ARIA attributes present: `role`, `aria-selected`, `aria-label` where needed

**Output:** A pass/fail report with specific issues and line numbers if any fail

---

## Skill: `design-system-audit`

**When to use:** "Check for magic numbers" / "Audit CSS" / "Ensure all values use tokens"

**What Claude Code does:**
1. Greps `site/` for any hardcoded px, rem, #hex, rgb, or color-name values outside `tokens.css`
2. Greps `site/` for hardcoded animation durations outside `animations.css`
3. Reports each occurrence with: file path, line number, the hardcoded value, and the recommended token name
4. Checks that all color references in CSS use `var(--color-*)` or `var(--stage-*)`
5. Checks that all spacing uses `var(--space-*)`
6. Checks that all typography uses `var(--text-xs)` through `var(--text-5xl)` and `var(--weight-*)`

**Output:** A list of violations. If none, "✓ Design system is clean — all values use tokens."

---

## Skill: `quiz-quality-check`

**When to use:** "Review quiz for X concept" / "Check quiz quality" / "Audit the [concept] questions"

**Standards:**
- ✓ 2–4 questions (minimum 2, maximum 4)
- ✓ Each question tests a *distinct* idea (not paraphrases or rewording of the same question)
- ✓ No "trick" questions — tests *understanding*, not memory of exact wording from the page
- ✓ `explanation` field is mandatory and adds information beyond just "correct" or "incorrect"
- ✓ Distractor options are plausible (not obviously wrong; a reader must have understood to choose correctly)
- ✓ Correct index is accurate (answer key matches the intended correct option)
- ✓ Quiz difficulty matches the concept (a baseline RAG quiz is easier than a GraphRAG quiz)

**Output:** Pass/fail per question with specific feedback. If all pass: "✓ Quiz is solid — ready to ship."

---

## Skill: `fix-accessibility`

**When to use:** "Make this page accessible" / "Add keyboard nav" / "Check WCAG compliance" / "Audit the sidebar for a11y"

**What Claude Code does:**
1. Checks every button, link, and interactive element for proper ARIA roles
2. Verifies all form inputs have associated `<label>` or `aria-label`
3. Confirms color contrast meets WCAG AA (4.5:1 text, 3:1 UI)
4. Verifies keyboard navigation: Tab order is logical, Enter/Space activate buttons, Arrow keys navigate menus
5. Checks that all images have `alt` text or `aria-label` (no silent images)
6. Verifies heading hierarchy (h1 → h2 → h3, no skipping levels)
7. Checks for focus styles on interactive elements (`:focus` or `:focus-visible`)

**Output:** List of violations with remediation. Pass → "✓ Page is accessible."

---

## Skill: `mobile-test`

**When to use:** "Check mobile responsiveness" / "Is this mobile-friendly?" / "Test on a phone"

**What Claude Code does:**
1. Checks that viewport meta tag is present: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
2. Verifies CSS uses media queries for breakpoints (assumes breakpoints at 640px, 1024px)
3. Checks that touch targets are ≥ 44×44px (WCAG touch target size)
4. Verifies that the comparison slider and other touch interactions don't rely on hover-only affordances
5. Checks that interactive elements aren't too close together (min 8px spacing)
6. Verifies that long text wraps and doesn't overflow on small screens

**Output:** List of issues. Pass → "✓ Ready for mobile."

---

## Skill: `scaffold-dataset`

**When to use:** "I have raw notes on [topic], help me structure them" / "Convert Obsidian notes to structured data"

**What Claude Code does:**
1. Reads raw Markdown source notes
2. Extracts and structures: TL;DR, When to use, When not to use, Core ideas, Key metrics, Links, Next steps, Related questions
3. Identifies which sections of the concept map to which HTML section (hook → why-it-matters → interactive-viz, etc.)
4. Suggests analogy and real-world example for the `#hook` section
5. Proposes failure narratives for the `#why-it-matters` section
6. Identifies possible interactive viz types and suggests which one would work best
7. Draft quiz questions (you review and finalize)
8. Outputs a structured JSON-like object ready to become a `-data.js` module

**Output:** A complete data skeleton for a concept page

---

## Skill: `deploy-to-pages`

**When to use:** "Deploy to GitHub Pages" / "Set up Pages" / "Publish the site"

**What Claude Code does:**
1. Ensures `site/.nojekyll` file exists (prevents Jekyll from blocking `_template/`)
2. Verifies all relative paths in HTML files are correct (e.g., `../../design-system/tokens.css` not absolute `/design-system/...`)
3. Confirms `.gitignore` exists and excludes `node_modules/`, `.env`, etc. (though this project has neither)
4. Instructs you to: go to GitHub repo settings → Pages → source: "Deploy from a branch" → main branch → /site folder
5. Provides the eventual published URL
6. Writes a quick checklist of what to verify on the live site (landing page loads, quiz works, localStorage persists)

**Output:** Deployment instructions and verification checklist

---

## How to Use These Skills

In Claude Code, type `/skillname` followed by context:

```
/new-concept-page
Topic: RAG
Concept: Late Interaction (ColBERT)
Source: RAG/Search-and-Retrieval/Notes/Late-Interaction-Token-Matching.md

/new-topic
Topic: Transformers
Description: How attention mechanisms work and why they matter
Icon: pyramid

/check-page-completeness
Page: site/topics/rag/baseline.html

/design-system-audit

/quiz-quality-check
Concept: baseline

/mobile-test
Page: site/topics/rag/index.html

/scaffold-dataset
Source notes: (paste raw Markdown)
Topic: Transformers
Concept: Attention Heads
```

Each skill is designed to be invoked multiple times across the project lifetime. They're not one-shot; they're companions to your workflow.
