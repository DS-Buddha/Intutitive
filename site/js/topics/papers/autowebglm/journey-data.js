/**
 * AutoWebGLM Paper Journey — assumptions, benchmarks, extension prompts.
 */

export const observationLevels = [
  {
    id: 'O0',
    label: 'O0 — Raw HTML dump',
    truncation: false,
    compaction: false,
    summarization: false,
    maxChars: null,
    note: 'Full page HTML (~50K+ tokens). GPT-4 prompt agents drown in noise — operable elements buried in scripts and ads.',
  },
  {
    id: 'O1',
    label: 'O1 — Simplified HTML',
    truncation: true,
    compaction: false,
    summarization: false,
    maxChars: 4000,
    note: 'HTML Pruner keeps ancestors, descendants, and siblings of operable nodes — vital structure only.',
  },
  {
    id: 'O2',
    label: 'O2 — + Position',
    truncation: true,
    compaction: true,
    summarization: false,
    maxChars: 4000,
    note: 'Scroll offset + page height — agent knows what is visible vs below the fold.',
  },
  {
    id: 'O3',
    label: 'O3 — + Action history',
    truncation: true,
    compaction: true,
    summarization: false,
    maxChars: 4000,
    note: 'Full observation space: task + simplified HTML + location + past actions — breaks ineffective loops.',
  },
];

export const evidenceBenchmarks = [
  {
    id: 'autowebbench-en',
    label: 'AutoWebBench English (SSR)',
    paperSection: 'Table 2',
    baselines: [
      { name: 'GPT-4', accuracy: 38.6, cost: 0 },
      { name: 'AutoWebGLM 6B', accuracy: 64.8, cost: 0 },
    ],
    insight: '+26.2 pts cross-task SSR — 6B open model beats GPT-4 on bilingual real-site traces.',
  },
  {
    id: 'mind2web',
    label: 'Mind2Web average SSR',
    paperSection: 'Table 3',
    baselines: [
      { name: 'GPT-4†', accuracy: 30.9, cost: 0 },
      { name: 'AutoWebGLM 6B', accuracy: 59.5, cost: 0 },
    ],
    insight: '+28.6 pts vs GPT-4 — curriculum + HTML simplify closes gap to Html-T5-XL (66.9) at 80× smaller scale.',
  },
  {
    id: 'webarena',
    label: 'WebArena task success',
    paperSection: 'Table 4',
    baselines: [
      { name: 'GPT-4', accuracy: 14.4, cost: 0 },
      { name: 'AutoWebGLM 6B', accuracy: 18.2, cost: 0 },
    ],
    insight: 'Beats GPT-4 on live sandbox sites — but 18.2% shows real-world autonomy is still far from solved.',
  },
];

export const assumptions = [
  {
    id: 'static-dom',
    label: 'DOM is parseable and text-rich',
    defaultOn: true,
    description: 'HTML Pruner and operable-element tagging assume standard DOM trees.',
    breakScenario: {
      title: 'Canvas game or CAPTCHA-only gate',
      dciOutcome: 'struggle',
      retrieverOutcome: 'win',
      verdict: 'When the actionable UI is pixels-only, simplified HTML is empty — vision grounding or human handoff wins.',
    },
  },
  {
    id: 'simplified-html',
    label: 'Pruner keeps the gold element',
    defaultOn: true,
    description: 'Target button/link survives depth/sibling limits in Algorithm 1.',
    breakScenario: {
      title: 'Target in pruned sibling branch',
      dciOutcome: 'struggle',
      retrieverOutcome: 'win',
      verdict: 'Aggressive pruning drops the correct node — MindAct-style top-k over full DOM may find it (at 10× token cost).',
    },
  },
  {
    id: 'english-chinese',
    label: 'EN/ZH site styles in training',
    defaultOn: true,
    description: 'AutoWebBench covers bilingual sites; model trained on merged EN/ZH traces.',
    breakScenario: {
      title: 'RTL or mobile-only responsive layout',
      dciOutcome: 'struggle',
      retrieverOutcome: 'win',
      verdict: 'Layout conventions differ — operable IDs and scroll semantics may not transfer without locale-specific data.',
    },
  },
  {
    id: 'sandbox-rft',
    label: 'RFT in MiniWoB++/WebArena sandboxes',
    defaultOn: true,
    description: 'Rejection sampling finetuning assumes repeatable environments for reward signals.',
    breakScenario: {
      title: 'Authenticated production checkout flow',
      dciOutcome: 'struggle',
      retrieverOutcome: 'win',
      verdict: 'Live sites block automation, rotate DOM, and forbid 64× sampling — RFT pipeline does not apply cleanly.',
    },
  },
  {
    id: '6b-backbone',
    label: '6B model meets latency budget',
    defaultOn: true,
    description: 'ChatGLM3-6B keeps inference cost deployable; predict step is still ~48% of latency.',
    breakScenario: {
      title: 'Novel 12-tab research workflow',
      dciOutcome: 'struggle',
      retrieverOutcome: 'win',
      verdict: 'Frontier models with higher reasoning may decompose tasks better — AutoWebGLM trades capability for deployability.',
    },
  },
];

