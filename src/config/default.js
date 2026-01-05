// src/config/default.js

export const DEFAULTS = {
  DOCS_URL: 'https://docs.rkeeper.ru/sh5/',
  ai: {
    enabled: false,
    provider: 'openrouter',
    openrouter: {
      url: 'https://openrouter.ai/api/v1/chat/completions',
      model: 'deepseek/deepseek-r1-0528:free',
      temperature: 0.2
    }
  }
};
