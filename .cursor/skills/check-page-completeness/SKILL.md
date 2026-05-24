---
name: check-page-completeness
description: Audits a concept page against the 7-section standard, quiz config, slug alignment, and accessibility. Use when reviewing a page, checking if a concept is ready to ship, or auditing page completeness.
disable-model-invocation: true
---

# Check Page Completeness

Audit the target page against this checklist. Report pass/fail with file paths and line numbers for failures.

## Structure

- [ ] All 7 sections present with real content (not placeholder)
- [ ] Section ids: `hook`, `why-it-matters`, `interactive-viz`, `core-mechanism`, `tradeoffs`, `connections`, `check-understanding`
- [ ] Breadcrumb navigation correct and links work

## Interactive and quiz

- [ ] `.viz-container` has valid `data-viz-type` (exists in `pipeline-viz.js`)
- [ ] `<noscript>` fallback for interactive viz
- [ ] `.quiz-container` has `data-quiz-id` matching concept slug
- [ ] `*-data.js` exports `quiz` with ≥ 2 questions
- [ ] Each question: `question`, `options`, `correct` (0–3), `explanation`

## Progress alignment

- [ ] `data-progress-ring` matches topic `id` in `registry.js`
- [ ] `initProgress()` uses same topic id and concept slug
- [ ] All internal links are relative paths

## Runtime

- [ ] No console errors when served via local HTTP server
- [ ] Keyboard navigation works (Tab, Enter, Arrow keys for tabs)
- [ ] ARIA: `role`, `aria-selected`, `aria-label` where needed

## Output format

Pass/fail report listing each failed item with remediation steps.
