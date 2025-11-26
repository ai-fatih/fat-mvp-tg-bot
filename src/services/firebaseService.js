import { db } from '../firebase.js';
import { collection, doc, setDoc, getDoc, addDoc, query, where, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";

// Создание или обновление пользователя
export async function createOrUpdateUser({ telegramId, username }) {
const userRef = doc(db, "users", String(telegramId));
const userSnap = await getDoc(userRef);

const now = serverTimestamp();

if (userSnap.exists()) {
// Обновляем время последнего взаимодействия
await updateDoc(userRef, { lastInterActionAt: now });
} else {
await setDoc(userRef, {
telegramId,
username,
role: "бухгалтер",
status: "active",
questionCount: 0,
dateRegistered: now,
lastInterActionAt: now,
storeHouseVersion: "6.3.870",
});
}
}

// Сохранение сообщения пользователя
export async function saveUserMessage({ telegramId, text }) {
const messageRef = collection(db, "messages");
await addDoc(messageRef, {
telegramId,
text,
createdAt: serverTimestamp(),
status: "new",
isEscalated: false,
});

// Обновляем questionCount пользователя
const userRef = doc(db, "users", String(telegramId));
const userSnap = await getDoc(userRef);
if (userSnap.exists()) {
const currentCount = userSnap.data().questionCount || 0;
await updateDoc(userRef, { questionCount: currentCount + 1, lastInterActionAt: serverTimestamp() });
}
}

// Получение всех вопросов пользователя
export async function getUserQuestions(telegramId) {
const messagesRef = collection(db, "messages");
const q = query(messagesRef, where("telegramId", "==", telegramId));
const querySnapshot = await getDocs(q);

const questions = [];
querySnapshot.forEach(docSnap => {
const data = docSnap.data();
questions.push({
id: docSnap.id,  // добавляем ID документа для кнопок
text: data.text,
status: data.status,
createdAt: data.createdAt?.toDate?.()?.toLocaleString() || "—"
});
});

questions.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
return questions;
}

// Обновление статуса конкретного вопроса по ID документа
export async function updateMessageStatus(messageId, newStatus) {
const messageRef = doc(db, "messages", messageId);
await updateDoc(messageRef, { status: newStatus });
}