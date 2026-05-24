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
        { id: 'understand-checkpoint', label: 'Checkpoint', anchor: '#understand-checkpoint' },
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
      readinessChecks: [
        { id: 'understand-complete', label: 'Completed Part 1 (Understand)', storageKey: 'dci-understand-complete' },
        { id: 'verify-lab', label: 'Used verify playgrounds (compare, top-k, terminal)', storageKey: 'dci-ready-verify' },
        { id: 'stress-assumptions', label: 'Explored ≥3 assumption-breaker scenarios', storageKey: 'dci-ready-stress', minCount: 3 },
        { id: 'ideas-saved', label: 'Saved ≥2 improvement ideas', storageKey: 'dci-ready-ideas', minCount: 2 },
        { id: 'chat-used', label: 'Discussed the paper in chat', storageKey: 'dci-ready-chat' },
      ],
    },
  },
];

export function getPaper(id) {
  return papers.find(p => p.id === id);
}

export function getAllPapers() {
  return papers;
}
