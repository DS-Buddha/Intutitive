/** Search & Retrieval — hybrid BM25 + dense */

export default {
  playgrounds: {
    'hybrid-search': {
      defaultQuery: 'SKU-8842 warranty extension',
      insight: 'Exact SKU matches BM25; "warranty extension" paraphrases rank in dense. Hybrid RRF keeps both in top results.',
      corpus: [
        { label: 'Product catalog', text: 'SKU-8842 industrial valve — 24-month manufacturer warranty included.' },
        { label: 'Support FAQ', text: 'Customers may purchase a warranty extension for eligible valves within 90 days of delivery.' },
        { label: 'Returns policy', text: 'Defective units under warranty are replaced within 5 business days of RMA approval.' },
        { label: 'Unrelated SKU', text: 'SKU-9910 pump assembly — no extended warranty program available.' },
        { label: 'Legal boilerplate', text: 'All warranties exclude damage from improper installation per section 8.2.' },
      ],
    },
  },
};
