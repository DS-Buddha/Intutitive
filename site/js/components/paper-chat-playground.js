/**
 * Paper chat — discuss the paper with a Gemini-powered tutor (via dev server proxy).
 */

import { formatChatMarkdown } from '../core/format-chat-markdown.js';
import { getProgress, setProgress, KEYS } from '../core/lab-progress.js';

function loadMessages() {
  try {
    const raw = getProgress(KEYS.chatMessages);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

function saveMessages(messages) {
  setProgress(KEYS.chatMessages, JSON.stringify(messages));
}

export function mount(container, config = {}) {
  const paperId = config.paperId;
  const starters = config.starters;
  const paperLabel = config.paperLabel || 'the paper';

  if (!paperId || !starters?.length) {
    container.textContent = 'Paper chat requires paperId and starters in lab-data.js';
    return;
  }

  container.className = 'playground playground--paper-chat playground--interactive';
  container.innerHTML = `
    <div class="playground__header playground__header--accent playground__header--chat">
      <div class="playground__header-icon" aria-hidden="true">💬</div>
      <div>
        <h3 class="playground__title">Paper chat</h3>
        <p class="playground__subtitle">Discuss the paper, stress-test your ideas, or ask where ${paperLabel} breaks.</p>
      </div>
    </div>

    <div class="paper-chat-layout">
      <div class="paper-chat-status" data-chat-status></div>

      <div class="paper-chat-thread">
        <div class="paper-chat-thread__head">
          <span>Conversation</span>
          <button type="button" class="btn btn--ghost btn--sm paper-chat-clear" data-chat-clear hidden>Clear</button>
        </div>
        <div class="paper-chat-messages" data-chat-messages aria-live="polite"></div>
      </div>

      <div class="paper-chat-compose" data-chat-compose>
        <p class="paper-chat-compose__label">Quick starters</p>
        <div class="paper-chat-starters" data-chat-starters></div>
        <form class="paper-chat-form" data-chat-form>
          <textarea class="paper-chat-input" rows="3" placeholder="Ask about the paper, your improvement idea, or where it breaks…" data-chat-input autocomplete="off"></textarea>
          <button type="submit" class="btn btn--primary paper-chat-send" data-chat-send>
            <span class="paper-chat-send__label">Send</span>
            <span class="paper-chat-send__icon" aria-hidden="true">→</span>
          </button>
        </form>
        <p class="paper-chat-compose__hint paper-chat-compose__hint--desktop"><kbd>Enter</kbd> to send · <kbd>Shift</kbd>+<kbd>Enter</kbd> for new line</p>
        <p class="paper-chat-compose__hint paper-chat-compose__hint--touch">Tap Send when ready</p>
      </div>
    </div>
  `;

  const state = { messages: loadMessages(), loading: false, apiReady: false };

  const statusEl = container.querySelector('[data-chat-status]');
  const startersEl = container.querySelector('[data-chat-starters]');
  const messagesEl = container.querySelector('[data-chat-messages]');
  const composeEl = container.querySelector('[data-chat-compose]');
  const form = container.querySelector('[data-chat-form]');
  const input = container.querySelector('[data-chat-input]');
  const sendBtn = container.querySelector('[data-chat-send]');
  const clearBtn = container.querySelector('[data-chat-clear]');

  input.removeAttribute('readonly');
  input.removeAttribute('disabled');

  startersEl.innerHTML = starters.map(s =>
    `<button type="button" class="paper-chat-starter" data-starter="${escapeAttr(s)}">${escapeHtml(s)}</button>`
  ).join('');

  startersEl.querySelectorAll('[data-starter]').forEach(btn => {
    btn.addEventListener('click', () => {
      input.value = btn.dataset.starter;
      highlightCompose();
      input.focus();
    });
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.requestSubmit();
    }
  });

  const highlightCompose = () => {
    composeEl.classList.add('paper-chat-compose--highlight');
    setTimeout(() => composeEl.classList.remove('paper-chat-compose--highlight'), 2500);
  };

  const renderMessages = () => {
    clearBtn.hidden = !state.messages.length;

    if (!state.messages.length && !state.loading) {
      messagesEl.innerHTML = `
        <div class="paper-chat-empty">
          <span class="paper-chat-empty__icon" aria-hidden="true">◇</span>
          <p>No messages yet</p>
          <span>Pick a starter or type a question below</span>
        </div>`;
      return;
    }

    messagesEl.innerHTML = state.messages.map(m => {
      const isError = m.role === 'model' && m.content.startsWith('Error:');
      return `
      <div class="paper-chat-msg paper-chat-msg--${m.role}${isError ? ' paper-chat-msg--error' : ''}">
        <div class="paper-chat-msg__avatar" aria-hidden="true">${m.role === 'user' ? 'You' : 'AI'}</div>
        <div class="paper-chat-msg__bubble">
          <span class="paper-chat-msg__role">${m.role === 'user' ? 'You' : 'Tutor'}</span>
          <div class="paper-chat-msg__body paper-chat-msg__body--rich">${formatChatMarkdown(m.content)}</div>
        </div>
      </div>`;
    }).join('');

    if (state.loading) {
      messagesEl.innerHTML += `
        <div class="paper-chat-msg paper-chat-msg--model">
          <div class="paper-chat-msg__avatar" aria-hidden="true">AI</div>
          <div class="paper-chat-msg__bubble">
            <span class="paper-chat-msg__role">Tutor</span>
            <div class="paper-chat-msg__body paper-chat-msg__body--loading">
              <span class="paper-chat-typing"><span></span><span></span><span></span></span>
              Thinking…
            </div>
          </div>
        </div>`;
    }

    requestAnimationFrame(() => {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    });
  };

  const setStatus = (html, type = 'info') => {
    const dotClass = type === 'warn' ? 'paper-chat-status__dot--warn' : 'paper-chat-status__dot--ok';
    statusEl.className = `paper-chat-status paper-chat-status--${type}`;
    statusEl.innerHTML = `<span class="paper-chat-status__dot ${dotClass}" aria-hidden="true"></span><span>${html}</span>`;
  };

  const updateSendState = () => {
    sendBtn.disabled = state.loading || !state.apiReady;
    sendBtn.title = state.apiReady ? '' : 'Requires dev server and GEMINI_API_KEY in .env';
    sendBtn.classList.toggle('paper-chat-send--disabled', !state.apiReady);
  };

  async function sendMessage(text) {
    if (!text || state.loading || !state.apiReady) return false;

    state.messages.push({ role: 'user', content: text });
    saveMessages(state.messages);
    input.value = '';
    state.loading = true;
    updateSendState();
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
      saveMessages(state.messages);
      document.dispatchEvent(new CustomEvent('dci:chat-message', { detail: { paperId } }));
    } catch (err) {
      state.messages.push({ role: 'model', content: `Error: ${err.message}` });
      saveMessages(state.messages);
    } finally {
      state.loading = false;
      updateSendState();
      renderMessages();
      input.focus();
    }
    return true;
  }

  async function checkHealth() {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error('unavailable');
      const data = await res.json();
      state.apiReady = data.gemini === true;
      if (state.apiReady) {
        setStatus('Connected — powered by Gemini');
      } else {
        setStatus('You can type freely. To <strong>send</strong>, add <code>GEMINI_API_KEY</code> to <code>.env</code> and run <code>python server/dev_server.py</code>.', 'warn');
      }
    } catch (_) {
      state.apiReady = false;
      setStatus('You can type freely. To <strong>send</strong>, run <code>python server/dev_server.py</code> (not plain <code>http.server</code>).', 'warn');
    }
    updateSendState();
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text || state.loading) return;
    if (!state.apiReady) {
      setStatus('Cannot send yet — start the dev server with your Gemini API key configured.', 'warn');
      input.focus();
      return;
    }
    await sendMessage(text);
  });

  clearBtn.addEventListener('click', () => {
    state.messages = [];
    saveMessages([]);
    renderMessages();
  });

  document.addEventListener('dci:chat-prefill', async (e) => {
    if (e.detail?.paperId && e.detail.paperId !== paperId) return;
    if (!e.detail?.message) return;
    input.value = e.detail.message;
    if (e.detail.highlight) highlightCompose();
    input.focus();
    if (e.detail.scroll) {
      container.closest('section')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    if (e.detail.send && state.apiReady) {
      await sendMessage(e.detail.message);
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
