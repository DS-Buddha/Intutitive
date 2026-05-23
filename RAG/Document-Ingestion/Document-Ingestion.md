---
tags: [rag, ingestion, document-parsing, index, generative-ai]
status: evergreen
aliases: [Document ingestion, Parsing for RAG]
parent: "[[Generative AI/RAG/RAG]]"
updated: 2026-05-20
---

# Document ingestion — concept hub

## TL;DR

**Document ingestion** is everything before chunking and embedding: parsing PDFs and office files, preserving layout and reading order, and attaching evidence metadata for citations. Most RAG failures start here—not at the retriever or LLM.

## When to use / not

- **Use** when chunks look scrambled, tables break, or citations cannot point to a page/region.
- **Not** the place for vector search tuning—see [[Generative AI/RAG/Search-and-Retrieval/Search-and-Retrieval]].

## Child concepts

- [[Generative AI/RAG/Document-Ingestion/Notes/Document-Parsing-for-RAG]]
- [[Generative AI/RAG/Document-Ingestion/Notes/Layout-Aware-Evidence-Pins]]

## How it fits

First stage under [[Generative AI/RAG/RAG]] and [[Generative AI/RAG/Baseline-RAG-Pipeline]]. Feeds [[Generative AI/RAG/Search-and-Retrieval/Search-and-Retrieval]] and structure-first paths ([[Generative AI/RAG/Indexing-and-Structure/Indexing-and-Structure]]).

## Links out

- [[Generative AI/RAG/RAG]]
- [[Generative AI/RAG/Baseline-RAG-Pipeline]]
- [[Generative AI/RAG/Document-Ingestion/Notes/Document-Parsing-for-RAG]]
- [[Generative AI/RAG/Document-Ingestion/Notes/Layout-Aware-Evidence-Pins]]
- [[Generative AI/Start-Here]]

## Related questions

- Which parser stack (open vs commercial layout API) is your default for PDFs?
