/**
 * DCI playground configs — shared by lab-data.js and concept deep-dive pages.
 */

import { labScenarios, labChunks, rankByScenario, dciMatches } from './dci-scenarios.js';
import { terminalPlaygroundConfig } from './dci-corpus.js';
import journeyData from './journey-data.js';

const PAPER_LABEL = 'DCI';

export const dciPlaygrounds = {
  'interface-compare': {
    scenarios: labScenarios,
    chunks: labChunks,
    rankByScenario,
    dciMatches,
    syncBus: true,
  },
  'topk-bottleneck': {
    scenarios: labScenarios,
    chunks: labChunks,
    rankByScenario,
  },
  resolution: {
    document: labChunks.find(c => c.id === 'c3'),
    chunks: labChunks,
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
    dciSteps: journeyData.paradigmSteps.dci,
  },
  'context-level': { levels: journeyData.contextLevels },
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
