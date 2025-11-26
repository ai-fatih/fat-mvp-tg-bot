// src/bot/index.js — инициализация бота и регистрация хендлеров, без прямого вызова
import { config } from '../config/config.js';
import { botConfig } from './botConfig.js';
import { createBot } from './bot.js';
import { startHandler } from './handlers/startHandler.js';
import { messageHandler } from './handlers/messageHandler.js';
import { setupCallbackHandler } from './handlers/callbackHandler.js';

// Создание бота
export const bot = createBot(config.TELEGRAM_BOT_TOKEN, botConfig);

// Регистрация хендлеров
bot.onText(/\/start/, (msg) => startHandler(bot, msg));
bot.on("message", (msg) => messageHandler(bot, msg));
setupCallbackHandler(bot);

// Логирование ошибок
bot.on("polling_error", (err) => console.error("[POLLING ERROR]", err));
