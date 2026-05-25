# ERROR.md — Known Error Patterns and Fixes

When something goes wrong on the platform, refer to this file first. Each error includes the symptom, root cause, and fix.

## For Cursor Agents

When debugging this repo:

1. Run the local server (`python -m http.server 8080 --directory site`) before testing ES modules
2. Use browser DevTools for progress/quiz issues — grep `initProgress`, `data-quiz-id`, `data-progress-ring`
3. If the agent cannot reproduce UI bugs, ask the user to paste console errors

---

## ES Module CORS Error When Opening from Filesystem

**Symptom:**
```
Uncaught TypeError: Failed to load module script: 
Expected a javascript module script 
but the server responded with a MIME type of "".
Location: file:///Users/.../site/index.html.
```

Or simply: Nothing loads, console is empty, page appears blank.

**Root Cause:**
Browsers block ES module imports (`<script type="module">`) across `file://` origins by default due to CORS restrictions. Even though you're on the same machine, the browser treats filesystem files differently from HTTP-served files.

**Fix:**
Run a local HTTP server instead:

```bash
cd site
python -m http.server 8080
# Then open http://localhost:8080 in your browser
```

Or use Python 3 directly in the project directory:
```bash
python -m http.server 8080 --directory site
```

Or Node.js (if you have it):
```bash
npx http-server site -p 8080
```

This is expected behavior — see AGENTS.md for instructions.

---

## Progress Ring Shows 0% Even After Completing Concepts

**Symptom:**
- You complete a concept's quiz (see the "Quiz Passed!" message)
- You navigate to a different page or the landing page
- The progress ring stays at 0% (empty)
- But locally in DevTools, you can see quiz answers were saved

**Root Cause:**
The `localStorage` key mismatch. Progress is stored under a key like `intuitive:progress:rag`, but the code reading it is looking for a different topic ID.

Specifically, one of three places has a mismatch:
1. The topic `id` in `site/js/topics/registry.js`
2. The `data-progress-ring` attribute on the progress ring container
3. The `topicId` parameter passed to `initProgress(topicId, conceptSlug)`

**Example of what goes wrong:**
```js
// registry.js says:
{ id: 'rag', title: 'Retrieval-Augmented Generation', ... }

// But the HTML passes:
<div data-progress-ring="RAG"></div>  // ← Wrong! Case mismatch

// Or the JS calls:
initProgress('RAG', 'baseline')  // ← Different case again
```

**Fix:**
1. Open browser DevTools → Application tab → LocalStorage
2. Look for keys starting with `intuitive:progress:`
3. Note the topic ID (e.g., `intuitive:progress:rag`)
4. Open `site/js/topics/registry.js` and verify the topic `id` matches
5. Grep for `data-progress-ring` and `initProgress()` calls and ensure all three use the exact same ID
6. Clear localStorage if needed: DevTools → LocalStorage → right-click key → Delete
7. Refresh the page and complete a quiz again

**Prevention:**
Use kebab-case consistently: `id: 'rag'`, `data-progress-ring="rag"`, `initProgress('rag', slug)`.

---

## Quiz Does Not Fire quiz:passed Event

**Symptom:**
- Quiz completes (you see your score)
- But the concept never gets marked as "done" in progress
- Progress ring doesn't update
- No localStorage entry for `intuitive:progress:rag`

**Root Cause:**
The quiz is completing, but the `quiz:passed` event is not emitting (or not being heard). Two common causes:

1. **Slug mismatch**: The `data-quiz-id` on the `.quiz-container` doesn't match the slug passed to `initProgress()`:
   ```html
   <div class="quiz-container" data-quiz-id="baseline"></div>
   ```
   But the JS calls `initProgress('rag', 'baseline-page')` — different slug.

2. **Quiz score calculation bug**: The score is computed using integer division instead of floating-point:
   ```js
   // Wrong (integer division):
   if (correct / total >= 75)  // If correct=1, total=1, this is 100/100, fine
                                // But if correct=3, total=4, this is 3/4 = 0 (integer)
   
   // Correct (floating-point):
   if (correct / total >= 0.75)  // Explicitly compare to 0.75, not 75
   ```

**Fix:**
1. Open browser DevTools → Console → Filter to "quiz"
2. Add temporary `console.log` in `quiz.js` when the event emits:
   ```js
   emit('quiz:passed', { conceptSlug });
   console.log('Quiz passed event emitted for:', conceptSlug);
   ```
