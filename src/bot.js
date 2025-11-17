import TelegramBot from 'node-telegram-bot-api';
import { TELEGRAM_BOT_TOKEN } from './config.js';
import { startHandler } from './handlers/startHandler.js';
import { messageHandler } from './handlers/messageHandler.js';
import { callbackHandler } from './handlers/callbackHandler.js';

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => startHandler(bot, msg));
bot.on("message", (msg) => messageHandler(bot, msg));
bot.on("callback_query", (query) => callbackHandler(bot, query));

bot.on("polling_error", (err) => console.error("[POLLING ERROR]", err));
console.log("Bot is running...");