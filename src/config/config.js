import { ENV } from './environment.js';
import { DEFAULTS } from './default.js';
import { CONSTANTS } from './constants.js';
import { botConfig } from '../bot/botConfig.js';

export const config = {
  NODE_ENV: ENV.NODE_ENV,
  DOCS_URL: ENV.DOCS_URL,
  TELEGRAM_BOT_TOKEN: ENV.TELEGRAM_BOT_TOKEN,

  ai: {
    enabled: ENV.AI_ASSIST_ENABLED ?? DEFAULTS.ai.enabled,
    provider: DEFAULTS.ai.provider,

    openrouter: {
      apiKey: ENV.OPENROUTER_API_KEY,
      url: DEFAULTS.ai.openrouter.url,
      model: DEFAULTS.ai.openrouter.model,
      temperature: DEFAULTS.ai.openrouter.temperature
    }
  },

  CONSTANTS,
  botConfig
};

/* =========================
   🔎 ВАЛИДАЦИЯ КОНФИГА
   ========================= */

// 🔴 1. Критично для всего приложения
if (!config.TELEGRAM_BOT_TOKEN) {
  if (config.NODE_ENV === 'production') {
    throw new Error('❌ TELEGRAM_BOT_TOKEN обязателен в production');
  }

  console.warn(
    '⚠️ TELEGRAM_BOT_TOKEN не задан. Бот не запустится.'
  );
}

// 🟡 2. Некритично — только для AI
if (config.ai.enabled) {
  if (!config.ai.openrouter.apiKey) {
    console.warn(
      '⚠️ AI включён, но OPENROUTER_API_KEY не задан. AI отключён.'
    );
    config.ai.enabled = false;
  }

  if (!config.ai.openrouter.url) {
    console.warn(
      '⚠️ AI: не задан URL OpenRouter. AI отключён.'
    );
    config.ai.enabled = false;
  }

  if (!config.ai.openrouter.model) {
    console.warn(
      '⚠️ AI: не указана модель. AI отключён.'
    );
    config.ai.enabled = false;
  }
}
