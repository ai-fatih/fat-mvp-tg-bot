// src/ai/ai.service.js
import { config } from '../config/index.js';
import { SYSTEM_PROMPT } from './prompts/system.prompt.js';
import { STOREHOUSE_PROMPT } from './prompts/storehouse.prompt.js';

/**
 * Получить ответ от AI
 * @param {string} userQuestion
 * @returns {string|null}
 */
export async function getAIAnswer(userQuestion) {
  
  // 1️⃣ Базовые защиты (самые важные)
  if (!config.ai.enabled) return null;
  if (!userQuestion || typeof userQuestion !== 'string') return null;

  const { openrouter } = config.ai;

  // 2️⃣ Дополнительная защита (на случай если конфиг "поехал")
  if (!openrouter?.apiKey) {
    console.warn('[AI] OPENROUTER_API_KEY отсутствует');
    return null;
  }

  // 3️⃣ Ограничение длины вопроса (Telegram + токены)
  const MAX_LENGTH = config.CONSTANTS.MAX_MESSAGE_LENGTH;
  const safeQuestion =
    userQuestion.length > MAX_LENGTH
      ? userQuestion.slice(0, MAX_LENGTH)
      : userQuestion;

      console.log('[AI] Question:', safeQuestion);

  // 4️⃣ Формирование сообщений для модели
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'system', content: STOREHOUSE_PROMPT },
    { role: 'user', content: safeQuestion }
  ];

  console.log('[AI DEBUG]', {
    apiKeyExists: !!openrouter.apiKey,
    apiKeyLength: openrouter.apiKey?.length,
    apiKeyPreview: openrouter.apiKey?.slice(0, 6)
  });

  
  try { 
    const options = {
      method: 'POST',
      headers: {Authorization:  `Bearer ${openrouter.apiKey}`, 'Content-Type': 'application/json'},
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1-0528:free',
        messages
      })};
 
    // 5️⃣ Запрос к OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', options);
    console.log('[AI response]', response) 

    // 6️⃣ Обработка не-200 ответов
    if (!response.ok) {
      console.error(
        '[AI] OpenRouter error:',
        response.status,
        response.statusText
      );
      return '❌ Не удалось получить ответ от AI.';
    }

    const data = await response.json();
    console.log('[AI RAW DATA]', JSON.stringify(data, null, 2));


    // 7️⃣ Безопасный доступ к ответу
    return data?.choices?.[0]?.message?.content || null;

  } catch (error) {
    console.error('[AI SERVICE ERROR]', error);
    return '❌ AI временно недоступен. Попробуйте позже.';
  }
}
