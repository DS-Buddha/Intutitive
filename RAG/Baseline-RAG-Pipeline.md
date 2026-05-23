---
tags: [rag, baseline, pipeline, generative-ai]
status: budding
aliases: [Baseline RAG, Naive RAG, Vanilla RAG]
parent: "[[Generative AI/RAG/RAG]]"
updated: 2026-05-20
---

# Baseline RAG pipeline

## TL;DR

**Baseline RAG** is the default stack most teams start with: chunk documents, embed chunks, retrieve top‑k by vector similarity, stuff context into a prompt, and generate an answer. It matters as the contrast slice—know when this is enough before adopting structure-first indexing, graphs, or agentic loops.

## When to use / not

- **Use** for first prototypes, narrow corpora, and FAQs where chunks align well with questions.
- **Poor fit** for long structured PDFs, global thematic questions, or high-stakes answers needing retrieve-and-verify loops.

## Core ideas

### Pipeline stages

1. **Ingest** — parse → chunk (fixed size or semantic) → optional metadata
2. **Index** — embed chunks → vector store (ANN)
3. **Retrieve** — embed query → top‑k similarity
4. **Generate** — LLM with retrieved context

### Typical failure modes

- **Chunking** splits tables, lists, or sections across boundaries
- **Embedding mismatch** between query and document phrasing (see [[Generative AI/RAG/Search-and-Retrieval/Notes/Hypothetical-Document-Expansion]])
- **Recall** too low (k too small, wrong embedder) or **precision** too low (wrong chunks ranked high)

## How it fits

This note sits under [[Generative AI/RAG/RAG]] as the **before** picture. Upgrade paths: ingestion ([[Generative AI/RAG/Document-Ingestion/Document-Ingestion]]), search ([[Generative AI/RAG/Search-and-Retrieval/Search-and-Retrieval]]), structure ([[Generative AI/RAG/Indexing-and-Structure/Indexing-and-Structure]]), graphs ([[Generative AI/RAG/Graph-and-Global-Synthesis/Graph-and-Global-Synthesis]]), verification ([[Generative AI/RAG/Verification-and-Agentic-Loops/Verification-and-Agentic-Loops]]). Eval retrieval with [[Generative AI/Evaluation/Metrics/Notes/Precision-Recall-F1]].

## Links out

- [[Generative AI/RAG/RAG]]
- [[Generative AI/RAG/Document-Ingestion/Document-Ingestion]]
- [[Generative AI/RAG/Search-and-Retrieval/Search-and-Retrieval]]
- [[Generative AI/RAG/Search-and-Retrieval/SOTA-Retrieval-Catalog]]
- [[Generative AI/Start-Here]]

## Next steps

- **Follow-up note:** document your project's default chunk size, embed model, and k.
- **Question:** Which failure mode shows up first on your corpus—recall or precision?

## Related questions

- When does baseline RAG fail loudly enough to justify GraphRAG or hierarchical trees?
