// Firebase SDK — используем модульный вариант
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; 
import 'dotenv/config'
// -------------------------------
// 1. Конфиг Firebase
// -------------------------------
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain:  process.env.FIREBASE_AUTH_DOMAIN,
  projectId:  process.env.FIREBASE_PROJECT_ID,
  storageBucket:  process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId:  process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId:  process.env.FIREBASE_APP_ID,
  measurementId:  process.env.FIREBASE_MEASUREMENT_ID
};

// Валидация обязательных полей
const requiredFields = ['FIREBASE_API_KEY', 'FIREBASE_PROJECT_ID'];
const missingFields = requiredFields.filter(field => !process.env[field]);

if (missingFields.length > 0) {
  throw new Error(
    `Отсутствуют обязательные переменные окружения Firebase: ${missingFields.join(', ')}`
  );
}

// -------------------------------
// 2. Инициализация приложения
// -------------------------------
let app;
let db;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log('✅ Firebase успешно инициализирован');
} catch (error) {
  console.error('❌ Ошибка инициализации Firebase:', error.message);
  throw error;
}
 
export { db };