// Firebase SDK — используем модульный вариант
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; 

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
 
export { db };