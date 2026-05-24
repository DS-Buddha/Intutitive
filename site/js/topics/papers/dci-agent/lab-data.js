/**
 * DCI interactive lab — all playground configs.
 */

import { labScenarios, labChunks } from './dci-scenarios.js';
import { corpusFiles, corpusPresets } from './dci-corpus.js';
import journeyData from './journey-data.js';
import { dciPlaygrounds } from './playground-configs.js';

export default {
  defaultLabState: {
    scenarioId: 'sku',
    topK: 3,
    resolution: 'line',
  },
  playgrounds: {
    ...dciPlaygrounds,
    'interface-compare': { ...dciPlaygrounds['interface-compare'], syncBus: true },
    'topk-bottleneck': { ...dciPlaygrounds['topk-bottleneck'], syncBus: true },
    'coverage-metrics': { ...dciPlaygrounds['coverage-metrics'], syncBus: true },
  },
  scenarios: labScenarios,
  chunks: labChunks,
  corpusFiles,
  corpusPresets,
  journey: journeyData,
};
