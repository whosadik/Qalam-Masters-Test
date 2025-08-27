import { createContext, useContext, useEffect, useState } from "react";
import { login as apiLogin, me as apiMe, logout as apiLogout } from "@/api/auth";
import { getAccess } from "@/lib/apiClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  async function fetchMe() {
    try {
      const u = await apiMe();
      setUser(u);
    } catch {
      setUser(null);
    } finally {
      setReady(true);
    }
  }

  useEffect(() => {
    if (getAccess()) fetchMe();
    else setReady(true);
  }, []);

  async function login(email, password) {
    await apiLogin({ email, password });
    await fetchMe();
  }

  function logout() {
    apiLogout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
