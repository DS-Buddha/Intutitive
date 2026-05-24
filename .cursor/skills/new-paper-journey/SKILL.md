---
name: new-paper-journey
description: Scaffolds a standardized Paper Journey (Understand → Verify → Think) matching the DCI gold standard. Use when adding a research paper, onboarding a paper to the platform, or creating a Paper Journey for an arXiv paper.
disable-model-invocation: true
---

# New Paper Journey

Every paper must match the DCI shell and UX. Read [Papers/PAPER-JOURNEY-STANDARD.md](../../Papers/PAPER-JOURNEY-STANDARD.md) before starting.

**Gold standard:** `site/topics/papers/dci-agent/`

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
   - `lab-data.js` — wire all playgrounds via config (never import paper data in shared components)
   - Optional `*-scenarios.js`, `*-corpus.js` for verify playgrounds

4. Add registry entry in `site/js/topics/paperRegistry.js`:
   - `id`, `title`, paths, `journey.phases`, `labSections`, `partGroups`
   - `understandSectionIds`, `coreVerifyPlaygrounds`, `readinessChecks`
   - Optional `journey.onboarding.timeEstimate`

5. Add `server/prompts/<paper-id>.md` for Gemini Paper chat

6. Update hub `lab.html` script: `initPaperLab('<paper-id>', labData)`

7. Run `python server/dev_server.py` and audit against DCI:
   - Part 1 read-only before playgrounds
   - Journey bar, readiness panel, onboarding, part CTAs
   - Think pipeline: assumption → ideas → chat
   - No per-paper CSS

## Slug alignment

These must match (kebab-case):

- Registry `id` = folder name = `lab-data.js` paper-chat `paperId` = `server/prompts/<paper-id>.md`
- `data-section-id` on Understand sections = `journey.understandSectionIds`
- Core verify section ids = `journey.coreVerifyPlaygrounds`

## Anti-patterns (do not do)

- Custom sidebar layout or per-paper CSS
- Skipping journey bar / readiness / onboarding
- Leading with playgrounds before Understand
- Importing paper data inside `site/js/components/*-playground.js`
- One-off Think UI instead of assumption → ideas → chat

## Output

A Paper Journey visually and structurally aligned with DCI. Compare side-by-side with `site/topics/papers/dci-agent/lab.html`.

## Example

```
Paper: Direct Corpus Interaction
paper-id: dci-agent
Source: Papers/DCI/Paper-Notes.md
Reference: site/topics/papers/dci-agent/ (copy structure, replace content)
```
