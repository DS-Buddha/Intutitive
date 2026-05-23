---
tags: [rag, agentic-rag, agents, orchestration, self-rag, crag, multi-agent]
status: budding
source: https://medium.com/@umesh382.kushwaha/agentic-rag-when-static-retrieval-is-no-longer-enough-15fafb3fa06d
aliases: [Agentic RAG, Agentic Retrieval-Augmented Generation, Agentic-RAG]
parent: "[[Generative AI/RAG/Verification-and-Agentic-Loops/Verification-and-Agentic-Loops]]"
updated: 2026-05-20
---

# Planner–retriever–reflection loops (Agentic RAG)

## TL;DR

**Agentic RAG** replaces the fixed query → retrieve → generate pipeline with a **reasoning loop**: plan sub-tasks, route to multiple tools, reflect on results, and re-retrieve when confidence is low. It matters when enterprise work needs multi-step retrieval, adaptive recovery, or synthesis across documents, APIs, and live data — tasks static RAG cannot do in one pass.

## When to use / not

- **Use** for multi-hop reasoning, cross-system synthesis (docs + DB + web), complex document workflows (due diligence, compliance screening, portfolio review), and high-stakes domains where reflection reduces hallucinations.
- **Do not** agentic-ify simple lookups ("what does clause 4.2 say?") — static [[Generative AI/RAG/Indexing-and-Structure/Notes/TOC-Structure-Navigation]] or vector RAG is cheaper and faster with no quality gain.
- **Require** cost controls, max iteration depth, and reasoning traces before production.

## Core ideas

### Static RAG wall

Fixed linear workflow: query → retrieval → context assembly → generate. No self-correction.

Fails on:

| Problem class | Example |
| ------------- | ------- |
| **Multi-step reasoning** | Find contracts where counterparty is in breach register, then check renewal overlap |
| **Adaptive recovery** | Initial retrieval insufficient — static system hallucinates; agentic reformulates and retries |
| **Tool-augmented synthesis** | Answer needs doc index + regulatory API + SQL + web search |

Static RAG = question-answering machine. Agentic RAG = reasoning partner. Difference is **architecture**, not model size.

### Four agentic design patterns (Singh et al. / Andrew Ng)

1. **Reflection** — critique outputs before returning; check if retrieved docs actually support the answer; re-query if not. [[Generative AI/RAG/Verification-and-Agentic-Loops/Notes/Adaptive-Retrieve-and-Verify]] implements via reflection tokens (IsREL, IsSUP, IsUSE).
2. **Planning** — decompose complex query into sub-tasks before retrieving. Hierarchical retrieval interfaces: ~94.5% HotpotQA, ~89.7% 2WikiMultiHop.
3. **Tool use** — retrieval is one tool among PageIndex, GraphRAG, web search, calculators. Harvey AI pattern: structured legal retrieval + live court APIs + knowledge graphs.
4. **Multi-agent collaboration** — Orchestrator, Retriever(s), Analyst, Critic, Writer. HM-RAG (Liu et al.) for complex multi-source reasoning.

