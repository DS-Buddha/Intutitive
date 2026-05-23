/**
 * Topic Registry
 * Single source of truth for all topics and their concepts.
 * Add new topics by appending an entry to the topics array.
 */

export const topics = [
  {
    id: 'rag',
    title: 'Retrieval-Augmented Generation',
    description: 'How to ground LLMs in documents so they answer from sources instead of guessing.',
    icon: 'search-doc',
    hubPath: './topics/rag/index.html',
    conceptCount: 11,
    readingOrder: [
      { slug: 'baseline', label: 'Baseline RAG', path: './topics/rag/baseline.html' },
      { slug: 'ingestion', label: 'Document Ingestion', path: './topics/rag/ingestion.html' },
      { slug: 'ingestion-parsing', label: 'Layout-Aware Parsing', path: './topics/rag/ingestion-parsing.html' },
      { slug: 'ingestion-pins', label: 'Evidence Pins', path: './topics/rag/ingestion-evidence-pins.html' },
      { slug: 'search-retrieval', label: 'Search & Retrieval', path: './topics/rag/search-retrieval.html' },
      { slug: 'search-colbert', label: 'ColBERT / Late Interaction', path: './topics/rag/search-colbert.html' },
      { slug: 'search-hyde', label: 'HyDE', path: './topics/rag/search-hyde.html' },
      { slug: 'indexing-raptor', label: 'RAPTOR Trees', path: './topics/rag/indexing-raptor.html' },
      { slug: 'indexing-pageindex', label: 'PageIndex (TOC Navigation)', path: './topics/rag/indexing-pageindex.html' },
      { slug: 'graph-graphrag', label: 'GraphRAG', path: './topics/rag/graph-graphrag.html' },
      { slug: 'verification-agentic', label: 'Agentic RAG', path: './topics/rag/verification-agentic.html' },
    ],
  },
];

/**
 * Get a topic by ID.
 */
export function getTopic(id) {
  return topics.find(t => t.id === id);
}

/**
 * Get all topics.
 */
export function getAllTopics() {
  return topics;
}

/**
 * Get a concept from a topic.
 */
export function getConcept(topicId, slug) {
  const topic = getTopic(topicId);
  if (!topic) return null;
  return topic.readingOrder.find(c => c.slug === slug);
}
