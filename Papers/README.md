# Paper Journey — Authoring Template

Use this template when adding a new research paper to Intuitive. DCI (`site/topics/papers/dci-agent/`) is the gold-standard reference.

## Success criteria

After completing the journey, the learner should:

1. Explain the paper end-to-end (problem → method → evidence → limits)
2. Verify understanding with playgrounds — not replace reading with knobs
3. Critique what the paper assumes and where it breaks
4. Propose research extensions with predicted tradeoffs — **thinking only**, no code required

## Three parts (required on `lab.html`)

**Rule: Part 1 (read-only) must come before any `data-playground` element.**

| Part | HTML sections | Content |
| ---- | ------------- | ------- |
| **Orient** | `index.html` | Thesis, prerequisites, journey map, CTA to `#understand-hook` |
| **Understand** | `lab.html` Part 1 | Hook, problem, insight, method, evidence, vocabulary, checkpoint — **no playgrounds** |
| **Verify** | `lab.html` Part 2 | Playgrounds with `verify-bridge` callouts linking back to Understand anchors |
| **Think** | `lab.html` Part 3 | Assumption breaker + hypothesis studio |

## Folder structure

```
Papers/<Paper-Name>/
  Paper-Notes.md          # Source notes (assumptions, limits, extensions, numbers)

site/topics/papers/<paper-id>/
  index.html              # Hub (orient)
  lab.html                # Full journey: Understand → Verify → Think
  concepts/               # Optional focused concept pages (deep dive)
  explainer.html          # Redirect to lab.html if needed

site/js/topics/papers/<paper-id>/
  *-scenarios.js          # Shared scenarios
  lab-data.js             # Playground configs
  journey-data.js         # Assumptions, benchmarks, extension prompts
  *-corpus.js             # Mock corpus if needed
```

## Part 1 — Understand (read-only checklist)

Every paper journey must include these sections before playgrounds:

1. **Hook + thesis** — analogy + TL;DR
2. **The problem** — why the status quo breaks (failure chain cards)
3. **The insight** — static diagram of core reframing + key vocabulary
4. **Method** — how the paper works (static tables for ablations)
5. **Evidence** — benchmark numbers in read-only tables
6. **Vocabulary map** — concepts mapped to verify stations + optional concept page links
7. **Checkpoint** — 3 reflection prompts + "I'm ready to verify" button

## Part 2 — Verify (playground checklist)

- Phase divider at `#verify-start`
- Soft nudge if Part 1 not complete (playgrounds still usable)
- Each playground gets a `verify-bridge` linking to the Understand section it proves

## Registry entry — `site/js/topics/paperRegistry.js`

Add a paper object with:

- `id`, `title`, `fullTitle`, `arxiv`, `arxivUrl`, `github`
- `hubPath`, `labPath`, `thesis`, `prerequisites`, `concepts[]`
- `journey.phases[]` — orient, understand, verify, think
- `journey.labSections[]` — scrollspy sections for lab.html (Understand sections first)
- `journey.readinessChecks[]` — understand complete, verify used, stress, extend

## Source notes — `Paper-Notes.md`

Required sections:

1. TL;DR and thesis
2. Core concepts (3–5)
3. Method summary with paper section refs (§3, §4, …)
4. Key results with numbers
5. **Paper assumptions** (table) — for assumption-breaker
6. **Limitations** (table) — break scenarios when assumptions fail
7. **Extension directions** (3–5) — each with framing, tradeoffs, directions
8. Paper Journey site mapping table

## Journey data — `journey-data.js`

Export:

```js
export const contextLevels = [...];      // if paper has ablation levels
export const evidenceBenchmarks = [...]; // paper tables with numbers
export const contributions = [...];    // claims → lab anchor links
export const assumptions = [...];        // id, label, breakScenario
export const extensionPrompts = [...];   // id, prompt, reveal, relatedSection
```

## Playgrounds

Register new types in `site/js/components/playgrounds.js`.

Reusable types from DCI:

| Type | Use when |
| ---- | -------- |
| `interface-compare` | A/B two methods on same scenario |
| `topk-bottleneck` | Early filtering loses evidence |
| `assumption-breaker` | Toggle assumptions, flip outcomes |
| `hypothesis-studio` | Write hypothesis → reveal expert take |
| `evidence-lens` | Predict benchmark winner, reveal numbers |
| `paradigm-compare` | Step-through two trajectories |
| `context-level` | Ablation / context management levels |

Paper-specific playgrounds: add `*-playground.js` only when reusable types don't fit.

## Connected lab (scenario bus)

For Verify-layer stations that share scenario/top-k:

1. Set `syncBus: true` in `lab-data.js` playground config
2. Playgrounds import `getLabState`, `setLabState`, `subscribeLabState` from `scenario-bus.js`

## Readiness tracking

- `dci-understand-complete` — checkpoint button or scrolled through ≥4 Understand sections
- `dci-ready-verify` — visited compare, top-k, terminal playgrounds
- `dci-ready-stress` / `dci-ready-extend` — assumption + hypothesis counts

## Checklist before shipping

- [ ] Hub CTA links to `lab.html#understand-hook`
- [ ] Part 1 read-only sections exist before any playground
- [ ] Verify bridges link back to Understand anchors
- [ ] At least 3 assumption-breaker scenarios
- [ ] At least 3 extension prompts with expert reveals
- [ ] Paper-Notes.md complete
- [ ] Registry entry with understand → verify → think phases
- [ ] Run locally: `cd site && python -m http.server 8080`

## Reference

- Philosophy: [SOUL.md](../SOUL.md) — Paper Journey section
- Gold standard: [DCI lab](../site/topics/papers/dci-agent/lab.html)