3. Complete a quiz and check the console — does the log appear?
4. If yes, the event fired. Check that `progress.js` has an event listener for `quiz:passed`:
   ```js
   on('quiz:passed', ({ conceptSlug }) => {
     console.log('Progress heard quiz:passed for:', conceptSlug);
     markQuizPassed(conceptSlug);
   });
   ```
5. If no, the event didn't fire. Check:
   - `data-quiz-id` on the quiz container matches the expected slug
   - Score calculation uses `>= 0.75`, not `>= 75`
   - The `eventbus` module exports the correct `emit` function
6. Clear browser console and DevTools cache (DevTools → Network → "Disable cache" checkbox) and reload

---

## Animated Pipeline Viz Does Not Mount

**Symptom:**
- Page loads without errors
- The `.viz-container` element is present in the HTML
- But the interactive diagram is missing (empty white box)
- No JavaScript errors in console

**Root Cause:**
The `data-viz-type` attribute on the `.viz-container` has a value that doesn't match any handler registered in `pipeline-viz.js`. The component tries to mount but finds no matching case in the switch statement.

**Example:**
```html
<div class="viz-container" data-viz-type="cool-new-pipeline"></div>
```

But in `pipeline-viz.js`:
```js
switch (type) {
  case 'baseline-pipeline-stepper': ...
  case 'rag-pipeline-map': ...
  // ← 'cool-new-pipeline' not in the list
}
```

**Fix:**
1. Grep for the `data-viz-type` value to find what you meant:
   ```bash
   grep -r "data-viz-type" site/topics/
   ```
2. Compare against the list in `pipeline-viz.js`:
   ```js
   const vizHandlers = {
     'baseline-pipeline-stepper': handleBaseline,
     'rag-pipeline-map': handleRagMap,
     'comparison-slider': handleComparison,
     // ... see full list for valid values
   };
   ```
3. Fix the HTML to use a valid value, OR add a new handler in `pipeline-viz.js`:
   ```js
   case 'my-new-viz-type':
     renderMyNewViz(element, config);
     break;
   ```
4. Reload the page

**Prevention:**
Before committing a new concept page, verify the `data-viz-type` value exists in the handler map.

---

## Before/After Comparison Slider Jumps on Touch

**Symptom:**
- On desktop, dragging the slider handle works smoothly
- On mobile/touch, the handle teleports instead of following your finger
- Page scrolls while you're trying to drag the slider

**Root Cause:**
The `pointermove` event listener doesn't have `{ passive: false }` and doesn't call `event.preventDefault()`. This allows the browser to prioritize page scrolling over the drag handler.

**Code that causes it:**
```js
element.addEventListener('pointermove', (e) => {
  const x = e.clientX;
  // ← No preventDefault() → page can scroll
});
```

**Fix:**
In `site/js/components/comparison.js`, update the event listener:

```js
// Before:
element.addEventListener('pointermove', (e) => {

// After:
element.addEventListener('pointermove', (e) => {
  e.preventDefault();  // ← Add this
```

And ensure the listener is registered with `{ passive: false }`:

```js
element.addEventListener('pointermove', handleMove, { passive: false });

function handleMove(e) {
  e.preventDefault();
  // ... drag logic
}
```

This tells the browser "I might call preventDefault on this event, so don't defer it."

---

## Section Scroll-Spy Marks Wrong Section as Active

**Symptom:**
- You scroll the page
- The sidebar section navigation shows the wrong section as "current"
- When you're clearly reading section 3, the sidebar marks section 4 as active
- Or adjacent sections are marked active at the same time

**Root Cause:**
The `IntersectionObserver` in `router.js` has a `rootMargin` that's too generous. Multiple sections trigger "visible" at once, and the code picks the last one instead of the topmost one.

**Default setting:**
```js
const observer = new IntersectionObserver(callback, {
  rootMargin: '-40% 0px -55% 0px',  // ← Adjust these percentages
});
```

The `rootMargin` defines which part of the viewport counts as "visible." `-40% 0px -55% 0px` means:
- Only sections in the middle 5% of the viewport count
- Sections scrolled to the top or bottom are ignored

If this band is too wide, multiple sections are "visible" at once.

**Fix:**
Narrow the active band. In `router.js`, adjust the `rootMargin`:

```js
// Current (too loose):
rootMargin: '-40% 0px -55% 0px'

// Tighter (better):
rootMargin: '-45% 0px -45% 0px'

// Even tighter (for snappy scrollspy):
rootMargin: '-48% 0px -48% 0px'
```

Or use a pixel-based margin if percentages feel wrong:

```js
rootMargin: '-200px 0px -300px 0px'
```

