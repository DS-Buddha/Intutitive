/**
 * A-RAG interactive lab — all playground configs.
 */

import { labScenarios, labChunks } from './a-rag-scenarios.js';
import journeyData from './journey-data.js';
import { aragPlaygrounds } from './playground-configs.js';

export default {
  defaultLabState: {
    scenarioId: 'multihop',
    topK: 3,
    resolution: 'line',
  },
  playgrounds: {
    ...aragPlaygrounds,
    'interface-compare': { ...aragPlaygrounds['interface-compare'], syncBus: true },
    'topk-bottleneck': { ...aragPlaygrounds['topk-bottleneck'], syncBus: true },
  },
  scenarios: labScenarios,
  chunks: labChunks,
  journey: journeyData,
};
