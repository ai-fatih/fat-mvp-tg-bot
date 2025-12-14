/**
 * Нормализация текста
 */
export function normalize(text) {
    return text
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  /**
   * Простая similarity (0..1)
   * MVP-версия без библиотек
   */
  export function similarity(a = '', b = '') {
    const sa = new Set(normalize(a).split(' '));
    const sb = new Set(normalize(b).split(' '));
  
    const intersection = [...sa].filter(x => sb.has(x)).length;
    const union = new Set([...sa, ...sb]).size;
  
    return union === 0 ? 0 : intersection / union;
  }
  
  /**
   * Примитивный анти-спам
   */
  export function looksLikeSpam(text) {
    const spamPatterns = [
      /^.{1,3}$/,
      /(.)\1{5,}/,        // ааааааа
      /https?:\/\//,      // ссылки
    ];
  
    return spamPatterns.some(r => r.test(text));
  }
  
  /**
   * Извлечение тегов
   */
  export function extractTags(text) {
    const tags = [];
  
    if (/накладн|приход/i.test(text)) tags.push('накладные');
    if (/заявк/i.test(text)) tags.push('заявки');
    if (/товар|номенкл/i.test(text)) tags.push('товары');
    if (/отчёт|отчет/i.test(text)) tags.push('отчёты');
  
    return tags;
  }
  
  /**
   * Основная категория
   */
  export function detectCategory(text) {
    if (/накладн|приход/i.test(text)) return 'WAREHOUSE';
    if (/заявк/i.test(text)) return 'ORDERS';
    if (/отчёт|отчет/i.test(text)) return 'REPORTS';
    return null;
  }
  
  /**
   * Предупреждения (soft-валидация)
   */
  export function detectWarnings(text) {
    const warnings = [];
  
    if (text.length > 500) {
      warnings.push('LONG_TEXT');
    }
  
    if (!/[?]/.test(text)) {
      warnings.push('NO_QUESTION_MARK');
    }
  
    return warnings;
  }
  