---
name: new-concept-page
description: Scaffolds a complete concept page with HTML, data module, registry updates, and hub link card. Use when adding a concept page, creating a technique page under a topic, or building a new learning page from RAG source notes.
disable-model-invocation: true
---

# New Concept Page

## Workflow

1. Read the source note in `RAG/` (or topic equivalent). Extract TL;DR, When to use/not, Core ideas, Links, Next steps.
2. Copy `site/_template/concept-leaf.html` → `site/topics/<topic>/<concept-slug>.html`
3. Fill all 7 sections: hook, why-it-matters, interactive-viz, core-mechanism, tradeoffs, connections, check-understanding
4. Create `site/js/topics/<topic>/<concept-slug>-data.js`:
   - `stages` array or viz-specific config
   - `quiz` array (2–4 MC questions: `question`, `options`, `correct` index, `explanation`)
   - `comparison` object if tradeoffs uses before/after slider
5. Update `site/topics/<topic>/index.html` — add link card
6. Update `site/js/topics/registry.js` — add concept to reading order

## Slug alignment

Ensure these match (kebab-case):
- `data-quiz-id` on `.quiz-container` = concept slug
- `initProgress('<topic-id>', '<concept-slug>')`
- `data-progress-ring` = topic id from registry
- `data-viz-type` exists in `pipeline-viz.js`

## Output

A fully working concept page. Run `check-page-completeness` skill to verify.

## Example

```
Topic: rag
Concept: Late Interaction (ColBERT)
Source: RAG/Search-and-Retrieval/Notes/Late-Interaction-Token-Matching.md
Slug: search-colbert
```
