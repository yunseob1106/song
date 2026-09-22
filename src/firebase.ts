import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// 보내주신 Firebase 연동 키 설정
const firebaseConfig = {
  apiKey: "AIzaSyBAYlbQYya2AAZ4YnzFoIeKL8UDsAo5ovU",
  authDomain: "requireddata-88c5a.firebaseapp.com",
  projectId: "requireddata-88c5a",
  storageBucket: "requireddata-88c5a.firebasestorage.app",
  messagingSenderId: "396910555324",
  appId: "1:396910555324:web:266cfb8288a39ecc7be0b9",
  measurementId: "G-EHQCMGP61B"
};

// Firebase 및 DB 초기화
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);