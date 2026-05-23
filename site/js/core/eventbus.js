/**
 * Lightweight pub/sub event bus for cross-module communication.
 * No external dependencies. Single source of truth for events.
 */

const listeners = new Map();

export function on(event, handler) {
  if (!listeners.has(event)) {
    listeners.set(event, []);
  }
  listeners.get(event).push(handler);
}

export function off(event, handler) {
  if (!listeners.has(event)) return;
  const handlers = listeners.get(event);
  const index = handlers.indexOf(handler);
  if (index !== -1) {
    handlers.splice(index, 1);
  }
}

export function emit(event, payload) {
  if (!listeners.has(event)) return;
  listeners.get(event).forEach(handler => {
    try {
      handler(payload);
    } catch (error) {
      console.error(`Error in event handler for "${event}":`, error);
    }
  });
}

export function clear() {
  listeners.clear();
}
