---
tags: [rag, retrieval, generative-ai, index, notes]
status: evergreen
aliases: [Retrieval-Augmented Generation]
updated: 2026-05-20
---

# RAG — state of the art

## TL;DR

This folder maps modern retrieval design by **pipeline theme**: ingestion, search, structure, graphs, and verification. Use it to pick a path instead of default single-vector chunking. Goal-based entry: [[Generative AI/Start-Here]].

## When to use / not

- **Use** for reading order or routing from a high-level RAG question to a specific note.
- **Not** a substitute for leaf notes—open those for mechanisms, tradeoffs, and citations.

## Child concepts (by theme)

| Theme | Hub | Key leaves |
|-------|-----|------------|
| **Baseline** | [[Generative AI/RAG/Baseline-RAG-Pipeline]] | chunk → embed → top-k → generate |
| **Ingestion** | [[Generative AI/RAG/Document-Ingestion/Document-Ingestion]] | [[Generative AI/RAG/Document-Ingestion/Notes/Document-Parsing-for-RAG]], [[Generative AI/RAG/Document-Ingestion/Notes/Layout-Aware-Evidence-Pins]] |
| **Search** | [[Generative AI/RAG/Search-and-Retrieval/Search-and-Retrieval]] | [[Generative AI/RAG/Search-and-Retrieval/Notes/Late-Interaction-Token-Matching]], [[Generative AI/RAG/Search-and-Retrieval/Notes/Hypothetical-Document-Expansion]] |
| **Structure** | [[Generative AI/RAG/Indexing-and-Structure/Indexing-and-Structure]] | [[Generative AI/RAG/Indexing-and-Structure/Notes/Hierarchical-Summary-Trees]], [[Generative AI/RAG/Indexing-and-Structure/Notes/TOC-Structure-Navigation]] |
| **Graphs** | [[Generative AI/RAG/Graph-and-Global-Synthesis/Graph-and-Global-Synthesis]] | [[Generative AI/RAG/Graph-and-Global-Synthesis/Notes/Entity-Graph-Community-Retrieval]] |
| **Verification** | [[Generative AI/RAG/Verification-and-Agentic-Loops/Verification-and-Agentic-Loops]] | [[Generative AI/RAG/Verification-and-Agentic-Loops/Notes/Adaptive-Retrieve-and-Verify]], [[Generative AI/RAG/Verification-and-Agentic-Loops/Notes/Planner-Retriever-Reflection-Loops]] |

### Catalogs

- [[Generative AI/RAG/Search-and-Retrieval/SOTA-Retrieval-Catalog]] — retrieval, rerank, query-side SOTA

### Concept map

```mermaid
flowchart LR
  ingest[Document_Ingestion]
  search[Search_and_Retrieval]
  index[Indexing_and_Structure]
  graph[Graph_and_Global_Synthesis]
  verify[Verification_and_Agentic]
  ingest --> search
  search --> index
  search --> graph
  search --> verify
```

### Suggested reading order

1. [[Generative AI/RAG/Baseline-RAG-Pipeline]] — contrast baseline
2. [[Generative AI/RAG/Document-Ingestion/Notes/Document-Parsing-for-RAG]]
3. [[Generative AI/RAG/Search-and-Retrieval/Search-and-Retrieval]] + [[Generative AI/RAG/Search-and-Retrieval/SOTA-Retrieval-Catalog]]
4. [[Generative AI/RAG/Search-and-Retrieval/Notes/Late-Interaction-Token-Matching]]
5. [[Generative AI/RAG/Search-and-Retrieval/Notes/Hypothetical-Document-Expansion]]
6. [[Generative AI/RAG/Indexing-and-Structure/Notes/Hierarchical-Summary-Trees]]
7. [[Generative AI/RAG/Indexing-and-Structure/Notes/TOC-Structure-Navigation]]
8. [[Generative AI/RAG/Graph-and-Global-Synthesis/Notes/Entity-Graph-Community-Retrieval]]
9. [[Generative AI/RAG/Verification-and-Agentic-Loops/Notes/Adaptive-Retrieve-and-Verify]]
10. [[Generative AI/RAG/Verification-and-Agentic-Loops/Notes/Planner-Retriever-Reflection-Loops]]
11. [[Generative AI/Agents/Notes/Human-in-the-Loop-Multi-Agent-Workflows]]

## How it fits

Under [[Generative AI]] with [[Generative AI/Evaluation/Evaluation]] and [[Generative AI/Agents/Agents]]. Combinations (HyDE + late interaction rerank; TOC vs summary trees) deserve design notes as you standardize stacks.

## Links out

- [[Generative AI/Start-Here]]
- [[Generative AI/RAG/Baseline-RAG-Pipeline]]
- [[Generative AI/RAG/Document-Ingestion/Document-Ingestion]]
- [[Generative AI/RAG/Search-and-Retrieval/Search-and-Retrieval]]
- [[Generative AI/RAG/Search-and-Retrieval/SOTA-Retrieval-Catalog]]
- [[Generative AI/RAG/Indexing-and-Structure/Indexing-and-Structure]]
- [[Generative AI/RAG/Graph-and-Global-Synthesis/Graph-and-Global-Synthesis]]
- [[Generative AI/RAG/Verification-and-Agentic-Loops/Verification-and-Agentic-Loops]]
- [[Generative AI/Agents/Agents]]

## Related questions

- When is [[Generative AI/RAG/Indexing-and-Structure/Notes/TOC-Structure-Navigation]] vs [[Generative AI/RAG/Indexing-and-Structure/Notes/Hierarchical-Summary-Trees]] for long PDFs?
