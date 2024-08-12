// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBZgV2bDO2Hnm_RNfhT7JnWeSnIdG4qT0c",
  authDomain: "chatbot-c3f5c.firebaseapp.com",
  projectId: "chatbot-c3f5c",
  storageBucket: "chatbot-c3f5c.appspot.com",
  messagingSenderId: "412978585182",
  appId: "1:412978585182:web:f55620e4315f7b9b28decf",
  measurementId: "G-GD2Y153DTJ"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };