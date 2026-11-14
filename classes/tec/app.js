const form = document.getElementById('quiz-form');
const score = document.getElementById('quiz-score');
const answers = JSON.parse(document.getElementById('quiz-key').textContent);

form.addEventListener('submit', event => {
  event.preventDefault();
  let correct = 0;
  let attempted = 0;
  answers.forEach((answer, i) => {
    const field = form.querySelector(`[data-question="${i}"]`);
    const selected = field.querySelector('input:checked');
    const feedback = field.querySelector('.feedback');
    if (!selected) {
      feedback.textContent = 'Not answered.';
      delete feedback.dataset.result;
      return;
    }
    attempted++;
    const ok = Number(selected.value) === answer.correct;
    correct += Number(ok);
    feedback.dataset.result = ok ? 'correct' : 'incorrect';
    feedback.textContent = (ok ? 'Correct. ' : 'Not quite. ') + answer.explanation;
  });
  score.textContent = `${correct} / ${answers.length} correct; ${attempted} answered.`;
});

form.addEventListener('reset', () => {
  form.querySelectorAll('.feedback').forEach(feedback => {
    feedback.textContent = '';
    delete feedback.dataset.result;
  });
  score.textContent = '';
});
