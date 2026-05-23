---
tags: [rag, ingestion, document-parsing, docling, neo4j, citations, layout-aware]
status: budding
source: https://vipulmshah.medium.com/layout-aware-rag-with-evidence-pins-building-clickable-citations-for-pdfs-using-docling-neo4j-5305769759f0
aliases: [Evidence Pins, Layout-Aware RAG with Docling]
parent: "[[Generative AI/RAG/Document-Ingestion/Document-Ingestion]]"
updated: 2026-05-20
---

# Layout-Aware RAG with Evidence Pins

## TL;DR

Build RAG where every answer links to **clickable evidence pins** — open the source PDF with the **exact region highlighted**. Uses **Docling** for layout + bounding boxes, **Neo4j** for graph structure + native vector indexes, and a lightweight deterministic agent loop. Shifts trust from "believe me" to "show me exactly where."

## When to use / not

- **Use** when provenance is non-negotiable: regulated docs (building codes, ADA, specs), audit trails, or any workflow needing sentence-level citations with spatial proof.
- **Use** for complex multi-modal PDFs: specs, submittals, RFIs, change orders — text + tables + diagrams.
- **Overkill** for simple text-only corpora where page-level citations suffice and you don't need bbox highlights.

## Core ideas

### Motivation (AEC / domain-agnostic)

AEC documents (design specs, materials specs, building codes, submittals, RFIs) require **clause + page + rectangle**, not approximate answers.

Goals:

- Faithful answers with **sentence-level citations**
- **Contextually precise evidence** — PDF opens with exact region highlighted
- Efficient iteration without heavyweight orchestration upfront

### Architecture (high level)

```
PDF → Docling parse → structure-aware chunking (+ bboxes)
    → embeddings → Neo4j (graph + vector index)
    → vector retrieval + structural expansion
    → LLM answer with inline [chunk_id] citations
    → linkify → PDF.js viewer with bbox overlay
```

