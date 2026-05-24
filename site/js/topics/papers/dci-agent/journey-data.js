/**
 * DCI Paper Journey — spine, assumptions, extension prompts.
 */

export const contextLevels = [
  {
    id: 'L0',
    label: 'L0 — Raw',
    truncation: false,
    compaction: false,
    summarization: false,
    maxChars: null,
    note: 'Full trajectory kept. Context grows unbounded — expensive but nothing lost.',
  },
  {
    id: 'L1',
    label: 'L1 — Truncate 50K',
    truncation: true,
    compaction: false,
    summarization: false,
    maxChars: 50000,
    note: 'Oldest tool output dropped when context exceeds 50K chars.',
  },
  {
    id: 'L2',
    label: 'L2 — Truncate 20K',
    truncation: true,
    compaction: false,
    summarization: false,
    maxChars: 20000,
    note: 'Tighter cap — long grep sweeps may lose early hits.',
  },
  {
    id: 'L3',
    label: 'L3 — + Compaction',
    truncation: true,
    compaction: true,
    summarization: false,
    maxChars: 20000,
    note: 'Repeated file reads collapse to latest version; saves tokens.',
  },
  {
    id: 'L4',
    label: 'L4 — + Summarization',
    truncation: true,
    compaction: true,
    summarization: true,
    maxChars: 20000,
    note: 'Old steps summarized — agent may lose exact line numbers from early greps.',
  },
];

export const evidenceBenchmarks = [
  {
    id: 'browsecomp',
    label: 'BrowseComp-Plus',
    paperSection: '§4.1',
    baselines: [
      { name: 'Retriever (Qwen3-Embed-8B)', accuracy: 69.0, cost: 1440 },
      { name: 'DCI-Agent-CC', accuracy: 80.0, cost: 1016 },
    ],
    insight: 'Same LLM backbone — swap interface, not model. DCI +11 pts accuracy, −29% cost.',
  },
  {
    id: 'multihop',
    label: 'Multi-hop QA (Table 2 avg)',
    paperSection: '§4.2',
    baselines: [
      { name: 'ASearcher-Local-14B', accuracy: 52.3, cost: null },
      { name: 'DCI-Agent-CC', accuracy: 83.0, cost: null },
    ],
    insight: '+30.7 pts — agentic multi-step search benefits from composable grep pipes.',
  },
  {
    id: 'ir',
    label: 'IR ranking (Table 3 avg NDCG@10)',
    paperSection: '§4.3',
    baselines: [
      { name: 'ReasonRank-32B', accuracy: 47.0, cost: null },
      { name: 'DCI-Agent-CC', accuracy: 68.5, cost: null },
    ],
    insight: 'DCI as ranking interface beats dedicated rerankers on localization-heavy tasks.',
  },
];

export const contributions = [
  {
    id: 'formalize',
    claim: 'Formalize Direct Corpus Interaction (grep, read, shell — no vector index)',
    station: '#terminal',
  },
  {
    id: 'benchmarks',
    claim: 'Beat sparse/dense/rerank baselines on QA and IR without external retrievers',
    station: '#evidence',
  },
  {
    id: 'resolution',
    claim: 'Introduce retrieval interface resolution — granularity of corpus access',
    station: '#resolution',
  },
];

export const assumptions = [
  {
    id: 'local-corpus',
    label: 'Local / workspace-scale corpus',
    defaultOn: true,
    description: 'Corpus fits on disk; grep latency is acceptable.',
    breakScenario: {
      title: 'Web-scale crawl (10B pages)',
      dciOutcome: 'struggle',
      retrieverOutcome: 'win',
      verdict: 'Offline index + top-k is mandatory at web scale. DCI shines when the agent workspace is bounded (repo, docs folder, case files).',
    },
  },
  {
    id: 'capable-agent',
    label: 'Capable multi-step agent',
    defaultOn: true,
    description: 'Agent can plan grep pipes, read files, and recover from empty results.',
    breakScenario: {
      title: 'Single-shot QA (no agent loop)',
      dciOutcome: 'struggle',
      retrieverOutcome: 'win',
      verdict: 'DCI needs an agent loop. One-shot "retrieve and answer" is exactly what dense retrievers optimize for.',
    },
  },
  {
    id: 'structured-files',
    label: 'Structured text files',
    defaultOn: true,
    description: 'Corpus is grep-friendly: plain text, CSV, markdown — not scanned PDFs.',
    breakScenario: {
      title: 'Scanned PDF archive (no OCR layer)',
      dciOutcome: 'struggle',
      retrieverOutcome: 'win',
      verdict: 'grep on binary PDFs fails. Parsing/OCR/indexing front-load is still required — DCI assumes readable files.',
    },
  },
  {
    id: 'latency-budget',
    label: 'Generous latency budget',
    defaultOn: true,
    description: 'Multi-step terminal search is OK; sub-100ms retrieval is not required.',
    breakScenario: {
      title: 'Real-time chat with strict SLA',
      dciOutcome: 'struggle',
      retrieverOutcome: 'win',
      verdict: 'Each grep + read adds round-trips. Pre-indexed top-k wins when latency dominates.',
    },
  },
  {
    id: 'no-index',
    label: 'No pre-built index',
    defaultOn: true,
    description: 'Corpus changes often; maintaining embeddings is costly or impossible.',
    breakScenario: {
      title: 'Static billion-doc corpus, query-heavy',
      dciOutcome: 'struggle',
      retrieverOutcome: 'win',
      verdict: 'Amortize indexing cost when corpus is static and queries are many. DCI wins when corpus is dynamic or small.',
    },
  },
];

