import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { authConfig } from "../auth/authConfig";

const AuthContext = createContext();

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
        const savedToken = await SecureStore.getItemAsync("auth_token");
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

      await SecureStore.setItemAsync("auth_token", data.token);
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

      await SecureStore.setItemAsync("auth_token", data.token);
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
    await SecureStore.deleteItemAsync("auth_token");
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
