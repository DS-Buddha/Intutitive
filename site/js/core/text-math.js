/**
 * Client-side text utilities for educational playgrounds.
 * Transparent algorithms — not production RAG, but faithful to the mechanics.
 */

const TOKEN_RE = /[a-z0-9']+/gi;

export function tokenize(text) {
  return (text.toLowerCase().match(TOKEN_RE) || []);
}

export function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

/** Fixed-size (rigid) chunking with character overlap. */
export function chunkFixed(text, chunkSize, overlapPct) {
  if (!text.trim()) return [];
  const overlap = Math.floor(chunkSize * (overlapPct / 100));
  const stride = Math.max(1, chunkSize - overlap);
  const chunks = [];

  for (let start = 0; start < text.length; start += stride) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push({
      text: text.slice(start, end),
      start,
      end,
      splitAt: 'fixed boundary',
    });
    if (end >= text.length) break;
  }

  return annotateOverlap(chunks);
}

/** Recursive splitting: paragraph → line → sentence → clause → word → fixed. */
export function chunkRecursive(text, chunkSize, overlapPct) {
  if (!text.trim()) return [];

  const separators = [
    /\n\n+/,
    /\n/,
    /(?<=[.!?])\s+/,
    /,\s+/,
    /\s+/,
  ];

  function splitRecursive(str, depth) {
    if (str.length <= chunkSize) return [str];
    if (depth >= separators.length) {
      return chunkFixed(str, chunkSize, overlapPct).map(c => c.text);
    }

    const parts = str.split(separators[depth]).filter(p => p.trim());
    if (parts.length <= 1) return splitRecursive(str, depth + 1);

    const merged = [];
    let buf = '';

    for (const part of parts) {
      const trimmed = part.trim();
      const joiner = separators[depth].source.includes('\\n') ? '\n' : ' ';
      const candidate = buf ? buf + joiner + trimmed : trimmed;

      if (candidate.length <= chunkSize) {
        buf = candidate;
      } else {
        if (buf) merged.push(buf);
        if (trimmed.length > chunkSize) {
          merged.push(...splitRecursive(trimmed, depth + 1));
          buf = '';
        } else {
          buf = trimmed;
        }
      }
    }
    if (buf) merged.push(buf);

    return merged;
  }

  const labels = ['paragraph', 'sentence', 'clause', 'word', 'fixed'];
  const pieces = splitRecursive(text.trim(), 0);

  let cursor = 0;
  const chunks = pieces.map((piece, i) => {
    const start = text.indexOf(piece, cursor);
    const safeStart = start === -1 ? cursor : start;
    const end = safeStart + piece.length;
    cursor = end;
    return {
      text: piece,
      start: safeStart,
      end,
      splitAt: labels[Math.min(i, labels.length - 1)] + ' boundary',
    };
  });

  return applyOverlapWindow(chunks, text, chunkSize, overlapPct);
}

function annotateOverlap(chunks) {
  return chunks.map((c, i) => ({
    ...c,
    overlapWithPrev: i > 0 ? Math.max(0, chunks[i - 1].end - c.start) : 0,
  }));
}

function applyOverlapWindow(chunks, fullText, chunkSize, overlapPct) {
  if (overlapPct === 0 || chunks.length <= 1) return annotateOverlap(chunks);

  const overlap = Math.floor(chunkSize * (overlapPct / 100));
  const result = [chunks[0]];

  for (let i = 1; i < chunks.length; i++) {
    const prev = result[result.length - 1];
    const start = Math.max(0, prev.end - overlap);
    result.push({
      text: fullText.slice(start, chunks[i].end),
      start,
      end: chunks[i].end,
      splitAt: chunks[i].splitAt,
      overlapWithPrev: prev.end - start,
    });
  }

  return annotateOverlap(result);
}

/** Bag-of-words TF vectors for transparent similarity demos. */
export function buildVocabulary(documents) {
  const vocab = new Map();
  documents.forEach(doc => {
    tokenize(doc).forEach(t => vocab.set(t, (vocab.get(t) || 0) + 1));
  });
  return [...vocab.keys()].sort();
}

