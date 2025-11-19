import 'dotenv/config';

/**
 * Конфигурация приложения
 * @type {Object}
 */
export const config = {
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  DOCS_URL: process.env.DOCS_URL || 'https://docs.rkeeper.ru/sh5/',
  NODE_ENV: process.env.NODE_ENV || 'development',
};

// Валидация критических параметров
if (!config.TELEGRAM_BOT_TOKEN) {
  console.warn(
    '⚠️ Предупреждение: TELEGRAM_BOT_TOKEN не задан в .env. Бот не сможет запуститься!'
  );
}

// Дополнительно: проверка режима
if (config.NODE_ENV === 'production' && !config.TELEGRAM_BOT_TOKEN) {
  throw new Error('В продакшене обязателен TELEGRAM_BOT_TOKEN!');
}
