/** Emit when user interacts with a verify playground. */
export function markPlaygroundUsed(id) {
  document.dispatchEvent(new CustomEvent('dci:playground-used', { detail: { id } }));
}
