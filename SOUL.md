# SOUL.md — Project Mission and Design Philosophy

## Mission

Make every technical AI/ML concept viscerally understandable before a single line of code is read.

The measure of success is not "did the user read the explanation" but "did they feel the insight click."

## The Core Belief

Intuition is not a simplified version of understanding. It is the *prerequisite* to it.

A person can memorize that ColBERT uses "token-level MaxSim matching" without understanding *why* this matters or *when* you'd choose it over E5. They might pass a quiz. But they haven't *understood*.

We build intuition by:
1. Grounding new ideas in existing mental models (analogies)
2. Making failure visible (what breaks when you skip this step)
3. Showing the mechanism through animation before naming it
4. Asking them to apply the idea immediately (quiz)

## The Three-Moment Rule

Every concept page must create three moments, or it is incomplete:

### Moment 1: "Oh, I've seen this before"
The analogy lands. The reader maps the new concept onto something they already understand.

**Example:** "ColBERT is like searching a bookshelf by scanning *every word on every spine* instead of glancing at the book titles once. You get more signal by looking at detail."

This happens in the `#hook` and first part of `#interactive-viz`.

### Moment 2: "Now I get why this is hard"
The reader feels the constraint or tradeoff. They see what breaks without this technique.

**Example:** The animation shows a baseline RAG system returning irrelevant chunks because the embedding model lost lexical precision by pooling tokens into a single vector. The reader *sees* the failure.

This happens in `#why-it-matters` and the failure chain animation.

### Moment 3: "I could explain this to someone else"
The reader passes the quiz. They've applied the concept to a new scenario and gotten it right.

This happens in `#check-understanding`. The quiz is the gate. No concept is learned until the quiz passes.

## What We Are NOT Building

- **A documentation site** — no "reference first" mode. Every page teaches one idea, start to finish.
- **A course with video lectures** — no passive consumption. Every interaction is hands-on.
- **A chatbot or RAG demo app** — no backend. Pure static files. The learning is about *understanding*, not *using a tool*.
- **A "comprehensive guide"** — depth is earned through the sequence, not front-loaded. A reader learns baseline RAG before learning GraphRAG.
- **A collection of notes** — we're not republishing papers. We're creating new insights by intersecting technique, analogy, and animation.

## Seven Design Principles

### 1. Analogy Before Definition
Always. A reader should be able to explain the concept in plain English *before* they encounter the technical term.

Banned: "Deep neural networks use multi-head attention to compute relevance scores across input tokens." ❌
Good: "Imagine you're reading an essay about machine learning. Your brain doesn't focus equally on every word — certain words matter more for understanding, depending on what you're trying to grasp. Attention works the same way." ✓

### 2. Interactive Before Passive
Show, don't tell. An animated step-by-step walkthrough teaches more than a paragraph of explanation.

If a concept involves a sequence (parsing → chunking → embedding → retrieval), animate it. Let the reader *see* the data flow.

### 3. One Concept Per Page
No sprawl. A page teaches one idea and one idea only. "Search and Retrieval" is a hub page that links to "ColBERT", "HyDE", "BM25", etc. — not a page that tries to teach all of them.

### 4. Failure Modes Are First-Class
Every `#core-mechanism` section needs a corresponding failure narrative. "Here's how it works" is incomplete without "Here's what breaks when you skip this step."

Example: The RAPTOR page doesn't just show the tree structure; it shows what a flat chunking approach loses (loss of hierarchy, inability to reason about documents as a whole).

### 5. The Quiz Is The Gate
A concept is learned when it is passed, not read.

If a reader skips the quiz, we don't mark the concept complete. If they fail the quiz, we don't move them forward. The quiz is not a "bonus check" — it's the mechanism of learning.

### 6. Progressive Disclosure
TL;DR → Visual → Details → Tradeoffs → Quiz

A reader can understand the core idea from the first three sections without reading the technical details. The Details tab exists for practitioners who want to implement. The Tradeoffs section exists for people deciding whether to use this at all.

### 7. Zero Friction to Start
No account. No setup. No build step.

`python -m http.server 8080 && open http://localhost:8080`

That's it. A reader opens the landing page and can start learning within 30 seconds.

## Voice

