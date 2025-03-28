import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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
 const auth = getAuth(app);
 const db = getFirestore(app);
 export const provider = new GoogleAuthProvider();

export { auth, db };