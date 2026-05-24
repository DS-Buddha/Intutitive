#!/usr/bin/env python3
"""One-time generator for RAG concept HTML pages."""

import os

BASE = os.path.join(os.path.dirname(__file__), '..', 'topics', 'rag')

PAGES = [
    {
        'file': 'ingestion.html',
        'slug': 'ingestion',
        'data': 'ingestion-data.js',
        'title': 'Document Ingestion',
        'desc': 'Learn document ingestion — parsing, chunking, and the failure chain before retrieval.',
        'tldr': 'Everything before chunking and embedding: parsing PDFs, preserving layout, attaching evidence metadata. Most RAG failures start here.',
        'analogy': 'Think of ingestion like preparing ingredients before cooking. If you chop vegetables randomly, mix raw and cooked, or lose the recipe labels — no chef (retriever or LLM) can fix the dish downstream.',
        'playground_type': 'ingestion-failure',
        'playground_title': 'Failure chain sandbox',
        'playground_desc': 'Toggle each ingestion quality step off. Watch how bad parsing poisons chunking, retrieval, and the final answer.',
        'mechanism': '<p>Ingestion converts raw files into structured, retrievable units. The pipeline: load → parse (layout-aware) → chunk (structure-respecting) → embed metadata (page, bbox, section).</p><ul><li><strong>Parse:</strong> preserve reading order, detect tables and headings</li><li><strong>Chunk:</strong> respect semantic boundaries, strip headers/footers</li><li><strong>Metadata:</strong> page numbers, element types, coordinates for citations</li></ul>',
        'tradeoffs_use': '<li>Multi-column PDFs, tables, scanned docs, regulated corpora</li><li>When citations must point to exact source regions</li>',
        'tradeoffs_skip': '<li>Simple single-column text where baseline loaders suffice</li><li>When you only need quick prototyping on clean markdown</li>',
        'prev': './baseline.html',
        'next': './ingestion-parsing.html',
        'connections': '<a href="./ingestion-parsing.html">Layout-Aware Parsing</a> · <a href="./ingestion-evidence-pins.html">Evidence Pins</a> · <a href="./search-retrieval.html">Search & Retrieval</a>',
        'together': 'Turn off parsing in the sandbox above. That single toggle is why rerankers and bigger LLMs cannot save a broken ingestion pipeline.',
    },
    {
        'file': 'ingestion-parsing.html',
        'slug': 'ingestion-parsing',
        'data': 'ingestion-parsing-data.js',
        'title': 'Layout-Aware Parsing',
        'desc': 'Compare naive PDF extraction vs layout-aware parsing for RAG.',
        'tldr': 'Traditional PDF loaders flatten layout and break reading order. Layout-aware parsing preserves structure so chunking and retrieval stay grounded.',
        'analogy': 'Reading a newspaper by scanning left-to-right across both columns at once gives gibberish. Layout-aware parsing reads column-by-column, top-to-bottom — like a human would.',
        'playground_type': 'parse-comparison',
        'playground_title': 'Parsing sandbox',
        'playground_desc': 'Toggle naive vs layout-aware extraction on a mock two-column page. See how chunk text changes.',
        'mechanism': '<p>Layout-aware parsers treat documents as visual artifacts: detect bounding boxes, classify elements (Title, Table, NarrativeText), reconstruct reading flow across columns.</p><ul><li><strong>Multi-column:</strong> cluster blocks, order within columns, merge correctly</li><li><strong>Tables:</strong> preserve row/column structure instead of flattened strings</li><li><strong>Metadata:</strong> page, type, coordinates emitted per element</li></ul>',
        'tradeoffs_use': '<li>Financial reports, legal docs, multi-column PDFs, forms</li><li>When chunk quality diagnostics show scrambled text</li>',
        'tradeoffs_skip': '<li>Clean single-column text PDFs with PyPDF-style loaders</li>',
        'prev': './ingestion.html',
        'next': './ingestion-evidence-pins.html',
        'connections': '<a href="./ingestion.html">Document Ingestion</a> · <a href="./ingestion-evidence-pins.html">Evidence Pins</a>',
        'together': 'Switch to naive mode in the sandbox. The resulting chunk is what your retriever would embed — notice how revenue context gets separated from its heading.',
    },
    {
        'file': 'ingestion-evidence-pins.html',
        'slug': 'ingestion-pins',
        'data': 'ingestion-evidence-pins-data.js',
        'title': 'Evidence Pins',
        'desc': 'Link RAG chunks to clickable PDF regions with bounding boxes.',
        'tldr': 'Every answer links to clickable evidence pins — open the source PDF with the exact region highlighted. Trust shifts from "believe me" to "show me where."',
        'analogy': 'A footnote that jumps to the exact highlighted sentence in the original book — not just "see chapter 4." Evidence pins are that for PDFs.',
        'playground_type': 'evidence-pins',
        'playground_title': 'Evidence pins sandbox',
        'playground_desc': 'Click a chunk to highlight its source region on a mock PDF page. Citations become spatial proof.',
        'mechanism': '<p>Pipeline: Docling parse → structure-aware chunking with bboxes → embed → store in graph DB → retrieve → LLM cites chunk IDs → linkify to PDF.js viewer with overlay.</p><ul><li><strong>Bbox:</strong> page + [x0,y0,x1,y1] in PDF points</li><li><strong>Citation policy:</strong> bracketed chunk IDs after every factual claim</li><li><strong>Viewer:</strong> coordinate transform PDF points → canvas pixels</li></ul>',
        'tradeoffs_use': '<li>Regulated docs, audit trails, building codes, specs</li><li>When provenance is non-negotiable</li>',
        'tradeoffs_skip': '<li>Simple text corpora where page-level citation is enough</li>',
        'prev': './ingestion-parsing.html',
        'next': './search-retrieval.html',
        'connections': '<a href="./ingestion-parsing.html">Layout-Aware Parsing</a> · <a href="./graph-graphrag.html">GraphRAG</a> · <a href="./verification-agentic.html">Agentic RAG</a>',
        'together': 'Click each chunk in the sandbox. The highlighted region is what users verify — without it, "grounded" answers are still unverifiable.',
    },
    {
        'file': 'search-retrieval.html',
        'slug': 'search-retrieval',
        'data': 'search-retrieval-data.js',
        'title': 'Search & Retrieval',
        'desc': 'Hybrid search — BM25 lexical + dense semantic retrieval with RRF fusion.',
        'tldr': 'Search maps a query to candidate evidence before generation. Dense vs sparse vs hybrid — what gets into context usually dominates RAG quality more than the LLM prompt.',
        'analogy': 'Dense search is like finding books by topic ("something about warranties"). BM25 is like finding books that contain the exact product code. Hybrid search uses both catalogs.',
        'playground_type': 'hybrid-search',
        'playground_title': 'Hybrid retrieval sandbox',
        'playground_desc': 'Same query, three ranking strategies side-by-side. Edit the query to see when each wins.',
        'mechanism': '<p>Two-stage retrieval is common: cheap recall (bi-encoder, BM25, hybrid) then precision (reranker, late interaction).</p><ul><li><strong>BM25:</strong> exact term matching, great for SKUs and IDs</li><li><strong>Dense:</strong> semantic similarity, great for paraphrases</li><li><strong>RRF fusion:</strong> combine rank lists without score calibration</li></ul>',
        'tradeoffs_use': '<li>Mixed query types — exact IDs and natural language</li><li>When dense-only misses keyword-critical passages</li>',
        'tradeoffs_skip': '<li>Homogeneous short notes where dense-only suffices</li>',
        'prev': './ingestion-evidence-pins.html',
        'next': './search-colbert.html',
        'connections': '<a href="./search-colbert.html">ColBERT</a> · <a href="./search-hyde.html">HyDE</a> · <a href="./baseline.html">Baseline RAG</a>',
        'together': 'Try queries with exact codes vs paraphrases in the sandbox. Hybrid fusion is the default production pattern when both signal types matter.',
    },
    {
        'file': 'search-colbert.html',
        'slug': 'search-colbert',
        'data': 'search-colbert-data.js',
        'title': 'ColBERT / Late Interaction',
        'desc': 'Token-level MaxSim late interaction for precision retrieval.',
        'tldr': 'ColBERT scores queries and passages with late interaction (MaxSim) — many token vectors, not one pooled dot product. Strong lexical precision without losing neural signal.',
        'analogy': 'Bi-encoder retrieval summarizes a paragraph into one fingerprint. ColBERT keeps every word fingerprint and finds the best word-level matches — like spell-check at retrieval time.',
        'playground_type': 'colbert',
        'playground_title': 'ColBERT MaxSim sandbox',
        'playground_desc': 'See the token similarity matrix and how MaxSim sums best matches per query token.',
        'mechanism': '<p>Each query and passage token gets a contextual embedding. Score = sum over query tokens of max similarity to any passage token (MaxSim).</p><ul><li><strong>Recall stage:</strong> often bi-encoder or BM25 first</li><li><strong>Precision stage:</strong> ColBERT rerank on top-k candidates</li><li><strong>Cost:</strong> multi-vector index is larger than single-vector</li></ul>',
        'tradeoffs_use': '<li>Proper nouns, rare terms, short queries</li><li>As reranker after cheap recall</li>',
        'tradeoffs_skip': '<li>Strict latency/storage budgets with huge corpora</li>',
        'prev': './search-retrieval.html',
        'next': './search-hyde.html',
        'connections': '<a href="./search-retrieval.html">Search & Retrieval</a> · <a href="./search-hyde.html">HyDE</a>',
        'together': 'Edit the query in the sandbox. Watch which document wins when rare terms like "GraphRAG" need token-level matching.',
    },
    {
        'file': 'search-hyde.html',
        'slug': 'search-hyde',
        'data': 'search-hyde-data.js',
        'title': 'HyDE',
        'desc': 'Hypothetical Document Embeddings — generate then retrieve.',
        'tldr': 'HyDE has an LLM write a hypothetical answer, embeds that text, and retrieves on similarity to the hypothesis instead of the raw question.',
        'analogy': 'Instead of searching with "how do community summaries work?" you search with a fake paragraph that sounds like the answer you want. Documents similar to that paragraph rank higher.',
        'playground_type': 'hyde',
        'playground_title': 'HyDE sandbox',
        'playground_desc': 'Compare direct query retrieval vs embedding a generated hypothetical document.',
        'mechanism': '<p>Query representation problem: short questions embed poorly against long formal passages. HyDE bridges the vocabulary gap with a generated stand-in document.</p><ul><li><strong>Risk:</strong> wrong facts in the hypothesis skew neighborhoods</li><li><strong>Mitigation:</strong> pair with reranking or reflection</li></ul>',
        'tradeoffs_use': '<li>Short/abstract queries vs document vocabulary mismatch</li><li>No labeled query-passage pairs to train a bridge</li>',
        'tradeoffs_skip': '<li>High-stakes facts where hallucinated hypotheses poison retrieval</li>',
        'prev': './search-colbert.html',
        'next': './indexing-raptor.html',
        'connections': '<a href="./search-colbert.html">ColBERT</a> · <a href="./verification-agentic.html">Agentic RAG</a>',
        'together': 'Type a short question in the sandbox. The hypothetical doc often retrieves better — but check what happens if the hypothesis invents wrong facts.',
    },
    {
        'file': 'indexing-raptor.html',
        'slug': 'indexing-raptor',
        'data': 'indexing-raptor-data.js',
        'title': 'RAPTOR Trees',
        'desc': 'Hierarchical summary trees for multi-scale retrieval.',
        'tldr': 'RAPTOR builds a tree of abstractive summaries: leaves are chunks, parents summarize children. Retrieval hits multiple granularities — detail or theme.',
        'analogy': 'A textbook with chapter summaries, section summaries, and full paragraphs. You can read the one-page summary or drill to the exact paragraph — RAPTOR indexes all levels.',
        'playground_type': 'raptor',
        'playground_title': 'RAPTOR tree sandbox',
        'playground_desc': 'Query the summary tree. See whether leaf chunks or parent summaries match best.',
        'mechanism': '<p>Recursive summarization: cluster chunks → summarize → repeat up the tree. Query matches at different depths.</p><ul><li><strong>Leaf:</strong> precise local detail</li><li><strong>Parent:</strong> theme-level context for broad questions</li><li><strong>Tradeoff:</strong> abstractive summaries may lose verbatim citeability</li></ul>',
        'tradeoffs_use': '<li>Long narratives needing both detail and themes</li><li>When flat chunking buries global context</li>',
        'tradeoffs_skip': '<li>Strict legal citing with no paraphrase allowed</li><li>Tiny corpora where tree build cost exceeds benefit</li>',
        'prev': './search-hyde.html',
        'next': './indexing-pageindex.html',
        'connections': '<a href="./indexing-pageindex.html">PageIndex</a> · <a href="./graph-graphrag.html">GraphRAG</a>',
        'together': 'Query "cloud revenue" vs "overall strategy" in the sandbox. Different tree levels answer different question shapes.',
    },
    {
        'file': 'indexing-pageindex.html',
        'slug': 'indexing-pageindex',
        'data': 'indexing-pageindex-data.js',
        'title': 'PageIndex (TOC Navigation)',
        'desc': 'Structure-first retrieval via table of contents navigation.',
        'tldr': 'PageIndex builds a TOC-like index and lets an LLM reason over structure to find passages — de-emphasizing embedding similarity over the whole file.',
        'analogy': 'Finding a policy in an employee handbook by opening the table of contents vs searching random sticky notes scattered on the floor. Structure beats bag-of-chunks for organized docs.',
        'playground_type': 'pageindex',
        'playground_title': 'PageIndex sandbox',
        'playground_desc': 'TOC navigation jumps to the right section in one hop. Flat chunk search may return fragments from wrong places.',
        'mechanism': '<p>Hierarchical index mirrors document outline. LLM chooses branches and drill-down paths before (or instead of) global embedding top-k.</p><ul><li><strong>Best for:</strong> manuals, policies, reports with reliable headings</li><li><strong>Hybrid:</strong> PageIndex routing → small embedding search inside section</li></ul>',
        'tradeoffs_use': '<li>Long structured PDFs with clear section hierarchy</li><li>Queries referencing sections ("remote work policy")</li>',
        'tradeoffs_skip': '<li>Unstructured notes without headings</li><li>When pure semantic search over short docs is faster</li>',
        'prev': './indexing-raptor.html',
        'next': './graph-graphrag.html',
        'connections': '<a href="./indexing-raptor.html">RAPTOR</a> · <a href="./verification-agentic.html">Agentic RAG</a>',
        'together': 'Search "remote work policy" in the sandbox. TOC lands on section 4 in one step; flat search may rank a random chunk mentioning "remote" from benefits.',
    },
    {
        'file': 'graph-graphrag.html',
        'slug': 'graph-graphrag',
        'data': 'graph-graphrag-data.js',
        'title': 'GraphRAG',
        'desc': 'Entity graph community retrieval for global corpus questions.',
        'tldr': 'GraphRAG lifts chunks into entity/relation graphs, clusters communities, and summarizes them — answering global thematic questions isolated chunk retrieval misses.',
        'analogy': 'Instead of reading random pages from 100 books, you get a map of characters and themes connecting those books — then read the summary of the relevant story cluster.',
        'playground_type': 'graphrag',
        'playground_title': 'GraphRAG sandbox',
        'playground_desc': 'Ask a global question. See which community summary and entities light up on the graph.',
        'mechanism': '<p>Extract entities and relations → community detection at multiple scales → summarize communities → query via graph structure + summaries, not only vector NN to raw chunks.</p><ul><li><strong>Global queries:</strong> "What themes connect our product lines?"</li><li><strong>Cost:</strong> graph build heavier than flat embed</li></ul>',
        'tradeoffs_use': '<li>Corpus-level synthesis, multi-hop entity questions</li><li>Cross-document relational structure matters</li>',
        'tradeoffs_skip': '<li>Small narrow corpora without stable entities</li><li>When graph extraction noise exceeds value</li>',
        'prev': './indexing-pageindex.html',
        'next': './verification-agentic.html',
        'connections': '<a href="./indexing-raptor.html">RAPTOR</a> · <a href="./ingestion-evidence-pins.html">Evidence Pins</a>',
        'together': 'Ask "What connects cloud and enterprise customers?" The community summary synthesizes what no single chunk contains.',
    },
    {
        'file': 'verification-agentic.html',
        'slug': 'verification-agentic',
        'data': 'verification-agentic-data.js',
        'title': 'Agentic RAG',
        'desc': 'Planner–retriever–reflection loops for multi-step RAG.',
        'tldr': 'Agentic RAG replaces fixed query→retrieve→generate with a reasoning loop: plan sub-tasks, route tools, reflect on results, re-retrieve when confidence is low.',
        'analogy': 'Static RAG is a vending machine — one button, one snack. Agentic RAG is a researcher who makes a plan, checks sources, realizes something is missing, and goes back to the library.',
        'playground_type': 'agentic-loop',
        'playground_title': 'Agentic loop sandbox',
        'playground_desc': 'Step through planner → retriever → reflection → re-retrieve → generate. Watch evidence accumulate.',
        'mechanism': '<p>Production loop: intent parser → task planner → tool router → retrieval → reflection engine → re-retrieval (bounded) → synthesis with citations.</p><ul><li><strong>CRAG:</strong> relevance classifier, supplement if below threshold</li><li><strong>Self-RAG:</strong> reflection tokens (IsREL, IsSUP, IsUSE)</li><li><strong>Controls:</strong> max iterations, cost ceiling, reasoning traces</li></ul>',
        'tradeoffs_use': '<li>Multi-hop reasoning, cross-system synthesis</li><li>High-stakes domains needing reflection</li>',
        'tradeoffs_skip': '<li>Simple single-chunk lookups ("what does clause 4.2 say?")</li><li>When 3–8× cost/latency is unjustified</li>',
        'prev': './graph-graphrag.html',
        'next': None,
        'connections': '<a href="./graph-graphrag.html">GraphRAG</a> · <a href="./indexing-pageindex.html">PageIndex</a> · <a href="./ingestion-evidence-pins.html">Evidence Pins</a>',
        'together': 'Click through each step in the sandbox. Reflection is what prevents returning an answer when evidence is incomplete.',
    },
]


