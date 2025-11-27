/**
 * wait — универсальная пауза
 * Используется для:
 *   - повторных попыток отправки сообщений
 *   - ожидания между действиями
 *   - имитации задержки для асинхронных процессов
 *
 * @param {number} ms — время в миллисекундах
 * @returns {Promise<void>}
 *
 * Пример:
 *   await wait(1000); // пауза 1 секунда
 */
export const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * waitRandom — случайная задержка
 * Используется, когда нужно добавить случайность, например для имитации "человеческой" реакции бота
 *
 * @param {number} min — минимальная пауза
 * @param {number} max — максимальная пауза
 * @returns {Promise<void>}
 *
 * Пример:
 *   await waitRandom(500, 1500); // пауза от 0.5 до 1.5 секунды
 */
export const waitRandom = (min, max) => {
    const ms = Math.floor(Math.random() * (max - min + 1)) + min;
    return wait(ms);
};

 
export async function botTyping(bot, chatId, duration = 2000) {
    const interval = 4000; // Telegram сбрасывает через ~5 секунд
    const cycles = Math.ceil(duration / interval);

    for (let i = 0; i < cycles; i++) {
        try {
            await bot.sendChatAction(chatId, 'typing');
        } catch (err) {
            console.warn('[TYPING] Ошибка sendChatAction:', err.message);
        }
        await wait(interval);
    }
}
 