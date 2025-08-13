"use client";

export const handleAuthError = (error: any, logout: () => void): boolean => {
  if (error?.message?.includes("Authentication expired")) {
    console.log("Authentication expired, logging out...");
    logout();
    return true; // Indicates that auth error was handled
  }
  return false; // Indicates that this was not an auth error
}; 