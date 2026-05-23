---
tags: [rag, retrieval, search, index, generative-ai]
status: evergreen
aliases: [Retriever, Search and retrieval, Information retrieval for RAG]
parent: "[[Generative AI/RAG/RAG]]"
updated: 2026-05-20
---

# Search and retrieval — concept hub

## TL;DR

**Search and retrieval** maps a query to candidate evidence (passages, chunks, or records) before generation. Dense vs sparse vs hybrid, recall vs precision, and query-side expansion usually dominate RAG quality more than the LLM prompt alone.

## When to use / not

- **Use** when designing or debugging **what gets into context** (missed docs, wrong chunks, search latency).
- **Not** for indexing trees, graphs, or retrieve-or-not gating—see sibling hubs under [[Generative AI/RAG/RAG]].

## Core ideas

### Recall vs precision

- **Recall stage:** cheap, high-throughput (bi-encoder, BM25, hybrid).
- **Precision stage:** rerankers (cross-encoder, late interaction) before the LLM sees text.

### Representation families

- **Bi-encoder (dense):** one vector per query and passage.
- **Late interaction:** multi-vector per text (MaxSim); see [[Generative AI/RAG/Search-and-Retrieval/Notes/Late-Interaction-Token-Matching]].
- **Sparse / hybrid:** BM25, learned sparse, RRF fusion.
- **Query-side:** [[Generative AI/RAG/Search-and-Retrieval/Notes/Hypothetical-Document-Expansion]] and related rewrites.

## Child concepts

- **Dense & APIs** — [[Generative AI/RAG/Search-and-Retrieval/SOTA-Retrieval-Catalog]]
- **Late interaction** — [[Generative AI/RAG/Search-and-Retrieval/Notes/Late-Interaction-Token-Matching]]
- **Query expansion** — [[Generative AI/RAG/Search-and-Retrieval/Notes/Hypothetical-Document-Expansion]]

## Catalogs

- [[Generative AI/RAG/Search-and-Retrieval/SOTA-Retrieval-Catalog]]

## How it fits

Sits after [[Generative AI/RAG/Document-Ingestion/Document-Ingestion]] in the pipeline. Critique and gating: [[Generative AI/RAG/Verification-and-Agentic-Loops/Notes/Adaptive-Retrieve-and-Verify]]. Hit quality: [[Generative AI/Evaluation/Metrics/Notes/Precision-Recall-F1]].

## Links out

- [[Generative AI/RAG/Search-and-Retrieval/SOTA-Retrieval-Catalog]]
- [[Generative AI/RAG/Search-and-Retrieval/Notes/Late-Interaction-Token-Matching]]
- [[Generative AI/RAG/Search-and-Retrieval/Notes/Hypothetical-Document-Expansion]]
- [[Generative AI/RAG/RAG]]
- [[Generative AI]]

## Related questions

- When does hybrid search beat dense-only on your corpus language mix?
