import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("bsis_user")) || null;
    } catch {
      return null;
    }
  });
  const [checking, setChecking] = useState(!!localStorage.getItem("bsis_token"));

  // Validate the stored session once on load
  useEffect(() => {
    const token = localStorage.getItem("bsis_token");
    if (!token) return;
    api
      .get("/api/auth/me")
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem("bsis_user", JSON.stringify(res.data.user));
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/api/auth/login", { email, password });
    localStorage.setItem("bsis_token", res.data.token);
    localStorage.setItem("bsis_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      /* ignore */
    }
    localStorage.removeItem("bsis_token");
    localStorage.removeItem("bsis_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, checking }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
