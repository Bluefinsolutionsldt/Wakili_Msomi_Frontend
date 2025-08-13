"use client";

export interface User {
  id: string;
  email: string;
  username?: string;
  subscription_status?: "free" | "daily" | "weekly" | "monthly";
  free_prompts_remaining?: number;
  subscription_expires?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export interface SubscriptionPlan {
  id: "daily" | "weekly" | "monthly";
  name: string;
  description: string;
  price: number;
  duration: string;
  features: string[];
}

export interface PaymentHistory {
  id: string;
  plan: string;
  amount: number;
  date: string;
  status: "completed" | "pending" | "failed";
}
