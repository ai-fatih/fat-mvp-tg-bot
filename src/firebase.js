// Firebase SDK — используем модульный вариант
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
  increment
} from "firebase/firestore"; 

// -------------------------------
// 1. Конфиг Firebase
// -------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyAn7onVw37JV9m2eHBnWrrFOY0Vra8FBaY",
  authDomain: "storehouse-e80f2.firebaseapp.com",
  projectId: "storehouse-e80f2",
  storageBucket: "storehouse-e80f2.firebasestorage.app",
  messagingSenderId: "831198914942",
  appId: "1:831198914942:web:d62474887446d621c52b2f",
  measurementId: "G-2361VFMN87"
};

// -------------------------------
// 2. Инициализация приложения
// -------------------------------
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); 

// -------------------------------
// 3. USERS: создание или обновление
// -------------------------------
export async function createOrUpdateUser({
  telegramId,
  username,
  role = "бухгалтер",
  storeHouseVersion = "6.3.870"
}) {
  const userRef = doc(db, "users", telegramId.toString());
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // Создаём нового пользователя
    await setDoc(userRef, {
      telegramId,
      username: username || null,
      role,
      status: "active",
      questionCount: 0,
      storeHouseVersion,
      dateRegistered: serverTimestamp(),
      lastInterActionAt: serverTimestamp(),
    });
    return "created";
  } else {
    // Обновляем lastInterActionAt
    await updateDoc(userRef, {
      lastInterActionAt: serverTimestamp(),
    });
    return "updated";
  }
}

// -------------------------------
// 4. MESSAGES: запись вопроса
// -------------------------------
export async function saveUserMessage({
  telegramId,
  text,
  status = "new",
  answerFromBot = "",
  attachments = [""],
  directions = "incoming",
  errorCode = "",
  isEscalated = false
}) {
  const messagesRef = collection(db, "message");

  await addDoc(messagesRef, {
    userId: telegramId.toString(),
    telegramId,
    text,
    status,
    answerFromBot,
    attachments,
    directions,
    errorCode,
    isEscalated,
    createdAt: serverTimestamp()
  });

  // Увеличиваем счётчик вопросов пользователя атомарно
  const userRef = doc(db, "users", telegramId.toString());
  await updateDoc(userRef, {
    questionCount: increment(1)
  });
}

// -------------------------------
// Экспорт db, если понадобится
// -------------------------------
export { db };