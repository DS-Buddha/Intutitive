---
tags: [rag, indexing, structure, hierarchy, index, generative-ai]
status: evergreen
aliases: [Indexing and structure, Structure-first RAG]
parent: "[[Generative AI/RAG/RAG]]"
updated: 2026-05-20
---

# Indexing and structure — concept hub

## TL;DR

**Indexing and structure** covers ways to organize corpora beyond flat chunks: hierarchical summary trees and TOC-style navigation so retrieval can hit the right granularity (section vs theme) without stuffing every chunk into context.

## When to use / not

- **Use** for long narratives, manuals, and reports where section hierarchy matters.
- **Poor fit** for tiny FAQ corpora where baseline chunk+embed is enough ([[Generative AI/RAG/Baseline-RAG-Pipeline]]).

## Child concepts

- [[Generative AI/RAG/Indexing-and-Structure/Notes/Hierarchical-Summary-Trees]] (RAPTOR)
- [[Generative AI/RAG/Indexing-and-Structure/Notes/TOC-Structure-Navigation]] (PageIndex)

## How it fits

Alternative or complement to [[Generative AI/RAG/Search-and-Retrieval/Search-and-Retrieval]]. Compare TOC navigation vs summary trees for long PDFs. Global synthesis may still need [[Generative AI/RAG/Graph-and-Global-Synthesis/Graph-and-Global-Synthesis]].

## Links out

- [[Generative AI/RAG/RAG]]
- [[Generative AI/RAG/Indexing-and-Structure/Notes/Hierarchical-Summary-Trees]]
- [[Generative AI/RAG/Indexing-and-Structure/Notes/TOC-Structure-Navigation]]
- [[Generative AI/RAG/Document-Ingestion/Document-Ingestion]]

## Related questions

- For your longest PDFs, is TOC reasoning or hierarchical summaries the better first experiment?
