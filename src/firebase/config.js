// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// REPLACE WITH YOUR ACTUAL FIREBASE CONFIG
export const firebaseConfig = {
    apiKey: "AIzaSyBQc0O7IMUSkGqR-NctwhcLXF8Ze8qhxj0",
    authDomain: "sapp-726d7.firebaseapp.com",
    projectId: "sapp-726d7",
    storageBucket: "sapp-726d7.firebasestorage.app",
    messagingSenderId: "903739383848",
    appId: "1:903739383848:web:3502336a2a95dc6d3e551d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
