"use client";

export interface ApiResponse {
  response: string;
  conversation_id: string;
  language: string;
  confidence_score: number;
  processed_at: string;
}

export interface Conversation {
  id: string;
  created_at: string;
  language: string;
  messages: Message[];
  metadata: Record<string, any>;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface QueryResponse {
  response: string;
  conversation_id: string;
  language: string;
  confidence_score: number;
  processed_at: string;
}

export interface CreateConversationRequest {
  language?: string;
  metadata?: Record<string, any>;
}

export interface QueryRequest {
  query: string;
  conversation_id: string;
  language?: string;
}
