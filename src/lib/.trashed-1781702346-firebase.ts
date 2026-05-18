import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBmtKpV09mghDTM7t8Gr2LqUFbNguLBBLc",
  authDomain: "jarvis-8f458.firebaseapp.com",
  databaseURL: "https://jarvis-8f458-default-rtdb.firebaseio.com",
  projectId: "jarvis-8f458",
  storageBucket: "jarvis-8f458.firebasestorage.app",
  messagingSenderId: "146465738672",
  appId: "1:146465738672:web:2cf3e973f6a78413681075"
};
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const rtdb = getDatabase(app);
export const storage = getStorage(app);
