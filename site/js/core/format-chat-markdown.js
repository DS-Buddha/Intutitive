/**
 * Lightweight, safe markdown → HTML for chat bubbles.
 */

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatInline(text) {
  let s = text;
  const codes = [];
  s = s.replace(/`([^`\n]+)`/g, (_, code) => {
    codes.push(code);
    return `\x00CODE${codes.length - 1}\x00`;
  });

  s = s
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
    .replace(/\$([^$\n]+)\$/g, '<span class="chat-math">$1</span>');

  s = s.replace(/\x00CODE(\d+)\x00/g, (_, i) => `<code>${codes[Number(i)]}</code>`);
  return s;
}

function formatBlocks(text) {
  const parts = [];
  const codeBlockRe = /```(\w*)\n?([\s\S]*?)```/g;
  let last = 0;
  let match;

  while ((match = codeBlockRe.exec(text)) !== null) {
    if (match.index > last) {
      parts.push({ type: 'text', content: text.slice(last, match.index) });
    }
    parts.push({ type: 'code', lang: match[1], content: match[2].trim() });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ type: 'text', content: text.slice(last) });
  if (!parts.length) parts.push({ type: 'text', content: text });

  return parts.map(part => {
    if (part.type === 'code') {
      return `<pre class="chat-code-block"><code>${escapeHtml(part.content)}</code></pre>`;
    }
    return formatProse(part.content);
  }).join('');
}

function formatProse(raw) {
  const lines = escapeHtml(raw.trim()).split('\n');
  const out = [];
  let para = [];
  let inOl = false;
  let inUl = false;

  const flushPara = () => {
    if (!para.length) return;
    out.push(`<p>${formatInline(para.join(' '))}</p>`);
    para = [];
  };

  const closeLists = () => {
    if (inOl) { out.push('</ol>'); inOl = false; }
    if (inUl) { out.push('</ul>'); inUl = false; }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushPara();
      closeLists();
      continue;
    }

    const hMatch = trimmed.match(/^#{1,3}\s+(.+)$/);
    const olMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    const ulMatch = trimmed.match(/^[-*•]\s+(.+)$/);
    const hrMatch = trimmed === '---' || trimmed === '***';

    if (hrMatch) {
      flushPara();
      closeLists();
      out.push('<hr class="chat-hr">');
    } else if (hMatch) {
      flushPara();
      closeLists();
      const level = trimmed.match(/^#+/)[0].length;
      const tag = level === 1 ? 'h4' : level === 2 ? 'h5' : 'h6';
      out.push(`<${tag} class="chat-heading">${formatInline(hMatch[1])}</${tag}>`);
    } else if (olMatch) {
      flushPara();
      if (!inOl) { closeLists(); out.push('<ol>'); inOl = true; }
      out.push(`<li>${formatInline(olMatch[1])}</li>`);
    } else if (ulMatch) {
      flushPara();
      if (!inUl) { closeLists(); out.push('<ul>'); inUl = true; }
      out.push(`<li>${formatInline(ulMatch[1])}</li>`);
    } else {
      closeLists();
      para.push(trimmed);
    }
  }

  flushPara();
  closeLists();
  return out.join('');
}

export function formatChatMarkdown(text) {
  if (!text) return '';

  const raw = String(text).trim();
  if (raw.startsWith('Error:')) {
    return `<p class="chat-error">${escapeHtml(raw)}</p>`;
  }

  return formatBlocks(raw) || `<p>${formatInline(escapeHtml(raw))}</p>`;
}
