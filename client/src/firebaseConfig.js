// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDVVPlYuf4wN5AeI76sZz9LjkXETOXAOjM",
  authDomain: "krumeku-auth.firebaseapp.com",
  projectId: "krumeku-auth",
  storageBucket: "krumeku-auth.firebasestorage.app",
  messagingSenderId: "405683846920",
  appId: "1:405683846920:web:cbb9981f2e05a63c7436bd",
  measurementId: "G-WP36X8JPKX",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
