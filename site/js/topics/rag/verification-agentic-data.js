/** Agentic RAG — planner retriever reflection loop */

export default {
  playgrounds: {
    'agentic-loop': {
      steps: [
        { phase: 'Planner', icon: '📋', description: 'User asks a multi-hop question. Agent decomposes into sub-tasks.', output: 'Sub-task 1: Find contracts with Acme Corp. Sub-task 2: Check breach register overlap.', decision: 'Route sub-task 1 to vector index first.' },
        { phase: 'Retriever', icon: '🔍', description: 'Execute retrieval for first sub-task.', output: 'Retrieved 3 contract chunks mentioning Acme Corp.', evidenceAdd: [{ source: 'Contract index', text: 'Master Services Agreement with Acme Corp signed 2022-03-15.' }] },
        { phase: 'Reflection', icon: '🪞', description: 'Critique: do retrieved chunks support the next sub-task?', output: 'IsREL=Yes, IsSUP=Partial — breach register not yet queried.', decision: 'Confidence 0.62 < 0.75 → re-query with reformulated search.' },
        { phase: 'Re-retrieve', icon: '🔄', description: 'Switch tool to SQL breach register; merge with contract evidence.', output: 'Acme appears in breach register Q2 2024 — renewal clause conflict found.', evidenceAdd: [{ source: 'Breach register DB', text: 'Acme Corp — material breach flagged 2024-06-01, renewal window overlaps.' }] },
        { phase: 'Generator', icon: '✍️', description: 'Synthesize final answer with citations from both tools.', output: 'Acme MSA (2022) has active renewal overlap with Q2 breach flag — review §8 termination.', decision: 'Confidence 0.91 — return answer with tool trace.' },
      ],
    },
  },
};