- **Direct and concrete**, not academic
  - "This algorithm is slow when the corpus is huge" not "scalability constraints emerge in high-cardinality retrieval scenarios"
- **Uses "you" and "your corpus"** — addresses the practitioner, not the theorist
- **Short sentences. Active verbs.** — "ColBERT keeps tokens separate" not "The token-level architecture is preserved through the retrieval phase"
- **No hedging** — take positions. "Use ColBERT when you need lexical precision" not "ColBERT can sometimes be considered when precision matters, depending on the use case"
- **Concrete examples over abstract principles** — "A 10M-token corpus with ColBERT uses 40GB of VRAM" not "Scalability is quadratic in corpus size"

## Adding a New Topic

A topic earns its place when three conditions are met:

1. **Source material exists** — as reviewed notes in `RAG/` or an equivalent source folder
2. **A coherent "why" chain exists** — why this concept matters now, not just "it exists"
3. **At least one interactive component can be designed** that creates Moment #2 (feeling the failure)

Before proposing Transformers, RAG, RL, etc., ensure the source material is written and reviewed. Don't design the learning platform for a topic until the topic is well understood.

## Success Metrics

A concept page succeeds if:
- A reader with no background in the topic reads the hook and interactive-viz sections and can explain the idea to a peer
- A reader passes the quiz without re-reading the core-mechanism section (it means they got it from the analogy and animation)
- A reader visits the page, then comes back two weeks later and remembers the core idea (we're building long-term understanding, not cramming)

We don't measure by page views or time on site. We measure by "did this person's mental model change."

## Content Types

We build three kinds of learning experiences:

1. **Concept pages** (RAG curriculum) — one idea, quiz-gated, three moments
2. **Topic hubs** — sequence and prerequisites only
3. **Paper Journey** — end-to-end research paper mastery, hypothesis-gated

## Paper Journey (fourth content type)

A Paper Journey teaches a research paper so the learner can **explain it end-to-end** and **propose credible extensions** — thinking, not implementing.

### Three parts (every paper journey page)

**Rule: Never lead a paper journey with a playground. Understanding sections come first.**

| Part | Purpose |
| ---- | ------- |
| **Orient** | Hub, thesis, prerequisites — on `index.html` |
| **Understand** | Read-only holistic brief: problem → insight → method → evidence → vocabulary → checkpoint |
| **Verify** | Playgrounds — each labeled "You read X — now prove it" |
| **Think** | Assumption breaker + Research Extension Studio |

Single-page flow on `lab.html`: Part 1 (Understand) → Part 2 (Verify) → Part 3 (Think).

Matches the RAG concept page pattern: analogy → why → play — but at paper scale.

### Five moments (papers)

Concept pages use three moments. Paper Journeys add two more:

### Moment 4: "I see where this breaks and why"
The learner toggles assumptions (scale, structure, agent capability) and watches DCI-style wins flip to struggles. They feel the paper's boundary conditions.

This happens in **Part 3 — Think** (`assumption-breaker` playground).

### Moment 5: "I could propose a research direction from here"
The learner writes a short hypothesis for an extension prompt, then compares to an expert reveal. Gap = learning. No code required.

This happens in **Part 3 — Think** (`hypothesis-studio` playground).

### Hypothesis gate (not quiz)

Papers do **not** use multiple-choice quizzes. Mastery is:

- Completed Part 1 (Understand) — checkpoint or scrolled through key sections
- Used verify playgrounds (compare, top-k, terminal)
- Explored ≥3 assumption-breaker scenarios
- Completed hypothesis for ≥2 extension prompts (stored in `sessionStorage`)
- Self-honor **Research readiness** checklist in the sidebar

Implementation links (arXiv, GitHub) are optional footnotes — never the mastery gate.

### Paper Journey voice

Same as concept pages: direct, concrete, practitioner-facing. Add: name tradeoffs explicitly, cite benchmark numbers when relevant, and always show *what the paper assumes* before celebrating what it achieves.

## For Agents

Before writing or reviewing concept content, read this file.

In Cursor, the `content-voice` rule applies when editing `site/**/*.html`.
Use the `check-page-completeness` and `quiz-quality-check` skills before marking a page done.

See also: [AGENTS.md](AGENTS.md) for repo conventions, [SKILLS.md](SKILLS.md) for workflows.
