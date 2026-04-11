"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  signUp as authSignUp,
  login as authLogin,
  logout as authLogout,
} from "@/lib/auth";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  /** Convenience shorthand — null when no user is signed in */
  displayName: string | null;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  displayName: null,
  signUp: async () => {},
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    let active = true;

    async function initAuth() {
      try {
        // Keep auth session across refresh/reopen.
        await setPersistence(auth, browserLocalPersistence);
      } catch (err) {
        console.error("[AuthContext] Failed to set local persistence", err);
      }

      if (!active) return;

      unsub = onAuthStateChanged(auth, (u) => {
        if (!active) return;
        setUser(u);
        setLoading(false);
      });
    }

    void initAuth();

    return () => {
      active = false;
      if (unsub) unsub();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        displayName: user?.displayName ?? null,
        signUp: authSignUp,
        login: authLogin,
        logout: authLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

