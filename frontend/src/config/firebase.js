import { initializeApp } from "firebase/app";

import {
  getAuth,
  GoogleAuthProvider,
} from "firebase/auth";

import {
  getFirestore,
} from "firebase/firestore";

import {
  getStorage,
} from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCQrsF9d5mhxJmxxbxULbdgVH-pu0LrOas",
  authDomain: "collabx-fd53e.firebaseapp.com",
  projectId: "collabx-fd53e",
  storageBucket: "collabx-fd53e.firebasestorage.app",
  messagingSenderId: "293138482230",
  appId: "1:293138482230:web:5b25df594cbb94a8bfc497",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
