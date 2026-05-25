#!/usr/bin/env node
/**
 * Static checks for Paper Journey lab wiring (no browser).
 * Usage: node scripts/verify-paper-lab.mjs <paper-id>
 *
 * After this passes, open lab.html in a browser and confirm Part 2 controls render
 * (see ERROR.md — "Paper Journey Part 2 Playgrounds Are Empty").
 */
import { readFileSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';
import { getPaper } from '../site/js/topics/paperRegistry.js';

const paperId = process.argv[2];
if (!paperId) {
  console.error('Usage: node scripts/verify-paper-lab.mjs <paper-id>');
  process.exit(1);
}

const paper = getPaper(paperId);
if (!paper) {
  console.error(`No registry entry for "${paperId}"`);
  process.exit(1);
}

if (!Array.isArray(paper.concepts)) {
  console.error(`Registry "${paperId}": concepts must be an array (use [] if no deep dives)`);
  process.exit(1);
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const labPath = join(root, 'site', 'js', 'topics', 'papers', paperId, 'lab-data.js');
const labData = (await import(pathToFileURL(labPath).href)).default;
const playgrounds = labData.playgrounds || {};

const labHtmlPath = join(root, 'site', 'topics', 'papers', paperId, 'lab.html');
const labHtml = readFileSync(labHtmlPath, 'utf8');
const playgroundTypes = [...labHtml.matchAll(/data-playground="([^"]+)"/g)].map((m) => m[1]);
const uniqueTypes = [...new Set(playgroundTypes)];

let failed = false;
for (const type of uniqueTypes) {
  if (!playgrounds[type]) {
    console.error(`Missing playgrounds["${type}"] in lab-data for ${paperId}`);
    failed = true;
  }
}

if (playgrounds['paradigm-compare']) {
  const p = playgrounds['paradigm-compare'];
  if (!p.retrieverSteps?.length || !p.agentSteps?.length) {
    console.error('paradigm-compare: retrieverSteps and agentSteps required');
    failed = true;
  }
}

if (playgrounds.resolution && !playgrounds.resolution.document) {
  console.error('resolution: config.document required');
  failed = true;
}

if (playgrounds['interface-compare']) {
  const c = playgrounds['interface-compare'];
  if (!c.scenarios?.length || !c.chunks?.length || !c.rankByScenario || !c.agentMatches) {
    console.error('interface-compare: scenarios, chunks, rankByScenario, agentMatches required');
    failed = true;
  }
}

if (playgrounds['paper-chat']?.paperId !== paperId) {
  console.error(`paper-chat.paperId must be "${paperId}"`);
  failed = true;
}

if (failed) process.exit(1);

console.log(`OK ${paperId}: concepts=${paper.concepts.length}, playgrounds=${Object.keys(playgrounds).length}, html-types=${uniqueTypes.length}`);
console.log('Next: open lab.html in browser — Part 2 must show sliders/controls (not empty boxes)');
