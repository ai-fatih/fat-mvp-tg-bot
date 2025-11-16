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
} from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// -------------------------------
// 1. Конфиг Firebase
// -------------------------------
// Эти данные копируешь из Firebase → Project settings → "Your apps" → Web app → Config
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

// -------------------------------
// 3. Инициализация Firestore
// -------------------------------
const db = getFirestore(app);

const analytics = getAnalytics(app);
// -------------------------------
// 4. USERS: создание или обновление
// -------------------------------
export async function createOrUpdateUser({ telegramId, username }) {
  const userRef = doc(db, "users", telegramId.toString());
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // Создаём нового пользователя
    await setDoc(userRef, {
      telegramId,
      username: username || null,
      role: "unknown",
      status: "active",
      questionCount: 0,
      dateRegistered: serverTimestamp(),
      lastInteractionAt: serverTimestamp(),
    });
    return "created";
  } else {
    // Обновляем lastInteractionAt
    await updateDoc(userRef, {
      lastInteractionAt: serverTimestamp(),
    });
    return "updated";
  }
}

// -------------------------------
// 5. MESSAGES: запись вопроса
// -------------------------------
export async function saveUserMessage({
  telegramId,
  text,
  status = "new"
}) {
  const messagesRef = collection(db, "messages");

  await addDoc(messagesRef, {
    telegramId,
    text,
    status,
    createdAt: serverTimestamp(),
  });

  // Также увеличиваем счётчик вопросов у пользователя
  const userRef = doc(db, "users", telegramId.toString());
  await updateDoc(userRef, {
    questionCount: (await getDoc(userRef)).data().questionCount + 1
  });
}

// -------------------------------
// Экспортируем db, если понадобится ещё где-нибудь
// -------------------------------
export { db };