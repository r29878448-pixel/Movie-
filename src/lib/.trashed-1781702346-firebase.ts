import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAdSE29j85iVghbN63LGvCAxTQ5YkoQO_c",
  authDomain: "agniflix-25b59.firebaseapp.com",
  databaseURL: "https://agniflix-25b59-default-rtdb.firebaseio.com",
  projectId: "agniflix-25b59",
  storageBucket: "agniflix-25b59.firebasestorage.app",
  messagingSenderId: "594773029970",
  appId: "1:594773029970:web:5dd7b02ed67edca5965b8b"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const rtdb = getDatabase(app);
export const storage = getStorage(app);
