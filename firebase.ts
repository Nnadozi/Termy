// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyApt7qWDONNWdkiNCnDBJOD5FaWLuUZwb0",
  authDomain: "termy-f44be.firebaseapp.com",
  projectId: "termy-f44be",
  storageBucket: "termy-f44be.firebasestorage.app",
  messagingSenderId: "990788739192",
  appId: "1:990788739192:web:174f3d8c72db9fcbafcd8d",
  measurementId: "G-DTEZV0989J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };

