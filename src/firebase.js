import firebase from "firebase/app";

import "firebase/firestore";
import "firebase/auth";
import "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBdViVB8A7cQF_hol-IBKr9zP8aQlt4ZLw",
  authDomain: "notes-app-c0895.firebaseapp.com",
  databaseURL: "https://notes-app-c0895-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "notes-app-c0895",
  storageBucket: "notes-app-c0895.firebasestorage.app",
  messagingSenderId: "895402274242",
  appId: "1:895402274242:web:b2b835c0a4a6ffa5967a5b",
  measurementId: "G-1NGN3GVJ73"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// firebase.analytics();

export default firebase;