**Demo:** [lumozai/layout-aware-rag-demo](https://github.com/lumozai/layout-aware-rag-demo) — Chainlit frontend, FastAPI backend.

### Lightweight agent first (deterministic tool loop)

1. Build query → embed → vector query in Neo4j
2. Expand with structural context (headings, sections, neighbor chunks)
3. Prompt LLM with retrieved snippets
4. Parse inline citations → post-process to evidence links

**Why lightweight before orchestration:**

- Simplicity and low latency
- Full visibility into each step
- Deterministic, reproducible runs
- Easy RCA via step-level logging
- Upgrade path to frameworked orchestration later

Part 1 of the series covers the **core data pipeline** (parse → chunk → store → retrieve → citation linking) without full LLM integration in the demo foundation.

### Why Docling

Requirements:

- Preserve reading order and hierarchy (headings, lists, tables)
- Emit **bounding boxes** per fragment: page + `[x0, y0, x1, y1]`
- Local/offline processing
- Structure-respecting chunkers with token limits

Docling advantages vs. assembling multiple tools:

- Clean document model with bboxes
- **HybridChunker** — hierarchical, tokenizer-aware
- Local Python API + CLI
- Minimal integration overhead

### Neo4j data model

```
Document ──OF── Page ──IN_PAGE── Chunk
```

- **Chunk** stores: `text`, `page_num`, `bbox`, `headings`, `embedding`
- Bbox in **PDF points** (coordinate system matches parser)
- Tables: multiple bboxes per chunk, or child **Cell** nodes for per-cell highlights
- Optional `:NEXT` chain between chunks for neighbor expansion
- **Vector index** on `Chunk.embedding` (Neo4j 5.23+, cosine)

### Ingestion pipeline

1. **Parse** — Docling CLI or `DocumentConverter`
   ```bash
   docling ./ada/2010-ada-standards.pdf --output ./out --ocr --to json
   ```
   JSON includes items with page numbers, reading order, bounding boxes.

2. **Chunk** — `HybridChunker` with HuggingFace tokenizer (e.g. `all-MiniLM-L6-v2`)
   - Merge bboxes from all `doc_items` in chunk metadata
   - Extract heading context from chunk meta
   - Stable chunk IDs via hash of page + text prefix

3. **Embed** — SentenceTransformers (384-dim example)

4. **Upsert** — MERGE Document, Page, Chunk nodes; link Chunk → Page → Document

### Retrieval: vectors + structure

```cypher
CALL db.index.vector.queryNodes('chunk_vec', $k, $queryEmbedding)
YIELD node AS c, score
WHERE c.family = $docType OR ...
MATCH (c)-[:IN_PAGE]->(p:Page)-[:OF]->(d:Document)
RETURN c { .id, .text, .bbox, .page_num, .headings }, ...
ORDER BY score DESC LIMIT $limit
```

Often **expand** results with neighboring chunks (same section via `:NEXT` or shared `headings`).

### Citations → clickable evidence pins

**Prompt policy:** after every factual claim, add bracketed chunk IDs — e.g. `[c123]` or `[c123, c371]`. Only cite provided chunks; no fabricated IDs.

**Linkify:** regex replaces `[c123]` with viewer URLs:
```
/viewer?doc={docId}&page={page}&bbox=x0,y0,x1,y1
```

**PDF.js overlay:**

- Convert PDF points (origin often bottom-left) → canvas pixels (top-left)
- Draw highlight `div` at computed position
- Multi-box highlights for tables; recompute on zoom/resize
- Invert Y if parser uses top-left origin

### Lessons learned

- **Structure-first chunking** beats naive fixed-size — headings, lists, table captions improve retrieval and reduce hallucinations
- **Graph + vectors** — vectors for recall; graph for precision and context expansion
- **Deterministic loop** — log inputs/outputs and chunk IDs; replay sessions from query + settings
- **Latency** — local parsing + graph-resident vectors; hot path = embed → ANN → prompt (no cross-store joins)

### Security & governance

- Local parsing avoids shipping sensitive PDFs to cloud OCR
- Provenance first-class: every claim links to source rectangle
- Audit trail: persist chunk IDs + prompt template per answer

### Future improvements

- Frameworked orchestration for human-in-the-loop and policy gates
- Table-aware chunking with cell-level nodes and multi-cell highlights
- Document versioning — incremental re-chunk/re-embed on upstream changes
- Eval harness: labeled QA + cite-checking + retrieval regression tests

### Stack (quickstart)

- Python 3.11+, Docling, Neo4j 5.23+ (vector indexes)
- pdfjs-dist for web viewer
- Embeddings: SentenceTransformers `all-MiniLM-L6-v2` (384 dims)

## How it fits

Implements the layout-aware parsing principles from [[Generative AI/RAG/Document-Ingestion/Notes/Document-Parsing-for-RAG]] with a concrete **provenance UI** layer. Complements [[Generative AI/RAG/Graph-and-Global-Synthesis/Notes/Entity-Graph-Community-Retrieval]] (Neo4j graph + vectors here are document-structure-centric, not entity-community summaries). Pairs with strict grounding patterns in [[Generative AI/RAG/Verification-and-Agentic-Loops/Notes/Adaptive-Retrieve-and-Verify]] when citation fidelity is the product requirement.

## Links out

- [[Generative AI/RAG/RAG]]
- [[Generative AI/RAG/Document-Ingestion/Notes/Document-Parsing-for-RAG]]
- [[Generative AI/RAG/Graph-and-Global-Synthesis/Notes/Entity-Graph-Community-Retrieval]]
- Demo repo: [lumozai/layout-aware-rag-demo](https://github.com/lumozai/layout-aware-rag-demo)

## Next steps

- Compare Docling vs. Unstructured `hi_res` on one problematic multi-column PDF.
- Prototype bbox overlay with PDF.js on a single page before full pipeline.
- Define eval set with expected page + optional bbox for cite-checking.

## Related questions

- Cell-level table nodes vs. merged bbox — when does per-cell highlighting matter?
- Neo4j vs. separate vector DB + metadata store — tradeoffs at your scale?
