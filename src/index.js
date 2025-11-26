// src/index.js — точка входа всего приложения (инициализация, запуск бота, сервисов).
 
import 'dotenv/config';  // загружаем .env
import './bot/index.js';  // запускаем бота

console.log("Application started...");

// планирую добавить Database watcher и cron задачи в проект