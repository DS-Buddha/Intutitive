# Paper Journey Standard

**Gold standard reference:** [DCI Paper Journey](../site/topics/papers/dci-agent/lab.html) (`site/topics/papers/dci-agent/`)

Every research paper onboarded to Intuitive must use the **same shell, chrome, and Think pipeline** as DCI. Content differs; aesthetics and UX do not. Read [SOUL.md](../SOUL.md) for philosophy before authoring.

---

## Design philosophy

1. **Understand before playgrounds** — Part 1 is read-only. Never lead with `data-playground`.
2. **Readiness gate, not quiz** — Mastery is tracked via a research readiness checklist (interaction-based), not multiple-choice quizzes.
3. **Thinking, not implementing** — Part 3 is critique and research extensions (Ideas workshop + Paper chat), not code exercises.
4. **Shared design system only** — All styling from `site/design-system/` (`tokens.css`, `components.css`). No per-paper CSS files.
5. **Config-first playgrounds** — Paper content lives in `lab-data.js` / `journey-data.js`; shared playground components never import paper-specific modules.

---

## Journey flow

| Phase | Page | Purpose |
| ----- | ---- | ------- |
| **Orient** | `index.html` | Thesis, prerequisites, journey map, CTA to `lab.html#understand-hook` |
| **Understand** | `lab.html` Part 1 | Read-only: hook → problem → insight → method → evidence → vocabulary |
| **Verify** | `lab.html` Part 2 | Playgrounds with `verify-bridge` callouts linking back to Understand |
| **Think** | `lab.html` Part 3 | Assumption breaker → Ideas workshop → Paper chat → paper links |

Single-page flow on `lab.html`. Hub stays minimal.

---

## Mandatory UI shell

Copy from [site/_template/paper-hub.html](../site/_template/paper-hub.html) and [site/_template/paper-lab.html](../site/_template/paper-lab.html). Do not invent alternate layouts.

### Required DOM hooks

| Hook | Purpose |
| ---- | ------- |
| `[data-journey-progress]` | Clickable journey bar (Understand / Verify / Think) |
| `[data-readiness-checklist]` | Research readiness checklist |
| `[data-readiness-banner]` | Shown when all checks complete |
| `[data-paper-nav]` | Hub / lab / concept links (filled by `paper-page.js`) |
| `[data-journey-map]` | Hub journey map (from registry `journey.phases`) |
| `[data-scrollspy]` | Sidebar section nav on lab |
| `[data-verify-nudge]` | Soft nudge if Part 1 incomplete |
| `[data-think-nudge]` | Soft nudge if Part 2 core labs incomplete |

### Required CSS classes

- Layout: `page-layout--paper`, `page-layout--lab`, `sidebar--lab`
- Parts: `journey-part-label`, `journey-part-divider`, `understand-next`, `part-cta`
- Verify: `verify-bridge`, `verify-group-label`, `verify-deep-dive`, `learn-try`
- Think: `learn-try--think`
- Content: `hook-analogy-card`, `learn-objective`, `learn-takeaway`, `vocab-map`, `paper-table`, `playground`

### Required part anchors

- `#understand-hook` — Part 1 start
- `#verify-start` — Part 2 divider
- `#think-start` — Part 3 divider
- `#assumptions`, `#ideas`, `#chat`, `#paper` — Think pipeline

### Part CTAs (required)

- After vocabulary: **Continue to Part 2 — Verify →** linking to `#verify-start`
- After verify deep-dive: **Continue to Part 3 — Think →** linking to `#think-start`

Onboarding card is injected by `lab-onboarding.js` — do not duplicate in HTML.

---

## Folder structure

```
Papers/<Paper-Name>/
  Paper-Notes.md              # Source notes (see below)

site/topics/papers/<paper-id>/
  index.html                  # Hub (orient)
  lab.html                    # Full journey
  concepts/                   # Optional concept deep dives

site/js/topics/papers/<paper-id>/
  journey-data.js             # Assumptions, benchmarks, ideas, chat starters
  lab-data.js                 # Playground configs (config-first)
  *-scenarios.js              # Optional mock scenarios / corpus helpers
  *-corpus.js                 # Optional terminal / corpus data

server/prompts/
  <paper-id>.md               # Gemini system prompt for Paper chat
```

`<paper-id>` must match registry `id` and `lab-data.js` `paper-chat.paperId`.

---

## Registry entry

Add to [site/js/topics/paperRegistry.js](../site/js/topics/paperRegistry.js):

