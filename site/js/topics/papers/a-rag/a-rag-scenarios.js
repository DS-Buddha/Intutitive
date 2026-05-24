/**
 * A-RAG lab scenarios — multi-hop QA with hierarchical retrieval patterns.
 */

export const labChunks = [
  { id: 'c1', label: 'Director bio', text: 'Steven Spielberg directed Jaws in 1975, launching the blockbuster era.', file: 'films.txt', line: 1, scoreSemantic: 0.72, scoreKeyword: 0.15, isGold: { director: true } },
  { id: 'c2', label: 'Jaws release', text: 'Jaws was released on June 20, 1975 by Universal Pictures.', file: 'films.txt', line: 2, scoreSemantic: 0.88, scoreKeyword: 0.92, isGold: { release: true } },
  { id: 'c3', label: 'Universal history', text: 'Universal Pictures was founded in 1912 in Los Angeles, California.', file: 'studios.txt', line: 1, scoreSemantic: 0.65, scoreKeyword: 0.45, isGold: { studio: true } },
  { id: 'c4', label: 'LA geography', text: 'Los Angeles is the largest city in California by population.', file: 'geo.txt', line: 1, scoreSemantic: 0.55, scoreKeyword: 0.30 },
  { id: 'c5', label: 'Blockbuster era', text: 'The summer blockbuster tradition began after Jaws broke box office records.', file: 'films.txt', line: 3, scoreSemantic: 0.78, scoreKeyword: 0.40 },
  { id: 'c6', label: 'California state', text: 'California became the 31st U.S. state on September 9, 1850.', file: 'geo.txt', line: 2, scoreSemantic: 0.42, scoreKeyword: 0.25 },
  { id: 'c7', label: 'Spielberg awards', text: 'Steven Spielberg won Academy Awards for Schindler\'s List and Saving Private Ryan.', file: 'films.txt', line: 4, scoreSemantic: 0.70, scoreKeyword: 0.35 },
  { id: 'c8', label: 'Noise chunk', text: 'Q3 streaming revenue grew 18% year-over-year across major platforms.', file: 'earnings.txt', line: 1, scoreSemantic: 0.35, scoreKeyword: 0.10 },
];

export const labScenarios = [
  {
    id: 'release',
    label: 'Exact entity lookup',
    question: 'When was Jaws released?',
    scoreKey: 'scoreKeyword',
    goldIds: ['c2'],
    dciPattern: 'Jaws',
    dciPipe: '1975',
    insight: 'keyword_search finds "Jaws" instantly. Naive RAG may rank Spielberg bio higher by semantic similarity.',
  },
  {
    id: 'multihop',
    label: 'Two-hop bridge',
    question: 'In what state was the studio that distributed Jaws founded?',
    scoreKey: 'scoreSemantic',
    goldIds: ['c2', 'c3'],
    dciPattern: 'Universal',
    dciPipe: 'California',
    agentCmd: 'semantic_search("Jaws distributor") → keyword_search("Universal") → chunk_read',
    insight: 'A-RAG chains: semantic_search "Jaws distributor" → keyword_search "Universal" → chunk_read studio founding.',
  },
  {
    id: 'director',
    label: 'Semantic paraphrase',
    question: 'Who created the film that started the blockbuster era?',
    scoreKey: 'scoreSemantic',
    goldIds: ['c1', 'c5'],
    dciPattern: 'Spielberg',
    dciPipe: 'blockbuster',
    insight: 'Query paraphrases "Jaws" — semantic_search bridges to Spielberg; keyword alone may miss.',
  },
];

export function rankByScenario(scenarioId, chunks = labChunks) {
  const scenario = labScenarios.find(s => s.id === scenarioId) || labScenarios[0];
  return [...chunks]
    .map(c => ({ ...c, score: c[scenario.scoreKey] || 0 }))
    .sort((a, b) => b.score - a.score);
}

/** Simulates A-RAG multi-tool hits (keyword + semantic pipeline). */
export function aragMatches(scenarioId, chunks = labChunks) {
  const scenario = labScenarios.find(s => s.id === scenarioId) || labScenarios[0];
  const patterns = [scenario.dciPattern, scenario.dciPipe].filter(Boolean);
  const keywordHits = chunks.filter(c => {
    const t = c.text.toLowerCase();
    return patterns.some(p => t.includes(p.toLowerCase()));
  });
  const semanticHits = rankByScenario(scenarioId, chunks)
    .filter(c => scenario.goldIds.includes(c.id) || c.score > 0.6)
    .slice(0, 4);
  const ids = new Set([...keywordHits, ...semanticHits].map(c => c.id));
  return chunks.filter(c => ids.has(c.id));
}
