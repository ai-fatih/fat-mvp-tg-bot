// /utils/telegram/chatUtils.js
import { getState } from '../state/stateHelpers.js';
import { safeSend, safeEdit } from './safeSend.js';
import { clearServiceMessages } from './clearServiceMessages.js';
import { fmt, headers } from './formatMessage.js';
import { logger } from '../helpers/logger.js';
import { keyboards } from './keyboards.js';

/**
 * Обновление/отправка списка вопросов пользователя
 *
 * @param {object} bot - экземпляр TelegramBot
 * @param {number|string} chatId - ID чата
 * @param {boolean} [deleteOld=true] - удалять старые служебные сообщения
 */
export async function updateQuestionsList(bot, chatId, deleteOld = true) {
    const state = getState(chatId);
    const questions = state.questions || [];

    if (questions.length >= 20) {
        logger.warn(`[QUESTIONS] Достигнут лимит 20 вопросов для chatId=${chatId}`);
        return false;
    }

    // Формируем текст сообщения
    let text = `${headers.questions()} (${questions.length} из 20)\n\n`;
    questions.forEach(q => {
        text += `${fmt.italic(`${q.id}. ${q.question}`)}\n`;
        if (q.answer) text += `Ответ: ${fmt.mono(q.answer)}\n\n`;
    });
    text += `\n${headers.waiting()}`;

   

    try {
        if (state.questionsMsgId) {
            // Редактируем существующее сообщение
            await safeEdit(bot, chatId, state.questionsMsgId, text, { reply_markup: keyboards.questionsList({ allowEdit: true, allowClear: false }) });
            logger.debug(`[QUESTIONS] Список обновлён (ID: ${state.questionsMsgId})`);
        } else {
            // Отправляем новое сообщение
            const msg = await safeSend(bot, chatId, text, { reply_markup: keyboards.questionsList({ allowEdit: true, allowClear: false }) });

            state.questionsMsgId = msg.message_id;
            logger.debug(`[QUESTIONS] Новый список (ID: ${msg.message_id})`);
        }

        // Очистка старых служебных сообщений
        if (deleteOld) {
            await clearServiceMessages(bot, chatId);
        }

    } catch (err) {
        logger.error(`[QUESTIONS] Ошибка обновления списка для chatId=${chatId}: ${err.message}`);
    }
}

/**
 * Пример функции добавления вопроса и обновления списка
 *
 * @param {object} bot - экземпляр TelegramBot
 * @param {number|string} chatId - ID чата
 * @param {string} questionText - текст вопроса
 */
export async function addQuestionAndUpdate(bot, chatId, questionText) {
    const state = getState(chatId);
    const newId = (state.questions?.length || 0) + 1;

    // Добавляем вопрос
    state.questions.push({ id: newId, question: questionText });
    logger.debug(`[QUESTIONS] Добавлен вопрос ${newId} для chatId=${chatId}`);

    // Обновляем список в чате
    await updateQuestionsList(bot, chatId);
}
