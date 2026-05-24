/**
 * A-RAG Paper Journey — assumptions, benchmarks, extension prompts.
 */

export const disclosureLevels = [
  {
    id: 'D0',
    label: 'D0 — Single-shot dump',
    truncation: false,
    compaction: false,
    summarization: false,
    maxChars: null,
    note: 'Naive RAG: all top-k chunks concatenated at once. Maximum tokens, no agent choice.',
  },
  {
    id: 'D1',
    label: 'D1 — Snippet only',
    truncation: true,
    compaction: false,
    summarization: false,
    maxChars: 800,
    note: 'Search tools return keyword/sentence snippets — agent sees previews, not full chunks.',
  },
  {
    id: 'D2',
    label: 'D2 — Progressive read',
    truncation: true,
    compaction: true,
    summarization: false,
    maxChars: 800,
    note: 'Agent calls chunk_read only for promising IDs. Full text on demand — fewer irrelevant tokens.',
  },
  {
    id: 'D3',
    label: 'D3 — + Context tracker',
    truncation: true,
    compaction: true,
    summarization: false,
    maxChars: 800,
    note: 'Re-reading a chunk returns zero tokens. Encourages exploring new evidence instead of loops.',
  },
];

export const evidenceBenchmarks = [
  {
    id: 'musique',
    label: 'MuSiQue (GPT-5-mini)',
    paperSection: 'Table 1',
    baselines: [
      { name: 'Naive RAG', accuracy: 52.8, cost: 5387 },
      { name: 'A-RAG (Full)', accuracy: 74.1, cost: 5663 },
    ],
    insight: '+21.3 pts LLM-Acc — agentic hierarchy beats one-shot retrieval on compositional hops.',
  },
  {
    id: 'hotpot',
    label: 'HotpotQA (GPT-5-mini)',
    paperSection: 'Table 1',
    baselines: [
      { name: 'Naive RAG', accuracy: 81.2, cost: 5358 },
      { name: 'A-RAG (Full)', accuracy: 94.5, cost: 2737 },
    ],
    insight: '+13.3 pts with **half** the retrieved tokens — progressive read beats dump-all.',
  },
  {
    id: '2wiki',
    label: '2WikiMultiHopQA (GPT-5-mini)',
    paperSection: 'Table 1',
    baselines: [
      { name: 'HippoRAG2', accuracy: 82.0, cost: 5538 },
      { name: 'A-RAG (Full)', accuracy: 89.7, cost: 2930 },
    ],
    insight: 'Beats graph-RAG baseline by +7.7 pts with ~47% fewer tokens — model-driven beats fixed graph algorithm.',
  },
];

export const assumptions = [
  {
    id: 'capable-model',
    label: 'Capable reasoning + tool-calling model',
    defaultOn: true,
    description: 'Agent can reliably choose tools and iterate over multiple steps.',
    breakScenario: {
      title: 'Small model without function calling',
      dciOutcome: 'struggle',
      retrieverOutcome: 'win',
      verdict: 'A-RAG needs the model in the loop. Naive RAG\'s fixed pipeline works fine when the model cannot tool-call.',
    },
  },
  {
    id: 'pre-chunked',
    label: 'Pre-chunked corpus with stable IDs',
    defaultOn: true,
    description: 'Corpus split into ~1K-token chunks; chunk_read addresses known IDs.',
    breakScenario: {
      title: 'Live streaming documents (no chunk IDs)',
      dciOutcome: 'struggle',
      retrieverOutcome: 'win',
      verdict: 'chunk_read assumes offline chunking. Dynamic corpora need different interfaces (URL fetch, page read).',
    },
  },
  {
    id: 'qa-benchmarks',
    label: 'Closed corpus multi-hop QA',
    defaultOn: true,
    description: 'Evaluation uses provided document sets — not open-web search.',
    breakScenario: {
      title: 'Real-time open-web deep research',
      dciOutcome: 'struggle',
      retrieverOutcome: 'win',
      verdict: 'Keyword search on a fixed corpus ≠ web search APIs. Different toolset needed for live internet.',
    },
  },
  {
    id: 'iteration-budget',
    label: 'Generous iteration budget',
    defaultOn: true,
    description: 'Agent can run many ReAct steps; latency is acceptable.',
    breakScenario: {
      title: 'Sub-second chat SLA (1 round only)',
      dciOutcome: 'struggle',
      retrieverOutcome: 'win',
      verdict: 'Each tool call adds latency. Single-shot Naive RAG wins when you cannot iterate.',
    },
  },
  {
    id: 'english-lexical',
    label: 'Lexical keyword search is useful',
    defaultOn: true,
    description: 'Queries and corpus share tokens for keyword_search to help.',
    breakScenario: {
      title: 'Cross-lingual QA (query in English, docs in Japanese)',
      dciOutcome: 'struggle',
      retrieverOutcome: 'win',
      verdict: 'Runtime keyword match fails without shared script. Multilingual embeddings or translation layer needed.',
    },
  },
];

