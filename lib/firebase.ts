// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore";
import { getStorage } from "firebase/storage";

import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: "give4need-b6888",
  storageBucket: "give4need-b6888.appspot.com",
  messagingSenderId: "423355697414",
  appId: "1:423355697414:web:d57049c7c4fd0a0b02f687",
  measurementId: "G-FRMH8S2GDP",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// firestore
const db = getFirestore(app);

// cloud firestore
const storage = getStorage(app);

export { db, auth, storage };
