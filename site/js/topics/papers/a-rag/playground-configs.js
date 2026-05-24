/**
 * A-RAG playground configs — shared by lab-data.js and concept deep-dive pages.
 */

import { labScenarios, labChunks, rankByScenario, aragMatches } from './a-rag-scenarios.js';
import journeyData from './journey-data.js';

const PAPER_LABEL = 'A-RAG';

const ARAG_TRAJECTORY = [
  { tool: 'semantic_search', output: 'films.txt: "Jaws was released on June 20, 1975…" (snippet)', chars: 120 },
  { tool: 'keyword_search', output: 'studios.txt: "Universal Pictures was founded in 1912 in Los Angeles…"', chars: 95 },
  { tool: 'chunk_read', output: 'Full studios.txt chunk — founding location California confirmed', chars: 980 },
  { tool: 'semantic_search', output: 'geo.txt: "Los Angeles is the largest city in California…" (snippet)', chars: 88 },
  { tool: 'chunk_read', output: 'Attempt re-read studios.txt → "This chunk has been read before" (0 tokens)', chars: 0 },
];

const compareLabels = {
  title: 'Naive RAG vs A-RAG — live comparison',
  baselineName: 'Naive RAG',
  baselineMeta: 'One-shot top-k · dump all chunks',
  agentName: 'A-RAG (Full)',
  agentMeta: 'keyword + semantic + chunk_read',
  agentControlLabel: 'Read granularity',
  agentSuccessVerdict: '✓ Multi-hop evidence chained — agent can answer',
  agentFailVerdict: '✗ Gold chunks not reached — try another tool sequence',
};

const paradigmLabels = {
  title: 'Naive RAG vs A-RAG (Figure 2)',
  baselineName: 'Naive RAG',
  baselineMeta: 'Single-shot retrieve · concatenate',
  agentName: 'A-RAG',
  agentMeta: 'Hierarchical tools · ReAct loop',
  highlightBaseline: 'Naive RAG only',
  highlightAgent: 'A-RAG only',
  insights: [
    'Same question — Naive RAG retrieves once; A-RAG plans a tool sequence.',
    'Naive RAG dumps top-k chunks. The model cannot search again if evidence is missing.',
    'A-RAG picks keyword_search, semantic_search, or chunk_read based on the question.',
    'Final step: Naive RAG answers from fixed context; A-RAG stops when evidence suffices.',
  ],
};

const resolutionLabels = {
  title: 'Hierarchical granularity',
  subtitle: 'Drag from whole document down to exact span — keyword → sentence → chunk in A-RAG.',
  levelNames: ['Document', 'Sentence snippet', 'Matched line', 'Exact span'],
  tickLabels: ['Chunk', 'Snippet', 'Line', 'Span'],
  insights: [
    'chunk_read loads ~1000 tokens — expensive if used on every candidate.',
    'semantic_search / keyword_search return sentence snippets — cheap previews.',
    'Agent reads matching lines first, then calls chunk_read only for promising IDs.',
    'Exact span — precise citation after chunk_read confirms the answer.',
  ],
};

const contextLabels = {
  title: 'Progressive disclosure (D0–D3)',
  subtitle: 'Compare dump-all retrieval vs snippet-first + chunk_read + context tracker.',
};

const scalingLabels = {
  title: 'Test-time scaling',
  subtitle: 'Paper §5.1 — accuracy improves with max steps and reasoning effort on MuSiQue-300.',
};

export const aragPlaygrounds = {
  'interface-compare': {
    scenarios: labScenarios,
    chunks: labChunks,
    rankByScenario,
    agentMatches: aragMatches,
    syncBus: true,
    labels: compareLabels,
    formatAgentCmd: (scenario) => scenario.agentCmd || `keyword_search("${scenario.dciPattern}")`,
  },
  'topk-bottleneck': {
    scenarios: labScenarios,
    chunks: labChunks,
    rankByScenario,
  },
  resolution: {
    document: labChunks.find(c => c.id === 'c2'),
    chunks: labChunks,
    labels: resolutionLabels,
  },
  'paradigm-compare': {
    retrieverSteps: journeyData.paradigmSteps.naive,
    agentSteps: journeyData.paradigmSteps.arag,
    labels: paradigmLabels,
  },
  'context-level': {
    levels: journeyData.disclosureLevels,
    trajectory: ARAG_TRAJECTORY,
    labels: contextLabels,
  },
  'test-time-scaling': {
    ...journeyData.testTimeScaling,
    labels: scalingLabels,
  },
  'evidence-lens': { benchmarks: journeyData.evidenceBenchmarks },
  'assumption-breaker': {
    assumptions: journeyData.assumptions,
    assumptionToSeed: journeyData.assumptionToSeed,
    paperLabel: PAPER_LABEL,
  },
  'ideas-workshop': {
    ideas: journeyData.improvementIdeas,
    paperLabel: PAPER_LABEL,
    paperId: 'a-rag',
  },
  'paper-chat': {
    paperId: 'a-rag',
    starters: journeyData.chatStarters,
    paperLabel: PAPER_LABEL,
  },
};
