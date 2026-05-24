/** GraphRAG — entity graph community retrieval */

export default {
  playgrounds: {
    graphrag: {
      defaultQuery: 'What connects cloud and enterprise customers?',
      entities: [
        { id: 'cloud', label: 'Cloud Services' },
        { id: 'k8s', label: 'Kubernetes' },
        { id: 'enterprise', label: 'Enterprise' },
        { id: 'revenue', label: 'Q3 Revenue' },
        { id: 'hardware', label: 'Hardware' },
        { id: 'migration', label: 'Migration' },
      ],
      edges: [
        { from: 'cloud', to: 'k8s' },
        { from: 'k8s', to: 'enterprise' },
        { from: 'enterprise', to: 'revenue' },
        { from: 'hardware', to: 'migration' },
        { from: 'migration', to: 'cloud' },
      ],
      communities: [
        { name: 'Cloud growth cluster', entityIds: ['cloud', 'k8s', 'enterprise', 'revenue'], keywords: ['cloud', 'enterprise', 'kubernetes', 'growth'], summary: 'Enterprise customers expanded managed Kubernetes usage, driving 28% cloud revenue growth in Q3.' },
        { name: 'Hardware decline cluster', entityIds: ['hardware', 'migration', 'cloud'], keywords: ['hardware', 'decline', 'migration'], summary: 'Legacy hardware revenue fell 3% as customers migrated workloads to cloud-hosted solutions.' },
      ],
    },
  },
};
