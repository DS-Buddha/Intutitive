/**
 * Shared DCI lab scenarios — queries, gold evidence, chunk corpus.
 */

export const labChunks = [
  { id: 'c1', label: 'Contract header', text: 'Master Services Agreement with Acme Corp signed 2022-03-15.', file: 'contracts.txt', line: 1, scoreSku: 0.12, scoreWarranty: 0.18, scoreError: 0.05 },
  { id: 'c2', label: 'Renewal clause', text: 'Renewal window opens Q2 2024 per section 8.2.', file: 'contracts.txt', line: 2, scoreSku: 0.08, scoreWarranty: 0.22, scoreError: 0.04 },
  { id: 'c3', label: 'SKU warranty', text: 'SKU-8842 valve warranty: 24 months standard coverage.', file: 'contracts.txt', line: 3, scoreSku: 0.95, scoreWarranty: 0.88, scoreError: 0.06, isGold: { sku: true, warranty: true } },
  { id: 'c4', label: 'Liability cap', text: 'General liability cap $2M unless breach register applies.', file: 'contracts.txt', line: 4, scoreSku: 0.05, scoreWarranty: 0.10, scoreError: 0.03 },
  { id: 'c5', label: 'Breach register', text: 'Acme Corp,2024-06-01,material_breach', file: 'breach_register.csv', line: 2, scoreSku: 0.04, scoreWarranty: 0.06, scoreError: 0.05, isGold: { breach: true } },
  { id: 'c6', label: 'FAQ extension', text: 'Customers may purchase warranty extension for eligible valves within 90 days.', file: 'support_faq.md', line: 1, scoreSku: 0.15, scoreWarranty: 0.72, scoreError: 0.08 },
  { id: 'c7', label: 'Error code', text: 'ERROR-4429 indicates firmware mismatch on industrial controllers.', file: 'support_faq.md', line: 2, scoreSku: 0.03, scoreWarranty: 0.05, scoreError: 0.98, isGold: { error: true } },
  { id: 'c8', label: 'Earnings (noise)', text: 'Q3 revenue reached $4.8 billion. Cloud grew 28%.', file: 'earnings_q3.txt', line: 1, scoreSku: 0.20, scoreWarranty: 0.25, scoreError: 0.10 },
  { id: 'c9', label: 'Hardware decline', text: 'Legacy hardware declined 3% year-over-year.', file: 'earnings_q3.txt', line: 2, scoreSku: 0.11, scoreWarranty: 0.14, scoreError: 0.07 },
  { id: 'c10', label: 'Unrelated SKU', text: 'SKU-9910,2024-01-05,no_warranty_program', file: 'breach_register.csv', line: 4, scoreSku: 0.35, scoreWarranty: 0.40, scoreError: 0.12 },
];

export const labScenarios = [
  {
    id: 'sku',
    label: 'Exact SKU lookup',
    question: 'What is the warranty period for SKU-8842?',
    scoreKey: 'scoreSku',
    goldIds: ['c3'],
    dciPattern: 'SKU-8842',
    dciPipe: null,
    insight: 'Exact product codes need lexical match — dense retriever may rank paraphrases above the SKU line.',
  },
  {
    id: 'warranty',
    label: 'Piped clue conjunction',
    question: 'Find warranty extension policy for valves.',
    scoreKey: 'scoreWarranty',
    goldIds: ['c3', 'c6'],
    dciPattern: 'warranty',
    dciPipe: 'valve',
    insight: 'DCI pipes weak clues: grep warranty | grep valve. Retriever returns one semantic blob.',
  },
  {
    id: 'error',
    label: 'Error code precision',
    question: 'What does ERROR-4429 mean?',
    scoreKey: 'scoreError',
    goldIds: ['c7'],
    dciPattern: 'ERROR-4429',
    dciPipe: null,
    insight: 'Rare error codes are brittle for embedding similarity — grep finds them instantly.',
  },
  {
    id: 'breach',
    label: 'Multi-hop entity',
    question: 'Is Acme Corp flagged in the breach register?',
    scoreKey: 'scoreSku',
    goldIds: ['c5'],
    dciPattern: 'Acme',
    dciPipe: 'breach',
    insight: 'Agentic search combines entity + register lookup — hard as a single top-k call.',
  },
];

export function rankByScenario(scenarioId, chunks = labChunks) {
  const scenario = labScenarios.find(s => s.id === scenarioId) || labScenarios[0];
  return [...chunks]
    .map(c => ({ ...c, score: c[scenario.scoreKey] || 0 }))
    .sort((a, b) => b.score - a.score);
}

export function dciMatches(scenarioId, chunks = labChunks) {
  const scenario = labScenarios.find(s => s.id === scenarioId) || labScenarios[0];
  const patterns = [scenario.dciPattern, scenario.dciPipe].filter(Boolean);
  return chunks.filter(c => {
    const t = c.text.toLowerCase();
    return patterns.every(p => t.includes(p.toLowerCase()));
  });
}
