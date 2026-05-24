import { aragPlaygrounds } from '../playground-configs.js';

export default {
  playgrounds: {
    'test-time-scaling': {
      ...aragPlaygrounds['test-time-scaling'],
      reasoningCurve: [],
    },
  },
};
