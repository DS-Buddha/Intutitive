/**
 * AutoWebGLM playground configs — shared by lab-data.js.
 */

import { labScenarios, labChunks, rankByScenario, autowebglmMatches } from './autowebglm-scenarios.js';
import journeyData from './journey-data.js';

const PAPER_LABEL = 'AutoWebGLM';

const WEB_TRAJECTORY = [
  { tool: 'observe', output: 'Pruned shop.html — 12 operable nodes (cookie banner id=2 visible)', chars: 3800 },
  { tool: 'click(2)', output: 'Dismiss cookie notice — DOM updated', chars: 120 },
  { tool: 'type_string(12, "headphones")', output: 'Search input filled', chars: 95 },
  { tool: 'click(13)', output: 'Results page loaded — 24 product nodes', chars: 4100 },
  { tool: 'click(47)', output: 'Add to Cart — cart badge shows 1 item', chars: 88 },
  { tool: 'finish', output: 'Task complete — item in cart', chars: 40 },
];

const compareLabels = {
  title: 'GPT-4 + raw HTML vs AutoWebGLM',
  baselineName: 'GPT-4 + raw HTML',
  baselineMeta: 'MindAct-style top-k over full DOM',
  agentName: 'AutoWebGLM',
  agentMeta: 'HTML Pruner · unified action space',
  agentControlLabel: 'Observation detail',
  agentSuccessVerdict: '✓ Gold elements reachable — agent can complete task',
  agentFailVerdict: '✗ Target element pruned or ranked below top-k',
};

const paradigmLabels = {
  title: 'Prompt-only GPT-4 vs AutoWebGLM pipeline',
  baselineName: 'GPT-4 + raw HTML',
  baselineMeta: 'Multi-round element filtering',
  agentName: 'AutoWebGLM',
  agentMeta: 'Prune → observe → act loop',
  highlightBaseline: 'GPT-4 pipeline only',
  highlightAgent: 'AutoWebGLM only',
  insights: [
    'Same task — GPT-4 sees noisy 50K-token HTML; AutoWebGLM sees ~4K pruned nodes.',
    'GPT-4 needs many LLM rounds (MindAct) to rank elements — high latency.',
    'AutoWebGLM predicts one action per step from unified observation space.',
    'Final step: both execute in browser — but AutoWebGLM carries explicit action history.',
  ],
};

const resolutionLabels = {
  title: 'HTML observation zoom',
  subtitle: 'Drag from full page down to target element — raw HTML → pruned tree → operable node → click target.',
  levelNames: ['Full page HTML', 'Pruned subtree', 'Operable node', 'Action target'],
  tickLabels: ['Page', 'Pruned', 'Node', 'Target'],
  insights: [
    'Full page — scripts, ads, and footers dominate token budget.',
    'Pruned subtree — HTML Pruner keeps local context around candidates.',
    'Operable node — clickable/typeable elements tagged with ids.',
    'Action target — click(47) or type_string(12, …) on the exact element.',
  ],
};

const contextLabels = {
  title: 'Observation space (O0–O3)',
  subtitle: 'Compare raw HTML dump vs simplified HTML + position + action history.',
};

const curriculumLabels = {
  title: 'Training curriculum',
  subtitle: 'Paper Table 6 — Mind2Web SSR improves with staged data and DPO; RFT boosts simulators.',
  stepsLabel: 'Training stage',
  reasoningLabel: 'RFT environment',
};

export const autowebglmPlaygrounds = {
  'interface-compare': {
    scenarios: labScenarios,
    chunks: labChunks,
    rankByScenario,
    agentMatches: autowebglmMatches,
    syncBus: true,
    labels: compareLabels,
    formatAgentCmd: (scenario) => scenario.agentCmd || `click pruned node matching "${scenario.dciPattern}"`,
  },
  'topk-bottleneck': {
    scenarios: labScenarios,
    chunks: labChunks,
    rankByScenario,
  },
  resolution: {
    document: labChunks.find(c => c.id === 'e3'),
    chunks: labChunks,
    labels: resolutionLabels,
  },
  'paradigm-compare': {
    retrieverSteps: journeyData.paradigmSteps.gpt4,
    agentSteps: journeyData.paradigmSteps.autowebglm,
    labels: paradigmLabels,
  },
  'context-level': {
    levels: journeyData.observationLevels,
    trajectory: WEB_TRAJECTORY,
    labels: contextLabels,
  },
  'test-time-scaling': {
    ...journeyData.trainingCurriculum,
    labels: curriculumLabels,
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
    paperId: 'autowebglm',
  },
  'paper-chat': {
    paperId: 'autowebglm',
    starters: journeyData.chatStarters,
    paperLabel: PAPER_LABEL,
  },
};
