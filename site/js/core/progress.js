/**
 * Progress tracking via localStorage.
 * Structure: intuitive:progress:{topicId} = { conceptSlug: { sectionsRead: [], quizPassed: bool } }
 */

import { on } from './eventbus.js';

const STORAGE_KEY_PREFIX = 'intuitive:progress:';

/**
 * Initialize progress tracking for a concept page.
 * Call once per page load with the topic id and concept slug.
 */
export function initProgress(topicId, conceptSlug) {
  const key = STORAGE_KEY_PREFIX + topicId;

  // Listen for quiz:passed event
  on('quiz:passed', ({ conceptSlug: slug }) => {
    markQuizPassed(topicId, slug);
  });

  // Mark current sections as visited on scroll
  document.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('[data-section-id]');
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.5 && rect.bottom > 0) {
        const sectionId = section.getAttribute('data-section-id');
        markSectionRead(topicId, conceptSlug, sectionId);
      }
    });
  });
}

/**
 * Mark a section as read in localStorage.
 */
export function markSectionRead(topicId, conceptSlug, sectionId) {
  const key = STORAGE_KEY_PREFIX + topicId;
  const progress = getTopicProgress(topicId);

  if (!progress[conceptSlug]) {
    progress[conceptSlug] = { sectionsRead: [], quizPassed: false };
  }

  if (!progress[conceptSlug].sectionsRead.includes(sectionId)) {
    progress[conceptSlug].sectionsRead.push(sectionId);
  }

  localStorage.setItem(key, JSON.stringify(progress));
}

/**
 * Mark a quiz as passed for a concept.
 */
export function markQuizPassed(topicId, conceptSlug) {
  const key = STORAGE_KEY_PREFIX + topicId;
  const progress = getTopicProgress(topicId);

  if (!progress[conceptSlug]) {
    progress[conceptSlug] = { sectionsRead: [], quizPassed: false };
  }

  progress[conceptSlug].quizPassed = true;
  localStorage.setItem(key, JSON.stringify(progress));

  // Update progress ring display if it exists
  updateProgressRing(topicId);
}

/**
 * Get all progress for a topic.
 */
export function getTopicProgress(topicId) {
  const key = STORAGE_KEY_PREFIX + topicId;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : {};
}

/**
 * Get progress for a specific concept.
 */
export function getConceptProgress(topicId, conceptSlug) {
  const progress = getTopicProgress(topicId);
  return progress[conceptSlug] || { sectionsRead: [], quizPassed: false };
}

/**
 * Calculate overall topic completion as a percentage.
 * Completion = (concepts with quiz passed / total concepts) * 100
 */
export function getTopicCompletion(topicId, totalConcepts) {
  const progress = getTopicProgress(topicId);
  const passed = Object.values(progress).filter(p => p.quizPassed).length;
  return Math.round((passed / totalConcepts) * 100);
}

/**
 * Update the visual progress ring for a topic.
 */
function updateProgressRing(topicId) {
  const ring = document.querySelector(`[data-progress-ring="${topicId}"]`);
  if (!ring) return;

  // Count total concepts by looking at the registry or sidebar
  const conceptLinks = ring.closest('[data-concept-count]')?.getAttribute('data-concept-count') || 1;
  const completion = getTopicCompletion(topicId, parseInt(conceptLinks));

  // Update SVG circle stroke
  const circle = ring.querySelector('circle[data-progress-stroke]');
  if (circle) {
    const circumference = 2 * Math.PI * 45; // r = 45
    const offset = circumference * (1 - completion / 100);
    circle.style.strokeDashoffset = offset;
  }

  // Update percentage text
  const text = ring.querySelector('text[data-progress-text]');
  if (text) {
    text.textContent = `${completion}%`;
  }
}

/**
 * Clear all progress for a topic (for testing).
 */
export function clearTopicProgress(topicId) {
  const key = STORAGE_KEY_PREFIX + topicId;
  localStorage.removeItem(key);
  updateProgressRing(topicId);
}

/**
 * Clear all progress across all topics (for testing).
 */
export function clearAllProgress() {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(STORAGE_KEY_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
}