export const improvementIdeas = [
  {
    id: 'vision-grounding',
    title: 'Screenshot + Set-of-Marks grounding',
    seed: 'When HTML Pruner returns sparse trees, overlay numbered boxes on screenshots and predict click(id) from vision.',
    whyBetter: '28% of failures are poor graphical recognition — OCR module alone is insufficient for modern SPAs.',
    reveal: {
      framing: 'AutoWebGLM is HTML-first; vision agents (SeeClick, CogAgent) address complementary failure modes.',
      tradeoffs: [
        'Better: handles canvas, icons, and image buttons',
        'Risk: dual modalities increase latency beyond 6B budget',
        'Design: use vision only when pruned HTML has < N operable nodes',
      ],
      nextSteps: [
        'Hybrid trigger: if pruner yields empty operable set → fall back to SoM',
        'Measure WebArena gain vs token/latency cost',
      ],
    },
  },
  {
    id: 'adaptive-prune',
    title: 'Adaptive HTML prune budget',
    seed: 'If target not in top-k candidate elements, relax depth/sibling limits and re-parse — don\'t fail silently.',
    whyBetter: 'Assumption breaker shows pruning can drop gold elements — dynamic budget preserves token savings when easy.',
    reveal: {
      framing: 'MindAct uses multiple LLM rounds on full candidates; AutoWebGLM compresses first — add a retry ladder.',
      tradeoffs: [
        'Better: recovers cross-domain cases where layout differs',
        'Risk: worst-case context blows up toward raw HTML',
        'Signal: confidence on predicted element id',
      ],
      nextSteps: [
        'Ablation on AutoWebBench out-of-domain split',
        'Cap retries at 2 prune passes per step',
      ],
    },
  },
  {
    id: 'self-check',
    title: 'Post-action verification loop',
    seed: 'After click/type, compare simplified HTML diff or URL change before committing to next action.',
    whyBetter: 'Paper §6 proposes self-check — 44% hallucination failures often chain from unchecked wrong clicks.',
    reveal: {
      framing: 'Explicit history helps but does not verify success — add observe→confirm micro-step.',
      tradeoffs: [
        'Better: breaks infinite retry loops on failed clicks',
        'Risk: doubles model calls on happy path',
        'Cheap check: URL/hash change without full re-predict',
      ],
      nextSteps: [
        'Rule-based diff for type_string (input value present)',
        'Measure SSR on AutoWebBench with/without verify',
      ],
    },
  },
  {
    id: 'intent-layer',
    title: 'Intent-before-action (Auto-Intent style)',
    seed: 'Predict next intent in ≤3 words (e.g. "open cart", "filter price") then map to action space.',
    whyBetter: 'Decouples high-level plan from low-level grounding — reduces mis-clicks on ambiguous pages.',
    reveal: {
      framing: 'AutoWebGLM predicts actions directly; Auto-Intent shows top-k intents help GPT-4 on Mind2Web.',
      tradeoffs: [
        'Better: interpretable traces for debugging',
        'Risk: intent vocabulary may not cover long-tail sites',
        'Needs: bilingual intent lexicon for AutoWebBench ZH',
      ],
      nextSteps: [
        'Distill intents from hybrid human–AI CoT traces',
        'Evaluate on cross-domain AutoWebBench split',
      ],
    },
  },
  {
    id: 'planner-grounder',
    title: 'Split planner and grounder (AutoGLM insight)',
    seed: 'Small fast model grounds click(id); larger model plans subgoals only when HTML changes substantially.',
    whyBetter: 'Paper notes predict step is 48% of latency — specialize models like AutoGLM\'s intermediate interface.',
    reveal: {
      framing: 'Planning and grounding need different optimization — flexibility vs accuracy.',
      tradeoffs: [
        'Better: cut average latency on simple click chains',
        'Risk: coordination failures between two models',
        'Deploy: keep 6B as grounder, cloud planner optional',
      ],
      nextSteps: [
        'Profile which steps need replanning vs reflex clicks',
        'Compare end-to-end SSR vs monolithic AutoWebGLM',
      ],
    },
  },
  {
    id: 'popup-handler',
    title: 'Dedicated pop-up / cookie interrupt policy',
    seed: '8% failures from pop-ups — classify interrupt modals first step, dismiss before task actions.',
    whyBetter: 'Low-hanging fruit: cookie banners and newsletter modals block otherwise correct action sequences.',
    reveal: {
      framing: 'Unified action space treats pop-ups as normal nodes — a router could prioritize dismiss patterns.',
      tradeoffs: [
        'Better: cheap heuristic or tiny classifier before main policy',
        'Risk: closing wrong modal loses task context',
        'Data: augment Stage 1 with interrupt-only traces',
      ],
      nextSteps: [
        'Label interrupt steps in 10% of AutoWebBench traces',
        'Measure pop-up failure slice before/after',
      ],
    },
  },
];

