"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { handleAuthError } from "@/utils/auth-error-handler";
import SubscriptionModal from "@/components/SubscriptionModal";
import TypingIndicator from "@/components/TypingIndicator";
import {
  Send,
  User,
  Scale,
  AlertCircle,
  Clock,
  Mic,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Crown,
  Lock,
} from "lucide-react";
import React from "react";

// Utility function to parse markdown-style bold text (**text**)
const parseMarkdownBold = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={index} className="font-bold">
          {boldText}
        </strong>
      );
    }
    return part;
  });
};

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  conversationCreated?: boolean;
}

interface ChatProps {
  selectedConversationId?: string;
  onNewConversation?: () => void;
  onConversationsChange?: (value: boolean) => void;
}

const MessageBubble = ({
  message,
  index,
}: {
  message: Message;
  index: number;
}) => {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex items-start space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 max-w-6xl mx-auto group ${
        isUser ? "flex-row-reverse space-x-reverse" : ""
      }`}
    >
      <Avatar className="h-7 w-7 sm:h-8 sm:w-8 ring-2 ring-gray-700/30 flex-shrink-0">
        {isUser ? (
          <AvatarFallback className="bg-gray-700 text-white ">
            <User className="h-3 w-3 sm:h-4 sm:w-4" />
          </AvatarFallback>
        ) : (
          <>
            <AvatarImage src="/wakilimsomi.jpeg" alt="Wakili Msomi" />
            <AvatarFallback className="bg-gradient-to-br from-[#FFD45E] to-[#e6bf55] text-black">
              <Scale className="h-3 w-3 sm:h-4 sm:w-4" />
            </AvatarFallback>
          </>
        )}
      </Avatar>

      <div
        className={`flex-1 space-y-1 sm:space-y-2 ${
          isUser ? "items-end" : "items-start"
        } flex flex-col`}
      >
        <div
          className={`flex items-center space-x-2 ${
            isUser ? "flex-row-reverse space-x-reverse" : ""
          }`}
        >
          <span className="text-xs sm:text-sm font-medium text-gray-300 pr-3">
            {isUser ? "You" : "Wakili Msomi"}
          </span>
          {message.timestamp && (
            <span className="text-xs text-gray-500 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>

        <div
          className={`rounded-2xl px-3 sm:px-4 py-2 sm:py-3 max-w-[85%] sm:max-w-[75%] ${
            isUser
              ? "bg-gradient-to-r from-[#FFD45E] to-[#e6bf55] text-black rounded-br-md ml-auto"
              : "bg-gray-800/60 backdrop-blur-sm text-white border border-gray-700/30 rounded-bl-md"
          }`}
        >
          <p className="text-sm sm:text-sm leading-relaxed whitespace-pre-wrap">
            {isUser ? message.content : parseMarkdownBold(message.content)}
          </p>
        </div>

        {/* Action buttons for assistant messages */}
        {!isUser && (
          <div className="flex items-center space-x-2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-1.5 sm:p-1.5 text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 rounded-lg transition-colors touch-manipulation">
              <Copy className="h-3 w-3" />
            </button>
            <button className="p-1.5 sm:p-1.5 text-gray-500 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors touch-manipulation">
              <ThumbsUp className="h-3 w-3" />
            </button>
            <button className="p-1.5 sm:p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors touch-manipulation">
              <ThumbsDown className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Memoized Status Bar Component
const StatusBar = React.memo(
  ({ user, onUpgrade }: { user: any; onUpgrade: () => void }) => {
    if (!user) return null;

    return (
      <div className="mb-2">
        {user.subscription_status === "free" ? (
          <div className="flex items-center justify-between bg-gray-800/40 rounded-lg px-3 py-2 text-xs">
            <div className="flex items-center space-x-2">
              <Lock className="h-3 w-3 text-orange-400" />
              <span className="text-gray-300">
                {user.free_prompts_remaining ?? 0} free prompts remaining
              </span>
            </div>
            <Button
              onClick={onUpgrade}
              size="sm"
              className="bg-[#FFD45E] text-black hover:bg-[#e6bf55] h-6 px-3 text-xs"
            >
              <Crown className="h-3 w-3 mr-1" />
              Upgrade
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 text-xs">
            <Crown className="h-3 w-3 text-[#FFD45E] mr-2" />
            <span className="text-green-400 font-medium">
              {user.subscription_status?.toUpperCase()} PLAN ACTIVE
            </span>
            {user.subscription_expires && (
              <span className="text-gray-400 ml-2">
                • Expires{" "}
                {new Date(user.subscription_expires).toLocaleDateString()}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);

// Memoized Input Component
const ChatInput = React.memo(
  ({
    newMessage,
    setNewMessage,
    handleKeyPress,
    handleSubmit,
    canSend,
    isAuthenticated,
    isLoading,
    inputRef,
  }: {
    newMessage: string;
    setNewMessage: (value: string) => void;
    handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent) => void;
    canSend: boolean;
    isAuthenticated: boolean;
    isLoading: boolean;
    inputRef: React.RefObject<HTMLInputElement | null>;
  }) => {
    const placeholder = canSend
      ? "Ask about legal matters, contracts, regulations..."
      : "Subscribe to continue chatting with Wakili Msomi...";

    const buttonClassName = `h-12 w-12 sm:h-14 sm:w-14 shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 rounded-xl sm:rounded-2xl touch-manipulation ${
      canSend
        ? "bg-gradient-to-r from-[#FFD45E] via-[#e6bf55] to-[#d4a94a] hover:from-[#e6bf55] hover:via-[#d4a94a] hover:to-[#c19c42] text-black"
        : "bg-gray-700 text-gray-400 cursor-not-allowed"
    }`;

    return (
      <form
        onSubmit={handleSubmit}
        className="flex items-end space-x-2 sm:space-x-4"
      >
        <div className="flex-1 relative">
          <div className="relative">
            <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 z-10 w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden ring-1 ring-[#FFD45E]/30">
              <Image
                src="/wakilimsomi.jpeg"
                alt="Wakili Msomi"
                fill
                className="object-cover rounded-full"
                sizes="(max-width: 640px) 20px, 24px"
              />
            </div>
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewMessage(e.target.value)
              }
              onKeyPress={handleKeyPress}
              onFocus={(e) => {
                // Ensure focus is maintained on mobile
                e.target.focus();
              }}
              onTouchStart={(e) => {
                // Prevent default touch behavior and ensure focus
                e.preventDefault();
                e.currentTarget.focus();
              }}
              placeholder={placeholder}
              disabled={!isAuthenticated || isLoading}
              className="pl-12 sm:pl-14 pr-12 sm:pr-14 py-3 sm:py-4 h-12 sm:h-14 bg-gray-800/60 border-gray-700/30 focus:border-[#FFD45E]/50 focus:ring-2 focus:ring-[#FFD45E]/20 placeholder:text-gray-500 text-white rounded-xl sm:rounded-2xl backdrop-blur-sm transition-all text-base touch-manipulation"
              style={{
                WebkitAppearance: "none",
                WebkitTapHighlightColor: "transparent",
                WebkitUserSelect: "text",
                WebkitTouchCallout: "none",
                fontSize: "16px", // Prevents zoom on iOS
                caretColor: "#FFD45E", // Custom cursor color
              }}
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={!isAuthenticated || isLoading || !newMessage.trim()}
          className={buttonClassName}
        >
          <Send className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </form>
    );
  }
);

export default function Chat({
  selectedConversationId,
  onNewConversation,
  onConversationsChange,
}: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [showStatusBar, setShowStatusBar] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    isAuthenticated,
    logout,
    user,
    canSendMessage,
    decrementFreePrompt,
    refreshSubscriptionStatus,
  } = useAuth();

  // Memoize canSendMessage result to prevent unnecessary re-renders
  const canSend = useMemo(() => canSendMessage(), [canSendMessage]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Only scroll when new messages are added, not on every render
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length, scrollToBottom]);

  useEffect(() => {
    if (selectedConversationId) {
      loadConversation(selectedConversationId);
    } else {
      setMessages([]);
    }
  }, [selectedConversationId]);

  // Simplified subscription status effect
  useEffect(() => {
    if (user) {
      setShowStatusBar(true);
      const timer = setTimeout(() => {
        setShowStatusBar(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [user?.subscription_status]);

  const loadConversation = useCallback(
    async (conversationId: string) => {
      try {
        setError(null);
        setIsLoading(true);
        const conversation = await api.getConversation(conversationId);
        if (conversation && conversation.messages) {
          setMessages(
            conversation.messages.map((msg: any) => ({
              role: msg.role,
              content: msg.content,
              timestamp: msg.timestamp,
            }))
          );
        } else {
          if (onNewConversation) {
            onNewConversation();
          }
        }
      } catch (error: any) {
        console.error("Error loading conversation:", error);

        if (handleAuthError(error, logout)) {
          return;
        }

        setError(
          error?.message || "Failed to load conversation. Please try again."
        );
        if (onNewConversation) {
          onNewConversation();
        }
      } finally {
        setIsLoading(false);
      }
    },
    [onNewConversation, logout]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newMessage.trim() || !isAuthenticated || isLoading) return;

      if (!canSend) {
        setShowSubscriptionModal(true);
        await refreshSubscriptionStatus();
        return;
      }

      const messageText = newMessage.trim();
      setNewMessage("");
      setIsStreaming(true);
      setIsWaitingForResponse(true);
      setError(null);

      const userMessage: Message = {
        role: "user" as const,
        content: messageText,
        timestamp: new Date().toISOString(),
      };

      // Only add the user message initially, assistant message will be added when first content arrives
      setMessages((prev) => [...prev, userMessage]);
      decrementFreePrompt();

      try {
        const response = await fetch(
          `http://84.247.138.245:8007/query`, // Using direct backend URL from api.ts
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "text/event-stream",
              "Cache-Control": "no-cache",
              Connection: "keep-alive",
              Authorization: `Bearer ${api.token}`,
            },
            body: JSON.stringify({
              query: messageText,
              conversation_id: api.currentConversationId,
              language: "en",
              use_offline: false,
              verbose: false,
            }),
          }
        );

        // Check for event stream content type
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("text/event-stream")) {
          throw new Error(
            "Invalid response from server. Expected event stream but received: " +
              contentType
          );
        }

        if (!response.ok) {
          let errorMessage = "An unknown error occurred";
          try {
            const errorData = await response.json();
            errorMessage =
              errorData.detail || errorData.message || errorMessage;
          } catch (e) {
            console.error("Failed to parse error response:", e);
          }
          throw new Error(errorMessage);
        }

        if (!response.body) {
          throw new Error("Response body is null");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let conversationCreated = false;

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          console.log("Received chunk:", chunk); // Debug log

          // Split by newlines and handle each line
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.trim().startsWith("data: ")) {
              try {
                // Extract the JSON part after 'data: '
                const jsonString = line.trim().substring(6);
                console.log("Parsing JSON:", jsonString); // Debug log
                const data = JSON.parse(jsonString);

                if (data.content || data.response_chunk) {
                  // Handle both content and response_chunk fields
                  const messageContent = data.content || data.response_chunk;
                  console.log("Message content:", messageContent); // Debug log

                  // Clear waiting state on first content
                  setIsWaitingForResponse(false);

                  setMessages((prev) => {
                    // Check if we need to add the assistant message (first content)
                    const lastMessage = prev[prev.length - 1];
                    if (!lastMessage || lastMessage.role !== "assistant") {
                      // Add new assistant message with first content
                      const assistantMessage: Message = {
                        role: "assistant" as const,
                        content: messageContent,
                        timestamp: new Date().toISOString(),
                      };
                      return [...prev, assistantMessage];
                    } else {
                      // Append to existing assistant message
                      return prev.map((msg, index) =>
                        index === prev.length - 1
                          ? { ...msg, content: msg.content + messageContent }
                          : msg
                      );
                    }
                  });
                }

                if (data.status === "complete") {
                  if (data.conversation_id) {
                    api.setCurrentConversationId(data.conversation_id);
                    conversationCreated = true;
                  }
                }

                if (data.error) {
                  throw new Error(data.detail || data.error);
                }
              } catch (e) {
                console.error("Failed to parse stream data:", e);
              }
            }
          }
        }
        if (conversationCreated && onConversationsChange) {
          onConversationsChange(true);
        }
      } catch (error: any) {
        console.error("Error sending message:", error);

        if (handleAuthError(error, logout)) {
          return;
        }

        setError(error?.message || "Failed to send message. Please try again.");
        // Remove the optimistic messages on error
        setMessages((prev) => {
          // If we added an assistant message, remove both user and assistant
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && lastMessage.role === "assistant") {
            return prev.slice(0, -2); // Remove both user and assistant
          } else {
            return prev.slice(0, -1); // Remove just the user message
          }
        });
        setNewMessage(messageText);
      } finally {
        setIsStreaming(false);
        setIsWaitingForResponse(false);
      }
    },
    [
      newMessage,
      isAuthenticated,
      isLoading,
      canSend,
      decrementFreePrompt,
      onConversationsChange,
      logout,
      refreshSubscriptionStatus,
    ]
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as any);
      }
    },
    [handleSubmit]
  );

  // Memoize the no prompts message to prevent unnecessary re-renders
  const noPromptsMessage = useMemo(() => {
    if (
      messages.length > 0 &&
      !canSend &&
      user?.subscription_status === "free"
    ) {
      return (
        <div className="flex flex-col items-center justify-center px-4 py-8 max-w-md mx-auto">
          <div className="w-16 h-16 bg-[#FFD45E]/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-[#FFD45E]" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            Out of Free Prompts
          </h3>
          <p className="text-gray-400 text-center mb-4">
            You've used all your free prompts. Upgrade to continue chatting with
            Wakili Msomi.
          </p>
          <Button
            onClick={() => setShowSubscriptionModal(true)}
            className="bg-[#FFD45E] text-black hover:bg-[#e6bf55]"
          >
            <Crown className="h-4 w-4 mr-2" />
            View Plans
          </Button>
        </div>
      );
    }
    return null;
  }, [messages.length, canSend, user?.subscription_status]);

  const handleUpgrade = useCallback(() => {
    setShowSubscriptionModal(true);
  }, []);

  return (
    <div className="flex flex-col h-[100dvh] bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f]">
      {/* Messages Area - Scrollable */}
      <div className="flex-1 overflow-hidden max-h-[calc(100dvh-200px)]">
        <ScrollArea className="h-full max-h-full">
          <div className="py-6 space-y-6">
            {messages.map((message, index) => (
              <MessageBubble
                key={`${message.timestamp}-${index}`}
                message={message}
                index={index}
              />
            ))}

            {/* Show typing indicator when waiting for response */}
            {isWaitingForResponse && <TypingIndicator />}

            {/* streaming active - no typing indicator */}

            {noPromptsMessage}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-3 sm:px-4 py-2 max-w-6xl mx-auto w-full flex-shrink-0">
          <Alert
            variant="destructive"
            className="bg-red-500/10 border-red-500/30"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Input Area - Fixed at Bottom */}
      <div className="flex-shrink-0 backdrop-blur-sm border-t border-gray-800/30">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
          {/* Subscription Status Bar */}
          {user && showStatusBar && (
            <StatusBar user={user} onUpgrade={handleUpgrade} />
          )}

          <ChatInput
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            handleKeyPress={handleKeyPress}
            handleSubmit={handleSubmit}
            canSend={canSend}
            isAuthenticated={isAuthenticated}
            isLoading={isLoading || isStreaming}
            inputRef={inputRef}
          />

          <p className="text-xs text-gray-500 mt-3 sm:mt-4 text-center px-2">
            For more assistant you can call{" "}
            <span className="text-yellow-300">+255 621 900 555</span>
          </p>
        </div>
      </div>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
    </div>
  );
}