**Survey:** Singh et al., [Agentic RAG survey](https://arxiv.org/abs/2501.09136) (arXiv:2501.09136, Jan 2025).

### Three production architectures

| Architecture | Mechanism | When to use |
| ------------ | --------- | ----------- |
| **CRAG** | Relevance classifier on chunks; below threshold → web/supplement search | Practical first step — one classification layer |
| **Self-RAG** | Decide if retrieval needed; critique with reflection tokens | Factual accuracy primary (clinical, legal) |
| **Multi-Agent RAG** | Specialized agents collaborate on workflows no single agent handles | Complex cross-doc + cross-system tasks |

See [[Generative AI/RAG/Verification-and-Agentic-Loops/Notes/Adaptive-Retrieve-and-Verify]] for CRAG and Self-RAG paper details.

### Benchmark highlights (article cites)

- **Self-RAG:** 5.8% hallucination rate vs 10.5–19% for other variants (250 clinical vignettes, MDPI Electronics 2025).
- **Multi-hop:** static ~34% vs agentic ~89% accuracy — categorical gap, not marginal tuning.
- **Tool-using tasks:** static ~15% vs agentic ~82% when live/cross-system data required.
- **CRAG:** Precision@5 ≈ 0.69, ~10.5% hallucination, ~240ms latency — often best cost/quality entry point.

### Honest tradeoffs

| Dimension | Static RAG | Agentic RAG |
| --------- | ---------- | ----------- |
| Latency | ~45ms (sparse) | ~350ms+ |
| Cost | Baseline | 3–8× on simple queries |
| Complexity | Low | Tool orchestration, error handling, runaway prevention |
| Multi-hop / tools | Poor | Strong |

Production needs: max iteration count, cost ceiling per query, monitoring for runaway chains.

### Production loop (7 stages)

1. **Intent parser** — decompose query into information needs
2. **Task planner** — tool assignment, order, fallbacks
3. **Tool router** — PageIndex (local), GraphRAG (relational), web (current), code executor (numeric)
4. **Retrieval execution** — parallel where independent; sequential when chained; confidence scores per result
5. **Reflection engine** — IsRelevant? IsGrounded? AnyGaps? → re-query signal
6. **Re-retrieval loop** — reformulate, switch tools; configurable depth limit
7. **Final answer** — synthesis with citations: tool, source, confidence per claim

### LangGraph + LlamaIndex pattern

State graph with nodes: `planner` → `retriever` → `reflector` → conditional loop back to `retriever` or forward to `generator`.

- Route local queries → PageIndex / vector index
- Relational queries → KnowledgeGraph index
- Else → web search
- Re-retrieve if `reflection_score < threshold` and `iterations < max`

### Business leader framing

1. Target **high-value slow tasks** currently done by skilled humans (due diligence, regulatory scan, contract portfolio review).
2. **Segment query types** — don't agentic-ify the 80% that are simple lookups.
3. **Cost controls from day one** — depth limits, cost ceilings, runaway monitoring.
4. **Log reasoning traces** — tool used, doc retrieved, reflection score that triggered re-query (audit/compliance).

### Document AI stack (5 layers — series context)

1. Retrieval — PageIndex vs chunking
2. Hallucination — root causes and fixes
3. Parsing — layout-aware extraction first
4. Architecture — GraphRAG vs PageIndex by query type
5. **Reasoning** — agentic loop (this note)

Weakness in any lower layer caps everything above.

### Emerging (2026 horizon)

- Multi-modal agentic RAG (tables, charts, diagrams natively)
- Memory-augmented agents (cross-session)
- RL-trained retrieval (Search-R1, arXiv:2503.09516)
- Human-in-the-loop at scale (LangGraph checkpointing) → [[Generative AI/Agents/Notes/Human-in-the-Loop-Multi-Agent-Workflows]]
- Real-time agentic RAG over fresh + historical docs (LazyGraphRAG direction)

## How it fits

Agentic RAG is the **orchestration layer** above parsing ([[Generative AI/RAG/Document-Ingestion/Notes/Document-Parsing-for-RAG]]), retrieval tools ([[Generative AI/RAG/Indexing-and-Structure/Notes/TOC-Structure-Navigation]], [[Generative AI/RAG/Graph-and-Global-Synthesis/Notes/Entity-Graph-Community-Retrieval]]), and critique methods ([[Generative AI/RAG/Verification-and-Agentic-Loops/Notes/Adaptive-Retrieve-and-Verify]]). For regulated workflows, pair with [[Generative AI/Agents/Notes/Human-in-the-Loop-Multi-Agent-Workflows]] and provenance patterns like [[Generative AI/RAG/Document-Ingestion/Notes/Layout-Aware-Evidence-Pins]].

## Links out

- [[Generative AI/RAG/RAG]]
- [[Generative AI/RAG/Verification-and-Agentic-Loops/Notes/Adaptive-Retrieve-and-Verify]]
- [[Generative AI/RAG/Indexing-and-Structure/Notes/TOC-Structure-Navigation]]
- [[Generative AI/RAG/Graph-and-Global-Synthesis/Notes/Entity-Graph-Community-Retrieval]]
- [[Generative AI/Agents/Notes/Human-in-the-Loop-Multi-Agent-Workflows]]
- Survey: [arXiv:2501.09136](https://arxiv.org/abs/2501.09136)

## Next steps

- Map your query taxonomy: simple lookup vs multi-hop vs cross-system → pick static vs CRAG vs full agentic.
- Prototype LangGraph loop with one bounded workflow and logged reasoning trace.
- Set max iterations (e.g. 3) and confidence threshold before any pilot.

## Related questions

- CRAG-only vs full multi-agent — what's the retrieval quality delta on your eval set?
- How do reflection scores align with human reviewer overrides in high-risk flows?
