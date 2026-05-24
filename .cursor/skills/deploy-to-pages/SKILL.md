---
name: deploy-to-pages
description: Prepares and verifies GitHub Pages deployment with path checks and live site checklist. Use when deploying to GitHub Pages, publishing the site, or setting up Pages hosting.
disable-model-invocation: true
---

# Deploy to GitHub Pages

## Pre-deploy checks

1. Ensure `site/.nojekyll` exists (prevents Jekyll from blocking `_template/`)
2. Verify relative paths in HTML (e.g., `../../design-system/tokens.css`, not absolute `/design-system/...`)
3. Confirm `.gitignore` excludes `node_modules/`, `.env`, etc.

## Deployment steps

1. Push to `main` branch
2. GitHub repo settings → Pages → Source: "Deploy from a branch"
3. Branch: `main`, folder: `/site`
4. Note published URL (e.g., `https://<user>.github.io/Intutitive/`)

## Live verification checklist

- [ ] Landing page loads
- [ ] Topic hub and concept pages load (no 404s for CSS/JS)
- [ ] Interactive viz renders
- [ ] Quiz completes and progress persists (localStorage)
- [ ] Fonts load on nested pages (check absolute font paths if needed — see ERROR.md)

## Output

Deployment instructions and verification checklist with any path issues found.
