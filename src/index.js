// src/index.js — точка входа всего приложения (инициализация, запуск бота, сервисов).
import 'dotenv/config';
import { config } from './config/config.js';
import { ensureTOC } from './pdf/toc.ensure.js';

(async () => {
  for (const pdf of config.pdfs) {
    await ensureTOC(pdf);
  }

  await import('./bot/index.js');

  console.log('Application started...');
})();


// планирую добавить Database watcher и cron задачи в проект