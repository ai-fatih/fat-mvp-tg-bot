/**
 * Определяет текущий статус сервисного сообщения
 * @param {object} s - состояние чата
 * @returns {string} статус (EMPTY, COLLECTING, AWAITING_MANAGER, COMPLETE, LIMIT_REACHED, ERROR, BLOCKED_USER, NEW_FEATURE_ALERT)
 */
export function determineStatus(s) {
  const questions = s.questions || [];

  // 0. Нет вопросов
  if (questions.length === 0) {
    return 'EMPTY';
  }

  // 1. Пользователь заблокирован
  if (s.blocked) {
    return 'BLOCKED_USER';
  }

  // 2. Ошибка добавления вопроса
  if (s.errorAddingQuestion) {
    return 'ERROR';
  }

  // 3. Достигнут лимит вопросов
  if (questions.length >= 20) {
    return 'LIMIT_REACHED';
  }

  // 4. Только что получен новый вопрос — менеджер не ответил
  if (s.lastUserQuestion && !s.lastUserQuestion.ready) {
    return 'AWAITING_MANAGER';
  }

  const allAnswered = questions.every(q => q.ready);
  const hasUnanswered = questions.some(q => !q.ready);

  // 5. Все вопросы обработаны
  if (allAnswered) {
    return 'COMPLETE';
  }

  // 6. Имеются вопросы без ответа — идёт сбор/обработка
  if (hasUnanswered) {
    return 'COLLECTING';
  }

  // fallback на случай неизвестных ситуаций
  return 'COLLECTING';
}
