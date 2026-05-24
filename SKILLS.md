# SKILLS.md — Project Skills Catalog

Workflow skills for the Intuitive Learning Platform. Each skill has a Cursor implementation in `.cursor/skills/` and can also be invoked in Claude Code via `/skillname`.

## How to Invoke

### Cursor

Ask the agent to use a skill by name:

```
Use the new-concept-page skill to add Late Interaction (ColBERT) under RAG
Run check-page-completeness on site/topics/rag/baseline.html
```

Skills live at `.cursor/skills/<name>/SKILL.md`.

### Claude Code

Type `/skillname` followed by context:

```
/new-concept-page
Topic: RAG
Concept: Late Interaction (ColBERT)
```

See [CLAUDE.md](CLAUDE.md) for Claude Code entry point.

---

## Skills

| Skill | Trigger phrases | Cursor path |
|-------|-----------------|-------------|
| `new-concept-page` | "Add a concept page for X", "Create the Y page under topic Z" | [.cursor/skills/new-concept-page/SKILL.md](.cursor/skills/new-concept-page/SKILL.md) |
| `new-topic` | "Start a new topic on X", "Add Transformers / RL" | [.cursor/skills/new-topic/SKILL.md](.cursor/skills/new-topic/SKILL.md) |
| `check-page-completeness` | "Review the X page", "Is Y complete?", "Audit the baseline page" | [.cursor/skills/check-page-completeness/SKILL.md](.cursor/skills/check-page-completeness/SKILL.md) |
| `design-system-audit` | "Check for magic numbers", "Audit CSS", "Ensure all values use tokens" | [.cursor/skills/design-system-audit/SKILL.md](.cursor/skills/design-system-audit/SKILL.md) |
| `quiz-quality-check` | "Review quiz for X", "Check quiz quality", "Audit the questions" | [.cursor/skills/quiz-quality-check/SKILL.md](.cursor/skills/quiz-quality-check/SKILL.md) |
| `fix-accessibility` | "Make this page accessible", "Check WCAG compliance" | [.cursor/skills/fix-accessibility/SKILL.md](.cursor/skills/fix-accessibility/SKILL.md) |
| `mobile-test` | "Check mobile responsiveness", "Is this mobile-friendly?" | [.cursor/skills/mobile-test/SKILL.md](.cursor/skills/mobile-test/SKILL.md) |
| `scaffold-dataset` | "Structure my notes", "Convert Obsidian notes to data" | [.cursor/skills/scaffold-dataset/SKILL.md](.cursor/skills/scaffold-dataset/SKILL.md) |
| `deploy-to-pages` | "Deploy to GitHub Pages", "Publish the site" | [.cursor/skills/deploy-to-pages/SKILL.md](.cursor/skills/deploy-to-pages/SKILL.md) |

---

## Example Invocations

### Cursor

```
Use the new-concept-page skill
Topic: RAG
Concept: Late Interaction (ColBERT)
Source: RAG/Search-and-Retrieval/Notes/Late-Interaction-Token-Matching.md

Use check-page-completeness on site/topics/rag/baseline.html

Use scaffold-dataset on my Transformers attention notes
```

### Claude Code

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

Each skill is designed to be invoked repeatedly across the project lifetime.