Reload the page and scroll again. The active section should now track correctly.

---

## Fonts Fail to Load on GitHub Pages

**Symptom:**
- Locally (with `python -m http.server`), fonts look correct (Inter, JetBrains Mono)
- On GitHub Pages, fallback fonts appear (system sans-serif, monospace)
- Console shows no errors

**Root Cause:**
Font file paths are relative and break when a page is nested deeper (e.g., `site/topics/rag/baseline.html` is two levels deep). A relative path like `../../../assets/fonts/inter.woff2` might work from one page but not another.

Or: the font files don't exist in `site/assets/fonts/` at all.

**Example of what goes wrong:**
```css
/* In site/design-system/components.css: */
@font-face {
  font-family: 'Inter';
  src: url('../assets/fonts/inter.woff2') format('woff2');  /* ← Relative path */
}
```

A page at `site/index.html` resolves this to `site/assets/fonts/inter.woff2` ✓
A page at `site/topics/rag/baseline.html` looks for `site/topics/rag/../assets/fonts/inter.woff2` ❌ (doesn't exist)

**Fix:**

**Option 1: Use absolute paths from site root**
In `tokens.css` or `components.css`, use absolute paths:

```css
@font-face {
  font-family: 'Inter';
  src: url('/assets/fonts/inter.woff2') format('woff2');  /* ← Absolute, from /site/ root */
}
```

This works both locally and on GitHub Pages (as long as the page includes the leading `/`).

**Option 2: Use a CSS custom property** (recommended if paths vary)
In `tokens.css`:

```css
:root {
  --font-base-path: '../../assets/fonts';
  /* Or for GitHub Pages: '/assets/fonts' */
}
```

Then in components.css:

```css
@font-face {
  font-family: 'Inter';
  src: url(var(--font-base-path) + '/inter.woff2') format('woff2');
}
```

⚠️ Note: CSS doesn't support string concatenation with `+`. Use absolute paths instead.

**Option 3: Verify files exist**
```bash
ls -la site/assets/fonts/
```

Ensure `inter.woff2`, `jetbrains-mono.woff2` (or whatever you named them) exist.

**Prevention:**
Always use absolute paths from the site root (leading `/`) for fonts. Relative paths are brittle across nested pages.

---

## LocalStorage Is Full / Not Persisting

**Symptom:**
- Quiz is completed and you see the success message
- You refresh the page
- Progress is gone (reset to 0%)
- Or you see an error about localStorage quota

**Root Cause:**
1. localStorage quota exceeded (rare on modern browsers, but possible on old mobile devices)
2. Browser privacy mode (incognito) — localStorage is cleared on tab close
3. Clearing browser data — user (or a script) cleared localStorage manually

**Fix:**
1. Check if you're in incognito/private mode. If so, enable normal browsing mode.
2. Check localStorage quota:
   ```js
   navigator.storage.estimate().then(({ usage, quota }) => {
     console.log(`Using ${usage} of ${quota} bytes`);
   });
   ```
3. If quota is exceeded, try:
   - Clearing other sites' localStorage (DevTools → Application → LocalStorage)
   - Closing other tabs (reduces overall quota pressure)
   - Using a different browser (Firefox, Chrome, Safari have separate quotas)
4. Manually set a test value:
   ```js
   localStorage.setItem('test', 'value');
   console.log(localStorage.getItem('test'));  // Should print 'value'
   ```

---

## Page Breaks on Mobile / Text Overflows

**Symptom:**
- Desktop version looks fine
- On mobile (≤640px width), text overlaps buttons or spills out of containers
- Sidebar might cover content

**Root Cause:**
CSS is missing mobile breakpoints, or breakpoints are defined but media queries aren't applied.

**Fix:**
1. Add a mobile breakpoint media query. In `site/design-system/components.css`:

```css
/* Desktop: default */
.page-layout {
  display: grid;
  grid-template-columns: 16rem 1fr;  /* sidebar + content */
}

/* Mobile: ≤640px */
@media (max-width: 640px) {
  .page-layout {
    grid-template-columns: 1fr;  /* stack vertically */
  }

  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    transform: translateX(-100%);  /* hidden by default */
    /* When active: transform: translateX(0); */
  }

  .content {
    width: 100%;
    padding: var(--space-4);  /* add breathing room */
  }
}
```

2. Test on mobile or use DevTools device emulation (F12 → right-click → "Inspect" → Device toolbar icon)

---

## Accessibility: Keyboard Navigation Broken

**Symptom:**
- You press Tab repeatedly
- Focus doesn't move, or jumps to unexpected elements
- You can't navigate menus/modals with arrow keys

**Root Cause:**
Missing or incorrect ARIA roles, or elements lack `tabindex`.

**Fix:**
1. Add `tabindex="0"` to interactive elements that don't natively have it:
   ```html
   <!-- Good: semantic HTML, natively focusable -->
   <button>Click me</button>
   <a href="#">Link</a>

   <!-- Bad: needs tabindex to be focusable -->
   <div role="button">Click me</div>  <!-- ← Also add tabindex="0" -->

   <!-- Better: use semantic HTML -->
   <button>Click me</button>
   ```

2. For custom components (tabs, menus), add `role` attributes:
   ```html
   <div role="tablist">
     <button role="tab" aria-selected="true">Tab 1</button>
     <button role="tab" aria-selected="false">Tab 2</button>
   </div>
   ```

3. Implement arrow key navigation in JavaScript:
   ```js
   element.addEventListener('keydown', (e) => {
     if (e.key === 'ArrowRight') {
       focusNextTab();
     } else if (e.key === 'ArrowLeft') {
       focusPrevTab();
     }
   });
   ```

See AGENTS.md for accessibility testing checklist.

---

## Paper Journey Part 2 Playgrounds Are Empty (Gray Boxes, No Controls)

**Symptom:**
- On `lab.html`, Part 2 sections show empty rounded boxes — no sliders, dropdowns, or step-through UI
- Part 1 (read-only text) renders fine; Part 3 may also be broken
- Browser console shows: `Uncaught TypeError: Cannot read properties of undefined (reading 'map')` in `paper-page.js` (often at `renderPaperNav`)

**Root Cause:**
`initPaperLab()` calls `renderPaperNav()` **before** `mountPlaygrounds()`. If `renderPaperNav` throws, playground mounting never runs — containers stay as bare `<div class="playground">` elements.

Common triggers when onboarding a new paper:

1. **Missing `concepts` in `paperRegistry.js`** — `paper.concepts.map(...)` throws when `concepts` is omitted (use `concepts: []` if there are no deep dives)
2. **Invalid `lab-data.js` import** — syntax error or bad path in `lab.html` script; entire module fails to load
3. **`data-playground` key mismatch** — HTML has `data-playground="paradigm-compare"` but `lab-data.js` → `playgrounds` has no matching key (playground shows a text error *if* mount runs; silent empty box if mount never runs)
4. **Required config missing** — e.g. `resolution` needs `config.document`; mount shows inline message but only if `mountPlaygrounds` was reached

**Fix:**

1. Open DevTools → Console on the paper's `lab.html`
2. If `paper.concepts` error: add to registry entry:
   ```js
   concepts: [],  // or [{ slug, label, file }, ...]
   ```
   `paper-page.js` also guards with `(paper.concepts || []).map` — but registry should always define `concepts`.
3. If module load error: fix the import path in `lab.html` and validate `lab-data.js` exports `default`
4. If playground key mismatch: align every `data-playground="…"` in `lab.html` with a key in `playground-configs.js` / `lab-data.js` → `playgrounds`
5. Hard-refresh (Ctrl+Shift+R) after JS changes

**Prevention — verify every new Paper Journey before shipping:**

```bash
# From repo root (static wiring check)
node scripts/verify-paper-lab.mjs <paper-id>
```

Then open `lab.html` in the browser (server: `python server/dev_server.py` or `python -m http.server 8080` in `site/`):
- [ ] Console: zero errors on load
- [ ] Part 2 → Paradigm compare: step slider and side panels render
- [ ] Part 2 → at least one other core verify lab (compare / resolution / top-k) interactive
- [ ] Part 3 → Assumption breaker toggles render

See also `Papers/PAPER-JOURNEY-STANDARD.md` registry section and `.cursor/skills/new-paper-journey/SKILL.md` step 9.

---

## Still Stuck?

If your error isn't listed here:

1. **Check the console** — DevTools → Console → look for error messages
2. **Check localStorage** — DevTools → Application → LocalStorage → filter "intuitive:"
3. **Check network** — DevTools → Network → look for failed requests (404s for CSS/JS)
4. **Check HTML** — View Page Source (Ctrl+U) and search for typos in data attributes
5. **Grep the codebase** — search for the error message or the broken feature name
6. **Read SOUL.md and AGENTS.md** — for principles and conventions that might clarify the issue
7. **Add debug logs** — `console.log` at each step to track the execution flow

If you find a new error pattern, add it to this file with the same structure:
Symptom → Root Cause → Fix → Prevention.
