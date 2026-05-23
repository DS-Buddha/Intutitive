---
tags: [rag, verification, agentic, self-rag, index, generative-ai]
status: evergreen
aliases: [Verification and agentic loops, Adaptive RAG]
parent: "[[Generative AI/RAG/RAG]]"
updated: 2026-05-20
---

# Verification and agentic loops — concept hub

## TL;DR

**Verification and agentic loops** cover when to retrieve, whether evidence supports an answer, and multi-step plans that re-query tools until context is good enough—beyond one-shot top‑k retrieval.

## When to use / not

- **Use** when answers must be grounded, retrieval quality varies by query, or tasks need plan → retrieve → reflect cycles.
- **Overkill** for simple FAQ bots with stable corpora ([[Generative AI/RAG/Baseline-RAG-Pipeline]]).

## Child concepts

- [[Generative AI/RAG/Verification-and-Agentic-Loops/Notes/Adaptive-Retrieve-and-Verify]] (Self-RAG, CRAG)
- [[Generative AI/RAG/Verification-and-Agentic-Loops/Notes/Planner-Retriever-Reflection-Loops]] (Agentic RAG)

## How it fits

Downstream of [[Generative AI/RAG/Search-and-Retrieval/Search-and-Retrieval]]. Production governance: [[Generative AI/Agents/Notes/Human-in-the-Loop-Multi-Agent-Workflows]]. Eval: [[Generative AI/Evaluation/Judges/Notes/LLM-as-Judge]].

## Links out

- [[Generative AI/RAG/Verification-and-Agentic-Loops/Notes/Adaptive-Retrieve-and-Verify]]
- [[Generative AI/RAG/Verification-and-Agentic-Loops/Notes/Planner-Retriever-Reflection-Loops]]
- [[Generative AI/RAG/RAG]]
- [[Generative AI/Agents/Agents]]

## Related questions

- Which queries should skip retrieval entirely vs always retrieve-and-verify?
