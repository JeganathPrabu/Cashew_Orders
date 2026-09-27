// Firebase project configuration.
// Get these values from: Firebase Console -> Project Settings -> General -> Your apps -> Web app (</>)
// These values are NOT secret - access control is enforced by Firestore Security Rules, not by hiding this file.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBfbd9Cd8qWiaplkoBYflUSDp-KtdEKUeM",
  authDomain: "cashew-orders.firebaseapp.com",
  projectId: "cashew-orders",
  storageBucket: "cashew-orders.firebasestorage.app",
  messagingSenderId: "690314163866",
  appId: "1:690314163866:web:7a810055cd7c439a399123",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