```js
{
  id: 'my-paper',                    // kebab-case, matches folder name
  title: 'Short Title',
  fullTitle: 'Full paper title',
  arxiv: 'XXXX.XXXXX',
  arxivUrl: 'https://arxiv.org/abs/...',
  github: 'https://github.com/...',  // optional
  hubPath: './topics/papers/my-paper/index.html',
  labPath: './topics/papers/my-paper/lab.html',
  thesis: 'One-sentence thesis.',
  prerequisites: [{ label: '...', path: '../../rag/...' }],
  concepts: [{ slug: '...', label: '...', file: '....html' }],
  journey: {
    phases: [
      { id: 'orient', label: 'Orient', href: './index.html' },
      { id: 'understand', label: 'Understand', href: './lab.html#understand-hook' },
      { id: 'verify', label: 'Verify', href: './lab.html#verify-start' },
      { id: 'think', label: 'Think', href: './lab.html#think-start' },
    ],
    understandSectionIds: [
      'understand-hook', 'understand-problem', 'understand-insight',
      'understand-method', 'understand-evidence', 'understand-vocab',
    ],
    coreVerifyPlaygrounds: ['compare', 'topk', 'terminal'],  // section ids for readiness
    labSections: [ /* scrollspy entries — Understand first */ ],
    partGroups: [ /* Part 1 / 2 / 3 groups for floating nav */ ],
    readinessChecks: [
      { id: 'understand-complete', label: '...', hint: '...' },
      { id: 'verify-lab', label: '...', hint: '...' },
      { id: 'stress-assumptions', label: '...', hint: '...', minCount: 3 },
      { id: 'ideas-saved', label: '...', hint: '...', minCount: 2 },
      { id: 'chat-used', label: '...', hint: '...' },
    ],
    onboarding: {                    // optional overrides
      timeEstimate: '45–60 min',
    },
  },
}
```

Progress keys are derived automatically as `<paper-id>-understand-complete`, etc. (DCI keeps legacy `dci-*` keys for backward compatibility).

---

## Source notes — `Paper-Notes.md`

Required sections:

1. TL;DR and thesis
2. Core concepts (3–5)
3. Method summary with paper section refs
4. Key results with numbers
5. **Paper assumptions** (table) — for assumption-breaker
6. **Limitations** (table) — break scenarios when assumptions fail
7. **Extension directions** (3–5) — framing, tradeoffs, validation
8. Paper Journey site mapping table (Understand sections → Verify playgrounds → Think seeds)

---

## Data files

### `journey-data.js`

Export paper-specific content only:

```js
export const assumptions = [...];        // id, label, defaultOn, description, breakScenario
export const assumptionToSeed = {...};   // assumption id → ideas seed id
export const improvementIdeas = [...];   // id, title, seed, whyBetter, reveal
export const chatStarters = [...];
export const evidenceBenchmarks = [...]; // if using evidence-lens
export const contextLevels = [...];      // if using context-level
export const paradigmSteps = { retriever: [...], dci: [...] };
```

### `lab-data.js`

Wire all playgrounds via config — **never rely on shared components importing this file**:

```js
import * as journeyData from './journey-data.js';
import { labScenarios, labChunks, rankByScenario, dciMatches } from './my-scenarios.js';

export default {
  defaultLabState: { scenarioId: '...', topK: 3 },
  playgrounds: {
    'assumption-breaker': {
      assumptions: journeyData.assumptions,
      assumptionToSeed: journeyData.assumptionToSeed,
      paperLabel: 'My Paper',
    },
    'ideas-workshop': {
      ideas: journeyData.improvementIdeas,
      paperLabel: 'My Paper',
    },
    'paper-chat': {
      paperId: 'my-paper',
      starters: journeyData.chatStarters,
      paperLabel: 'My Paper',
    },
    // ... verify playgrounds with scenarios, chunks, rankByScenario as needed
  },
};
```

Init in `lab.html`:

```html
<script type="module">
  import { initPaperLab } from '../../../js/core/paper-page.js';
  import labData from '../../../js/topics/papers/my-paper/lab-data.js';
  initPaperLab('my-paper', labData);
</script>
```

---

## Part 1 — Understand (read-only)

Six sections before any playground:

1. **Hook + thesis** — analogy + TL;DR + learn objective
2. **The problem** — failure chain cards
3. **The insight** — static diagram + key terms
4. **Method** — how the paper works (tables for ablations)
5. **Evidence** — benchmark numbers in read-only tables
6. **Vocabulary** — concepts mapped to Part 2 verify stations

No checkpoint section. End with **Continue to Part 2** CTA.

Each section needs `data-section-id` matching registry `understandSectionIds`.

---

## Part 2 — Verify

