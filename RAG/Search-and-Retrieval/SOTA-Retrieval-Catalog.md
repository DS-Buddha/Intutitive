---
tags: [rag, retrieval, catalog, sota, generative-ai]
status: evergreen
aliases: [Latest retrieval techniques, SOTA retrieval, SOTA-Retrieval-Catalog]
parent: "[[Generative AI/RAG/Search-and-Retrieval/Search-and-Retrieval]]"
updated: 2026-05-20
---

# SOTA retrieval catalog

## TL;DR

Single index of **state-of-the-art retrieval techniques** for RAG: dense embedders, late interaction, rerankers, sparse/hybrid search, and query-side methods. Open this file to scan the landscape; open **Deep dive** links for mechanism and tradeoffs.

## Scope

**In:** first-stage retrieval, reranking, query rewriting before search, common commercial APIs. **Out:** document indexing structures (RAPTOR, GraphRAG), agentic retrieve-or-not (Self-RAG)—see [[Generative AI/RAG/RAG]].

## Technique index

### Dense / bi-encoder

| Technique | Category | One-line idea | Era / SOTA signal | Deep dive | Source |
|-----------|----------|---------------|-------------------|-----------|--------|
| E5 (incl. E5-mistral) | Dense | Text embeddings trained with weak supervision; strong open baseline | Widely used 2023–2025 | — | [https://arxiv.org/abs/2212.03533](https://arxiv.org/abs/2212.03533) |
| BGE / BGE-M3 | Dense | BAAI embedding family; M3 adds multi-function (dense/sparse/colbert) | Leaderboard staple | — | [https://github.com/FlagOpen/FlagEmbedding](https://github.com/FlagOpen/FlagEmbedding) |
| GTE / GTE-Qwen | Dense | Alibaba GTE series; Qwen2 variants for long context | 2024–2025 | — | [https://huggingface.co/Alibaba-NLP](https://huggingface.co/Alibaba-NLP) |
| OpenAI / Cohere / Voyage embed APIs | Dense | Hosted embedding endpoints; low ops, vendor lock-in | Production default for many teams | — | Vendor docs |
| Sentence-T5 / Contriever | Dense | Early strong dual-encoder baselines | Foundational | — | [https://arxiv.org/abs/2201.02805](https://arxiv.org/abs/2201.02805) |

### Late interaction

| Technique | Category | One-line idea | Era / SOTA signal | Deep dive | Source |
|-----------|----------|---------------|-------------------|-----------|--------|
| ColBERT | Late interaction | Token-level MaxSim scoring; precision-friendly | Classic SOTA rerank/recall | [[Generative AI/RAG/Search-and-Retrieval/Notes/Late-Interaction-Token-Matching]] | [https://arxiv.org/abs/2004.12832](https://arxiv.org/abs/2004.12832) |
| ColBERTv2 | Late interaction | Denoised residual compression; smaller indexes | Default upgrade over v1 | — | [https://arxiv.org/abs/2112.03539](https://arxiv.org/abs/2112.03539) |
| PLAID | Late interaction | Fast ColBERTv2 search with centroid pruning | Production-oriented | — | [https://arxiv.org/abs/2205.09707](https://arxiv.org/abs/2205.09707) |
| RAGatouille | Tooling | ColBERT index/query wrapper for RAG stacks | Practical | [[Generative AI/RAG/Search-and-Retrieval/Notes/Late-Interaction-Token-Matching]] | [https://github.com/AnswerDotAI/RAGatouille](https://github.com/AnswerDotAI/RAGatouille) |

### Cross-encoder reranking

| Technique | Category | One-line idea | Era / SOTA signal | Deep dive | Source |
|-----------|----------|---------------|-------------------|-----------|--------|
| Cross-encoder (BERT-style) | Rerank | Full joint query–passage encoding; top precision, costly | Standard stage-2 | — | [https://www.sbert.net/examples/applications/cross-encoder/README.html](https://www.sbert.net/examples/applications/cross-encoder/README.html) |
| monoT5 / rankT5 | Rerank | Seq2seq “true/false” relevance scoring | Strong on BEIR-style tasks | — | [https://arxiv.org/abs/2003.06713](https://arxiv.org/abs/2003.06713) |
| Cohere Rerank | Rerank | Hosted rerank API | Commercial | — | Cohere docs |
| Voyage Rerank | Rerank | Hosted rerank API | Commercial | — | Voyage docs |

### Sparse & hybrid

| Technique | Category | One-line idea | Era / SOTA signal | Deep dive | Source |
|-----------|----------|---------------|-------------------|-----------|--------|
| BM25 | Sparse | Lexical TF-IDF style; unbeatable baseline on keywords | Always consider | — | Classic IR |
| SPLADE | Learned sparse | Sparse neural term expansion | Hybrid stacks | — | [https://arxiv.org/abs/2109.10086](https://arxiv.org/abs/2109.10086) |
| uniCOIL / DeepImpact | Learned sparse | Impact scoring variants | Research / prod hybrids | — | [https://arxiv.org/abs/2106.14807](https://arxiv.org/abs/2106.14807) |
| Elasticsearch / OpenSearch hybrid | Hybrid | BM25 + dense vector in one engine | Ops-friendly | — | Vendor docs |
| RRF (reciprocal rank fusion) | Hybrid | Merge ranked lists without score calibration | Simple fusion | — | Common pattern |

### Query-side

| Technique | Category | One-line idea | Era / SOTA signal | Deep dive | Source |
|-----------|----------|---------------|-------------------|-----------|--------|
| HyDE | Query-side | Embed LLM-written hypothetical answer, not raw query | Strong on mismatch | [[Generative AI/RAG/Search-and-Retrieval/Notes/Hypothetical-Document-Expansion]] | [https://arxiv.org/abs/2212.10496](https://arxiv.org/abs/2212.10496) |
| Query decomposition | Query-side | Break complex question into sub-queries | Multi-hop RAG | — | Various (e.g. LangChain patterns) |
| Step-back prompting | Query-side | Retrieve on abstracted “step back” question | Broader context | — | [https://arxiv.org/abs/2310.06117](https://arxiv.org/abs/2310.06117) |
| Multi-query / fusion | Query-side | Several paraphrases + merge results | Recall boost | — | Common pattern |

### Multimodal / structured (pointers)

| Technique | Category | One-line idea | Era / SOTA signal | Deep dive | Source |
|-----------|----------|---------------|-------------------|-----------|--------|
| CLIP-style dual encoders | Multimodal | Image–text shared space | Vision RAG | — | [https://arxiv.org/abs/2103.00020](https://arxiv.org/abs/2103.00020) |
| SQL / structured retriever | Structured | Schema-aware or text-to-SQL retrieval | Enterprise DB RAG | — | Product-specific |

## Patents & commercial

**Hosted embeddings & rerank (OpenAI, Cohere, Voyage, etc.)**

- Models and serving are typically **proprietary**; you trade control for latency and ops.
- Open alternatives: E5, BGE, ColBERT + RAGatouille for on-prem or self-hosted stacks.

**Enterprise search vendors (Elastic, Pinecone, Weaviate, etc.)**

- Hybrid and vector search features are **product-layer**; patents often cover indexing, fusion, or managed pipelines—not individual papers.
- Prefer catalog **Source** links + your vendor docs for deployment specifics.

*Not legal advice—high-level commercial pointers only.*

## How it fits

Parent: [[Generative AI/RAG/Search-and-Retrieval/Search-and-Retrieval]]. Sibling RAG concepts (indexing, graphs, critique): [[Generative AI/RAG/RAG]]. Measure retrieval with [[Generative AI/Evaluation/Metrics/SOTA-Metrics-Catalog]].

## Maintenance

1. Add a row to the right **group** table (keep one-line idea honest).
2. Set **Deep dive** to a new leaf under `RAG/Search-and-Retrieval/Notes/` when you need full mechanism notes.
3. Bump `updated` in frontmatter; link new leaves from [[Generative AI/RAG/Search-and-Retrieval/Search-and-Retrieval]].

## Related questions

- Which embedding + rerank pair is the default for your production SLA?
