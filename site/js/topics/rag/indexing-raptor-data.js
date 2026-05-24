/** RAPTOR — hierarchical summary tree */

export default {
  playgrounds: {
    raptor: {
      defaultQuery: 'cloud revenue growth',
      tree: {
        id: 'root', label: 'Annual Report 2024',
        summary: 'Company-wide financial and strategic overview for fiscal 2024.',
        children: [
          {
            id: 'q3', label: 'Q3 Results',
            summary: 'Third quarter revenue $4.8B; cloud up 28%, hardware down 3%.',
            children: [
              { id: 'cloud', label: 'Cloud segment', text: 'Cloud services revenue increased 28% in Q3 driven by enterprise Kubernetes adoption.' },
              { id: 'hw', label: 'Hardware segment', text: 'Legacy hardware declined 3% year-over-year as customers migrated to cloud.' },
            ],
          },
          {
            id: 'ml', label: 'ML Platform',
            summary: 'New embedding model deployed; retrieval latency improved 40%.',
            children: [
              { id: 'embed', label: 'Embedding rollout', text: '384-dimensional vectors stored in approximate nearest-neighbor index.' },
            ],
          },
        ],
      },
    },
  },
};
