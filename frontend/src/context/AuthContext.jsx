import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("hrms_token");

    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/api/auth/current-user")
      .then((response) => {
        setUser(response.data.user);
      })
      .catch(() => {
        localStorage.removeItem("hrms_token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async ({ email, password }) => {
    const response = await api.post("/api/auth/login", { email, password });
    const { token, user: authUser } = response.data;

    localStorage.setItem("hrms_token", token);
    setUser(authUser);

    return response.data;
  };

  const register = async (payload) => {
    const response = await api.post("/api/auth/register", payload);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem("hrms_token");
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
