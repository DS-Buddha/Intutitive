/**
 * Playground orchestrator — mounts under-the-hood interactive sandboxes.
 */

import { mount as mountChunking } from './chunking-playground.js';
import { mount as mountEmbedding } from './embedding-playground.js';
import { mount as mountRetrieval } from './retrieval-playground.js';
import { mount as mountPipeline } from './pipeline-playground.js';
import { mount as mountIngestionFailure } from './ingestion-failure-playground.js';
import { mount as mountParseComparison } from './parse-comparison-playground.js';
import { mount as mountEvidencePins } from './evidence-pins-playground.js';
import { mount as mountHybridSearch } from './hybrid-search-playground.js';
import { mount as mountColbert } from './colbert-playground.js';
import { mount as mountHyde } from './hyde-playground.js';
import { mount as mountRaptor } from './raptor-playground.js';
import { mount as mountPageindex } from './pageindex-playground.js';
import { mount as mountGraphrag } from './graphrag-playground.js';
import { mount as mountAgenticLoop } from './agentic-loop-playground.js';
import { mount as mountTerminal } from './terminal-playground.js';
import { mount as mountTopkBottleneck } from './topk-bottleneck-playground.js';
import { mount as mountInterfaceCompare } from './interface-compare-playground.js';
import { mount as mountResolution } from './resolution-playground.js';
import { mount as mountMetrics } from './metrics-playground.js';
import { mount as mountParadigmCompare } from './paradigm-compare-playground.js';
import { mount as mountContextLevel } from './context-level-playground.js';
import { mount as mountEvidenceLens } from './evidence-lens-playground.js';
import { mount as mountAssumptionBreaker } from './assumption-breaker-playground.js';
import { mount as mountHypothesisStudio } from './hypothesis-studio-playground.js';

const MOUNTERS = {
  chunking: mountChunking,
  embedding: mountEmbedding,
  retrieval: mountRetrieval,
  pipeline: mountPipeline,
  'ingestion-failure': mountIngestionFailure,
  'parse-comparison': mountParseComparison,
  'evidence-pins': mountEvidencePins,
  'hybrid-search': mountHybridSearch,
  colbert: mountColbert,
  hyde: mountHyde,
  raptor: mountRaptor,
  pageindex: mountPageindex,
  graphrag: mountGraphrag,
  'agentic-loop': mountAgenticLoop,
  'terminal-corpus': mountTerminal,
  'topk-bottleneck': mountTopkBottleneck,
  'interface-compare': mountInterfaceCompare,
  'resolution': mountResolution,
  'coverage-metrics': mountMetrics,
  'paradigm-compare': mountParadigmCompare,
  'context-level': mountContextLevel,
  'evidence-lens': mountEvidenceLens,
  'assumption-breaker': mountAssumptionBreaker,
  'hypothesis-studio': mountHypothesisStudio,
};

export function mountAll(conceptData = {}) {
  document.querySelectorAll('[data-playground]').forEach(container => {
    const type = container.getAttribute('data-playground');
    const mountFn = MOUNTERS[type];
    if (!mountFn) {
      console.warn(`Unknown playground type: ${type}`);
      return;
    }
    const config = conceptData.playgrounds?.[type] || conceptData[type] || {};
    mountFn(container, config);
  });
}
