/**
 * Baseline RAG — Data & Configuration
 * The simplest RAG pipeline: chunk → embed → retrieve → generate
 */

export default {
  // Visualization: 4-step stepper pipeline
  steps: [
    {
      id: 'chunk',
      label: 'Chunking',
      color: 'var(--stage-ingest)',
      description: 'Split documents into manageable pieces',
      failureDescription: 'Without chunking, you embed entire documents. Huge vectors, slow retrieval, lost detail.',
    },
    {
      id: 'embed',
      label: 'Embedding',
      color: 'var(--stage-index)',
      description: 'Convert text to numerical vectors',
      failureDescription: 'Without embeddings, you can\'t measure semantic similarity. No way to find relevant chunks.',
    },
    {
      id: 'retrieve',
      label: 'Retrieval',
      color: 'var(--stage-retrieve)',
      description: 'Find the top-k most relevant chunks',
      failureDescription: 'Without retrieval, LLM has no source material. It guesses, hallucinates, makes up citations.',
    },
    {
      id: 'generate',
      label: 'Generation',
      color: 'var(--stage-generate)',
      description: 'LLM answers based on retrieved chunks',
      failureDescription: 'Without grounding, answers lack citations and authority. User doesn\'t know what\'s real.',
    },
  ],

  // Failure chain for #why-it-matters section
  failureChain: [
    { label: 'Bad chunking', color: 'var(--color-accent-danger)' },
    { label: 'Weak embeddings', color: 'var(--color-accent-danger)' },
    { label: 'Poor retrieval', color: 'var(--color-accent-danger)' },
    { label: 'Hallucination', color: 'var(--color-accent-danger)' },
  ],

  // Quiz questions (2–4, each with 4 options, correct index, and explanation)
  quiz: [
    {
      question: 'What is the primary purpose of chunking in RAG?',
      options: [
        'To compress documents for storage',
        'To split documents into pieces that can be individually embedded and retrieved',
        'To remove duplicate content',
        'To encrypt sensitive information',
      ],
      correct: 1,
      explanation:
        'Chunking breaks documents into manageable pieces so each chunk can be embedded as a vector and retrieved independently. This enables semantic search over document content.',
    },
    {
      question: 'Why do we need embeddings in RAG?',
      options: [
        'To encrypt text for security',
        'To reduce file size',
        'To represent text as numerical vectors so we can measure semantic similarity',
        'To improve grammar and spelling',
      ],
      correct: 2,
      explanation:
        'Embeddings convert text into numerical vectors in a high-dimensional space. Semantically similar chunks have vectors that are close together, allowing us to find relevant content via similarity search.',
    },
    {
      question: 'What happens if retrieval fails to find relevant chunks?',
      options: [
        'The system silently returns no results',
        'The LLM has no source material and is forced to generate answers from its training data, leading to hallucinations',
        'The system automatically expands the search scope',
        'The embedding model retrains itself',
      ],
      correct: 1,
      explanation:
        'If retrieval returns irrelevant or empty results, the LLM has no grounded context. It falls back to its training data and generates plausible-sounding but potentially false answers. This is hallucination.',
    },
    {
      question: 'In the baseline RAG pipeline, what is the relationship between embedding quality and retrieval quality?',
      options: [
        'Embedding quality is unrelated to retrieval',
        'Better embeddings (more semantically meaningful vectors) lead to better retrieval because relevant chunks cluster closer',
        'Retrieval quality depends only on the corpus size',
        'Embedding quality only matters for compression',
      ],
      correct: 1,
      explanation:
        'The entire baseline RAG pipeline depends on embeddings. Better embeddings mean semantically similar chunks have similar vectors. This makes similarity-based retrieval more accurate. Poor embeddings = irrelevant results.',
    },
  ],

  // Comparison data (if the tradeoffs section uses before/after slider)
  comparison: {
    before: {
      title: 'This technique',
      description: 'Without RAG: LLM generates from training data only',
    },
    after: {
      title: 'This technique',
      description: 'With baseline RAG: LLM grounds answers in your documents',
    },
  },
};
