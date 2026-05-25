/**
 * AutoWebGLM interactive lab — all playground configs.
 */

import { labScenarios, labChunks } from './autowebglm-scenarios.js';
import journeyData from './journey-data.js';
import { autowebglmPlaygrounds } from './playground-configs.js';

export default {
  defaultLabState: {
    scenarioId: 'checkout',
    topK: 3,
    resolution: 'line',
  },
  playgrounds: {
    ...autowebglmPlaygrounds,
    'interface-compare': { ...autowebglmPlaygrounds['interface-compare'], syncBus: true },
    'topk-bottleneck': { ...autowebglmPlaygrounds['topk-bottleneck'], syncBus: true },
  },
  scenarios: labScenarios,
  chunks: labChunks,
  journey: journeyData,
};
