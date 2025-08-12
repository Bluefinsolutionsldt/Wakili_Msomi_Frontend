// src/components/LoginForm.tsx
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  EyeIcon,
  EyeSlashIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ userId: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const [apiError, setApiError] = useState<string>("");

  const validateForm = () => {
    let isValid = true;
    const newErrors = { userId: "", email: "", password: "" };

    if (!userId) {
      newErrors.userId = "User ID is required";
      isValid = false;
    }

    if (!email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setApiError(""); // Clear any previous errors

    try {
      await login(userId, email); // Call the login function
      router.push("/"); // Redirect to the home page
    } catch (error: any) {
      console.error("Login error:", error);

      // Provide specific error messages based on error type
      let errorMessage = "Failed to log in. Please try again.";

      if (error?.message?.includes("Network error")) {
        errorMessage =
          "Network connection issue. Please check your internet connection and try again.";
      } else if (error?.message?.includes("timeout")) {
        errorMessage =
          "Request timed out. The server might be busy. Please try again.";
      } else if (error?.message?.includes("multiple attempts")) {
        errorMessage =
          "Unable to connect after multiple attempts. Please check your connection and try again later.";
      } else if (
        error?.message?.includes("Authentication") ||
        error?.message?.includes("Login failed")
      ) {
        errorMessage =
          "Invalid credentials. Please check your username and email.";
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setApiError(errorMessage);
      setErrors((prev) => ({
        ...prev,
        general: errorMessage,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full space-y-2 backdrop-blur-lg bg-white/5 p-8 rounded-2xl shadow-[0_0_40px_rgba(255,212,94,0.1)] border border-[#FFD45E]/20"
      >
        <div>
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-2 text-center text-3xl font-bold text-white"
          >
            {isSignup ? "Create an account" : "Welcome back"}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-2 text-center text-sm text-gray-400"
          >
            {isSignup
              ? "Sign up to get started"
              : "Please sign in to your account"}
          </motion.p>
        </div>

        {apiError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-red-500/10 p-4 border border-red-500/50"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-400">{apiError}</h3>
              </div>
            </div>
          </motion.div>
        )}

        <form className="mt-12 md:mt-12 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-8 ">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label
                htmlFor="userId"
                className="block text-sm font-medium text-gray-300"
              >
                UserName
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                id="userId"
                name="userId"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.userId ? "border-red-500" : "border-[#FFD45E]/20"
                } bg-[#1a1a1a] placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD45E] focus:border-transparent transition-all duration-200`}
                placeholder="Enter your user ID"
              />
              {errors.userId && (
                <p className="mt-1 text-sm text-red-400">{errors.userId}</p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300"
              >
                Email address
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.email ? "border-red-500" : "border-[#FFD45E]/20"
                } bg-[#1a1a1a] placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD45E] focus:border-transparent transition-all duration-200`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <motion.button
              whileHover={{
                scale: 1.01,
                boxShadow: "0 0 20px rgba(255,212,94,0.3)",
              }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-black bg-[#FFD45E] hover:bg-[#e6bf55] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFD45E] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div
                    className="w-2 h-2 bg-black rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-black rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-black rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              ) : isSignup ? (
                "Sign up"
              ) : (
                "Sign in"
              )}
            </motion.button>
          </motion.div>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <p className="text-sm text-gray-400">
            {isSignup ? "Already have an account? " : "Don't have an account? "}
            <button
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="font-medium text-[#FFD45E] hover:text-[#e6bf55] transition-colors duration-200"
            >
              {isSignup ? "Sign in" : "Sign up"}
            </button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
