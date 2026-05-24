---
tags: [paper, rag, dci, agentic-search, retrieval]
status: evergreen
source: https://arxiv.org/abs/2605.05242
aliases: [DCI, Direct Corpus Interaction]
updated: 2026-05-23
---

# Direct Corpus Interaction (DCI) — Paper Notes

## TL;DR

**Direct Corpus Interaction (DCI)** lets an agent search a raw corpus via terminal tools (`grep`, `rg`, `find`, file reads) instead of a fixed top-k retriever API. No embeddings, no vector index. Strong results on BrowseComp-Plus, multi-hop QA, and IR benchmarks — reframing retrieval as **interface design**, not just retriever design.

## Authors & links

- arXiv: [2605.05242](https://arxiv.org/abs/2605.05242)
- Code: [DCI-Agent/DCI-Agent-Lite](https://github.com/DCI-Agent/DCI-Agent-Lite)

## Key thesis

> "The medium shapes and controls the scale and form of human association and action." — McLuhan

For agentic search, retrieval **is** the medium. A top-k retriever compresses corpus access into one step; evidence filtered early cannot be recovered. DCI grants **higher retrieval interface resolution** — operating on lines, spans, and piped lexical constraints.

## Core concepts

### Top-k bottleneck

Retriever-mediated access: query → ranked top-k snippets. Agent cannot flip to page 47, pipe greps, or verify a hypothesis against local context if the retriever never surfaced it.

### Retrieval interface resolution

Granularity of corpus access: document → passage → line → character span. DCI operates at finer units than typical chunk retrieval.

### CLI composability

`grep 'foo' file | grep 'bar'`, `find . | grep 'report' | grep '2024'` — combine weak clues without a single semantic guess.

### Coverage vs localization

- **Coverage:** did the trajectory surface gold documents at all?
- **Localization:** how precise is the exposed snippet within the gold doc?

DCI gains often come from **better localization** (finer verification), not just more gold docs in recall.

## Method (§3)

### Two paradigms (Figure 2)

| Retriever-mediated | Direct corpus interaction |
| ------------------ | ------------------------- |
| Offline index + embed | Raw corpus, no index |
| top-k API | grep, rg, find, read, scripts |
| Ranked snippets | Tool outputs with line context |

### Implementations

- **DCI-Agent-Lite:** Pi-based, bash + read only, lightweight context management
- **DCI-Agent-CC:** Claude Code harness, same DCI interface

### Context management (L0–L4)

| Level | Truncation | Compaction | Summarization |
| ----- | ---------- | ---------- | ------------- |
| L0 | ✗ | ✗ | ✗ |
| L1 | 50K chars | ✗ | ✗ |
| L2 | 20K chars | ✗ | ✗ |
| L3 | 20K chars | ✓ | ✗ |
| L4 | 20K chars | ✓ | ✓ |

## Key results

### BrowseComp-Plus (Figure 1)

- Retriever (Qwen3-Embed-8B): **69.0%** accuracy, **$1,440** cost
- DCI-Agent-CC: **80.0%** (+11.0), **$1,016** (−29.4%)

### Multi-hop QA (Table 2)

- DCI-Agent-CC: **83.0%** avg accuracy vs ASearcher-Local-14B **52.3%** (+30.7)

### IR ranking (Table 3)

- DCI-Agent-CC: **68.5%** avg NDCG@10 vs ReasonRank-32B baseline (+21.5)

## Three contributions

1. Formalize DCI and evaluate across agentic search, QA, and IR
2. Outperform strong sparse/dense/rerank baselines without external retrievers on most benchmarks
3. Introduce **retrieval interface resolution** with trajectory-level coverage/localization analysis

## Paper assumptions (stress-test layer)

These are the conditions under which DCI wins in the paper's evaluation setup:

| Assumption | Why it matters |
| ---------- | -------------- |
| **Local / workspace-scale corpus** | grep latency is acceptable; corpus fits on disk |
| **Capable multi-step agent** | DCI needs plan → grep → read → refine loops |
| **Structured text files** | plain text, CSV, markdown — not raw binary PDFs |
| **Generous latency budget** | multi-step search OK; sub-100ms retrieval not required |
| **No pre-built index** | corpus changes often or indexing cost is prohibitive |

## Limitations — where DCI stops winning

| Scenario | Why retriever/index wins |
| -------- | ------------------------ |
| Web-scale crawl (10B pages) | offline ANN index mandatory; grep cannot scan the web |
| Single-shot QA (no agent loop) | one retrieve-and-answer call is what dense retrievers optimize |
| Scanned PDF archive (no OCR) | grep on binary fails; parsing/indexing front-load required |
| Real-time chat with strict SLA | each grep+read adds round-trips |
| Static billion-doc corpus, query-heavy | amortize indexing when corpus is fixed and queries are many |

## Extension directions (Research Extension Studio)

Use these for hypothesis-studio reveal panels — learner thinks first, then compares.

### 1. Hybrid interface (retriever → DCI verify)

- **Framing:** combine recall (index) with localization (grep)
- **Tradeoffs:** two-hop latency; retriever bias may hide docs outside top-N
- **Directions:** retriever proposes file list → DCI span verification; learned router (index vs grep vs read)

### 2. Learned tool router vs raw bash

- **Framing:** DCI-Agent-Lite uses minimal tools deliberately
- **Tradeoffs:** learning helps tool selection; hurts interpretability and debuggability
- **Directions:** train on trajectory logs; constrain action space to pipeable shell patterns

### 3. Interface resolution as trainable policy

- **Framing:** paper introduces resolution as analytic lens, not learned controller
- **Tradeoffs:** coarse = fewer tokens; fine = precise but context-heavy
- **Directions:** reward localization metric; hierarchical read (doc → paragraph → span)

### 4. When semantic retrieval still wins

- **Framing:** DCI trades indexing for lexical control — not universally optimal
- **Tradeoffs:** paraphrase-heavy queries with no lexical anchor favor dense retrieval
- **Directions:** paraphrase QA benchmark with no shared tokens; ablation removing grep

### 5. Safety / sandbox constraints

- **Framing:** full shell on raw files is powerful and dangerous in production
- **Tradeoffs:** allowlist (rg, head) vs path traversal, resource exhaustion
- **Directions:** read-only container; audit log of corpus touches

## Prerequisites (from our curriculum)

- Baseline RAG — retriever-mediated pipeline
- Search & Retrieval — BM25/dense/hybrid limits
- Agentic RAG — multi-step planner–retriever loops

## Related questions

- When is offline indexing still worth it (huge static corpora)?
- How does DCI scale to web-scale vs local agent workspaces?
- Can interface resolution be learned without collapsing to one-shot retrieve?

## Paper Journey site mapping

| Layer | Site section | Playground |
| ----- | ------------ | ---------- |
| Feel | lab.html #compare–#metrics | interface-compare, topk, resolution, terminal, metrics |
| Walk | lab.html #paradigm–#contributions | paradigm-compare, context-level, evidence-lens |
| Stress-test | lab.html #assumptions | assumption-breaker |
| Extend | lab.html #studio | hypothesis-studio |
