---
tags: [rag, graphs, synthesis, global-retrieval, index, generative-ai]
status: evergreen
aliases: [Graph RAG, Global synthesis]
parent: "[[Generative AI/RAG/RAG]]"
updated: 2026-05-20
---

# Graph and global synthesis — concept hub

## TL;DR

**Graph and global synthesis** lifts text into entities and relations, then uses community-level summaries to answer thematic, cross-document questions that flat chunk retrieval misses.

## When to use / not

- **Use** for corpus-level sensemaking, multi-hop entity questions, and narratives where **relations** carry meaning.
- **Poor fit** when entities are unstable noise or build cost outweighs corpus size.

## Child concepts

- [[Generative AI/RAG/Graph-and-Global-Synthesis/Notes/Entity-Graph-Community-Retrieval]] (GraphRAG)

## How it fits

Complements [[Generative AI/RAG/Search-and-Retrieval/Search-and-Retrieval]] (local passages) and [[Generative AI/RAG/Indexing-and-Structure/Indexing-and-Structure]] (hierarchy without full graphs).

## Links out

- [[Generative AI/RAG/Graph-and-Global-Synthesis/Notes/Entity-Graph-Community-Retrieval]]
- [[Generative AI/RAG/RAG]]
- [[Generative AI/RAG/Indexing-and-Structure/Indexing-and-Structure]]

## Related questions

- When is GraphRAG worth the indexing cost vs RAPTOR-style trees on your corpus?
