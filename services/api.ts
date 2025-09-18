"use client";

import { getAPIInstance, setAPIInstance } from "@/utils/api-singleton";
import { getNetworkErrorMessage } from "@/utils/network";
import type { APIInstance } from "@/types/api-types";

const API_BASE_URL = "https://wakilimsomibnd.sheriakiganjani.co.tz";

export class SheriaKiganjaniAPI implements APIInstance {
  public token: string | null = null;
  public currentConversationId: string | null = null;

  private constructor() {
    // Initialize without localStorage
    this.token = null;
    this.currentConversationId = null;

    // Only access localStorage after checking window
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      const storedConvId = localStorage.getItem("currentConversationId");
      if (storedToken) this.token = storedToken;
      if (storedConvId) this.currentConversationId = storedConvId;
    }
  }

  public static getInstance(): APIInstance {
    const existingInstance = getAPIInstance();
    if (existingInstance && existingInstance instanceof SheriaKiganjaniAPI) {
      return existingInstance;
    }

    const newInstance = new SheriaKiganjaniAPI();
    setAPIInstance(newInstance);
    return newInstance;
  }

  private getAuthHeaders(): HeadersInit {
    return {
      "Content-Type": "application/json",
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
    };
  }

  setToken(token: string | null): void {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("token", token);
      } else {
        localStorage.removeItem("token");
      }
    }
  }

  setCurrentConversationId(id: string | null): void {
    this.currentConversationId = id;
    if (typeof window !== "undefined") {
      if (id) {
        localStorage.setItem("currentConversationId", id);
      } else {
        localStorage.removeItem("currentConversationId");
      }
    }
  }

  clearToken(): void {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("currentConversationId");
    }
  }

  async getConversations(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (response.status === 401) {
        this.clearToken();
        throw new Error("Authentication expired. Please log in again.");
      }

      const data = await response.json();

      const conversations = Array.isArray(data) ? data : [];

      // Update current conversation ID if we have conversations
      if (conversations.length > 0 && !this.currentConversationId) {
        this.setCurrentConversationId(conversations[0].id);
      }

      return conversations;
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
      throw error;
    }
  }

  async createConversation(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          language: "en",
          metadata: {},
        }),
      });

      if (response.status === 401) {
        this.clearToken();
        throw new Error("Authentication expired. Please log in again.");
      }

      const data = await response.json();

      if (!data.id) {
        throw new Error("Invalid conversation response");
      }

      this.setCurrentConversationId(data.id);
      return data;
    } catch (error) {
      console.error("Failed to create conversation:", error);
      throw error;
    }
  }

  async query(message: string): Promise<any> {
    let conversationCreated = false;
    try {
      // If no conversation ID, get conversations first
      if (!this.currentConversationId) {
        const conversations = await this.getConversations();
        if (conversations.length === 0) {
          // Only create if we really have no conversations
          const newConversation = await this.createConversation();
          this.setCurrentConversationId(newConversation.id);
          conversationCreated = true;
        }
      }

      // Ensure we have a conversation ID
      if (!this.currentConversationId) {
        throw new Error("No active conversation");
      }

      // Send the query to external API
      const response = await fetch(`${API_BASE_URL}/query`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          query: message,
          conversation_id: this.currentConversationId,
          language: "en",
        }),
      });

      if (response.status === 401) {
        this.clearToken();
        throw new Error("Authentication expired. Please log in again.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || "Failed to send message");
      }

      return {
        content: data.response,
        role: "assistant",
        timestamp: data.processed_at,
        conversationCreated,
      };
    } catch (error) {
      console.error("Query failed:", error);
      throw error;
    }
  }

  async login(username: string, password: string): Promise<any> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      // Call external API directly with form-urlencoded data
      const response = await fetch(`${API_BASE_URL}/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: new URLSearchParams({
          username: username,
          password: password,
          grant_type: "password",
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        const errorMessage =
          data?.detail || `Login failed with status: ${response.status}`;
        throw new Error(errorMessage);
      }

      if (!data.access_token) {
        throw new Error("No access token received");
      }

      this.setToken(data.access_token);
      return data;
    } catch (error) {
      console.error("Login failed:", error);

      // Handle specific error types
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        throw new Error(getNetworkErrorMessage(error));
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(
          "Request timeout: The server is taking too long to respond. Please try again."
        );
      }

      throw new Error(
        error instanceof Error
          ? error.message
          : "Network error occurred during login"
      );
    }
  }

  async getConversation(conversationId: string): Promise<any> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/conversations/${conversationId}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      if (response.status === 401) {
        this.clearToken();
        throw new Error("Authentication expired. Please log in again.");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch conversation:", error);
      throw error;
    }
  }

  async signup(username: string, password: string): Promise<any> {
    try {
      // First, register the user
      const signupResponse = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!signupResponse.ok) {
        const errorData = await signupResponse.json().catch(() => null);
        throw new Error(errorData?.detail || "Signup failed");
      }

      // After successful signup, automatically log the user in
      const loginResponse = await fetch(`${API_BASE_URL}/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: new URLSearchParams({
          username: username,
          password: password,
          grant_type: "password",
        }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(loginData?.detail || "Auto-login after signup failed");
      }

      // Set the token from the login response
      if (loginData.access_token) {
        this.setToken(loginData.access_token);
      }

      return loginData;
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    }
  }

  async deleteConversation(conversationId: string): Promise<void> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/conversations/${conversationId}`,
        {
          method: "DELETE",
          headers: this.getAuthHeaders(),
        }
      );

      if (response.status === 401) {
        this.clearToken();
        throw new Error("Authentication expired. Please log in again.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || "Failed to delete conversation");
      }

      // If this was the current conversation, clear it
      if (this.currentConversationId === conversationId) {
        this.setCurrentConversationId(null);
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      throw error;
    }
  }

  async getUserInfo(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (response.status === 401) {
        this.clearToken();
        throw new Error("Authentication expired. Please log in again.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || "Failed to get user info");
      }

      return data;
    } catch (error) {
      console.error("Failed to get user info:", error);
      throw error;
    }
  }

  async getPaymentHistory(): Promise<any> {
    try {
      // First get user info to get username
      const userResponse = await fetch(`${API_BASE_URL}/users/me`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (userResponse.status === 401) {
        this.clearToken();
        throw new Error("Authentication expired. Please log in again.");
      }

      const userData = await userResponse.json();

      if (!userResponse.ok) {
        throw new Error(userData?.detail || "Failed to get user info");
      }

      // Then get payment history using username
      const response = await fetch(
        `${API_BASE_URL}/users/${userData.username}/payments`,
        {
          method: "GET",
          headers: this.getAuthHeaders(),
        }
      );

      if (response.status === 401) {
        this.clearToken();
        throw new Error("Authentication expired. Please log in again.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || "Failed to get payment history");
      }

      return data;
    } catch (error) {
      console.error("Failed to get payment history:", error);
      throw error;
    }
  }

  async createSubscriptionOrder(plan: string, phone: number): Promise<any> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/create-subscription-order`,
        {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ plan, phone }),
        }
      );

      if (response.status === 401) {
        this.clearToken();
        throw new Error("Authentication expired. Please log in again.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || "Failed to create subscription order");
      }

      return data;
    } catch (error) {
      console.error("Failed to create subscription order:", error);
      throw error;
    }
  }

  logout(): void {
    this.clearToken();
  }

  async getSubscriptionStatus(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/free-messages/status`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (response.status === 401) {
        this.clearToken();
        throw new Error("Authentication expired. Please log in again.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || "Failed to get subscription status");
      }

      return data;
    } catch (error) {
      console.error("Failed to get subscription status:", error);
    }
  }
}

export default SheriaKiganjaniAPI.getInstance();
