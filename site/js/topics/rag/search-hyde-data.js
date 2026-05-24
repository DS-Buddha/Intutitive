/** HyDE — hypothetical document expansion */

export default {
  playgrounds: {
    hyde: {
      defaultQuery: 'How do community summaries work?',
      hypotheticalTemplate: 'Community summaries in GraphRAG aggregate entities and relationships at multiple scales to answer global thematic questions over a document corpus. {query}',
      corpus: [
        { label: 'GraphRAG overview', text: 'Community detection clusters entities; each community gets an abstractive summary for global retrieval.' },
        { label: 'RAPTOR note', text: 'RAPTOR builds hierarchical summary trees over chunks for multi-scale retrieval.' },
        { label: 'Chunking guide', text: 'Fixed-size chunking splits documents into 512-token windows with 20% overlap.' },
        { label: 'BM25 tuning', text: 'BM25 k1 and b parameters control term frequency saturation and document length normalization.' },
      ],
    },
  },
};
