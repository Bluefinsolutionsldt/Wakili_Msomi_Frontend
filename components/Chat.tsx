"use client";

import { useState, useRef, useEffect } from "react";
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
import {
  Send,
  User,
  Scale,
  AlertCircle,
  Sparkles,
  MessageCircle,
  Clock,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  BarChart3,
  Bookmark,
  Globe,
  Mic,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Crown,
  Lock,
} from "lucide-react";

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

const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="flex items-start space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 max-w-6xl mx-auto"
  >
    <Avatar className="h-7 w-7 sm:h-8 sm:w-8 ring-2 ring-[#FFD45E]/20 flex-shrink-0">
      <AvatarImage src="/wakilimsomi.jpeg" alt="Wakili Msomi" />
      <AvatarFallback className="bg-gradient-to-br from-[#FFD45E] to-[#e6bf55] text-black">
        <Scale className="h-3 w-3 sm:h-4 sm:w-4" />
      </AvatarFallback>
    </Avatar>
    <div className="flex items-center space-x-2 bg-gray-800/60 backdrop-blur-sm rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 border border-gray-700/30">
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#FFD45E] rounded-full"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
      <span className="text-xs text-gray-300 ml-2 font-medium">
        Wakili Msomi is analyzing...
      </span>
    </div>
  </motion.div>
);

const MessageBubble = ({
  message,
  index,
}: {
  message: Message;
  index: number;
}) => {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
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
          <span className="text-xs sm:text-sm font-medium text-gray-300 pr-3  ">
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

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.08 + 0.1 }}
          className={`rounded-2xl px-3 sm:px-4 py-2 sm:py-3 max-w-[85%] sm:max-w-[75%] ${
            isUser
              ? "bg-gradient-to-r from-[#FFD45E] to-[#e6bf55] text-black rounded-br-md ml-auto"
              : "bg-gray-800/60 backdrop-blur-sm text-white border border-gray-700/30 rounded-bl-md"
          }`}
        >
          <p className="text-sm sm:text-sm leading-relaxed whitespace-pre-wrap">
            {isUser ? message.content : parseMarkdownBold(message.content)}
          </p>
        </motion.div>

        {/* Action buttons for assistant messages */}
        {!isUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.08 + 0.2 }}
            className="flex items-center space-x-2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <button className="p-1.5 sm:p-1.5 text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 rounded-lg transition-colors touch-manipulation">
              <Copy className="h-3 w-3" />
            </button>
            <button className="p-1.5 sm:p-1.5 text-gray-500 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors touch-manipulation">
              <ThumbsUp className="h-3 w-3" />
            </button>
            <button className="p-1.5 sm:p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors touch-manipulation">
              <ThumbsDown className="h-3 w-3" />
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// interface WelcomeScreenProps {
//   user: any;
// }

// const WelcomeScreen = ({ user }: WelcomeScreenProps) => {
//   const [activeTab, setActiveTab] = useState("All");
//   const tabs = ["All", "Text", "Image", "Video", "Music", "Analytics"];

//   const featureCards = [
//     {
//       icon: Bookmark,
//       title: "Legal Templates",
//       description: "Ready-to-use legal document templates and clauses.",
//       gradient: "from-blue-500/10 to-blue-600/5",
//       iconBg: "bg-blue-500/20",
//       iconColor: "text-blue-400",
//     },
//     {
//       icon: FileText,
//       title: "Document Analysis",
//       description: "AI-powered analysis of contracts and legal documents.",
//       gradient: "from-[#FFD45E]/10 to-[#e6bf55]/5",
//       iconBg: "bg-[#FFD45E]/20",
//       iconColor: "text-[#FFD45E]",
//     },
//     {
//       icon: Globe,
//       title: "Multi-jurisdiction Support",
//       description: "Legal guidance across different legal systems.",
//       gradient: "from-green-500/10 to-green-600/5",
//       iconBg: "bg-green-500/20",
//       iconColor: "text-green-400",
//     },
//   ];

//   return (
//     <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
//       {/* Main Welcome */}
//       <div className="text-center mb-8 sm:mb-12 max-w-3xl">
//         <motion.div
//           initial={{ scale: 0.8, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           transition={{ delay: 0.1 }}
//           className="mb-6 sm:mb-8"
//         >
//           <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#FFD45E] via-[#e6bf55] to-[#d4a94a] rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl mx-auto mb-4 sm:mb-6 ring-4 ring-[#FFD45E]/10 p-1.5 sm:p-2">
//             <div className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden">
//               <Image
//                 src="/wakilimsomi.jpeg"
//                 alt="Wakili Msomi"
//                 fill
//                 className="object-cover"
//                 sizes="(max-width: 640px) 64px, 80px"
//               />
//             </div>
//           </div>
//         </motion.div>

