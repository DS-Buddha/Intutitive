---
tags: [rag, retrieval, graphrag, graphs, knowledge-graph]
status: budding
source: https://arxiv.org/abs/2404.16130
aliases: [GraphRAG]
parent: "[[Generative AI/RAG/Graph-and-Global-Synthesis/Graph-and-Global-Synthesis]]"
updated: 2026-05-20
---

# Entity graph community retrieval (GraphRAG)

## TL;DR

GraphRAG lifts text chunks into a **graph** of entities and relations, then uses **community summaries** at multiple scales to answer global, thematic questions over a corpus. It matters when isolated chunk retrieval misses cross-document structure and you need sensemaking (“what themes connect these docs?”).

## When to use / not

- **Use** for corpus-level synthesis, multi-hop questions over named entities, and narratives where **relations** carry meaning.
- **Poor fit** when graphs are mostly noise (no stable entities), or when build/index cost outweighs benefits for small, narrow corpora.

## Core ideas

### Mechanism

- **Extract** entities and relationships from the corpus (plus optional claims).
- **Cluster / community detection** at scales; summarize communities for “global” answers.
- **Query path:** leverage graph structure and summaries, not only vector nearest neighbors to raw chunks.

### Primary sources

- Paper (PDF): [https://arxiv.org/pdf/2404.16130](https://arxiv.org/pdf/2404.16130)
- Abstract: [https://arxiv.org/abs/2404.16130](https://arxiv.org/abs/2404.16130)
- Microsoft overview: [GraphRAG blog](https://www.microsoft.com/en-us/research/blog/graphrag-unlocking-llm-discovery-on-narrative-private-data/)
- Implementation: [https://github.com/microsoft/graphrag](https://github.com/microsoft/graphrag)

### Tradeoffs

- **Cost:** graph construction and summarization are heavier than flat chunk embed.
- **Quality:** depends on entity extraction; errors compound in the graph.

## How it fits

GraphRAG contrasts with [[Generative AI/RAG/Indexing-and-Structure/Notes/Hierarchical-Summary-Trees]] (summary **tree** without an explicit entity graph) and [[Generative AI/RAG/Indexing-and-Structure/Notes/TOC-Structure-Navigation]] (use **document TOC** structure instead of inducing a graph). Choose GraphRAG when cross-document relational structure is the product of interest.

## Links out

- [[Generative AI/RAG/RAG]]
- [[Generative AI/RAG/Indexing-and-Structure/Notes/Hierarchical-Summary-Trees]]
- [[Generative AI/RAG/Indexing-and-Structure/Notes/TOC-Structure-Navigation]]

## Next steps

- **Follow-up note:** entity schema for your domain (people, SKUs, regulations) before a pilot GraphRAG build.
- **Question:** Local vs. global query mix—does your traffic justify community summaries?
- **Resource:** Microsoft GraphRAG repo quickstart for pipeline stages.

## Related questions

- How often must the graph be rebuilt as source documents change?
