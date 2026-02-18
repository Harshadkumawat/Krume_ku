import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
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
