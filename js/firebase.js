import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
const firebaseConfig = {
  apiKey: "AIzaSyCbwCy-xMyLvdOcxYvt62jqcpkfmxFr670",
  authDomain: "studenthub-server.firebaseapp.com",
  projectId: "studenthub-server",
  storageBucket: "studenthub-server.appspot.com",
  messagingSenderId: "662272949703",
  appId: "1:662272949703:web:73aed777819f12bca3ade2",
  measurementId: "G-ETXJ8G6DMD"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);
export { app, auth, googleProvider, db };
