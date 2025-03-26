import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAIf5a_1X_OZt1CY_TUlN2TJ8nrdAWmoeI",
  authDomain: "easylandlord-e3923.firebaseapp.com",
  projectId: "easylandlord-e3923",
  storageBucket: "easylandlord-e3923.firebasestorage.app",
  messagingSenderId: "563092805938",
  appId: "1:563092805938:web:196fec61a5c3dcbbda5f2b",
  measurementId: "G-DC25BFVFRQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
