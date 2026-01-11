// src/config/default.js

export const DEFAULTS = {
  DOCS_URL: 'https://docs.rkeeper.ru/sh5/',
  ai: {
    enabled: true,
    provider: 'openrouter',
    openrouter: {
      url: 'https://openrouter.ai/api/v1/chat/completions',
      model: 'deepseek/deepseek-r1-0528:free',
      temperature: 0.2
    }
  },
  pdfs: [
    {
      id: 'storehouse5',
      title: 'Store House Pro',
      path: 'src/data/sh5.pdf',
      toc: {
        pageFrom: 3,
        pageTo: 25
      }
    }
  ]
};