- Part divider at `#verify-start` with recommended path text
- Core labs first, then collapsible `<details class="verify-deep-dive">` for optional deep-dives
- Each playground section: `verify-bridge` → Understand anchor, `learn-try`, `data-playground="<type>"`
- Soft nudge via `[data-verify-nudge]` (wired automatically)

### Reusable playground types

| Type | Use when |
| ---- | -------- |
| `interface-compare` | A/B two methods on same scenario |
| `topk-bottleneck` | Early filtering loses evidence |
| `resolution` | Interface resolution zoom |
| `terminal-corpus` | CLI / composability sandbox |
| `coverage-metrics` | Coverage vs localization |
| `paradigm-compare` | Step-through two trajectories |
| `context-level` | Ablation / context levels |
| `evidence-lens` | Predict benchmark winner |
| `assumption-breaker` | Toggle assumptions (Part 3, but listed here for registry) |
| `ideas-workshop` | Draft improvements (Part 3) |
| `paper-chat` | Gemini tutor (Part 3) |

Paper-specific playgrounds: add `*-playground.js` + register in `playgrounds.js` only when reusable types cannot express the concept. Must use design-system playground classes.

### Connected lab (scenario bus)

For stations sharing scenario/top-k state, set `syncBus: true` in playground config. Requires `initLabState(defaults, paperId)` — handled by `initPaperLab`.

---

## Part 3 — Think (standard pipeline)

Fixed order — do not substitute alternate UIs:

1. **Assumption breaker** (`assumption-breaker`) — broken assumptions emit `dci:assumptions-changed`
2. **Ideas workshop** (`ideas-workshop`) — seeds highlight when assumptions break; `Send to chat` prefills Paper chat
3. **Paper chat** (`paper-chat`) — Gemini via dev server
4. **Paper links** — arXiv / GitHub footnotes (not mastery gates)

---

## Gemini Paper chat

1. Create `server/prompts/<paper-id>.md` — system prompt for the tutor
2. Run dev server (not plain `http.server`):

```bash
pip install -r requirements.txt
# GEMINI_API_KEY in .env (see .env.example)
python server/dev_server.py
```

Prompts are auto-discovered from `server/prompts/*.md` (filename stem = paper id).

API key stays server-side; browser calls `/api/chat` on same origin.

---

## Progress and readiness

Handled by shared infrastructure — do not reimplement:

| Module | Role |
| ------ | ---- |
| `lab-progress.js` | `initLabProgress(paperId)` — localStorage keys |
| `paper-page.js` | `initPaperLab`, readiness tracking, nudges |
| `lab-journey.js` | Journey bar |
| `lab-onboarding.js` | First-visit card |
| `learning-chrome.js` | Part-scoped progress, floating nav |

Readiness checks (default):

- Part 1: all Understand sections scrolled
- Part 2: core verify playgrounds interacted (`coreVerifyPlaygrounds`)
- Part 3: ≥3 assumption scenarios, ≥2 saved ideas, ≥1 chat message

---

## Anti-patterns

- Per-paper CSS or inline styles bypassing tokens
- Custom sidebar layout (slim lab sidebar + collapsed module tree is standard)
- Skipping journey bar, readiness panel, or onboarding
- Leading with playgrounds before Understand
- Replacing Ideas workshop or Paper chat with one-off UIs
- Importing paper data inside shared `site/js/components/*-playground.js`
- Hardcoding paper name in shared JS (use `paperLabel` in config)
- Using plain `python -m http.server` when testing Paper chat send

---

## Shipping checklist

- [ ] Copied templates; hub CTA links to `lab.html#understand-hook`
- [ ] Registry entry with `understandSectionIds`, `coreVerifyPlaygrounds`, `readinessChecks`
- [ ] Part 1 read-only sections before any `data-playground`
- [ ] Part 2 verify-bridges + recommended path + deep-dive collapsible
- [ ] Part 2→3 and Part 1→2 CTAs present
- [ ] Part 3: assumption → ideas → chat in order
- [ ] `lab-data.js` passes all playground content via config
- [ ] `Paper-Notes.md` complete
- [ ] `server/prompts/<paper-id>.md` if using chat
- [ ] Visual parity audit against DCI (structure + chrome, not content)
- [ ] Test: `python server/dev_server.py` — readiness, journey bar, Think pipeline, chat send

---

## Reference files

| Area | Path |
| ---- | ---- |
| Gold standard lab | `site/topics/papers/dci-agent/lab.html` |
| Gold standard hub | `site/topics/papers/dci-agent/index.html` |
| Registry | `site/js/topics/paperRegistry.js` |
| Init | `site/js/core/paper-page.js` |
| Templates | `site/_template/paper-hub.html`, `paper-lab.html` |
| Philosophy | `SOUL.md` |
| Agent guide | `AGENTS.md` |
