import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, rtdb } from './firebase';
import { ref, get, set, update } from 'firebase/database';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Ensure user document exists in RTDB
        const userRef = ref(rtdb, `users/${currentUser.uid}`);
        const docSnap = await get(userRef);
        if (!docSnap.exists()) {
          try {
            await set(userRef, {
              id: currentUser.uid,
              email: currentUser.email,
              name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
              photoURL: currentUser.photoURL || '',
              createdAt: Date.now(),
              lastSeen: Date.now(),
              isVerified: true // automatically set via Google Login
            });
          } catch (error) {
            console.error('Error creating user doc', error);
          }
        } else {
           await update(userRef, { lastSeen: Date.now() });
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logOut = () => firebaseSignOut(auth);

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
