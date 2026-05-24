---
name: design-system-audit
description: Finds hardcoded CSS values outside tokens.css and reports design system violations. Use when auditing CSS, checking for magic numbers, or ensuring all styles use design tokens.
disable-model-invocation: true
---

# Design System Audit

## Workflow

1. Grep `site/` for hardcoded px, rem, #hex, rgb, or color-name values outside `tokens.css`
2. Grep `site/` for hardcoded animation durations outside `animations.css`
3. Check colors use `var(--color-*)` or `var(--stage-*)`
4. Check spacing uses `var(--space-*)`
5. Check typography uses `var(--text-*)` and `var(--weight-*)`

## Report format

For each violation:
- File path and line number
- Hardcoded value found
- Recommended token name

## Output

List of violations, or: "Design system is clean — all values use tokens."
