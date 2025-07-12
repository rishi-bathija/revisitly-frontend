// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBLp02iUBN9ZPmwJAludsV2vQ5a5jRe1CA",
    authDomain: "revisitly.firebaseapp.com",
    projectId: "revisitly",
    storageBucket: "revisitly.firebasestorage.app",
    messagingSenderId: "524946011202",
    appId: "1:524946011202:web:11e4a70993945b8926a9db",
    measurementId: "G-R5CP7FJ2BV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth()