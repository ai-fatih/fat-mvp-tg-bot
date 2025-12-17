export function determineStatus(s = {}) {
  const q = s.questions || [];
  if (s.status) return s.status;
  
  if (q.length >= 2) return 'LIMIT_REACHED';

  const allReady = q.every(x => x.status === 'готово');
  if (allReady) return 'COMPLETE';

  return 'COLLECTING';
}