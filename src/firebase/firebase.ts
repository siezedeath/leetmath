import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
	apiKey: "AIzaSyCLEhoObEcFlMIEP5jpieJAj3Q1ulFt2iE",
	authDomain: "leetcodemath.firebaseapp.com",
	projectId: "leetcodemath",
	storageBucket: "leetcodemath.appspot.com",
	messagingSenderId: "57179098773",
	appId: "1:57179098773:web:1a305dfa8f293310b9559c"
};

const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const firestore = getFirestore(app);

export { auth, firestore, app };