export const extensionPrompts = [
  {
    id: 'hybrid-interface',
    prompt: 'Hybrid interface: retriever proposes candidate documents, terminal verifies exact spans. What improves? What breaks?',
    reveal: {
      framing: 'This is the most practical near-term extension — combine recall (index) with localization (grep).',
      tradeoffs: [
        'Improves: web-scale candidate generation + DCI-level citation precision',
        'Breaks: two-hop latency; retriever bias may still hide docs outside top-N candidates',
        'Open question: who routes — fixed pipeline or learned tool policy?',
      ],
      directions: [
        'Retriever → file list → DCI span verification (BrowseComp-style agents)',
        'Learned router: index vs grep vs read based on query type',
      ],
    },
    relatedSection: '§3 Method',
  },
  {
    id: 'learned-router',
    prompt: 'Replace raw bash with a learned tool router (grep vs read vs glob). When does learning help vs hurt interpretability?',
    reveal: {
      framing: 'DCI-Agent-Lite uses minimal tools deliberately — composability over learned retrieval.',
      tradeoffs: [
        'Learning helps: pick optimal tool sequence per query class',
        'Learning hurts: opaque failures, harder to debug trajectories',
        'Risk: router collapses back to "one-shot retrieve" behavior',
      ],
      directions: [
        'Train on trajectory logs from DCI successes/failures',
        'Constrained action space: only allow pipeable shell patterns',
      ],
    },
    relatedSection: '§3.2 Implementations',
  },
  {
    id: 'resolution-policy',
    prompt: 'Make interface resolution a trainable policy (document vs line vs span). What signal would you use?',
    reveal: {
      framing: 'The paper introduces resolution as an analytic lens — not yet a learned controller.',
      tradeoffs: [
        'Coarse resolution: fewer tokens, may miss exact evidence',
        'Fine resolution: precise but context-heavy',
        'Policy could adapt per query: SKU → span, overview → document',
      ],
      directions: [
        'Reward localization score from paper\'s trajectory metrics',
        'Hierarchical read: skim doc → zoom to paragraph → extract span',
      ],
    },
    relatedSection: '§5 Contribution 3',
  },
  {
    id: 'semantic-still-wins',
    prompt: 'Name a query type where semantic retrieval still beats DCI. Design the experiment to prove it.',
    reveal: {
      framing: 'DCI is not "always better" — it trades indexing for lexical control.',
      tradeoffs: [
        'Paraphrase-heavy questions with no lexical anchor favor dense retrieval',
        'Cross-lingual or typo-tolerant search needs embeddings',
        'DCI wins on exact codes, entities, piped conjunctions',
      ],
      directions: [
        'Benchmark: paraphrase QA with no shared tokens between query and gold',
        'Ablation: remove grep, keep only semantic file finder — where does accuracy cross over?',
      ],
    },
    relatedSection: '§4 Experiments',
  },
  {
    id: 'safety-sandbox',
    prompt: 'Sandbox DCI corpus access for untrusted agents. What commands do you allow? What attacks remain?',
    reveal: {
      framing: 'Full shell access on raw files is powerful and dangerous in production.',
      tradeoffs: [
        'Allowlist: rg, head, wc — block rm, curl, network',
        'Still vulnerable: path traversal, resource exhaustion (grep -r on huge trees)',
        'May need per-tenant corpus chroot',
      ],
      directions: [
        'Read-only container with size-capped grep output',
        'Audit log of every corpus touch for compliance use cases',
      ],
    },
    relatedSection: '§6 Limitations (implied)',
  },
];

