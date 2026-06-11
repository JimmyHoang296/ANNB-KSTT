import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'kstt_annb_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  function signIn(userData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
  }

  function signOut() {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
