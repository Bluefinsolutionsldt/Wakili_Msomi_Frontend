"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/services/api";
import { User } from "@/types/auth";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUserInfo: () => Promise<void>;
  canSendMessage: () => boolean;
  decrementFreePrompt: () => void;
  getSubscriptionStatus: () => Promise<any>;
  refreshSubscriptionStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  refreshUserInfo: async () => {},
  canSendMessage: () => false,
  decrementFreePrompt: () => {},
  getSubscriptionStatus: async () => {},
  refreshSubscriptionStatus: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [hasFetchedSubscription, setHasFetchedSubscription] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const storedPrompts = localStorage.getItem("free_prompts_remaining");

    if (token && username) {
      setIsAuthenticated(true);
      setUser({
        id: username,
        email: "", // Email not used in username-based auth
        username,
        subscription_status: "free",
        free_prompts_remaining: storedPrompts ? parseInt(storedPrompts) : 3,
      });
      api.setToken(token);

      // Try to get updated user info
      refreshUserInfo().catch(console.error);
    }
  }, []);

  // Call getSubscriptionStatus only once after user is initialized
  useEffect(() => {
    if (user && isAuthenticated && !hasFetchedSubscription) {
      getSubscriptionStatus().catch(console.error);
      setHasFetchedSubscription(true);
    }
  }, [user, isAuthenticated, hasFetchedSubscription]);

  const refreshUserInfo = async () => {
    try {
      if (!isAuthenticated) return;

      const userInfo = await api.getUserInfo();
      setUser((prevUser) => {
        // If backend provides free_prompts_remaining, use it
        // Otherwise, preserve existing count or default to 3 for new users
        let freePromptsCount = prevUser?.free_prompts_remaining ?? 3;
        if (
          userInfo.free_prompts_remaining !== undefined &&
          userInfo.free_prompts_remaining !== null
        ) {
          freePromptsCount = userInfo.free_prompts_remaining;
        }

        // Store the updated count in localStorage for persistence
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "free_prompts_remaining",
            freePromptsCount.toString()
          );
        }

        return {
          ...prevUser,
          id: prevUser?.id || userInfo.username,
          email: prevUser?.email || "",
          username: userInfo.username,
          subscription_status: userInfo.subscription_status || "free",
          free_prompts_remaining: freePromptsCount,
          subscription_expires: userInfo.subscription_expires,
        };
      });
    } catch (error) {
      console.error("Failed to refresh user info:", error);
      // If API call fails, ensure new users still get their 3 free prompts
      if (
        !user?.free_prompts_remaining &&
        user?.subscription_status === "free"
      ) {
        setUser((prevUser) => ({
          id: prevUser?.id || "",
          email: prevUser?.email || "",
          username: prevUser?.username,
          subscription_status: prevUser?.subscription_status,
          subscription_expires: prevUser?.subscription_expires,
          free_prompts_remaining: 3,
        }));
      }
    }
  };

  const canSendMessage = (): boolean => {
    if (!user) {
      return false;
    }

    // If user has active subscription, allow messages
    if (user.subscription_status && user.subscription_status !== "free") {
      return true;
    }

    // For free users, check remaining prompts
    const canSend = (user.free_prompts_remaining ?? 0) > 0;
    return canSend;
  };

  const getSubscriptionStatus = async () => {
    console.log("=== SUBSCRIPTION STATUS UPDATE ===");
    console.log(
      "Before - localStorage:",
      localStorage.getItem("free_prompts_remaining")
    );
    console.log("Before - user state:", user);

    let response;
    try {
      response = await api.getSubscriptionStatus();
      console.log("Backend response:", response);
    } catch (error) {
      console.error("Error getting subscription status:", error);
      return;
    }

    if (response.subscription.has_subscription) {
      setUser((prevUser) => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          subscription_status: response.subscription.plan,
          subscription_expires: response.subscription.expires_at,
        };
      });
    } else if (response.free_messages_remaining > 0) {
      setUser((prevUser) => {
        if (!prevUser) return null;
        // Update localStorage with backend data
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "free_prompts_remaining",
            response.free_messages_remaining.toString()
          );
        }
        return {
          ...prevUser,
          subscription_status: "free",
          free_prompts_remaining: response.free_messages_remaining,
        };
      });
    } else {
      setUser((prevUser) => {
        if (!prevUser) return null;
        // Update localStorage with backend data (0 prompts)
        if (typeof window !== "undefined") {
          localStorage.setItem("free_prompts_remaining", "0");
        }
        return {
          ...prevUser,
          subscription_status: "free",
          free_prompts_remaining: 0,
        };
      });
    }

    // Log after update
    setTimeout(() => {
      console.log(
        "After - localStorage:",
        localStorage.getItem("free_prompts_remaining")
      );
      console.log("After - user state:", user);
      console.log("=== END SUBSCRIPTION STATUS UPDATE ===");
    }, 100);
  };

  // Manual refresh function for subscription status
  const refreshSubscriptionStatus = async () => {
    setHasFetchedSubscription(false); // Reset flag to allow fresh fetch
    await getSubscriptionStatus();
  };

  const decrementFreePrompt = () => {
    if (user && user.subscription_status === "free") {
      const newCount = Math.max(0, (user.free_prompts_remaining ?? 0) - 1);
      setUser((prevUser) => ({
        id: prevUser?.id || "",
        email: prevUser?.email || "",
        username: prevUser?.username,
        subscription_status: prevUser?.subscription_status,
        subscription_expires: prevUser?.subscription_expires,
        free_prompts_remaining: newCount,
      }));
      // Store the updated count in localStorage for persistence
      if (typeof window !== "undefined") {
        localStorage.setItem("free_prompts_remaining", newCount.toString());
      }
    }
  };

  const login = async (username: string, password: string) => {
    if (typeof window === "undefined") return;

    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await api.login(username, password);

        // Store user data
        localStorage.setItem("username", username);

        // Initialize user with existing prompt count or default to 3
        const existingPrompts = localStorage.getItem("free_prompts_remaining");
        const promptCount = existingPrompts ? parseInt(existingPrompts) : 3;

        setUser({
          id: username,
          email: "", // Email not used in username-based auth
          username,
          subscription_status: "free",
          free_prompts_remaining: promptCount,
        });
        setIsAuthenticated(true);

        // Get updated user info after login
        await refreshUserInfo();

        return response;
      } catch (error) {
        lastError = error as Error;
        console.error(`Login attempt ${attempt} failed:`, error);

        // If it's not a network error, don't retry
        if (
          !(error instanceof Error) ||
          !error.message.includes("Network error")
        ) {
          throw error;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    // If all retries failed, throw the last error
    throw lastError || new Error("Login failed after multiple attempts");
  };

  const signup = async (username: string, password: string) => {
    if (typeof window === "undefined") return;

    try {
      const response = await api.signup(username, password);

      // Store user data and initialize free prompts for new users
      localStorage.setItem("username", username);
      localStorage.setItem("free_prompts_remaining", "3");

      setUser({
        id: username,
        email: "", // Email not used in username-based auth
        username: username,
        subscription_status: "free",
        free_prompts_remaining: 3,
      });
      setIsAuthenticated(true);

      // Get updated user info after signup (but preserve free prompts)
      await refreshUserInfo();

      return response;
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    }
  };

  const logout = () => {
    if (typeof window === "undefined") return;

    api.clearToken();
    localStorage.removeItem("username");
    localStorage.removeItem("free_prompts_remaining");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        signup,
        logout,
        refreshUserInfo,
        canSendMessage,
        decrementFreePrompt,
        getSubscriptionStatus,
        refreshSubscriptionStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
