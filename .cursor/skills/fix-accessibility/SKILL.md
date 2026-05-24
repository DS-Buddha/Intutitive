---
name: fix-accessibility
description: Audits and fixes WCAG AA accessibility issues including ARIA roles, keyboard navigation, contrast, and heading hierarchy. Use when making a page accessible, adding keyboard nav, or checking WCAG compliance.
disable-model-invocation: true
---

# Fix Accessibility

Audit the target page and fix violations.

## Checklist

1. Buttons, links, interactive elements have proper ARIA roles
2. Form inputs have `<label>` or `aria-label`
3. Color contrast meets WCAG AA (4.5:1 text, 3:1 UI)
4. Keyboard: logical Tab order, Enter/Space activate buttons, Arrow keys for tabs/menus
5. Images have `alt` text or `aria-label`
6. Heading hierarchy: h1 → h2 → h3, no skipped levels
7. Focus styles on interactive elements (`:focus` or `:focus-visible`)

## Prefer semantic HTML

Use `<button>` and `<a>` instead of `<div role="button">`.

## Output

List violations with remediation. Pass → "Page is accessible."
