import TelegramBot from 'node-telegram-bot-api';
import { config } from './config.js';
import { startHandler } from './handlers/startHandler.js';
import { messageHandler } from './handlers/messageHandler.js';
import { setupCallbackHandler } from './handlers/callbackHandler.js'; 

//Создаётся экземпляр Telegram‑бота с токеном из .env.
export const bot = new TelegramBot(config.TELEGRAM_BOT_TOKEN, { polling: true });
//Настраиваются слушатели:
bot.onText(/\/start/, (msg) => startHandler(bot, msg)); 

bot.on("message", (msg) => messageHandler(bot, msg));

setupCallbackHandler(bot);

//Запускается polling (постоянное ожидание сообщений).
bot.on("polling_error", (err) => console.error("[POLLING ERROR]", err));

//Результат: бот онлайн и ждёт команд.
console.log("Bot is running...");
  