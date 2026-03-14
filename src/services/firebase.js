import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

// --- REPLACE WITH YOUR FIREBASE CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyD90UvhQIN4UpuPVlcASom8sbdDIjbfzCM",
  authDomain: "codequest-ai-b9184.firebaseapp.com",
  projectId: "codequest-ai-b9184",
  storageBucket: "codequest-ai-b9184.firebasestorage.app",
  messagingSenderId: "968930126779",
  appId: "1:968930126779:web:03d6d85cb012be877db29e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use initializeFirestore with force-long-polling to fix potential localhost connectivity/offline issues
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