export const improvementIdeas = [
  {
    id: 'fourth-tool',
    title: 'Add a document-level skim tool',
    seed: 'Before chunk tools, let the agent list document titles or read first paragraph — coarse-to-fine navigation.',
    whyBetter: 'Multi-hop questions often need to pick the right document before sentence-level search.',
    reveal: {
      framing: 'A-RAG has keyword → sentence → chunk. A document tier completes the hierarchy.',
      tradeoffs: [
        'Better: faster orientation on large corpora',
        'Risk: extra tool = more decision points for weak models',
        'Design: return metadata only — keep tokens low',
      ],
      nextSteps: [
        'Ablation: add doc_list tool vs A-RAG Full on GraphRAG-Bench Novel',
        'Measure tokens saved when corpus has 10K+ chunks',
      ],
    },
  },
  {
    id: 'parallel-tools',
    title: 'Parallel tool calls per iteration',
    seed: 'Allow keyword_search + semantic_search in one step when the agent needs both lexical and semantic signals.',
    whyBetter: 'Paper deliberately uses serial ReAct — parallel calls could cut latency without losing autonomy.',
    reveal: {
      framing: 'Test-time scaling via width, not just depth (cf. SParC-RAG).',
      tradeoffs: [
        'Better: fewer round-trips on multi-hop',
        'Risk: context bloat if both tools return large snippets',
        'Needs: merge/dedup policy for parallel observations',
      ],
      nextSteps: [
        'Compare serial vs parallel on HotpotQA with fixed token budget',
        'Track failure modes: does parallel increase entity confusion?',
      ],
    },
  },
  {
    id: 'graph-hybrid',
    title: 'GraphRAG global + A-RAG local read',
    seed: 'Use graph/community summary for orientation, then A-RAG chunk tools for precise evidence and citation.',
    whyBetter: 'Graph methods excel at global questions; A-RAG excels at selective local read — complementary.',
    reveal: {
      framing: 'Neither graph-only nor flat-chunk-only is optimal for all query types.',
      tradeoffs: [
        'Better: global + local coverage on GraphRAG-Bench',
        'Risk: two systems to maintain; routing between them',
        'Open question: who decides graph vs flat — model or heuristic?',
      ],
      nextSteps: [
        'Route Novel vs Med. subsets differently — validate on GraphRAG-Bench',
        'Compare token cost vs pure A-RAG Full',
      ],
    },
  },
  {
    id: 'failure-training',
    title: 'Train against entity confusion',
    seed: 'Top failure mode is entity confusion in reasoning chain — add contrastive examples or RL on conflated entities.',
    whyBetter: 'Retrieval succeeds but agent merges wrong entities — a reasoning fix, not a tool fix.',
    reveal: {
      framing: 'Paper §5.3: majority of errors are reasoning chain, not retrieval misses.',
      tradeoffs: [
        'Better: fixes errors retrieval tools cannot',
        'Risk: overfit to benchmark entity patterns',
        'Needs: labeled failure taxonomy from MuSiQue review',
      ],
      nextSteps: [
        'Fine-tune on 100 manually labeled entity-confusion cases',
        'Measure delta on MuSiQue vs retrieval-only ablation',
      ],
    },
  },
  {
    id: 'adaptive-budget',
    title: 'Adaptive max-step policy',
    seed: 'Easy questions stop at 2–3 steps; hard multi-hop gets 20+. Use answer confidence or evidence coverage as stop signal.',
    whyBetter: 'Test-time scaling helps but wastes compute on simple queries.',
    reveal: {
      framing: 'Paper shows gains from 5→20 steps — not every query needs 20.',
      tradeoffs: [
        'Better: cost-accuracy Pareto improvement',
        'Risk: premature stop loses hard questions',
        'Signal: chunk_read count + answer self-eval',
      ],
      nextSteps: [
        'Plot accuracy vs avg steps with learned stop vs fixed L',
        'Compare to Adaptive-RAG routing literature',
      ],
    },
  },
  {
    id: 'learned-router',
    title: 'Learned kw vs semantic vs read policy',
    seed: 'Small classifier or RL policy suggests first tool given query embedding — model can override.',
    whyBetter: 'Reduces wasted semantic search on exact-entity queries and wasted keyword on paraphrase-heavy ones.',
    reveal: {
      framing: 'A-RAG lets the model choose — a hint layer preserves autonomy while cutting bad first moves.',
      tradeoffs: [
        'Better: fewer iterations on average',
        'Risk: router bias becomes hidden workflow RAG',
        'Guard: model can always ignore router suggestion',
      ],
      nextSteps: [
        'Train router on A-RAG trajectories from released eval suite',
        'Ablation: router-suggested vs pure model choice',
      ],
    },
  },
];

