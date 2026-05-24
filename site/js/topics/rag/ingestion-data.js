/** Document Ingestion hub — failure chain playground */

export default {
  playgrounds: {
    'ingestion-failure': {
      successAnswer: 'Answer cites Q3 revenue ($4.8B) from the earnings section with correct reading order.',
      failureAnswer: 'LLM cites a scrambled fragment mixing column text — unverifiable and likely wrong.',
      steps: [
        { id: 'parse', label: 'Layout-aware parsing', okDesc: 'Reading order preserved; headings stay with paragraphs.', failDesc: 'Columns mixed; table cells jumbled into narrative text.' },
        { id: 'chunk', label: 'Structure-aware chunking', okDesc: 'Chunks respect section boundaries and metadata.', failDesc: 'Fixed-size splits cut mid-sentence across unrelated blocks.' },
        { id: 'embed', label: 'Embedding', okDesc: 'Vectors represent coherent semantic units.', failDesc: 'Embeddings encode noise — headers, footers, broken OCR.' },
        { id: 'retrieve', label: 'Retrieval', okDesc: 'Top-k hits the earnings paragraph for revenue questions.', failDesc: 'Wrong chunk ranks first — similar words from wrong section.' },
        { id: 'generate', label: 'Generation', okDesc: 'Grounded answer with traceable source.', failDesc: 'Confident hallucination — no valid citation path.' },
      ],
    },
  },
};
