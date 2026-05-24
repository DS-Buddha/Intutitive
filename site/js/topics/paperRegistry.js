/**
 * Paper Explainer Registry
 * Each paper has a hub, concept pages, and an interactive lab journey.
 */

export const papers = [
  {
    id: 'dci-agent',
    title: 'Direct Corpus Interaction',
    fullTitle: 'Beyond Semantic Similarity: Rethinking Retrieval for Agentic Search via Direct Corpus Interaction',
    arxiv: '2605.05242',
    arxivUrl: 'https://arxiv.org/abs/2605.05242',
    github: 'https://github.com/DCI-Agent/DCI-Agent-Lite',
    hubPath: './topics/papers/dci-agent/index.html',
    explainerPath: './topics/papers/dci-agent/lab.html',
    labPath: './topics/papers/dci-agent/lab.html',
    thesis: 'Retrieval for capable agents is an interface-design problem — a terminal gives higher interface resolution than a fixed top-k API.',
    prerequisites: [
      { label: 'Baseline RAG', path: '../../rag/baseline.html' },
      { label: 'Search & Retrieval', path: '../../rag/search-retrieval.html' },
      { label: 'Agentic RAG', path: '../../rag/verification-agentic.html' },
    ],
    concepts: [
      { slug: 'top-k-bottleneck', label: 'Top-k Bottleneck', file: 'top-k-bottleneck.html' },
      { slug: 'interface-resolution', label: 'Interface Resolution', file: 'interface-resolution.html' },
      { slug: 'grep-composability', label: 'CLI Composability', file: 'grep-composability.html' },
      { slug: 'coverage-localization', label: 'Coverage vs Localization', file: 'coverage-localization.html' },
    ],
    journey: {
      phases: [
        { id: 'orient', label: 'Orient', href: './index.html' },
        { id: 'understand', label: 'Understand', href: './lab.html#understand-hook' },
        { id: 'verify', label: 'Verify', href: './lab.html#verify-start' },
        { id: 'think', label: 'Think', href: './lab.html#think-start' },
      ],
      labSections: [
        { id: 'understand-hook', label: 'Hook', anchor: '#understand-hook' },
        { id: 'understand-problem', label: 'Problem', anchor: '#understand-problem' },
        { id: 'understand-insight', label: 'Insight', anchor: '#understand-insight' },
        { id: 'understand-method', label: 'Method', anchor: '#understand-method' },
        { id: 'understand-evidence', label: 'Evidence', anchor: '#understand-evidence' },
        { id: 'understand-vocab', label: 'Vocabulary', anchor: '#understand-vocab' },
        { id: 'compare', label: 'A/B compare', anchor: '#compare' },
        { id: 'topk', label: 'Top-k', anchor: '#topk' },
        { id: 'resolution', label: 'Resolution', anchor: '#resolution' },
        { id: 'terminal', label: 'Terminal', anchor: '#terminal' },
        { id: 'metrics', label: 'Metrics', anchor: '#metrics' },
        { id: 'paradigm', label: 'Paradigm', anchor: '#paradigm' },
        { id: 'context', label: 'Context L0–L4', anchor: '#context' },
        { id: 'evidence', label: 'Evidence lens', anchor: '#evidence' },
        { id: 'assumptions', label: 'Assumptions', anchor: '#assumptions' },
        { id: 'ideas', label: 'Ideas workshop', anchor: '#ideas' },
        { id: 'chat', label: 'Paper chat', anchor: '#chat' },
        { id: 'paper', label: 'Paper links', anchor: '#paper' },
      ],
      partGroups: [
        {
          id: 'understand',
          label: 'Part 1 — Understand',
          introAnchor: '#understand-hook',
          sections: [
            { id: 'understand-hook', label: 'Hook', anchor: '#understand-hook' },
            { id: 'understand-problem', label: 'Problem', anchor: '#understand-problem' },
            { id: 'understand-insight', label: 'Insight', anchor: '#understand-insight' },
            { id: 'understand-method', label: 'Method', anchor: '#understand-method' },
            { id: 'understand-evidence', label: 'Benchmarks', anchor: '#understand-evidence' },
            { id: 'understand-vocab', label: 'Vocabulary', anchor: '#understand-vocab' },
          ],
        },
        {
          id: 'verify',
          label: 'Part 2 — Verify',
          introAnchor: '#verify-start',
          sections: [
            { id: 'compare', label: 'A/B compare', anchor: '#compare' },
            { id: 'topk', label: 'Top-k', anchor: '#topk' },
            { id: 'resolution', label: 'Resolution', anchor: '#resolution' },
            { id: 'terminal', label: 'Terminal', anchor: '#terminal' },
            { id: 'metrics', label: 'Metrics', anchor: '#metrics' },
            { id: 'paradigm', label: 'Paradigm', anchor: '#paradigm' },
            { id: 'context', label: 'Context', anchor: '#context' },
            { id: 'evidence', label: 'Evidence lens', anchor: '#evidence' },
          ],
        },
        {
          id: 'think',
          label: 'Part 3 — Think',
          introAnchor: '#think-start',
          sections: [
            { id: 'assumptions', label: 'Assumptions', anchor: '#assumptions' },
            { id: 'ideas', label: 'Ideas', anchor: '#ideas' },
            { id: 'chat', label: 'Chat', anchor: '#chat' },
            { id: 'paper', label: 'Links', anchor: '#paper' },
          ],
        },
      ],
      understandSectionIds: [
        'understand-hook', 'understand-problem', 'understand-insight',
        'understand-method', 'understand-evidence', 'understand-vocab',
      ],
      coreVerifyPlaygrounds: ['compare', 'topk', 'terminal'],
      readinessChecks: [
        {
          id: 'understand-complete',
          label: 'Completed Part 1 (Understand)',
          hint: 'Read all 6 sections in order',
        },
        {
          id: 'verify-lab',
          label: 'Used core verify labs',
          hint: 'Interact with compare, top-k, and terminal',
        },
        {
          id: 'stress-assumptions',
          label: 'Explored assumption scenarios',
          hint: 'Break ≥3 assumptions in Assumption breaker',
          minCount: 3,
        },
        {
          id: 'ideas-saved',
          label: 'Saved improvement ideas',
          hint: 'Save ≥2 ideas in Ideas workshop',
          minCount: 2,
        },
        {
          id: 'chat-used',
          label: 'Discussed the paper in chat',
          hint: 'Send at least one message in Paper chat',
        },
      ],
      onboarding: {
        timeEstimate: '45–60 min',
      },
    },
  },
  {
    id: 'a-rag',
    title: 'A-RAG',
    fullTitle: 'A-RAG: Scaling Agentic Retrieval-Augmented Generation via Hierarchical Retrieval Interfaces',
    arxiv: '2602.03442',
    arxivUrl: 'https://arxiv.org/abs/2602.03442',
    github: 'https://github.com/Ayanami0730/arag',
    hubPath: './topics/papers/a-rag/index.html',
    explainerPath: './topics/papers/a-rag/lab.html',
    labPath: './topics/papers/a-rag/lab.html',
    thesis: 'Agentic RAG should expose hierarchical retrieval interfaces to the model — keyword, semantic, and chunk tools beat fixed pipelines and scale with test-time compute.',
    prerequisites: [
      { label: 'Baseline RAG', path: '../../rag/baseline.html' },
      { label: 'Search & Retrieval', path: '../../rag/search-retrieval.html' },
      { label: 'Agentic RAG', path: '../../rag/verification-agentic.html' },
    ],
    concepts: [
      { slug: 'hierarchical-tools', label: 'Hierarchical Tools', file: 'hierarchical-tools.html' },
      { slug: 'progressive-disclosure', label: 'Progressive Disclosure', file: 'progressive-disclosure.html' },
      { slug: 'agentic-autonomy', label: 'Agentic Autonomy', file: 'agentic-autonomy.html' },
      { slug: 'test-time-scaling', label: 'Test-Time Scaling', file: 'test-time-scaling.html' },
    ],
    journey: {
      phases: [
        { id: 'orient', label: 'Orient', href: './index.html' },
        { id: 'understand', label: 'Understand', href: './lab.html#understand-hook' },
        { id: 'verify', label: 'Verify', href: './lab.html#verify-start' },
        { id: 'think', label: 'Think', href: './lab.html#think-start' },
      ],
      labSections: [
        { id: 'understand-hook', label: 'Hook', anchor: '#understand-hook' },
        { id: 'understand-problem', label: 'Problem', anchor: '#understand-problem' },
        { id: 'understand-insight', label: 'Insight', anchor: '#understand-insight' },
        { id: 'understand-method', label: 'Method', anchor: '#understand-method' },
        { id: 'understand-evidence', label: 'Evidence', anchor: '#understand-evidence' },
        { id: 'understand-vocab', label: 'Vocabulary', anchor: '#understand-vocab' },
        { id: 'paradigm', label: 'Paradigm', anchor: '#paradigm' },
        { id: 'granularity', label: 'Granularity', anchor: '#granularity' },
        { id: 'compare', label: 'Naive vs A-RAG', anchor: '#compare' },
        { id: 'topk', label: 'Top-k', anchor: '#topk' },
        { id: 'context', label: 'Disclosure', anchor: '#context' },
        { id: 'scaling', label: 'Scaling', anchor: '#scaling' },
        { id: 'evidence', label: 'Evidence lens', anchor: '#evidence' },
        { id: 'assumptions', label: 'Assumptions', anchor: '#assumptions' },
        { id: 'ideas', label: 'Ideas workshop', anchor: '#ideas' },
        { id: 'chat', label: 'Paper chat', anchor: '#chat' },
        { id: 'paper', label: 'Paper links', anchor: '#paper' },
      ],
      partGroups: [
        {
          id: 'understand',
          label: 'Part 1 — Understand',
          introAnchor: '#understand-hook',
          sections: [
            { id: 'understand-hook', label: 'Hook', anchor: '#understand-hook' },
            { id: 'understand-problem', label: 'Problem', anchor: '#understand-problem' },
            { id: 'understand-insight', label: 'Insight', anchor: '#understand-insight' },
            { id: 'understand-method', label: 'Method', anchor: '#understand-method' },
            { id: 'understand-evidence', label: 'Benchmarks', anchor: '#understand-evidence' },
            { id: 'understand-vocab', label: 'Vocabulary', anchor: '#understand-vocab' },
          ],
        },
        {
          id: 'verify',
          label: 'Part 2 — Verify',
          introAnchor: '#verify-start',
          sections: [
            { id: 'paradigm', label: 'Paradigm', anchor: '#paradigm' },
            { id: 'granularity', label: 'Granularity', anchor: '#granularity' },
            { id: 'compare', label: 'Naive vs A-RAG', anchor: '#compare' },
            { id: 'topk', label: 'Top-k', anchor: '#topk' },
            { id: 'context', label: 'Disclosure', anchor: '#context' },
            { id: 'scaling', label: 'Scaling', anchor: '#scaling' },
            { id: 'evidence', label: 'Evidence lens', anchor: '#evidence' },
          ],
        },
        {
          id: 'think',
          label: 'Part 3 — Think',
          introAnchor: '#think-start',
          sections: [
            { id: 'assumptions', label: 'Assumptions', anchor: '#assumptions' },
            { id: 'ideas', label: 'Ideas', anchor: '#ideas' },
            { id: 'chat', label: 'Chat', anchor: '#chat' },
            { id: 'paper', label: 'Links', anchor: '#paper' },
          ],
        },
      ],
      understandSectionIds: [
        'understand-hook', 'understand-problem', 'understand-insight',
        'understand-method', 'understand-evidence', 'understand-vocab',
      ],
      coreVerifyPlaygrounds: ['paradigm', 'granularity', 'compare'],
      readinessChecks: [
        {
          id: 'understand-complete',
          label: 'Completed Part 1 (Understand)',
          hint: 'Read all 6 sections in order',
        },
        {
          id: 'verify-lab',
          label: 'Used core verify labs',
          hint: 'Interact with paradigm, granularity, and compare',
        },
        {
          id: 'stress-assumptions',
          label: 'Explored assumption scenarios',
          hint: 'Break ≥3 assumptions in Assumption breaker',
          minCount: 3,
        },
        {
          id: 'ideas-saved',
          label: 'Saved improvement ideas',
          hint: 'Save ≥2 ideas in Ideas workshop',
          minCount: 2,
        },
        {
          id: 'chat-used',
          label: 'Discussed the paper in chat',
          hint: 'Send at least one message in Paper chat',
        },
      ],
      onboarding: {
        timeEstimate: '40–55 min',
      },
    },
  },
];

export function getPaper(id) {
  return papers.find(p => p.id === id);
}

export function getAllPapers() {
  return papers;
}
