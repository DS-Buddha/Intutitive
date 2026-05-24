/**
 * Configurable copy for paper-agnostic verify playgrounds.
 * Pass `labels: { ... }` in lab-data.js / playground-configs.js — never hardcode paper names in components.
 */

export const COMPARE_LABELS = {
  title: 'Retriever vs agent — live comparison',
  subtitle: 'Same question, two interfaces. Tune top-k and resolution — see which one can actually answer.',
  baselineName: 'Retriever-mediated',
  baselineMeta: 'Fixed top-k API · embedding similarity',
  agentName: 'Agent interface',
  agentMeta: 'Tools · iterative access',
  agentControlLabel: 'Agent resolution',
  agentSuccessVerdict: '✓ Exact evidence localized — agent can verify and cite',
  agentFailVerdict: '✗ Gold evidence not matched — refine search strategy',
};

export const PARADIGM_LABELS = {
  title: 'Two paradigms',
  subtitle: 'Same agent goal — different retrieval interface. Step through each trajectory.',
  baselineName: 'Baseline paradigm',
  baselineMeta: 'Fixed retrieval pipeline',
  agentName: 'Agent paradigm',
  agentMeta: 'Model-driven tool use',
  highlightBaseline: 'Baseline only',
  highlightAgent: 'Agent only',
  insights: [
    'Both start with the same user question — the interface diverges immediately.',
    'Baseline compresses corpus access into one ranked API call. Agent cannot refine.',
    'Agent composes search steps — each iteration narrows the evidence space.',
    'Final step: baseline gives fixed snippets; agent verifies and cites on demand.',
  ],
};

export const RESOLUTION_LABELS = {
  title: 'Interface resolution',
  subtitle: 'Drag the slider from coarse to fine granularity. This is how retrieval interfaces differ.',
  levelNames: ['Document', 'Passage', 'Line', 'Span'],
  tickLabels: ['Document', 'Passage', 'Line', 'Span'],
  insights: [
    'Retriever often returns a whole chunk — agent sees ~512 tokens, much of it irrelevant.',
    'Passage-level: a retrieved snippet — better, but boundaries are fixed by chunking.',
    'Line-level: search returns exact matching lines — good default for verification.',
    'Span-level: read surrounding context around match — precise citation for verification.',
  ],
};

export const CONTEXT_LEVEL_LABELS = {
  title: 'Context policy levels',
  subtitle: 'Long agent trajectories fill context fast. Toggle levels — watch what the agent still remembers.',
};

export const TEST_TIME_SCALING_LABELS = {
  title: 'Test-time scaling',
  subtitle: 'Increase max steps or reasoning effort — watch accuracy climb when the model controls retrieval.',
  stepsLabel: 'Max agent steps',
  reasoningLabel: 'Reasoning effort',
};

/** Shallow merge — override only keys you need per paper. */
export function mergeLabels(defaults, overrides = {}) {
  if (!overrides || typeof overrides !== 'object') return { ...defaults };
  const merged = { ...defaults, ...overrides };
  if (overrides.insights) merged.insights = overrides.insights;
  if (overrides.levelNames) merged.levelNames = overrides.levelNames;
  if (overrides.tickLabels) merged.tickLabels = overrides.tickLabels;
  return merged;
}
