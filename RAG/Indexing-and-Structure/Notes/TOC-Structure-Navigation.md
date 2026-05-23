---
tags: [rag, retrieval, pageindex, structure, vectorless]
status: budding
source: https://arxiv.org/abs/2512.03413
aliases: [PageIndex]
parent: "[[Generative AI/RAG/Indexing-and-Structure/Indexing-and-Structure]]"
updated: 2026-05-20
---

# TOC structure navigation (PageIndex)

## TL;DR

PageIndex builds a **hierarchical, TOC-like index** over long documents and lets an LLM **reason** over that structure to find relevant passages, de-emphasizing embedding similarity over the whole file. It matters for structured PDFs where section hierarchy and references beat bag-of-chunk retrieval.

## When to use / not

- **Use** for long reports, manuals, and policies where **section tree** and in-document references (“see §4.2”) dominate; good “vectorless” narrative for these shapes.
- **Poor fit** when documents lack reliable headings/structure, or when the fastest path is pure semantic search over short notes.

## Core ideas

### Mechanism

- **Hierarchical index:** mirror or recover document outline as a navigable tree.
- **LLM navigation:** model chooses branches and drill-down paths instead of (or before) global embedding top‑k over all chunks.
- **Intent:** reduce bad recalls from naive chunking and long-document embedding drift.

### Primary sources

- Paper (PDF): [https://arxiv.org/pdf/2512.03413](https://arxiv.org/pdf/2512.03413)
- Abstract: [https://arxiv.org/abs/2512.03413](https://arxiv.org/abs/2512.03413)
- Overview: [https://pageindex.ai/blog/pageindex-intro](https://pageindex.ai/blog/pageindex-intro)
- Code: [https://github.com/VectifyAI/PageIndex](https://github.com/VectifyAI/PageIndex)

## How it fits

PageIndex is a **structure-first** sibling to [[Generative AI/RAG/Indexing-and-Structure/Notes/Hierarchical-Summary-Trees]] (learned summary hierarchy) and [[Generative AI/RAG/Graph-and-Global-Synthesis/Notes/Entity-Graph-Community-Retrieval]] (induced entity graph). Pair with [[Generative AI/RAG/Verification-and-Agentic-Loops/Notes/Adaptive-Retrieve-and-Verify]] when navigation might still land on the wrong branch and you need gating.

## Links out

- [[Generative AI/RAG/RAG]]
- [[Generative AI/RAG/Indexing-and-Structure/Notes/Hierarchical-Summary-Trees]]
- [[Generative AI/RAG/Graph-and-Global-Synthesis/Notes/Entity-Graph-Community-Retrieval]]
- [[Generative AI/RAG/Verification-and-Agentic-Loops/Notes/Adaptive-Retrieve-and-Verify]]

## Next steps

- **Follow-up note:** PDF extraction quality checklist (TOC detection, scanned pages) before PageIndex.
- **Question:** Hybrid plan—PageIndex routing first, then small embedding retrieval inside a section?
- **Resource:** PageIndex intro blog for worked navigation examples.

## Related questions

- How does PageIndex compare to classic BM25 over section titles for routing?
