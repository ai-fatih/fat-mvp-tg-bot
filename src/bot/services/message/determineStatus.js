export function determineStatus(s) {
  const questions = s.questions || [];

  // 0. Нет вопросов
  if (questions.length === 0) {
    return 'EMPTY';
  }

  // 1. Только что получен новый вопрос — менеджер не ответил
  if (s.lastUserQuestion && !s.lastUserQuestion.answer) {
    return 'AWAITING_MANAGER';
  }

  const allAnswered = questions.every(q => q.answer);
  const hasUnanswered = questions.some(q => !q.answer);

  // 2. Все вопросы обработаны
  if (allAnswered) {
    return 'COMPLETE';
  }

  // 3. Имеются вопросы без ответа — идёт сбор/обработка
  if (hasUnanswered) {
    return 'COLLECTING';
  }

  // fallback на случай неизвестных ситуаций
  return 'COLLECTING';
}