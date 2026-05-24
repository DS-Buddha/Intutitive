---
name: new-topic
description: Creates a new topic hub with directory structure, data module, and registry entry. Use when starting a new subject area like Transformers, RL, or adding a new topic to the learning platform.
disable-model-invocation: true
---

# New Topic

## Workflow

1. Create `site/topics/<topic>/` directory
2. Copy `site/_template/topic-hub.html` → `site/topics/<topic>/index.html`
3. Fill in topic name, description, icon
4. Create `site/js/topics/<topic>/` directory
5. Create `site/js/topics/<topic>/<topic>-data.js` with full pipeline/stages config
6. Add entry to `site/js/topics/registry.js`:
   - `id`: kebab-case topic id
   - `title`: user-facing name
   - `description`: one-sentence hook
   - `icon`: SVG icon name
   - `hubPath`: path to hub page
   - `conceptCount`: 0 initially
   - `readingOrder`: empty array initially

## Output

New topic appears on landing page with 0% progress and 0 concepts.

## Example

```
Topic: transformers
Title: Transformers
Description: How attention mechanisms work and why they matter
Icon: pyramid
```
