// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDWFLJSTDrLTr_y1dsBjCjbPSUtRrAduYY",
  authDomain: "leetmath-2470f.firebaseapp.com",
  projectId: "leetmath-2470f",
  storageBucket: "leetmath-2470f.appspot.com",
  messagingSenderId: "700808609923",
  appId: "1:700808609923:web:a6a22cb4eeecec16671bb6",
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const firestore = getFirestore

export { auth, firestore, app};