/**
 * Quiz Component
 * Renders multiple-choice questions and tracks answers.
 * Emits quiz:passed event on successful completion (≥75%).
 */

import { emit } from '../core/eventbus.js';

/**
 * Mount all quiz containers on the page.
 */
export function mountAll(quizzes = {}) {
  const containers = document.querySelectorAll('[data-component="quiz"]');
  containers.forEach(container => {
    const quizId = container.getAttribute('data-quiz-id');
    const quizData = quizzes[quizId] || [];
    renderQuiz(container, quizId, quizData);
  });
}

/**
 * Render a quiz for a single concept.
 */
function renderQuiz(container, quizId, questions) {
  if (!questions || questions.length === 0) {
    container.innerHTML = '<p>No quiz available for this concept.</p>';
    return;
  }

  const quiz = document.createElement('div');
  quiz.className = 'quiz';
  quiz.setAttribute('data-quiz-id', quizId);

  questions.forEach((q, idx) => {
    const questionEl = createQuestionElement(q, idx, quizId);
    quiz.appendChild(questionEl);
  });

  // Submit button
  const submitBtn = document.createElement('button');
  submitBtn.className = 'btn-primary';
  submitBtn.style.marginTop = 'var(--space-6)';
  submitBtn.textContent = 'Check answers';

  submitBtn.addEventListener('click', () => {
    const results = scoreQuiz(container, quizId, questions);
    showResults(container, results, quizId, questions);
  });

  const buttonWrapper = document.createElement('div');
  buttonWrapper.style.textAlign = 'center';
  buttonWrapper.appendChild(submitBtn);
  quiz.appendChild(buttonWrapper);

  container.innerHTML = '';
  container.appendChild(quiz);
}

/**
 * Create a question element (question + radio options).
 */
function createQuestionElement(question, questionIdx, quizId) {
  const div = document.createElement('div');
  div.className = 'question-block';
  div.style.marginBottom = 'var(--space-6)';
  div.style.padding = 'var(--space-4)';
  div.style.borderRadius = 'var(--radius-lg)';
  div.style.backgroundColor = 'var(--color-bg-elevated)';

  // Question text
  const qText = document.createElement('h4');
  qText.style.marginTop = '0';
  qText.style.marginBottom = 'var(--space-4)';
  qText.textContent = question.question;
  div.appendChild(qText);

  // Options
  const optionsDiv = document.createElement('div');
  optionsDiv.style.display = 'flex';
  optionsDiv.style.flexDirection = 'column';
  optionsDiv.style.gap = 'var(--space-3)';

  question.options.forEach((option, optIdx) => {
    const label = document.createElement('label');
    label.style.display = 'flex';
    label.style.alignItems = 'center';
    label.style.gap = 'var(--space-2)';
    label.style.cursor = 'pointer';
    label.style.padding = 'var(--space-2)';
    label.style.borderRadius = 'var(--radius-md)';
    label.style.transition = 'background-color var(--duration-fast) var(--ease-out)';

    label.addEventListener('mouseover', () => {
      label.style.backgroundColor = 'var(--color-bg-surface)';
    });

    label.addEventListener('mouseout', () => {
      label.style.backgroundColor = 'transparent';
    });

    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = `q${questionIdx}`;
    radio.value = optIdx;
    radio.style.cursor = 'pointer';

    const optText = document.createElement('span');
    optText.textContent = option;
    optText.style.flex = '1';

    label.appendChild(radio);
    label.appendChild(optText);
    optionsDiv.appendChild(label);
  });

  div.appendChild(optionsDiv);

  // Explanation space (filled on reveal)
  const explDiv = document.createElement('div');
  explDiv.className = `explanation explanation-q${questionIdx}`;
  explDiv.style.marginTop = 'var(--space-4)';
  explDiv.style.padding = 'var(--space-3)';
  explDiv.style.borderRadius = 'var(--radius-md)';
  explDiv.style.display = 'none';
  div.appendChild(explDiv);

  return div;
}

/**
 * Score the quiz by checking selected answers.
 */
function scoreQuiz(container, quizId, questions) {
  const inputs = container.querySelectorAll('input[type="radio"]:checked');
  let correct = 0;

  inputs.forEach((input, idx) => {
    const selected = parseInt(input.value);
    if (selected === questions[idx].correct) {
      correct++;
    }
  });

  return {
    correct,
    total: questions.length,
    percentage: Math.round((correct / questions.length) * 100),
    passed: (correct / questions.length) >= 0.75,
  };
}

/**
 * Show quiz results and reveal explanations.
 */
function showResults(container, results, quizId, questions) {
  const quiz = container.querySelector('.quiz');
  const inputs = quiz.querySelectorAll('input[type="radio"]:checked');

  // Show explanations
  inputs.forEach((input, idx) => {
    const selected = parseInt(input.value);
    const question = questions[idx];
    const explDiv = quiz.querySelector(`.explanation-q${idx}`);
    const isCorrect = selected === question.correct;

    explDiv.style.display = 'block';
    explDiv.style.borderLeft = `4px solid ${isCorrect ? 'var(--color-accent-secondary)' : 'var(--color-accent-danger)'}`;
    explDiv.innerHTML = `
      <p style="margin: 0; font-weight: 600; color: ${isCorrect ? 'var(--color-accent-secondary)' : 'var(--color-accent-danger)'}">
        ${isCorrect ? '✓ Correct' : '✗ Incorrect'}
      </p>
      <p style="margin: var(--space-2) 0 0 0; font-size: var(--text-sm); color: var(--color-text-secondary);">
        ${question.explanation}
      </p>
    `;
  });

  // Show overall results
  let resultDiv = container.querySelector('[data-quiz-result]');
  if (!resultDiv) {
    resultDiv = document.createElement('div');
    resultDiv.setAttribute('data-quiz-result', 'true');
    resultDiv.style.marginTop = 'var(--space-6)';
    resultDiv.style.padding = 'var(--space-4)';
    resultDiv.style.borderRadius = 'var(--radius-lg)';
    resultDiv.style.textAlign = 'center';
    container.appendChild(resultDiv);
  }

  const statusColor = results.passed
    ? 'var(--color-accent-secondary)'
    : 'var(--color-accent-warning)';

  resultDiv.innerHTML = `
    <div style="font-size: var(--text-2xl); font-weight: 700; color: ${statusColor}; margin-bottom: var(--space-2);">
      ${results.correct} / ${results.total} correct
    </div>
    <div style="font-size: var(--text-lg); color: var(--color-text-secondary); margin-bottom: var(--space-4);">
      ${results.percentage}%
    </div>
    <div style="padding: var(--space-3); border-radius: var(--radius-md); background-color: var(--color-bg-elevated);">
      ${results.passed
        ? `<p style="margin: 0; color: var(--color-accent-secondary); font-weight: 600;">🎉 Concept mastered! Moving to next...</p>`
        : `<p style="margin: 0; color: var(--color-accent-warning); font-weight: 600;">Review the concept and try again to reach 75%.</p>`
      }
    </div>
  `;

  // Emit quiz:passed if successful
  if (results.passed) {
    emit('quiz:passed', { conceptSlug: quizId });
    console.log(`Quiz passed for concept: ${quizId}`);
  }
}

/**
 * Mount quiz from data object.
 * Expects format: { conceptSlug: [...questions] }
 */
export function mountQuiz(conceptSlug, quizData) {
  if (!quizData || typeof quizData !== 'object') return;
  const quizzes = { [conceptSlug]: quizData };
  mountAll(quizzes);
}
