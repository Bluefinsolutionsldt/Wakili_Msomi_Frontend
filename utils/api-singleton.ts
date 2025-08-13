"use client";

import type { APIInstance } from "@/types/api-types";

// Mock API instance for server-side rendering
const mockAPI: APIInstance = {
  token: null,
  currentConversationId: null,
  setToken: () => {},
  clearToken: () => {},
  setCurrentConversationId: () => {},
  getConversations: async () => [],
  getConversation: async () => ({}),
  createConversation: async () => ({}),
  deleteConversation: async () => {},
  query: async () => ({}),
  login: async () => ({}),
  signup: async () => ({}),
  getUserInfo: async () => ({}),
  getPaymentHistory: async () => [],
  createSubscriptionOrder: async () => ({}),
  logout: () => {},
  getSubscriptionStatus: async () => ({}),
};

let instance: APIInstance | null = null;

export function getAPIInstance(): APIInstance {
  if (typeof window === "undefined") {
    return mockAPI;
  }

  return instance || mockAPI;
}

export function setAPIInstance(api: APIInstance): void {
  if (typeof window !== "undefined") {
    instance = api;
  }
}
