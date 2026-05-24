/**
 * DCI playground configs — shared by lab-data.js and concept deep-dive pages.
 */

import { labScenarios, labChunks, rankByScenario, dciMatches } from './dci-scenarios.js';
import { terminalPlaygroundConfig } from './dci-corpus.js';
import journeyData from './journey-data.js';

const PAPER_LABEL = 'DCI';

const compareLabels = {
  title: 'Retriever vs DCI — live comparison',
  agentName: 'Direct corpus (DCI)',
  agentMeta: 'grep + read · raw corpus',
  agentControlLabel: 'DCI resolution',
};

const paradigmLabels = {
  title: 'Two paradigms (Figure 2)',
  baselineName: 'Retriever-mediated',
  baselineMeta: 'Offline index · top-k API',
  agentName: 'Direct corpus interaction',
  agentMeta: 'Raw files · grep, read, pipe',
  highlightBaseline: 'Retriever only',
  highlightAgent: 'DCI only',
  insights: [
    'Both start with the same user question — the interface diverges immediately.',
    'Retriever compresses corpus access into one ranked API call. Agent cannot refine.',
    'DCI composes weak lexical clues — each step narrows the search space.',
    'Final step: retriever gives snippets; DCI gives verified line-level evidence.',
  ],
};

const resolutionLabels = {
  insights: [
    'Retriever often returns a whole chunk — agent sees ~512 tokens, much of it irrelevant.',
    'Passage-level: a retrieved snippet — better, but boundaries are fixed by chunking.',
    'Line-level: grep returns exact matching lines with line numbers — DCI default.',
    'Span-level: read surrounding context around match — precise citation for verification.',
  ],
};

const contextLabels = {
  title: 'Context management (L0–L4)',
  subtitle: 'Long agent trajectories fill context fast. Toggle levels — watch what the agent still remembers.',
};

export const dciPlaygrounds = {
  'interface-compare': {
    scenarios: labScenarios,
    chunks: labChunks,
    rankByScenario,
    agentMatches: dciMatches,
    syncBus: true,
    labels: compareLabels,
  },
  'topk-bottleneck': {
    scenarios: labScenarios,
    chunks: labChunks,
    rankByScenario,
  },
  resolution: {
    document: labChunks.find(c => c.id === 'c3'),
    chunks: labChunks,
    labels: resolutionLabels,
  },
  'terminal-corpus': terminalPlaygroundConfig,
  'coverage-metrics': {
    scenarios: labScenarios,
    chunks: labChunks,
    rankByScenario,
    dciMatches,
  },
  'paradigm-compare': {
    retrieverSteps: journeyData.paradigmSteps.retriever,
    agentSteps: journeyData.paradigmSteps.dci,
    labels: paradigmLabels,
  },
  'context-level': {
    levels: journeyData.contextLevels,
    labels: contextLabels,
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
    paperId: 'dci-agent',
  },
  'paper-chat': {
    paperId: 'dci-agent',
    starters: journeyData.chatStarters,
    paperLabel: PAPER_LABEL,
  },
};
