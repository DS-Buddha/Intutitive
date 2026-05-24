/**
 * Quiz Component
 * Renders multiple-choice questions and tracks answers.
 * Emits quiz:passed event on successful completion (≥75%).
 */

import { emit } from '../core/eventbus.js';

/**
 * Mount all quiz containers on the page.
 * Accepts either { quizId: questions[] } or a flat questions array (single quiz).
 */
export function mountAll(quizzes = {}) {
  const containers = document.querySelectorAll('[data-component="quiz"]');
  containers.forEach(container => {
    const quizId = container.getAttribute('data-quiz-id');
    let quizData = quizzes[quizId];

    if (!quizData && Array.isArray(quizzes)) {
      quizData = quizzes;
    }

    renderQuiz(container, quizId, quizData || []);
  });
}

/**
 * Render a quiz for a single concept.
 */
function renderQuiz(container, quizId, questions) {
  if (!questions || questions.length === 0) {
    container.innerHTML = '<p class="text-secondary">No quiz available for this concept.</p>';
    return;
  }

  const quiz = document.createElement('div');
  quiz.className = 'quiz';
  quiz.setAttribute('data-quiz-id', quizId);

  const progress = document.createElement('div');
  progress.className = 'quiz-progress';
  progress.innerHTML = `
    <div class="quiz-progress__bar"><div class="quiz-progress__fill" data-quiz-fill></div></div>
    <span class="quiz-progress__text" data-quiz-count>0 / ${questions.length} answered</span>
  `;
  quiz.appendChild(progress);

  questions.forEach((q, idx) => {
    quiz.appendChild(createQuestionElement(q, idx));
  });

  const submitBtn = document.createElement('button');
  submitBtn.className = 'btn-primary';
  submitBtn.style.marginTop = 'var(--space-4)';
  submitBtn.style.width = '100%';
  submitBtn.style.minHeight = '2.75rem';
  submitBtn.textContent = 'Check my answers';
  submitBtn.addEventListener('click', () => {
    const results = scoreQuiz(quiz, questions);
    showResults(container, results, quizId, questions);
  });

  quiz.appendChild(submitBtn);
  container.innerHTML = '';
  container.appendChild(quiz);

  quiz.addEventListener('change', () => updateAnswerProgress(quiz, questions.length));
}

function updateAnswerProgress(quiz, total) {
  const answered = quiz.querySelectorAll('input[type="radio"]:checked').length;
  const fill = quiz.querySelector('[data-quiz-fill]');
  const count = quiz.querySelector('[data-quiz-count]');
  if (fill) fill.style.width = `${(answered / total) * 100}%`;
  if (count) count.textContent = `${answered} / ${total} answered`;
}

function createQuestionElement(question, questionIdx) {
  const div = document.createElement('div');
  div.className = 'question-block';
  div.setAttribute('data-question', questionIdx);

  const qText = document.createElement('h4');
  qText.textContent = `${questionIdx + 1}. ${question.question}`;
  div.appendChild(qText);

  const optionsDiv = document.createElement('div');
  optionsDiv.className = 'quiz-options';

  question.options.forEach((option, optIdx) => {
    const label = document.createElement('label');
    label.className = 'quiz-option';

    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = `q${questionIdx}`;
    radio.value = optIdx;

    const optText = document.createElement('span');
    optText.className = 'quiz-option__text';
    optText.textContent = option;

    label.appendChild(radio);
    label.appendChild(optText);
    optionsDiv.appendChild(label);
  });

  div.appendChild(optionsDiv);

  const explDiv = document.createElement('div');
  explDiv.className = `quiz-explanation explanation-q${questionIdx}`;
  div.appendChild(explDiv);

  return div;
}

