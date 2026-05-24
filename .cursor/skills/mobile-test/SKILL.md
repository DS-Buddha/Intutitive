---
name: mobile-test
description: Checks mobile responsiveness including viewport, breakpoints, touch targets, and overflow. Use when testing mobile-friendliness, checking responsive layout, or validating touch interactions.
disable-model-invocation: true
---

# Mobile Test

Audit the target page for mobile readiness.

## Checklist

1. Viewport meta: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
2. CSS media queries at 640px and 1024px breakpoints
3. Touch targets ≥ 44×44px
4. Comparison slider and touch interactions don't rely on hover-only affordances
5. Interactive elements have min 8px spacing
6. Long text wraps without overflow at ≤640px width

## Output

List of issues with fixes. Pass → "Ready for mobile."

## Testing tip

Use browser DevTools device emulation (F12 → device toolbar) at 640px width.
