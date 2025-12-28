export function determineStatus(s = {}) {
  const q = Array.isArray(s.questions) ? s.questions : [];

  // 1️⃣ Нет вопросов
  if (q.length === 0) {
    return 'EMPTY';
  }

  // 2️⃣ Все вопросы готовы
  const allReady = q.every(x => x.status === 'done');
  if (allReady) {
    return 'COMPLETE';
  }

/*   const anyInProcess = q.some(x => x.status === 'process');
  if (anyInProcess) return 'SENT_TO_MANAGER'; */
  
  // 3️⃣ Достигнут лимит
  const limit = s.maxQuestions ?? 20;
  if (q.length >= limit) {
    return 'LIMIT_REACHED';
  }

  // 4️⃣ Сбор вопросов
  return 'COLLECTING';
}
