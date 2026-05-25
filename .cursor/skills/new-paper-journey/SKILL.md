---
name: new-paper-journey
description: Scaffolds a standardized Paper Journey (Understand → Verify → Think) matching the DCI gold standard. Use when adding a research paper, onboarding a paper to the platform, or creating a Paper Journey for an arXiv paper.
disable-model-invocation: true
---

# New Paper Journey

Every paper must match the DCI shell and UX. Read [Papers/PAPER-JOURNEY-STANDARD.md](../../Papers/PAPER-JOURNEY-STANDARD.md) before starting.

**Gold standard:** `site/topics/papers/dci-agent/` · **Labels reference:** `site/js/components/playground-labels.js`

## Workflow

1. Write `Papers/<Paper-Name>/Paper-Notes.md`:
   - TL;DR, thesis, method, benchmark numbers
   - Assumptions table (for assumption-breaker)
   - Limitations / break scenarios
   - Extension directions (3–5) for Ideas workshop seeds
   - Site mapping: Understand sections → Verify playgrounds → Think seeds

2. Copy templates:
   - `site/_template/paper-hub.html` → `site/topics/papers/<paper-id>/index.html`
   - `site/_template/paper-lab.html` → `site/topics/papers/<paper-id>/lab.html`
   - Replace all `TODO` placeholders; keep DOM hooks and CSS classes unchanged

3. Create `site/js/topics/papers/<paper-id>/`:
   - `journey-data.js` — assumptions, assumptionToSeed, improvementIdeas, chatStarters, benchmarks
   - `playground-configs.js` — all playground configs **including `labels` overrides**
   - `lab-data.js` — imports `playground-configs.js` (never import paper data in shared components)
   - Optional `*-scenarios.js`, `*-corpus.js` for verify playgrounds

4. Add registry entry in `site/js/topics/paperRegistry.js`:
   - `id`, `title`, paths, `journey.phases`, `labSections`, `partGroups`
   - `understandSectionIds`, `coreVerifyPlaygrounds`, `readinessChecks`
   - Optional `concepts: [{ slug, label, file }]` for deep dives
   - Optional `journey.onboarding.timeEstimate`

5. Add `server/prompts/<paper-id>.md` for Gemini Paper chat

6. Update hub `lab.html` script: `initPaperLab('<paper-id>', labData)`

7. **Playground labels** — in `playground-configs.js`, override copy for compare/paradigm/resolution/context playgrounds:

```js
'interface-compare': {
  scenarios, chunks, rankByScenario,
  agentMatches: myMatches,
  labels: { title: '...', baselineName: '...', agentName: '...' },
},
'paradigm-compare': {
  retrieverSteps, agentSteps,
  labels: { baselineName: '...', agentName: '...', insights: [...] },
},
```

8. **Concept deep dives (optional, 3–4 concepts):**
   - Copy `site/_template/paper-concept.html` → `site/topics/papers/<paper-id>/concepts/<slug>.html`
   - Create `site/js/topics/papers/<paper-id>/concepts/<slug>-data.js` importing from `../playground-configs.js`
   - Add hub `concept-map` cards + lab vocab `vocab-map__deep` links
   - Register in `paperRegistry.js` `concepts` array

9. Run `python server/dev_server.py` and audit against DCI:
   - Part 1 read-only before playgrounds
   - Journey bar, readiness panel, onboarding, part CTAs
   - Think pipeline: assumption → ideas → chat
   - Compare/paradigm panels show paper-specific names (not "DCI")
   - No per-paper CSS

10. **Verify Part 2 playgrounds mount (mandatory — see ERROR.md):**
   ```bash
   node scripts/verify-paper-lab.mjs <paper-id>
   ```
   - Registry entry includes `concepts: []` at minimum (omitting crashes lab init)
   - Open `lab.html` → DevTools Console: **zero errors**
   - Part 2 controls visible (not empty gray boxes): paradigm compare, resolution/granularity, interface-compare

## Slug alignment

These must match (kebab-case):

- Registry `id` = folder name = `lab-data.js` paper-chat `paperId` = `server/prompts/<paper-id>.md`
- `data-section-id` on Understand sections = `journey.understandSectionIds`
- Core verify section ids = `journey.coreVerifyPlaygrounds`
- Concept `slug` = `initPaperConceptPage` second arg = `*-data.js` filename stem

## Anti-patterns (do not do)

- Custom sidebar layout or per-paper CSS
- Skipping journey bar / readiness / onboarding
- Leading with playgrounds before Understand
- Importing paper data inside `site/js/components/*-playground.js`
- Hardcoding paper names in shared playground components (use `labels` in config)
- One-off Think UI instead of assumption → ideas → chat

## Output

A Paper Journey visually and structurally aligned with DCI. Compare side-by-side with `site/topics/papers/dci-agent/lab.html`.

## Example

```
Paper: A-RAG
paper-id: a-rag
Source: Papers/A-RAG/Paper-Notes.md
Reference: site/topics/papers/a-rag/ (concepts + playground-configs.js labels)
```
