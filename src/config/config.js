// src/config/config.js
import { ENV } from './environment.js';
import { CONSTANTS } from './constants.js';
import { botConfig } from '../bot/botConfig.js';

/**
 * Основной конфиг приложения
 */
export const config = {
  ...ENV,
  CONSTANTS, 
  botConfig, // опционально, если хочешь использовать botConfig через глобальный config
};

// Валидация критических параметров
if (!config.TELEGRAM_BOT_TOKEN) {
  console.warn(
    '⚠️ Предупреждение: TELEGRAM_BOT_TOKEN не задан в .env. Бот не сможет запуститься!'
  );
}

if (config.NODE_ENV === 'production' && !config.TELEGRAM_BOT_TOKEN) {
  throw new Error('В продакшене обязателен TELEGRAM_BOT_TOKEN!');
}
