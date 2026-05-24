---
name: quiz-quality-check
description: Reviews quiz questions for understanding depth, plausible distractors, and correct answer keys. Use when reviewing quiz quality, auditing concept questions, or validating quiz data before shipping a page.
disable-model-invocation: true
---

# Quiz Quality Check

Review the quiz in the target `*-data.js` file against these standards.

## Standards

- 2–4 questions (min 2, max 4)
- Each question tests a *distinct* idea (not paraphrases)
- No trick questions — tests understanding, not exact wording recall
- `explanation` is mandatory and adds information beyond "correct/incorrect"
- Distractors are plausible (reader must have understood to choose correctly)
- `correct` index matches the intended answer
- Difficulty matches concept complexity

## Output

Pass/fail per question with specific feedback. If all pass: "Quiz is solid — ready to ship."

## Example

```
Concept: baseline
File: site/js/topics/rag/baseline-data.js
```
