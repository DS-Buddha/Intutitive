---
tags: [rag, retrieval, raptor, summarization, hierarchy]
status: budding
source: https://arxiv.org/abs/2401.18059
aliases: [RAPTOR, Recursive Abstractive Processing for Tree-Organized Retrieval]
parent: "[[Generative AI/RAG/Indexing-and-Structure/Indexing-and-Structure]]"
updated: 2026-05-20
---

# Hierarchical summary trees (RAPTOR)

## TL;DR

RAPTOR builds a tree of abstractive summaries over a document set: leaves are chunks, parents summarize children, and retrieval can hit multiple granularities. It matters for long narratives where you need both local detail and theme-level context without stuffing every chunk into the prompt.

## When to use / not

- **Use** for long narratives where multi-scale context (detail vs. theme) matters; summary nodes can surface what flat chunking buries.
- **Poor fit** when abstractive summaries are unacceptable (strict legal citing, no paraphrase) or tree build cost is prohibitive for tiny corpora.

## Core ideas

### Mechanism

- **Recursive summarization:** cluster or group chunks, summarize, repeat up the tree.
- **Retrieval:** query matches at different depths to pull either fine passages or higher-level summaries.
- **Intent:** mitigate “lost in the middle” and irrelevant micro-chunks by exposing **summary nodes** aligned to the question.

### Primary sources

- Paper (PDF): [https://arxiv.org/pdf/2401.18059](https://arxiv.org/pdf/2401.18059)
- Abstract: [https://arxiv.org/abs/2401.18059](https://arxiv.org/abs/2401.18059)
- Code: [https://github.com/parthsarthi03/raptor](https://github.com/parthsarthi03/raptor)

## How it fits

RAPTOR is one **hierarchical abstraction** path for long text. Contrast with [[Generative AI/RAG/Indexing-and-Structure/Notes/TOC-Structure-Navigation]] (document-native TOC reasoning) and [[Generative AI/RAG/Graph-and-Global-Synthesis/Notes/Entity-Graph-Community-Retrieval]] (entity graph and community summaries instead of an abstractive summary tree).

## Links out

- [[Generative AI/RAG/RAG]]
- [[Generative AI/RAG/Indexing-and-Structure/Notes/TOC-Structure-Navigation]]
- [[Generative AI/RAG/Graph-and-Global-Synthesis/Notes/Entity-Graph-Community-Retrieval]]

## Next steps

- **Follow-up note:** how RAPTOR tree updates when source docs change incrementally.
- **Question:** Do you need provenance from summary nodes back to raw spans for your use case?
- **Resource:** official RAPTOR repo examples for clustering + summarization defaults.

## Related questions

- How does summary depth interact with attribution to original chunks?
