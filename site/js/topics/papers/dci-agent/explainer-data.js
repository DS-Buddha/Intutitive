/**
 * DCI paper — main explainer scene config.
 */

import { terminalPlaygroundConfig } from './dci-corpus.js';

export default {
  scenes: {
    defaultScene: 'topk-funnel',
    scenes: [
      {
        id: 'topk-funnel',
        duration: 8000,
        narration: [
          'The full corpus is available — every document, every line.',
          'The retriever scores and ranks everything…',
          'Only top-k chunks pass through to the agent.',
          'Evidence filtered out here is gone forever — no second chance.',
        ],
      },
      {
        id: 'interface-morph',
        duration: 10000,
        narration: [
          'Classic RAG: agent queries a retriever, gets a ranked list.',
          'The interface compresses the corpus into snippets.',
          'Direct Corpus Interaction: agent uses grep, read, shell on raw files.',
          'Semantic interpretation moves down to the agent — higher resolution access.',
        ],
      },
      {
        id: 'context-mgmt',
        duration: 9000,
        narration: [
          'Long DCI runs accumulate grep output and file reads.',
          'L1: truncate large tool results.',
          'L3: compact old turns when context grows.',
          'L4: summarize history while keeping recent evidence.',
        ],
      },
      {
        id: 'pareto-results',
        duration: 7000,
        narration: [
          'BrowseComp-Plus: retriever baseline at 69% accuracy, $1440 cost.',
          'DCI-Agent-CC: 80% accuracy — +11 points.',
          'Same backbone — lower cost, better accuracy. Interface change, not just a better model.',
        ],
      },
      {
        id: 'coverage-localization',
        duration: 8000,
        narration: [
          'Coverage: did the trajectory surface the gold document at all?',
          'Localization: how small and precise is the exposed snippet?',
          'DCI often wins on localization — finer verification, not just more recall.',
        ],
      },
    ],
  },
  playgrounds: {
    'terminal-corpus': terminalPlaygroundConfig,
  },
};