export const chatStarters = [
  'Why does AutoWebGLM beat GPT-4 with only 6B parameters?',
  'Explain the HTML Pruner algorithm in plain language.',
  'What is rejection sampling finetuning (RFT) in this paper?',
  'Where does AutoWebGLM still fail on real websites?',
  'How does AutoWebBench differ from Mind2Web and WebArena?',
];

export const paradigmSteps = {
  gpt4: [
    { step: 1, action: 'Dump raw HTML', detail: 'Full DOM — ads, scripts, 50K+ tokens' },
    { step: 2, action: 'Multi-round filtering', detail: 'MindAct-style MCQ over element candidates — 10+ LLM calls' },
    { step: 3, action: 'Pick element', detail: 'Separate rounds for ranking and action' },
    { step: 4, action: 'Execute once', detail: 'No unified observation — history often implicit' },
  ],
  autowebglm: [
    { step: 1, action: 'HTML Pruner', detail: 'Keep operable nodes + local tree context — ~4K tokens' },
    { step: 2, action: 'Build observation', detail: 'Task + simplified HTML + scroll position + action history' },
    { step: 3, action: 'Predict unified action', detail: 'Single call: click(id), type_string, scroll, finish, …' },
    { step: 4, action: 'Execute & iterate', detail: 'Browser runs action; loop until finish or max steps' },
  ],
};

export const assumptionToSeed = {
  'static-dom': 'vision-grounding',
  'simplified-html': 'adaptive-prune',
  'english-chinese': 'intent-layer',
  'sandbox-rft': 'self-check',
  '6b-backbone': 'planner-grounder',
};

export const trainingCurriculum = {
  datasetLabel: 'Training ablation · Mind2Web avg SSR (Table 6)',
  stepCurve: [
    { steps: 1, accuracy: 48.1, insight: 'Train set only (Mind2Web + MiniWoB merge) — baseline imitation.' },
    { steps: 2, accuracy: 48.4, insight: '+ Stage 1 simple tasks — webpage recognition and basic ops.' },
    { steps: 3, accuracy: 56.7, insight: '+ Stage 2 complex hybrid human–AI traces — largest jump from real difficulty.' },
    { steps: 4, accuracy: 59.5, insight: '+ DPO preference alignment — refines action choices on hard steps.' },
    { steps: 5, accuracy: 59.5, insight: 'SFT+DPO plateaus on Mind2Web — environment bootstrapping needed for simulators.' },
  ],
  reasoningCurve: [
    { effort: 'sft', label: 'SFT only (MiniWoB++)', accuracy: 81.7, insight: 'Strong on simulated widgets before RFT.' },
    { effort: 'rft-mini', label: '+ RFT MiniWoB++', accuracy: 89.3, insight: '64× sampling, keep successes — +7.6 pts on 56 tasks.' },
    { effort: 'sft-wa', label: 'SFT only (WebArena)', accuracy: 8.3, insight: 'Live sandbox sites are much harder than offline sets.' },
    { effort: 'rft-wa', label: '+ RFT WebArena', accuracy: 18.2, insight: 'RFT doubles WebArena success — still far from production-ready.' },
  ],
};

export default {
  observationLevels,
  evidenceBenchmarks,
  assumptions,
  assumptionToSeed,
  improvementIdeas,
  chatStarters,
  paradigmSteps,
  trainingCurriculum,
};
