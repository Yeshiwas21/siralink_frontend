import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";

import {
  loginApi,
  logoutApi,
  getMeApi,
} from "../services/authService";


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
   * Load logged-in user from backend.
   */
  const loadUser = async () => {

    try {

      const data = await getMeApi();


      setUser({
        ...defaultUser,
        ...data,
        isAuthenticated: true,
      });


      return true;


    } catch (err) {


      setUser(defaultUser);

      return false;

    }

  };


  /**
   * Initialize authentication.
   *
   * Cookies are handled by the browser.
   * Axios handles refresh automatically.
   */
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        await loadUser();
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    const syncAuth = () => {
      loadUser();
    };

    window.addEventListener("focus", syncAuth);

    return () => {
      mounted = false;
      window.removeEventListener("focus", syncAuth);
    };
  }, []);


  /**
   * Login user.
   *
   * Backend creates HttpOnly cookies.
   */
  const login = async (payload) => {
    await loginApi(payload);
    const userData = await getMeApi();
    setUser({
      ...defaultUser,
      ...userData,
      isAuthenticated: true,
    });


    return userData;

  };



  /**
   * Logout user.
   *
   * Backend deletes cookies.
   */
  const logout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.log(
        "Logout API failed",
        err
      );

    }
    setUser(defaultUser);

  };



  const full_name = useMemo(() => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.first_name || "";
  }, [
    user.first_name,
    user.last_name,
  ]);



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