//         <motion.h1
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2 }}
//           className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight"
//         >
//           How can I help you today?
//         </motion.h1>

//         <motion.p
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.3 }}
//           className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto px-4"
//         >
//           Your AI-powered legal assistant is ready to provide expert guidance on
//           legal matters, document analysis, and professional consultation.
//         </motion.p>

//         {/* Free Prompts Welcome Message */}
//         {user && user.subscription_status === "free" && (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.4 }}
//             className="mt-4 p-4 bg-[#FFD45E]/10 border border-[#FFD45E]/20 rounded-2xl max-w-md mx-auto"
//           >
//             <div className="flex items-center justify-center space-x-2 mb-2">
//               <Sparkles className="h-5 w-5 text-[#FFD45E]" />
//               <span className="text-[#FFD45E] font-semibold">Welcome!</span>
//             </div>
//             <p className="text-sm text-gray-300 text-center">
//               You have{" "}
//               <span className="font-bold text-[#FFD45E]">
//                 {user.free_prompts_remaining ?? 3} free prompts
//               </span>{" "}
//               to explore Wakili Msomi. Ask me anything about legal matters!
//             </p>
//           </motion.div>
//         )}
//       </div>

//       {/* Feature Cards */}
//       <motion.div
//         initial={{ opacity: 0, y: 30 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.4 }}
//         className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12 w-full max-w-5xl"
//       >
//         {featureCards.map((card, index) => (
//           <motion.div
//             key={index}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.5 + index * 0.1 }}
//             whileHover={{ scale: 1.03, y: -4 }}
//             className={`bg-gradient-to-br ${card.gradient} backdrop-blur-sm border border-gray-700/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 cursor-pointer transition-all hover:border-gray-600/50 hover:shadow-lg hover:shadow-[#FFD45E]/5 touch-manipulation`}
//           >
//             <div
//               className={`w-10 h-10 sm:w-12 sm:h-12 ${card.iconBg} rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 ring-2 ring-gray-700/20`}
//             >
//               <card.icon
//                 className={`w-5 h-5 sm:w-6 sm:h-6 ${card.iconColor}`}
//               />
//             </div>
//             <h3 className="text-white font-semibold mb-2 text-base sm:text-lg">
//               {card.title}
//             </h3>
//             <p className="text-gray-400 text-sm leading-relaxed">
//               {card.description}
//             </p>
//           </motion.div>
//         ))}
//       </motion.div>

//       {/* Category Tabs */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.8 }}
//         className="flex items-center space-x-1 sm:space-x-2 p-1.5 sm:p-2 bg-gray-800/40 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-700/30 overflow-x-auto max-w-full"
//       >
//         {tabs.map((tab) => (
//           <button
//             key={tab}
//             onClick={() => setActiveTab(tab)}
//             className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm font-medium transition-all whitespace-nowrap touch-manipulation ${
//               activeTab === tab
//                 ? "bg-[#FFD45E] text-black shadow-lg"
//                 : "text-gray-400 hover:text-white hover:bg-gray-700/50"
//             }`}
//           >
//             {tab}
//           </button>
//         ))}
//       </motion.div>
//     </div>
//   );
// };