export const chatStarters = [
  'How is A-RAG different from Workflow RAG like IRCoT?',
  'Why does A-RAG use fewer tokens than Naive RAG?',
  'Explain the three hierarchical retrieval tools.',
  'Where does A-RAG break down?',
  'How does test-time scaling work in this paper?',
];

export const paradigmSteps = {
  naive: [
    { step: 1, action: 'Embed query', detail: 'Single vector representation' },
    { step: 2, action: 'Retrieve top-k', detail: 'Fixed algorithm — one shot' },
    { step: 3, action: 'Concatenate chunks', detail: 'All evidence dumped into context' },
    { step: 4, action: 'Generate answer', detail: 'Model cannot re-retrieve' },
  ],
  arag: [
    { step: 1, action: 'Reason about question', detail: 'Agent plans retrieval strategy' },
    { step: 2, action: 'Choose tool', detail: 'keyword_search / semantic_search / chunk_read' },
    { step: 3, action: 'Observe snippets', detail: 'Progressive disclosure — previews first' },
    { step: 4, action: 'Iterate or answer', detail: 'Read full chunks only when needed; stop when sufficient' },
  ],
};

export const assumptionToSeed = {
  'capable-model': 'learned-router',
  'pre-chunked': 'fourth-tool',
  'qa-benchmarks': 'graph-hybrid',
  'iteration-budget': 'adaptive-budget',
  'english-lexical': 'learned-router',
};

export const testTimeScaling = {
  datasetLabel: 'MuSiQue-300 subset · GPT-5-mini (paper §5.1)',
  stepCurve: [
    { steps: 5, accuracy: 66.0, insight: 'Short horizon — agent stops before chaining multi-hop evidence.' },
    { steps: 10, accuracy: 70.0, insight: 'Mid-range steps — more tool calls, steady gains on compositional questions.' },
    { steps: 15, accuracy: 72.0, insight: 'Diminishing returns begin — strong models use extra steps for verification.' },
    { steps: 20, accuracy: 74.1, insight: 'Paper peak at 20 steps (~+8 pts vs 5 steps) — test-time scaling via depth.' },
  ],
  reasoningCurve: [
    { effort: 'minimal', label: 'Minimal effort', accuracy: 49.0, insight: 'Low reasoning effort — tool choices are shallow even with a good interface.' },
    { effort: 'medium', label: 'Medium effort', accuracy: 62.0, insight: 'Mid effort — better planning of kw → semantic → read sequences.' },
    { effort: 'high', label: 'High effort', accuracy: 74.0, insight: 'High reasoning effort ~+25 pts vs minimal — interface + thinking scale together.' },
  ],
};

export default {
  disclosureLevels,
  evidenceBenchmarks,
  assumptions,
  assumptionToSeed,
  improvementIdeas,
  chatStarters,
  paradigmSteps,
  testTimeScaling,
};
