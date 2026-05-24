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

  playgrounds: {
    chunking: {
      defaultMode: 'recursive',
      defaultChunkSize: 280,
      defaultOverlap: 20,
      sampleText: `Q3 2024 Earnings Summary

Our third-quarter revenue reached $4.8 billion, up 12% year-over-year. Cloud services drove most of the growth, while legacy hardware declined slightly.

Machine Learning Platform Update

We deployed a new embedding model for document retrieval. The model converts text chunks into 384-dimensional vectors. Retrieval latency improved by 40% after switching to approximate nearest-neighbor search.

Employee Handbook — Remote Work

All employees may work remotely up to three days per week. Office attendance is required for quarterly planning sessions and team onboarding.`,
    },
    retrieval: {
      defaultQuery: 'What was Q3 revenue?',
      defaultTopK: 3,
      corpus: [
        {
          label: 'Q3 earnings',
          text: 'Our third-quarter revenue reached $4.8 billion, up 12% year-over-year. Cloud services drove most of the growth.',
        },
        {
          label: 'ML platform',
          text: 'We deployed a new embedding model for document retrieval. Text chunks become 384-dimensional vectors stored in a vector database.',
        },
        {
          label: 'Remote work policy',
          text: 'Employees may work remotely up to three days per week. Office attendance is required for quarterly planning sessions.',
        },
        {
          label: 'Cloud growth',
          text: 'Cloud services revenue increased 28% in Q3. Enterprise customers expanded their usage of managed Kubernetes.',
        },
        {
          label: 'Retrieval latency',
          text: 'Approximate nearest-neighbor search reduced retrieval latency by 40%. Top-5 chunks are passed to the LLM as context.',
        },
        {
          label: 'Hardware decline',
          text: 'Legacy hardware revenue declined 3% year-over-year as customers migrated to cloud-hosted solutions.',
        },
      ],
    },
    embedding: {
      defaultText: 'Our third-quarter revenue reached $4.8 billion, up 12% year-over-year.',
    },
    pipeline: {
      defaultQuery: 'What was Q3 revenue?',
      defaultTopK: 3,
      defaultChunkSize: 280,
      defaultOverlap: 20,
      defaultMode: 'recursive',
      sampleText: `Q3 2024 Earnings Summary

Our third-quarter revenue reached $4.8 billion, up 12% year-over-year. Cloud services drove most of the growth, while legacy hardware declined slightly.

Machine Learning Platform Update

We deployed a new embedding model for document retrieval. The model converts text chunks into 384-dimensional vectors.`,
    },
  },
};
