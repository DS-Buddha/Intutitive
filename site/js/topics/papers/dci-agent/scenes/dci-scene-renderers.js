/**
 * DCI paper — SVG scene renderers for scene-player.
 */

import { registerSceneRenderer } from '../../../../core/scene-player.js';

function svgWrap(content, w = 560, h = 320) {
  return `<svg class="scene-svg" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${content}</svg>`;
}

registerSceneRenderer('topk-funnel', (scene, p) => {
  const docs = 12;
  const kept = 5;
  const funnelY = 80 + p * 120;
  const dropped = Math.floor((docs - kept) * Math.min(1, p * 1.2));
  let dots = '';
  for (let i = 0; i < docs; i++) {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = 80 + col * 100;
    const y = 40 + row * 36;
    const isKept = i < kept && p > 0.35;
    const isDropped = i >= kept && p > 0.2;
    const opacity = p < 0.15 ? 1 : isKept ? 1 : isDropped ? 0.15 : 0.4;
    const cy = isDropped ? y + (funnelY - 40) * Math.min(1, (p - 0.2) * 2) : y;
    dots += `<circle cx="${x}" cy="${cy}" r="14" fill="${isKept && p > 0.5 ? 'var(--stage-retrieve)' : 'var(--color-text-secondary)'}" opacity="${opacity}"/>`;
    dots += `<text x="${x}" y="${cy + 4}" text-anchor="middle" font-size="9" fill="var(--color-bg-base)">${i + 1}</text>`;
  }
  const funnel = `
    <path d="M 200 ${funnelY} L 360 ${funnelY} L 320 280 L 240 280 Z" fill="rgba(88,166,255,0.15)" stroke="var(--stage-retrieve)" stroke-width="2"/>
    <text x="280" y="${funnelY + 50}" text-anchor="middle" font-size="11" fill="var(--color-text-secondary)">top-${kept} only</text>`;
  const label = p < 0.2 ? 'Full corpus' : p < 0.5 ? 'Retriever scores…' : 'Lost evidence cannot return';
  return svgWrap(`${dots}${p > 0.15 ? funnel : ''}<text x="280" y="16" text-anchor="middle" font-size="13" fill="var(--color-text-primary)">${label}</text>`);
});

registerSceneRenderer('interface-morph', (scene, p) => {
  const leftOpacity = Math.max(0, 1 - p * 1.5);
  const rightOpacity = Math.min(1, p * 1.5);
  const left = `
    <g opacity="${leftOpacity}">
      <rect x="20" y="40" width="240" height="240" rx="8" fill="var(--color-bg-base)" stroke="var(--color-border)"/>
      <text x="140" y="68" text-anchor="middle" font-size="12" font-weight="600">Retriever-mediated</text>
      <rect x="40" y="90" width="200" height="40" rx="4" fill="var(--stage-index)" opacity="0.3"/>
      <text x="140" y="115" text-anchor="middle" font-size="10">Index + embed</text>
      <rect x="60" y="150" width="160" height="50" rx="4" fill="var(--stage-retrieve)" opacity="0.4"/>
      <text x="140" y="180" text-anchor="middle" font-size="10">top-k snippets</text>
      <text x="140" y="230" text-anchor="middle" font-size="9" fill="var(--color-text-secondary)">Agent sees ranked list only</text>
    </g>`;
  const right = `
    <g opacity="${rightOpacity}">
      <rect x="300" y="40" width="240" height="240" rx="8" fill="var(--color-bg-base)" stroke="var(--stage-ingest)"/>
      <text x="420" y="68" text-anchor="middle" font-size="12" font-weight="600">Direct corpus (DCI)</text>
      <rect x="320" y="90" width="200" height="180" rx="4" fill="none" stroke="var(--color-border)" stroke-dasharray="4"/>
      <text x="420" y="120" font-family="monospace" font-size="10" fill="var(--stage-generate)">$ grep -r "clue" corpus/</text>
      <text x="420" y="145" font-family="monospace" font-size="10" fill="var(--stage-generate)">$ rg "SKU-8842" | head</text>
      <text x="420" y="170" font-family="monospace" font-size="10" fill="var(--stage-generate)">$ read file.txt</text>
      <text x="420" y="230" text-anchor="middle" font-size="9" fill="var(--color-text-secondary)">Raw corpus + terminal tools</text>
    </g>`;
  const arrow = p > 0.3 && p < 0.7 ? `<text x="280" y="160" text-anchor="middle" font-size="20">→</text>` : '';
  return svgWrap(`${left}${right}${arrow}`);
});

