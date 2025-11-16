require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

// Инициализация бота
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  polling: true, // бот получает апдейты от Telegram
});

/*
  ===== Основные обработчики =====
  Здесь мы ловим типы сообщений от пользователя.
*/

// 1. Команда /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    `Привет, ${msg.from.first_name || 'коллега'}!  
Я помогу разобраться с типовыми вопросами по StoreHouse Pro/.

Напиши вопрос в свободной форме — и я постараюсь подсказать решение.
  `);
});

// 2. Любой текст пользователя
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;

  // Если это текст → обрабатываем
  if (msg.text && !msg.text.startsWith("/start")) {
    const userQuestion = msg.text;

    // Пока логика простая — заглушка для MVP
    // Позже сюда добавим:
    // - быстрые типовые ответы,
    // - подключение к базе знаний,
    // - LLM-подсказки,
    // - обработку изображений и т.д.
    const response = await processUserText(userQuestion);

    bot.sendMessage(chatId, response);
  }
});

/*
  ===== Заготовка функции обработки текстов =====
  Сейчас она примитивная (MVP), но дальше мы расширим функционал:
  - распознавание категории проблемы
  - быстрые решения по SH
  - запросы к базе знаний docs.rkeeper.ru
  - ответы с использованием AI
*/
async function processUserText(text) {
  // На будущее — блок классификации, поиска по базе, AI
  // Пока просто возвращает, что получил
  return `Получил вопрос: "${text}"

Работаю над полноценным обработчиком.  
На этом этапе бот будет учиться понимать типовые проблемы StoreHouse.;
`}

/*
  ===== Обработка ошибок =====
*/
bot.on("polling_error", console.error);

console.log("Bot is running...");