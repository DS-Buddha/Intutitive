/**
 * Paper chat — discuss the paper with a Gemini-powered tutor (via dev server proxy).
 */

import { chatStarters } from '../topics/papers/dci-agent/journey-data.js';

export function mount(container, config = {}) {
  const paperId = config.paperId || 'dci-agent';
  const starters = config.starters || chatStarters;

  container.className = 'playground playground--paper-chat';
  container.innerHTML = `
    <div class="playground__header">
      <h3 class="playground__title">Paper chat</h3>
      <p class="playground__subtitle">Discuss the paper, stress-test ideas, and explore improvements with an AI tutor.</p>
    </div>
    <div class="paper-chat-status" data-chat-status></div>
    <div class="paper-chat-starters" data-chat-starters></div>
    <div class="paper-chat-messages" data-chat-messages aria-live="polite"></div>
    <form class="paper-chat-form" data-chat-form>
      <textarea class="paper-chat-input" rows="2" placeholder="Ask about the paper, your improvement idea, or where DCI breaks…" data-chat-input required></textarea>
      <button type="submit" class="btn btn--primary btn--sm" data-chat-send>Send</button>
    </form>
  `;

  const state = {
    messages: [],
    loading: false,
    apiReady: false,
  };

  const statusEl = container.querySelector('[data-chat-status]');
  const startersEl = container.querySelector('[data-chat-starters]');
  const messagesEl = container.querySelector('[data-chat-messages]');
  const form = container.querySelector('[data-chat-form]');
  const input = container.querySelector('[data-chat-input]');
  const sendBtn = container.querySelector('[data-chat-send]');

  startersEl.innerHTML = starters.map(s =>
    `<button type="button" class="paper-chat-starter" data-starter="${escapeAttr(s)}">${escapeHtml(s)}</button>`
  ).join('');

  startersEl.querySelectorAll('[data-starter]').forEach(btn => {
    btn.addEventListener('click', () => {
      input.value = btn.dataset.starter;
      input.focus();
    });
  });

  const renderMessages = () => {
    if (!state.messages.length) {
      messagesEl.innerHTML = '<p class="paper-chat-empty">No messages yet — pick a starter or ask your own question.</p>';
      return;
    }
    messagesEl.innerHTML = state.messages.map(m => `
      <div class="paper-chat-msg paper-chat-msg--${m.role}">
        <span class="paper-chat-msg__role">${m.role === 'user' ? 'You' : 'Tutor'}</span>
        <div class="paper-chat-msg__body">${formatMessage(m.content)}</div>
      </div>
    `).join('');
    if (state.loading) {
      messagesEl.innerHTML += '<div class="paper-chat-msg paper-chat-msg--model"><span class="paper-chat-msg__role">Tutor</span><div class="paper-chat-msg__body paper-chat-msg__body--loading">Thinking…</div></div>';
    }
    messagesEl.scrollTop = messagesEl.scrollHeight;
  };

  const setStatus = (html, type = 'info') => {
    statusEl.className = `paper-chat-status paper-chat-status--${type}`;
    statusEl.innerHTML = html;
  };

  async function checkHealth() {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error('unavailable');
      const data = await res.json();
      state.apiReady = data.gemini === true;
      if (state.apiReady) {
        setStatus('Connected — powered by Gemini. Ask anything about DCI.');
      } else {
        setStatus('Dev server running but <code>GEMINI_API_KEY</code> is missing in <code>.env</code>.', 'warn');
        sendBtn.disabled = true;
      }
    } catch (_) {
      state.apiReady = false;
      setStatus(
        'Chat requires the dev server. Run: <code>pip install -r requirements.txt</code> then <code>python server/dev_server.py</code>',
        'warn'
      );
      sendBtn.disabled = true;
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text || state.loading || !state.apiReady) return;

    state.messages.push({ role: 'user', content: text });
    input.value = '';
    state.loading = true;
    sendBtn.disabled = true;
    renderMessages();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paperId, messages: state.messages }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chat failed');

      state.messages.push({ role: 'model', content: data.reply });
      document.dispatchEvent(new CustomEvent('dci:chat-message', { detail: { paperId } }));
    } catch (err) {
      state.messages.push({
        role: 'model',
        content: `Error: ${err.message}. Check .env and that dev_server.py is running.`,
      });
    } finally {
      state.loading = false;
      sendBtn.disabled = !state.apiReady;
      renderMessages();
    }
  });

  checkHealth();
  renderMessages();
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(s) {
  return s.replace(/"/g, '&quot;');
}

function formatMessage(text) {
  return escapeHtml(text).replace(/\n/g, '<br>');
}
