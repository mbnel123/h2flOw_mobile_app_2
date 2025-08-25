// src/firebase/authService.ts
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  AuthError
} from 'firebase/auth';
import { auth } from './config'; // Zorg dat dit naar je bestaande config.ts wijst

export interface User {
  uid: string;
  email?: string | null;
}

export const signUp = async (email: string, password: string) => {
  try {
    console.log('🔐 Attempting sign up with:', email);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('✅ Sign up successful for:', user.email);
    return { user: { uid: user.uid, email: user.email }, error: null };
  } catch (error) {
    const authError = error as AuthError;
    console.log('❌ Sign up error:', authError.message);
    return { user: null, error: authError.message };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    console.log('🔐 Attempting sign in with:', email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('✅ Sign in successful for:', user.email);
    return { user: { uid: user.uid, email: user.email }, error: null };
  } catch (error) {
    const authError = error as AuthError;
    console.log('❌ Sign in error:', authError.message);
    return { user: null, error: authError.message };
  }
};

export const logout = async () => {
  try {
    console.log('🔐 Attempting logout');
    await signOut(auth);
    console.log('✅ Logout successful');
    return { error: null };
  } catch (error) {
    const authError = error as AuthError;
    console.log('❌ Logout error:', authError.message);
    return { error: authError.message };
  }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  console.log('📡 Setting up auth state listener');
  
  const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      console.log('👤 Auth state changed: User logged in', firebaseUser.email);
      callback({ uid: firebaseUser.uid, email: firebaseUser.email });
    } else {
      console.log('🚪 Auth state changed: User logged out');
      callback(null);
    }
  });

  return unsubscribe;
};
