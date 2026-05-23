---
tags: [rag, retrieval, self-rag, crag, agents, critique]
status: budding
source: https://arxiv.org/abs/2310.11511
aliases: [Self-RAG, CRAG, Corrective RAG, Self-RAG and CRAG]
parent: "[[Generative AI/RAG/Verification-and-Agentic-Loops/Verification-and-Agentic-Loops]]"
updated: 2026-05-20
---

# Adaptive retrieve and verify (Self-RAG, CRAG)

## TL;DR

Self-RAG and CRAG are complementary lines of work on **when to retrieve**, how to **critique** evidence, and how to **recover** from bad retrieval instead of freezing a single pipeline. They matter for production RAG where blind top‑k conditioning hurts factuality or user trust.

## When to use / not

- **Use** when queries are mixed (some need docs, some do not), retrieval quality is volatile, or you want explicit gating before trusting context.
- **Poor fit** when latency budgets forbid extra model steps or when your eval cannot measure reflection behavior.

## Core ideas

### Self-RAG — reflection tokens

- Train or prompt for **reflection**: retrieve vs. skip, relevance, usefulness of chunks.
- **Goal:** adaptive generation instead of always-on RAG.

**Sources:** [PDF](https://arxiv.org/pdf/2310.11511), [abstract](https://arxiv.org/abs/2310.11511)

### CRAG — corrective retrieval

- If retrieval looks weak, trigger **fallbacks** (e.g. web rewrite, alternate search) rather than conditioning on noisy chunks.
- **Goal:** degrade explicitly instead of hallucinating over junk context.

**Sources:** [PDF](https://arxiv.org/pdf/2401.15884), [abstract](https://arxiv.org/abs/2401.15884)

### Tradeoffs

- Extra steps add **latency** and need **labels or rubrics** if you train reflection.
- Composes with query improvement ([[Generative AI/RAG/Search-and-Retrieval/Notes/Hypothetical-Document-Expansion]]) and structure-first routing ([[Generative AI/RAG/Indexing-and-Structure/Notes/TOC-Structure-Navigation]]).

## How it fits

These methods sit at the **orchestration layer** above encoders and indexes: they decide whether [[Generative AI/RAG/Search-and-Retrieval/Notes/Late-Interaction-Token-Matching]]-level evidence is worth using and what to do when it is not. They are core building blocks of [[Generative AI/RAG/Verification-and-Agentic-Loops/Notes/Planner-Retriever-Reflection-Loops]] (CRAG and Self-RAG as two of three production architectures) without replacing your chunking or embedding choices.

## Links out

- [[Generative AI/RAG/RAG]]
- [[Generative AI/RAG/Verification-and-Agentic-Loops/Notes/Planner-Retriever-Reflection-Loops]]
- [[Generative AI/RAG/Search-and-Retrieval/Notes/Hypothetical-Document-Expansion]]
- [[Generative AI/RAG/Search-and-Retrieval/Search-and-Retrieval]]
- [[Generative AI/RAG/Indexing-and-Structure/Notes/TOC-Structure-Navigation]]

## Next steps

- **Follow-up note:** minimal prompt-only Self-RAG-style checklist vs. trained reflection heads.
- **Question:** What’s your fallback when CRAG-style signals say “retrieval failed”—human, web, or abstain?
- **Resource:** read CRAG paper sections on evaluator design and failure triggers.

## Related questions

- How do you log and audit reflection decisions for compliance?