registerSceneRenderer('context-mgmt', (scene, p) => {
  const levels = ['L0', 'L1', 'L2', 'L3', 'L4'];
  const active = Math.min(4, Math.floor(p * 5));
  let bars = '';
  levels.forEach((lv, i) => {
    const y = 60 + i * 44;
    const on = i <= active;
    bars += `<rect x="80" y="${y}" width="${on ? 200 + i * 30 : 80}" height="28" rx="4" fill="${on ? 'var(--stage-retrieve)' : 'var(--color-border)'}" opacity="${on ? 0.5 + i * 0.1 : 0.3}"/>`;
    bars += `<text x="60" y="${y + 18}" text-anchor="end" font-size="11">${lv}</text>`;
    const labels = ['none', 'truncate 50K', 'truncate 20K', '+ compact', '+ summarize'];
    bars += `<text x="300" y="${y + 18}" font-size="10" fill="var(--color-text-secondary)">${labels[i]}</text>`;
  });
  return svgWrap(`${bars}<text x="280" y="24" text-anchor="middle" font-size="12">Context management for long DCI runs</text>`);
});

registerSceneRenderer('pareto-results', (scene, p) => {
  const points = [
    { x: 120, y: 180, label: 'Retriever 69%', cost: '$1440' },
    { x: 280, y: 100, label: 'DCI-CC 80%', cost: '$1016' },
    { x: 200, y: 140, label: 'DCI-Lite 72%', cost: '$793' },
  ];
  let content = `<line x1="60" y1="220" x2="500" y2="220" stroke="var(--color-border)"/><line x1="60" y1="220" x2="60" y2="60" stroke="var(--color-border)"/>`;
  content += `<text x="280" y="250" text-anchor="middle" font-size="10" fill="var(--color-text-secondary)">Cost →</text>`;
  content += `<text x="30" y="140" text-anchor="middle" font-size="10" fill="var(--color-text-secondary)" transform="rotate(-90 30 140)">Accuracy</text>`;
  points.forEach((pt, i) => {
    const show = p > i * 0.25;
    if (!show) return;
    content += `<circle cx="${pt.x}" cy="${pt.y}" r="12" fill="var(--stage-retrieve)" opacity="0.9"/>`;
    content += `<text x="${pt.x}" y="${pt.y - 18}" text-anchor="middle" font-size="9">${pt.label}</text>`;
    content += `<text x="${pt.x}" y="${pt.y + 28}" text-anchor="middle" font-size="8" fill="var(--color-text-secondary)">${pt.cost}</text>`;
  });
  return svgWrap(content, 560, 280);
});

registerSceneRenderer('interface-resolution', (scene, p) => {
  const levels = ['Document', 'Passage', 'Line', 'Span'];
  const idx = Math.min(3, Math.floor(p * 4));
  const zoom = 1 + idx * 0.35;
  let doc = `<rect x="140" y="60" width="280" height="200" rx="6" fill="var(--color-bg-base)" stroke="var(--color-border)" transform="scale(${zoom})" transform-origin="280 160"/>`;
  const highlights = [
    { x: 160, y: 80, w: 240, h: 160 },
    { x: 180, y: 100, w: 200, h: 80 },
    { x: 200, y: 130, w: 160, h: 20 },
    { x: 220, y: 132, w: 80, h: 16 },
  ];
  const h = highlights[idx];
  doc += `<rect x="${h.x}" y="${h.y}" width="${h.w}" height="${h.h}" fill="rgba(88,166,255,0.25)" stroke="var(--stage-retrieve)"/>`;
  doc += `<text x="280" y="40" text-anchor="middle" font-size="12">Resolution: ${levels[idx]}</text>`;
  return svgWrap(doc);
});

registerSceneRenderer('coverage-localization', (scene, p) => {
  const cov = Math.min(100, Math.round(p * 100));
  const loc = Math.min(100, Math.round(Math.max(0, (p - 0.3) * 1.4) * 100));
  return svgWrap(`
    <text x="280" y="36" text-anchor="middle" font-size="12">Trajectory metrics</text>
    <text x="140" y="80" font-size="11">Coverage (found gold doc?)</text>
    <rect x="140" y="90" width="320" height="24" rx="4" fill="var(--color-border)"/>
    <rect x="140" y="90" width="${320 * cov / 100}" height="24" rx="4" fill="var(--stage-index)"/>
    <text x="470" y="106" font-size="10">${cov}%</text>
    <text x="140" y="160" font-size="11">Localization (how precise?)</text>
    <rect x="140" y="170" width="320" height="24" rx="4" fill="var(--color-border)"/>
    <rect x="140" y="170" width="${320 * loc / 100}" height="24" rx="4" fill="var(--stage-retrieve)"/>
    <text x="470" y="186" font-size="10">${loc}%</text>
    <text x="280" y="240" text-anchor="middle" font-size="10" fill="var(--color-text-secondary)">DCI wins on localization even when coverage matches</text>
  `);
});

registerSceneRenderer('default', (scene, p) => {
  return svgWrap(`<text x="280" y="160" text-anchor="middle" fill="var(--color-text-secondary)">${scene.id || 'Scene'}</text>`);
});
