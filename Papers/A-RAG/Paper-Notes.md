---
tags: [paper, rag, agentic-rag, hierarchical-retrieval]
status: evergreen
source: https://arxiv.org/abs/2602.03442
aliases: [A-RAG, ARAG]
updated: 2026-05-24
---

# A-RAG — Paper Notes

## TL;DR

**A-RAG** exposes three hierarchical retrieval tools directly to the LLM — `keyword_search`, `semantic_search`, and `chunk_read` — so the agent (not a fixed pipeline) decides when and how to retrieve. Beats Graph-RAG and Workflow-RAG baselines on multi-hop QA with comparable or **fewer** retrieved tokens. Performance scales with model capability and test-time compute.

## Authors & links

- arXiv: [2602.03442](https://arxiv.org/abs/2602.03442)
- Code: [Ayanami0730/arag](https://github.com/Ayanami0730/arag)

## Key thesis

> Existing RAG either retrieves in one shot or runs a predefined workflow. Neither lets the model participate in retrieval decisions — so RAG cannot scale with frontier model improvements.

A-RAG reframes RAG as **interface design for agents**: give the model multi-granularity tools (keyword → sentence → chunk) and a simple ReAct loop. The agent spontaneously composes workflows per task.

## Core concepts

### Three RAG paradigms (Figure 2)

| Paradigm | Who decides retrieval? | Example |
| -------- | ---------------------- | ------- |
| Naive RAG | Algorithm | Embed query → top-k → generate |
| Workflow RAG | Human designer | IRCoT, FLARE, MA-RAG fixed steps |
| Agentic RAG (A-RAG) | Model | Choose kw / semantic / read each step |

### Agentic autonomy (Appendix A)

Three principles — A-RAG satisfies all three:

1. **Autonomous strategy** — model picks tools and order
2. **Iterative execution** — multi-round, adapts to intermediate results
3. **Interleaved tool use** — ReAct action → observation → reasoning

### Hierarchical retrieval interfaces

| Tool | Granularity | Returns |
| ---- | ----------- | ------- |
| `keyword_search` | Lexical | Top-k chunk IDs + keyword-matching sentence snippets |
| `semantic_search` | Sentence | Top-k chunk IDs + best-matching sentences |
| `chunk_read` | Chunk | Full chunk text (+ adjacent chunks optional) |

Progressive disclosure: search tools return **snippets first**; agent reads full chunks only when needed.

### Context tracker

Tracks `C^read` — chunks already read. Re-reading returns zero tokens ("This chunk has been read before"), encouraging exploration and saving context.

## Method (§3)

### Index construction

- ~1000-token chunks (sentence-aligned, LinearRAG setup)
- Sentence-level embeddings (Qwen3-Embedding-0.6B)
- **No** offline keyword index — exact match at query time

### Agent loop

ReAct-style: one tool per iteration, max L steps. Deliberately simple — no parallel tool calls — to isolate interface effects.

## Key results

### Main benchmarks (GPT-5-mini, Table 1)

| Dataset | Naive RAG | A-RAG (Full) | Δ LLM-Acc |
| ------- | --------- | ------------ | --------- |
| MuSiQue | 52.8% | **74.1%** | +21.3 |
| HotpotQA | 81.2% | **94.5%** | +13.3 |
| 2WikiMultiHop | 50.2% | **89.7%** | +39.5 |
| GraphRAG-Bench Med. | 86.1% | **93.1%** | +7.0 |
| GraphRAG-Bench Novel | 70.6% | **85.3%** | +14.7 |

A-RAG (Naive) — single embedding tool only — already beats most Graph/Workflow baselines, showing agentic autonomy alone helps.

### Context efficiency (Table 3, GPT-5-mini)

A-RAG (Full) retrieves **fewer** tokens than Naive RAG on HotpotQA (2,737 vs 5,358) and 2Wiki (2,930 vs 5,506) while scoring higher. A-RAG (Naive) without hierarchical tools uses **more** tokens (e.g. 56K on MuSiQue) with **lower** accuracy — hierarchy enables selective reading.

### Ablation (Table 2, GPT-5-mini)

Removing semantic search or keyword search hurts; removing chunk_read (always return full chunks) also hurts vs progressive snippets → read.

### Test-time scaling (§5.1)

On MuSiQue-300: max steps 5→20 gives ~8% gain (GPT-5-mini); reasoning effort minimal→high gives ~25% gain. Stronger models benefit more from longer horizons.

## Paper assumptions

| ID | Assumption | Break scenario |
| ---- | ---------- | -------------- |
| `capable-model` | Model can tool-call and multi-step reason | Weak 7B without reliable function calling |
| `pre-chunked` | Corpus pre-chunked ~1K tokens with sentence boundaries | Streaming docs, no stable chunk IDs |
| `qa-benchmarks` | Multi-hop QA with provided corpus | Open-web search, real-time news |
| `iteration-budget` | Enough max steps for exploration | Strict 1-round latency SLA |
| `english-lexical` | Keyword search works on query language | Cross-lingual with no shared tokens |

## Limitations

| Limitation | Impact |
| ---------- | ------ |
| Tool design not exhaustive | Other tool subsets unexplored |
| Not tested on GPT-5 / Gemini-3 scale | Gains likely larger on frontier models |
| QA-focused eval | Fact verification, dialogue, long-form TBD |
| Simple agent loop | No parallel tools, no learned router |

## Extension directions

1. **Fourth tool layer** — document-level skim or graph hop before chunk tools
2. **Learned tool router** — when to escalate kw → semantic → read
3. **Parallel tool calls** — batch searches per iteration for latency
4. **Hybrid with GraphRAG** — graph for global structure, A-RAG tools for local read
5. **Failure-mode training** — reduce entity confusion (top failure category)

## Paper Journey site mapping

| Part 1 section | Part 2 playground | Part 3 seed |
| -------------- | ------------------- | ----------- |
| Hook + thesis | — | chat starters |
| Problem (two old paradigms) | `#paradigm` | assumption: `capable-model` |
| Insight (hierarchical tools) | `#granularity` | idea: `fourth-tool` |
| Method (agent loop + tracker) | `#context` | idea: `parallel-tools` |
| Evidence (benchmarks) | `#evidence` | idea: `graph-hybrid` |
| Vocabulary | `#compare`, `#topk` | assumption: `iteration-budget` |
