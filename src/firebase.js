// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAKMKF5yYbN3P7LUULk4BZfappH6rhM4uE",
  authDomain: "scrimdata-60eb9.firebaseapp.com",
  projectId: "scrimdata-60eb9",
  storageBucket: "scrimdata-60eb9.firebasestorage.app",
  messagingSenderId: "316442293080",
  appId: "1:316442293080:web:df232bf66dbe30dd612b2d",
  measurementId: "G-0CL0GHL2GG",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