/** Ideas to better the DCI solution — Part 3 Ideas Workshop */
export const improvementIdeas = [
  {
    id: 'hybrid-interface',
    title: 'Retriever proposes, DCI verifies',
    seed: 'Index finds candidate documents; terminal grep confirms exact spans before the agent answers.',
    whyBetter: 'Fixes recall at scale without losing the localization wins that make DCI strong.',
    reveal: {
      framing: 'The most practical upgrade path — combine index recall with grep precision.',
      tradeoffs: [
        'Better: web-scale candidate generation + DCI-level citations',
        'Risk: retriever bias hides docs outside top-N; two-hop latency',
        'Design choice: fixed pipeline vs learned router between index and grep',
      ],
      nextSteps: [
        'Prototype: top-20 files from BM25 → DCI span verification only inside those files',
        'Measure: does localization stay high when recall depends on the index?',
      ],
    },
  },
  {
    id: 'adaptive-resolution',
    title: 'Adaptive interface resolution',
    seed: 'Train or rule-based policy: SKU queries → line span; overview questions → whole document skim first.',
    whyBetter: 'Cuts context bloat on long trajectories while keeping precision when it matters.',
    reveal: {
      framing: 'The paper names resolution as a lens — making it adaptive is a natural upgrade.',
      tradeoffs: [
        'Better: fewer tokens on low-precision queries',
        'Risk: wrong granularity choice loses gold evidence',
        'Signal: reward localization score from trajectory metrics',
      ],
      nextSteps: [
        'Heuristic v1: regex/detect entities → auto zoom to span',
        'Learned v2: policy trained on DCI success/failure logs',
      ],
    },
  },
  {
    id: 'smart-context',
    title: 'Smarter L0–L4 context policy',
    seed: 'Instead of fixed truncation, evict low-salience tool output first; never summarize grep hits that matched gold patterns.',
    whyBetter: 'Long agent runs lose early evidence under L4 — a smarter policy preserves what matters.',
    reveal: {
      framing: 'Context management is the hidden bottleneck in long DCI trajectories.',
      tradeoffs: [
        'Better: longer effective horizon without unbounded cost',
        'Risk: salience model wrong → evicts the one line you needed',
        'Needs: entity/SKU-aware retention rules',
      ],
      nextSteps: [
        'Ablation: never-summarize-gold-lines vs paper L4',
        'Score chunks by query overlap before eviction',
      ],
    },
  },
  {
    id: 'web-scale-bridge',
    title: 'Web-scale corpus bridge',
    seed: 'Shard corpus by domain; lightweight file-level index points agent to the right shard before DCI grep.',
    whyBetter: 'Addresses the biggest limitation — grep cannot scan the open web linearly.',
    reveal: {
      framing: 'DCI assumes workspace-scale corpora; sharding + coarse routing extends the idea.',
      tradeoffs: [
        'Better: bounded grep scope per query',
        'Risk: wrong shard = never find gold doc',
        'Hybrid: sitemap / metadata index as first hop only',
      ],
      nextSteps: [
        'Simulate: 10K folders, metadata index → pick folder → DCI inside',
        'Compare cost/latency vs pure retriever on BrowseComp-style tasks',
      ],
    },
  },
  {
    id: 'safe-dci',
    title: 'Production-safe DCI sandbox',
    seed: 'Allowlist rg/head/wc; cap output bytes; chroot per tenant; audit every corpus read.',
    whyBetter: 'Raw shell access is powerful for research agents but unsafe in production as-is.',
    reveal: {
      framing: 'Making DCI deployable requires constraining the interface without killing composability.',
      tradeoffs: [
        'Better: compliance-friendly agent search',
        'Risk: over-restricted toolset recreates top-k rigidity',
        'Balance: pipeable patterns only, no arbitrary shell',
      ],
      nextSteps: [
        'Define minimal tool grammar (grep | grep | head)',
        'Red-team: path traversal and resource exhaustion',
      ],
    },
  },
  {
    id: 'semantic-fallback',
    title: 'Semantic fallback for paraphrase queries',
    seed: 'When grep returns empty, fall back to embedding search on file summaries — not full top-k pipeline.',
    whyBetter: 'Covers paraphrase-heavy queries where DCI weakens, without abandoning terminal-first design.',
    reveal: {
      framing: 'DCI wins on lexical anchors; a controlled fallback handles the rest.',
      tradeoffs: [
        'Better: robustness on paraphrase QA',
        'Risk: fallback overused → back to retriever-mediated behavior',
        'Gate: only trigger after N failed grep attempts',
      ],
      nextSteps: [
        'Benchmark paraphrase set with no shared tokens',
        'Ablate: grep-only vs grep-then-fallback crossover point',
      ],
    },
  },
];

export const chatStarters = [
  'Where does DCI break down, and why?',
  'How would you improve DCI for a web-scale corpus?',
  'Explain the top-k bottleneck in one paragraph.',
  'Compare DCI to baseline RAG for agentic search.',
  'What hybrid of retriever + terminal would you build?',
];

export const paradigmSteps = {
  retriever: [
    { step: 1, action: 'Embed query', detail: 'Single vector representation' },
    { step: 2, action: 'Search index', detail: 'ANN over chunk embeddings' },
    { step: 3, action: 'Return top-k', detail: 'Fixed API — ranked snippets only' },
    { step: 4, action: 'Agent reads', detail: 'Cannot re-query corpus differently' },
  ],
  dci: [
    { step: 1, action: 'Plan search', detail: 'Agent chooses tool sequence' },
    { step: 2, action: 'grep / rg', detail: 'Lexical filter on raw files' },
    { step: 3, action: 'Pipe & refine', detail: 'Combine weak clues' },
    { step: 4, action: 'Read span', detail: 'Line-level verification & cite' },
  ],
};

export default {
  contextLevels,
  evidenceBenchmarks,
  contributions,
  assumptions,
  extensionPrompts,
  improvementIdeas,
  chatStarters,
  paradigmSteps,
};