function scoreQuiz(quiz, questions) {
  let correct = 0;
  let answered = 0;

  questions.forEach((question, qIdx) => {
    const input = quiz.querySelector(`input[name="q${qIdx}"]:checked`);
    if (input) {
      answered++;
      if (parseInt(input.value, 10) === question.correct) {
        correct++;
      }
    }
  });

  const percentage = questions.length > 0
    ? Math.round((correct / questions.length) * 100)
    : 0;

  return {
    correct,
    total: questions.length,
    answered,
    percentage,
    passed: questions.length > 0 && (correct / questions.length) >= 0.75,
    allAnswered: answered === questions.length,
  };
}

function showResults(container, results, quizId, questions) {
  const quiz = container.querySelector('.quiz');

  if (!results.allAnswered) {
    let warn = container.querySelector('[data-quiz-warn]');
    if (!warn) {
      warn = document.createElement('p');
      warn.setAttribute('data-quiz-warn', 'true');
      warn.style.color = 'var(--color-accent-warning)';
      warn.style.textAlign = 'center';
      warn.style.marginTop = 'var(--space-4)';
      container.appendChild(warn);
    }
    warn.textContent = `Please answer all ${results.total} questions before checking.`;
    return;
  }

  container.querySelector('[data-quiz-warn]')?.remove();

  questions.forEach((question, qIdx) => {
    const input = quiz.querySelector(`input[name="q${qIdx}"]:checked`);
    const selected = input ? parseInt(input.value, 10) : -1;
    const isCorrect = selected === question.correct;
    const explDiv = quiz.querySelector(`.explanation-q${qIdx}`);

    explDiv.className = `quiz-explanation explanation-q${qIdx} visible ${isCorrect ? 'quiz-explanation--correct' : 'quiz-explanation--incorrect'}`;
    explDiv.innerHTML = `
      <p style="margin:0;font-weight:600;color:${isCorrect ? 'var(--color-accent-secondary)' : 'var(--color-accent-danger)'}">
        ${isCorrect ? '✓ Correct' : '✗ Not quite'}
      </p>
      <p style="margin:var(--space-2) 0 0 0;font-size:var(--text-sm);color:var(--color-text-secondary)">
        ${question.explanation}
      </p>
    `;

    const block = quiz.querySelector(`[data-question="${qIdx}"]`);
    if (block) {
      block.style.borderColor = isCorrect
        ? 'var(--color-accent-secondary)'
        : 'var(--color-accent-danger)';
    }
  });

  let resultDiv = container.querySelector('[data-quiz-result]');
  if (!resultDiv) {
    resultDiv = document.createElement('div');
    resultDiv.setAttribute('data-quiz-result', 'true');
    container.appendChild(resultDiv);
  }

  resultDiv.className = `quiz-result ${results.passed ? 'quiz-result--passed' : 'quiz-result--failed'}`;
  resultDiv.innerHTML = `
    <div class="quiz-result__score">${results.correct} / ${results.total}</div>
    <div class="quiz-result__message">${results.percentage}% — ${
      results.passed
        ? 'You got it! This concept is mastered.'
        : 'Review the explanations above and try again (need 75%).'
    }</div>
    <div class="quiz-result__actions">
      ${results.passed
        ? '<a href="index.html" class="btn-secondary">Back to RAG hub</a>'
        : '<button type="button" class="btn-secondary" data-retry-quiz>Try again</button>'
      }
    </div>
  `;

  if (!results.passed) {
    resultDiv.querySelector('[data-retry-quiz]')?.addEventListener('click', () => {
      resultDiv.remove();
      quiz.querySelectorAll('input[type="radio"]').forEach(r => { r.checked = false; });
      quiz.querySelectorAll('.quiz-explanation').forEach(e => {
        e.className = e.className.replace(' visible', '').replace('quiz-explanation--correct', '').replace('quiz-explanation--incorrect', '');
        e.innerHTML = '';
      });
      quiz.querySelectorAll('.question-block').forEach(b => { b.style.borderColor = ''; });
      updateAnswerProgress(quiz, questions.length);
    });
  }

  if (results.passed) {
    emit('quiz:passed', { conceptSlug: quizId });
  }

  resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

export function mountQuiz(conceptSlug, quizData) {
  if (!quizData) return;
  mountAll({ [conceptSlug]: quizData });
}
