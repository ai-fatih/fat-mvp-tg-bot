// src/config/environment.js
import 'dotenv/config';
import { DEFAULTS } from './default.js';

export const ENV = {
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || null,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || null,

  DOCS_URL: process.env.DOCS_URL || DEFAULTS.DOCS_URL,
  NODE_ENV: process.env.NODE_ENV || 'development',
  AI_ASSIST_ENABLED: process.env.AI_ASSIST_ENABLED === 'true'
};
