export interface APIInstance {
  token: string | null;
  currentConversationId: string | null;
  setToken: (token: string | null) => void;
  clearToken: () => void;
  setCurrentConversationId: (id: string | null) => void;
  getConversations: () => Promise<any[]>;
  getConversation: (id: string) => Promise<any>;
  createConversation: () => Promise<any>;
  deleteConversation: (id: string) => Promise<void>;
  query: (message: string) => Promise<any>;
  login: (username: string, password: string) => Promise<any>;
  signup: (username: string, password: string) => Promise<any>;
  logout: () => void;
  getSubscriptionStatus: () => Promise<any>;
  // Payment methods
  getUserInfo: () => Promise<any>;
  getPaymentHistory: () => Promise<any>;
  createSubscriptionOrder: (plan: string, phone: number) => Promise<any>;
}