export default function Chat({
  selectedConversationId,
  onNewConversation,
  onConversationsChange,
}: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (selectedConversationId) {
      loadConversation(selectedConversationId);
    } else {
      setMessages([]);
    }
  }, [selectedConversationId]);

  const canSend = canSendMessage();
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        await refreshSubscriptionStatus();
      } catch (err) {
        console.error("Failed to fetch subscription status", err);
      }
    };

    if (canSend) {
      fetchSubscriptionStatus();
      setShowSubscriptionModal(false);
    }
  }, [canSend]);

  useEffect(() => {
    if (user) {
      setShowStatusBar(true); // show when user changes
      const timer = setTimeout(() => {
        setShowStatusBar(false);
      }, 5000); // hides after 5 seconds

      return () => clearTimeout(timer); // cleanup if unmounted
    }
  }, [canSend, user]);

  const loadConversation = async (conversationId: string) => {
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

      // Handle authentication expired error
      if (handleAuthError(error, logout)) {
        return; // Don't set error state, just logout
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !isAuthenticated || isLoading) return;

    // Check if user can send message (subscription or free prompts)
    if (!canSendMessage()) {
      setShowSubscriptionModal(true);
      await refreshSubscriptionStatus();
      if (canSendMessage()) {
        setShowSubscriptionModal(false);
      }
      return;
    }

    const messageText = newMessage.trim();
    setNewMessage("");

    try {
      setIsLoading(true);
      setError(null);

      const userMessage = {
        role: "user" as const,
        content: messageText,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Decrement free prompt count for free users before sending the request
      decrementFreePrompt();

      const response = await api.query(messageText);

      if (response) {
        const assistantMessage = {
          role: "assistant" as const,
          content: response.content,
          timestamp: response.timestamp || new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
      if (response?.conversationCreated && onConversationsChange) {
        onConversationsChange(true);
      }
    } catch (error: any) {
      console.error("Error sending message:", error);

      // Handle authentication expired error
      if (handleAuthError(error, logout)) {
        return; // Don't set error state, just logout
      }

      setError(error?.message || "Failed to send message. Please try again.");
      setMessages((prev) => prev.slice(0, -1));
      setNewMessage(messageText);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f]">
      {/* Messages Area - Scrollable */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="min-h-full">
            {/* {messages.length === 0 && !isLoading ? (
              <WelcomeScreen user={user} />
            ) : ( */}

              <div className="py-6 space-y-6">
                {messages.map((message, index) => (
                  <MessageBubble key={index} message={message} index={index} />
                ))}

                <AnimatePresence>
                  {isLoading && <TypingIndicator />}
                </AnimatePresence>

                {/* No more prompts message */}
                {messages.length > 0 &&
                  !canSendMessage() &&
                  user?.subscription_status === "free" && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center justify-center px-4 py-8 max-w-md mx-auto"
                    >
                      <div className="w-16 h-16 bg-[#FFD45E]/10 rounded-full flex items-center justify-center mb-4">
                        <Lock className="h-8 w-8 text-[#FFD45E]" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        Out of Free Prompts
                      </h3>
                      <p className="text-gray-400 text-center mb-4">
                        You've used all your free prompts. Upgrade to continue
                        chatting with Wakili Msomi.
                      </p>
                      <Button
                        onClick={() => setShowSubscriptionModal(true)}
                        className="bg-[#FFD45E] text-black hover:bg-[#e6bf55]"
                      >
                        <Crown className="h-4 w-4 mr-2" />
                        View Plans
                      </Button>
                    </motion.div>
                  )}

                <div ref={messagesEndRef} />
              </div>
            {/* )} */}
          </div>
        </ScrollArea>
      </div>

      {/* Error Display - Fixed Position */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="px-3 sm:px-4 py-2 max-w-6xl mx-auto w-full flex-shrink-0"
          >
            <Alert
              variant="destructive"
              className="bg-red-500/10 border-red-500/30"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area - Fixed at Bottom */}
      <div className="flex-shrink-0 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-1 sm:py-2">
          {/* Subscription Status Bar */}
          {user && showStatusBar && (
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
                    onClick={() => setShowSubscriptionModal(true)}
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
          )}

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
                  placeholder={
                    canSendMessage()
                      ? "Ask about legal matters, contracts, regulations..."
                      : "Subscribe to continue chatting with Wakili Msomi..."
                  }
                  disabled={!isAuthenticated || isLoading}
                  className="pl-12 sm:pl-14 pr-12 sm:pr-14 py-3 sm:py-4 h-12 sm:h-14 bg-gray-800/60 border-gray-700/30 focus:border-[#FFD45E]/50 focus:ring-2 focus:ring-[#FFD45E]/20 placeholder:text-gray-500 text-white rounded-xl sm:rounded-2xl backdrop-blur-sm transition-all text-base"
                />
                <Mic className="absolute right-3 sm:right-5 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 sm:h-5 sm:w-5 cursor-pointer hover:text-gray-300 transition-colors touch-manipulation" />
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="submit"
                disabled={!isAuthenticated || isLoading || !newMessage.trim()}
                className={`h-12 w-12 sm:h-14 sm:w-14 shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 rounded-xl sm:rounded-2xl touch-manipulation ${
                  canSendMessage()
                    ? "bg-gradient-to-r from-[#FFD45E] via-[#e6bf55] to-[#d4a94a] hover:from-[#e6bf55] hover:via-[#d4a94a] hover:to-[#c19c42] text-black"
                    : "bg-gray-700 text-gray-400 cursor-not-allowed"
                }`}
              >
                {canSendMessage() ? (
                  <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </Button>
            </motion.div>
          </form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xs text-gray-500 mt-3 sm:mt-4 text-center px-2"
          >
            For more assistant you can call{" "}
            <span className="text-yellow-300">+255 621 900 555</span>
          </motion.p>
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
