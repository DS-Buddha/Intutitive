# Papers — Research Paper Journeys

Intuitive teaches research papers through a standardized **Paper Journey**: Understand → Verify → Think.

**Gold standard:** [DCI](../site/topics/papers/dci-agent/lab.html) (`site/topics/papers/dci-agent/`)

**Full authoring spec:** [PAPER-JOURNEY-STANDARD.md](PAPER-JOURNEY-STANDARD.md) — read this before onboarding a new paper.

## Quick start

1. Write `Papers/<Name>/Paper-Notes.md` (assumptions, limits, extensions, numbers)
2. Copy `site/_template/paper-hub.html` and `paper-lab.html` → `site/topics/papers/<paper-id>/`
3. Add registry entry in `site/js/topics/paperRegistry.js`
4. Create `journey-data.js` + `lab-data.js` under `site/js/topics/papers/<paper-id>/`
5. Add `server/prompts/<paper-id>.md` for Paper chat
6. Run `python server/dev_server.py` and audit against DCI structure

## Success criteria

After completing the journey, the learner should:

1. Explain the paper end-to-end (problem → method → evidence → limits)
2. Verify understanding with playgrounds — not replace reading with knobs
3. Critique what the paper assumes and where it breaks
4. Propose research extensions with predicted tradeoffs — **thinking only**, no code

## Three parts (on `lab.html`)

| Part | Content |
| ---- | ------- |
| **Orient** (`index.html`) | Thesis, prerequisites, journey map |
| **Understand** | Read-only: hook, problem, insight, method, evidence, vocabulary → **Continue to Part 2** |
| **Verify** | Playgrounds with verify-bridge callouts |
| **Think** | Assumption breaker + Ideas workshop + Paper chat |

## Related docs

- [PAPER-JOURNEY-STANDARD.md](PAPER-JOURNEY-STANDARD.md) — mandatory UI shell, registry schema, anti-patterns, checklist
- [SOUL.md](../SOUL.md) — Paper Journey philosophy
- [AGENTS.md](../AGENTS.md) — agent workflow for adding papers

Use the `new-paper-journey` skill (see [SKILLS.md](../SKILLS.md)) to scaffold a new paper.
