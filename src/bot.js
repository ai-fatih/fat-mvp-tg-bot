import 'dotenv/config'
import TelegramBot from 'node-telegram-bot-api'
// --- Подключаем Firebase ---
import { createOrUpdateUser, saveUserMessage } from './firebase.js';

// Инициализация бота
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  polling: true, // бот получает апдейты от Telegram
});

// ===== Основные обработчики =====

// 1. Команда /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  // Сохраняем или обновляем пользователя
  await createOrUpdateUser({
    telegramId: chatId,
    username: msg.from.username || msg.from.first_name,
  });

  bot.sendMessage(
    chatId,
    `Привет, ${msg.from.first_name || 'коллега'}!  
Я помогу разобраться с типовыми вопросами по StoreHouse Pro.

Напиши вопрос в свободной форме — и я постараюсь подсказать решение.
  `);
});

// 2. Любой текст пользователя
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;

  // Игнорируем /start — уже обработан
  if (msg.text && !msg.text.startsWith("/start")) {
    const userQuestion = msg.text;

    // 1) Сохраняем/обновляем пользователя
    await createOrUpdateUser({
      telegramId: chatId,
      username: msg.from.username || msg.from.first_name,
    });

    // 2) Сохраняем сообщение пользователя в Firestore
    await saveUserMessage({
      telegramId: chatId,
      text: userQuestion,
    });

    // 3) Обработка текста (MVP)
    const response = await processUserText(userQuestion);

    bot.sendMessage(chatId, response);
  }
});

// ===== Заготовка функции обработки текстов =====
async function processUserText(text) {
  // На будущее — блок классификации, поиска по базе, AI
  // Пока просто возвращает, что получил
  return `Получил вопрос: "${text}"

Работаю над полноценным обработчиком.  
На этом этапе бот будет учиться понимать типовые проблемы StoreHouse.;
`}

// ===== Обработка ошибок =====
bot.on("polling_error", console.error);

console.log("Bot is running...");