export function toTfVector(text, vocabulary) {
  const counts = new Map();
  tokenize(text).forEach(t => counts.set(t, (counts.get(t) || 0) + 1));
  return vocabulary.map(term => counts.get(term) || 0);
}

export function toTfidfVector(text, vocabulary, documents) {
  const tf = toTfVector(text, vocabulary);
  const n = documents.length;
  return tf.map((termFreq, i) => {
    if (termFreq === 0) return 0;
    const term = vocabulary[i];
    const df = documents.filter(d => tokenize(d).includes(term)).length;
    const idf = Math.log((n + 1) / (df + 1)) + 1;
    return termFreq * idf;
  });
}

export function cosineSimilarity(a, b) {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

/** Project high-dim vectors to 2D for visualization (truncated SVD-style). */
export function project2D(vectors) {
  if (vectors.length === 0) return [];
  const dims = vectors[0].length;
  if (dims === 0) return vectors.map(() => ({ x: 0, y: 0 }));

  const mean = new Array(dims).fill(0);
  vectors.forEach(v => v.forEach((val, i) => { mean[i] += val; }));
  mean.forEach((_, i) => { mean[i] /= vectors.length; });

  const centered = vectors.map(v => v.map((val, i) => val - mean[i]));

  let axisX = new Array(dims).fill(0);
  centered.forEach(v => v.forEach((val, i) => { axisX[i] += val; }));
  const magX = Math.hypot(...axisX) || 1;
  axisX = axisX.map(v => v / magX);

  const axisY = new Array(dims).fill(0);
  centered.forEach(v => {
    const proj = v.reduce((s, val, i) => s + val * axisX[i], 0);
    v.forEach((val, i) => { axisY[i] += val - proj * axisX[i]; });
  });
  const magY = Math.hypot(...axisY) || 1;
  const normY = axisY.map(v => v / magY);

  return centered.map(v => ({
    x: v.reduce((s, val, i) => s + val * axisX[i], 0),
    y: v.reduce((s, val, i) => s + val * normY[i], 0),
  }));
}

export function rankBySimilarity(query, documents, vocabulary) {
  const queryVec = toTfidfVector(query, vocabulary, documents);
  return documents
    .map((doc, index) => ({
      index,
      text: doc,
      vector: toTfidfVector(doc, vocabulary, documents),
      similarity: cosineSimilarity(queryVec, toTfidfVector(doc, vocabulary, documents)),
    }))
    .sort((a, b) => b.similarity - a.similarity);
}

export function vectorMagnitude(vec) {
  return Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
}

export function vectorSparsity(vec) {
  if (vec.length === 0) return 100;
  const zeros = vec.filter(v => v === 0).length;
  return Math.round((zeros / vec.length) * 100);
}

/** Term-level dot product breakdown for educational display. */
export function dotProductBreakdown(query, doc, vocabulary, documents) {
  const queryVec = toTfidfVector(query, vocabulary, documents);
  const docVec = toTfidfVector(doc, vocabulary, documents);
  const magQ = vectorMagnitude(queryVec);
  const magD = vectorMagnitude(docVec);
  const similarity = cosineSimilarity(queryVec, docVec);

  const rows = vocabulary
    .map((term, i) => ({
      term,
      queryWeight: queryVec[i],
      docWeight: docVec[i],
      product: queryVec[i] * docVec[i],
    }))
    .filter(r => r.product > 0)
    .sort((a, b) => b.product - a.product);

  const dotSum = rows.reduce((s, r) => s + r.product, 0);

  return {
    rows,
    dotSum,
    magQuery: magQ,
    magDoc: magD,
    similarity,
    queryVec,
    docVec,
  };
}

/** Top non-zero dimensions for heatmap display. */
export function topVectorDimensions(vec, vocabulary, limit = 20) {
  return vec
    .map((weight, i) => ({ term: vocabulary[i], weight }))
    .filter(d => d.weight > 0)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, limit);
}
