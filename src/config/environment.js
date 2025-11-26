// src/config/environment.js
import 'dotenv/config';
import { DEFAULTS } from './default.js';

export const ENV = {
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || DEFAULTS.TELEGRAM_BOT_TOKEN,
  DOCS_URL: process.env.DOCS_URL || DEFAULTS.DOCS_URL,
  NODE_ENV: process.env.NODE_ENV || DEFAULTS.NODE_ENV,
};
