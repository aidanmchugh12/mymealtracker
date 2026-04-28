import React, { createContext, useContext, useState, useEffect } from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { authConfig } from "../auth/authConfig";

const AuthContext = createContext();
const TOKEN_KEY = "auth_token";

const tokenStorage = {
  getItem: async () => {
    if (Platform.OS === "web") {
      return window.localStorage.getItem(TOKEN_KEY);
    }
    return SecureStore.getItemAsync(TOKEN_KEY);
  },
  setItem: async (value) => {
    if (Platform.OS === "web") {
      window.localStorage.setItem(TOKEN_KEY, value);
      return;
    }
    return SecureStore.setItemAsync(TOKEN_KEY, value);
  },
  deleteItem: async () => {
    if (Platform.OS === "web") {
      window.localStorage.removeItem(TOKEN_KEY);
      return;
    }
    return SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const restoreToken = async () => {
      try {
        const savedToken = await tokenStorage.getItem();
        if (savedToken) {
          setToken(savedToken);
          setIsAuthenticated(true);
          await fetchUserProfile(savedToken);
        }
      } catch (err) {
        console.error("Error restoring token:", err);
      } finally {
        setIsLoading(false);
      }
    };
    restoreToken();
  }, []);

  const fetchUserProfile = async (authToken) => {
    try {
      const response = await fetch(`${authConfig.apiUrl}/users/profile`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        setUser(await response.json());
      } else {
        await logout();
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${authConfig.apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data || "Login failed");

      await tokenStorage.setItem(data.token);
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email, password, username) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${authConfig.apiUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data || "Signup failed");

      await tokenStorage.setItem(data.token);
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await tokenStorage.deleteItem();
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        error,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
