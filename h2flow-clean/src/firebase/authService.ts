// src/firebase/authService.ts
// Mock implementation for React Native testing

export interface User {
  uid: string;
  email?: string;
}

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  // Mock user for testing - replace with real Firebase later
  setTimeout(() => {
    callback({ 
      uid: 'test-user-123',
      email: 'test@example.com'
    });
  }, 500);
  
  // Return cleanup function
  return () => {
    console.log('Auth listener cleanup');
  };
};

// Mock functions for now
export const signUp = async (email: string, password: string) => {
  return { user: { uid: 'test', email }, error: null };
};

export const signIn = async (email: string, password: string) => {
  return { user: { uid: 'test', email }, error: null };
};

export const logout = async () => {
  return { error: null };
};