def render(p):
    next_link = f'<a href="{p["next"]}" class="btn btn--primary">Next: continue path →</a>' if p.get('next') else ''
    return f'''<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="{p['desc']}">
  <link rel="stylesheet" href="../../design-system/tokens.css">
  <link rel="stylesheet" href="../../design-system/components.css">
  <link rel="stylesheet" href="../../design-system/animations.css">
  <title>{p['title']} — Intuitive Learning</title>
</head>
<body>
  <header class="site-header" role="banner">
    <nav class="breadcrumb" aria-label="breadcrumb">
      <a href="../../index.html">Home</a><span aria-hidden="true"> / </span>
      <a href="index.html">RAG</a><span aria-hidden="true"> / </span>
      <span aria-current="page">{p['title']}</span>
    </nav>
  </header>
  <div class="page-layout">
    <aside class="sidebar" aria-label="Page navigation">
      <nav class="section-nav" data-scrollspy>
        <h3 class="sidebar__heading">This page</h3>
        <ul class="sidebar__list">
          <li><a href="#hook" data-section="hook">💡 The analogy</a></li>
          <li><a href="#why-it-matters" data-section="why">⚠️ Why it matters</a></li>
          <li><a href="#interactive-viz" data-section="viz">🔬 Playgrounds</a></li>
          <li><a href="#core-mechanism" data-section="mechanism">⚙️ How it works</a></li>
          <li><a href="#tradeoffs" data-section="tradeoffs">⚖️ Tradeoffs</a></li>
          <li><a href="#connections" data-section="connections">🔗 Connections</a></li>
          <li><a href="#put-it-together" data-section="together">🧩 Put it together</a></li>
        </ul>
      </nav>
      <nav class="module-tree" aria-label="RAG concepts">
        <h3 class="sidebar__heading sidebar__heading--spaced">RAG pipeline</h3>
        <ul class="sidebar__list" data-rag-module-tree></ul>
      </nav>
    </aside>
    <main class="content" id="main-content">
      <section id="hook" class="content-section" data-section-id="hook">
        <div class="hook-analogy" data-reveal="fade-up">
          <div class="hook-analogy-card">
            <p class="hook-analogy-card__lead">Think of it like...</p>
            <div class="hook-analogy-card__body">{p['analogy']}</div>
          </div>
        </div>
        <h1>{p['title']}</h1>
        <div class="tldr-pill"><strong>TL;DR:</strong> {p['tldr']}</div>
      </section>
      <section id="why-it-matters" class="content-section" data-section-id="why">
        <h2>Why this matters</h2>
        <p>{p['tldr']}</p>
        <div class="callout callout--danger">
          <strong>Without this:</strong> downstream retrieval and generation inherit upstream mistakes — bigger models and rerankers rarely recover.
        </div>
        <div class="callout callout--success">
          <strong>With this:</strong> each pipeline stage receives clean, structured input — grounding becomes possible instead of hopeful.
        </div>
      </section>
      <section id="interactive-viz" class="content-section" data-section-id="viz">
        <h2>Play with the machinery</h2>
        <p>{p['playground_desc']}</p>
        <div class="playground" data-playground="{p['playground_type']}"></div>
      </section>
      <section id="core-mechanism" class="content-section" data-section-id="mechanism">
        <h2>How it works</h2>
        {p['mechanism']}
      </section>
      <section id="tradeoffs" class="content-section" data-section-id="tradeoffs">
        <h2>Tradeoffs</h2>
        <div class="grid grid-cols-2" style="gap:var(--space-4);">
          <div class="callout callout--use"><h3>Use when</h3><ul>{p['tradeoffs_use']}</ul></div>
          <div class="callout callout--danger"><h3>Skip when</h3><ul>{p['tradeoffs_skip']}</ul></div>
        </div>
      </section>
      <section id="connections" class="content-section" data-section-id="connections">
        <h2>Connections</h2>
        <p>{p['connections']}</p>
        <p class="text-secondary"><a href="{p['prev']}">← Previous lesson</a>{f' · <a href="{p["next"]}">Next lesson →</a>' if p.get('next') else ''}</p>
      </section>
      <section id="put-it-together" class="content-section" data-section-id="together">
        <h2>Put it together</h2>
        <p>{p['together']}</p>
        {next_link}
      </section>
    </main>
  </div>
  <script type="module">
    import {{ initRagConceptPage }} from '../../js/core/concept-page.js';
    import conceptData from '../../js/topics/rag/{p['data']}';
    initRagConceptPage('{p['slug']}', conceptData);
  </script>
</body>
</html>
'''


for page in PAGES:
    path = os.path.join(BASE, page['file'])
    with open(path, 'w', encoding='utf-8') as f:
        f.write(render(page))
    print('Wrote', path)
