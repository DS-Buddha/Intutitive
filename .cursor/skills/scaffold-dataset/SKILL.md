---
name: scaffold-dataset
description: Converts raw Markdown or Obsidian notes into structured concept data ready for a -data.js module. Use when structuring raw notes, converting Obsidian notes to page data, or preparing content before building a concept page.
disable-model-invocation: true
---

# Scaffold Dataset

## Workflow

1. Read raw Markdown source notes (typically from `RAG/`)
2. Extract and structure:
   - TL;DR, When to use, When not to use
   - Core ideas, Key metrics, Links, Next steps, Related questions
3. Map content to HTML sections:
   - hook → why-it-matters → interactive-viz → core-mechanism → tradeoffs → connections → check-understanding
4. Suggest analogy and real-world example for `#hook`
5. Propose failure narratives for `#why-it-matters`
6. Identify interactive viz types — recommend best fit from `pipeline-viz.js` handlers
7. Draft 2–4 quiz questions (user reviews and finalizes)
8. Output structured object ready for `*-data.js`

## Output format

```js
// Ready to paste into site/js/topics/<topic>/<concept-slug>-data.js
export const stages = [ /* viz config */ ];
export const quiz = [ /* questions */ ];
export const comparison = { /* optional */ };
```

Plus section-by-section content outline for the HTML page.
