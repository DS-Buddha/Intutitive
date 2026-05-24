/**
 * DCI interactive lab — all playground configs.
 */

import { labScenarios, labChunks } from './dci-scenarios.js';
import { corpusFiles, corpusPresets, terminalPlaygroundConfig } from './dci-corpus.js';
import journeyData from './journey-data.js';

export default {
  defaultLabState: {
    scenarioId: 'sku',
    topK: 3,
    resolution: 'line',
  },
  playgrounds: {
    'interface-compare': { scenarios: labScenarios, chunks: labChunks, syncBus: true },
    'topk-bottleneck': { scenarios: labScenarios, chunks: labChunks, syncBus: true },
    'resolution': { document: labChunks.find(c => c.id === 'c3') },
    'terminal-corpus': terminalPlaygroundConfig,
    'coverage-metrics': { scenarios: labScenarios, chunks: labChunks, syncBus: true },
    'paradigm-compare': {
      retrieverSteps: journeyData.paradigmSteps.retriever,
      dciSteps: journeyData.paradigmSteps.dci,
    },
    'context-level': { levels: journeyData.contextLevels },
    'evidence-lens': { benchmarks: journeyData.evidenceBenchmarks },
    'assumption-breaker': { assumptions: journeyData.assumptions },
    'ideas-workshop': { ideas: journeyData.improvementIdeas },
    'paper-chat': { paperId: 'dci-agent', starters: journeyData.chatStarters },
  },
  scenarios: labScenarios,
  chunks: labChunks,
  corpusFiles,
  corpusPresets,
  journey: journeyData,
};
