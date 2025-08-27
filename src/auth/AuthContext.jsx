"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  login as apiLogin,
  me as apiMe,
  logout as apiLogout,
  bootstrapAuth,
} from "@/services/authService";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booted, setBooted] = useState(false); 

  
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const { user: u } = await bootstrapAuth();
        if (!ignore) setUser(u);
      } finally {
        if (!ignore) setBooted(true);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  
  const login = async ({ email, password }) => {
    await apiLogin({ email, password }); 
    const u = await apiMe();             
    setUser(u);
    return u;
  };

  
  const logout = () => {
    apiLogout(); 
    setUser(null);
  };

  const value = useMemo(
    () => ({
      isAuthenticated: !!user,
      user,
      login,
      logout,
      booted,
    }),
    [user, booted]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
