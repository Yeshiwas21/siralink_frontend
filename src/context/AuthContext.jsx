import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { loginApi, logoutApi, getMeApi } from "../services/authService";
import { getAccessToken, clearTokens } from "../services/tokenService";

const AuthContext = createContext();

const defaultUser = {
  isAuthenticated: false,
  id: null,
  email: null,
  first_name: null,
  last_name: null,
  user_type: null,
  account_status: null,
  is_staff: false,
  is_active: false,
  client: null,
  worker: null,
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(defaultUser);
  const [loading, setLoading] = useState(true);

  /**
   * INIT AUTH
   */
  useEffect(() => {
    const initAuth = async () => {
      const token = getAccessToken();

      if (!token) {
        setUser(defaultUser);
        setLoading(false);
        return;
      }

      try {
        const data = await getMeApi();

        setUser({
          ...defaultUser,
          ...data,
          isAuthenticated: true,
        });
      } catch (err) {
        clearTokens();
        setUser(defaultUser);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * LOGIN
   */
  const login = async (form) => {
    await loginApi(form);
    const userData = await getMeApi();

    setUser({
      ...defaultUser,
      ...userData,
      isAuthenticated: true,
    });

    return userData;
  };

  /**
   * LOGOUT
   */
  const logout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.log("Logout API failed (ignored)", err);
    }

    clearTokens();
    setUser(defaultUser);
  };

  /**
   * DERIVED STATE (optimized)
   */
  const full_name = useMemo(() => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.first_name || "";
  }, [user.first_name, user.last_name]);

  const isClient = user.user_type === "client";
  const isWorker = user.user_type === "worker";
  const isAdmin = user.user_type === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        full_name,
        isClient,
        isWorker,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
