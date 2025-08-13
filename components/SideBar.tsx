"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { handleAuthError } from "@/utils/auth-error-handler";
import {
  Plus,
  Search,
  MessageSquare,
  MessageCircle,
  MoreHorizontal,
  Clock,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

interface SideBarProps {
  selectedConversationId?: string;
  onConversationSelect: (id: string) => void;
  isNewConversation: boolean;
  onConversationsChange: (value: boolean) => void;
}

const getConversationSummary = (conversation: any): string => {
  const firstUserMessage = conversation.messages.find(
    (msg: any) => msg.role === "user"
  );

  if (!firstUserMessage) {
    return "New Legal Consultation";
  }

  const content = firstUserMessage.content.toLowerCase();

  // Generate smart titles based on legal topics
  if (content.includes("contract") || content.includes("agreement")) {
    return "Contract Review & Analysis";
  }
  if (
    content.includes("divorce") ||
    content.includes("marriage") ||
    content.includes("custody")
  ) {
    return "Family Law Consultation";
  }
  if (
    content.includes("property") ||
    content.includes("real estate") ||
    content.includes("land")
  ) {
    return "Property Law Discussion";
  }
  if (
    content.includes("employment") ||
    content.includes("job") ||
    content.includes("workplace")
  ) {
    return "Employment Law Inquiry";
  }
  if (
    content.includes("criminal") ||
    content.includes("court") ||
    content.includes("charge")
  ) {
    return "Criminal Law Consultation";
  }
  if (
    content.includes("business") ||
    content.includes("company") ||
    content.includes("startup")
  ) {
    return "Business Law Advisory";
  }
  if (
    content.includes("will") ||
    content.includes("inheritance") ||
    content.includes("estate")
  ) {
    return "Estate Planning";
  }
  if (content.includes("tax") || content.includes("revenue")) {
    return "Tax Law Consultation";
  }
  if (
    content.includes("immigration") ||
    content.includes("visa") ||
    content.includes("citizenship")
  ) {
    return "Immigration Law Help";
  }
  if (
    content.includes("personal injury") ||
    content.includes("accident") ||
    content.includes("compensation")
  ) {
    return "Personal Injury Case";
  }

  // For general questions, create a more descriptive title
  const words = firstUserMessage.content.split(" ");
  if (words.length > 5) {
    const keyWords = words
      .filter((word: string) => word.length > 3)
      .filter(
        (word: string) =>
          ![
            "what",
            "how",
            "when",
            "where",
            "why",
            "can",
            "will",
            "should",
            "about",
            "the",
            "and",
            "for",
            "with",
          ].includes(word.toLowerCase())
      )
      .slice(0, 3)
      .join(" ");

    if (keyWords.length > 0) {
      return `Legal Query: ${
        keyWords.charAt(0).toUpperCase() + keyWords.slice(1)
      }`;
    }
  }

  if (firstUserMessage.content.length > 30) {
    return firstUserMessage.content.substring(0, 27) + "...";
  }
  return firstUserMessage.content;
};

export default function SideBar({
  selectedConversationId,
  onConversationSelect,
  isNewConversation,
  onConversationsChange,
}: SideBarProps) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [hasLoadedConversations, setHasLoadedConversations] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !hasLoadedConversations && !isLoading) {
      loadConversations();
      setHasLoadedConversations(true);
    }
  }, [isAuthenticated, hasLoadedConversations, isLoading]);

  useEffect(() => {
    if (
      isAuthenticated &&
      selectedConversationId === undefined &&
      hasLoadedConversations &&
      !isRefreshing
    ) {
      const refreshTimer = setTimeout(() => {
        loadConversations();
      }, 500);
      return () => clearTimeout(refreshTimer);
    }
  }, [
    selectedConversationId,
    isAuthenticated,
    hasLoadedConversations,
    isRefreshing,
  ]);

  useEffect(() => {
    if (isNewConversation) {
      // Force refresh conversations when new conversation is created
      setHasLoadedConversations(false);
      loadConversations();
      onConversationsChange(false);
    }
  }, [isNewConversation]);

  // Manual refresh function for conversations
  const refreshConversations = () => {
    setHasLoadedConversations(false);
    loadConversations();
  };

  const loadConversations = async () => {
    // Prevent multiple simultaneous calls
    if (isLoading || isRefreshing) {
      return;
    }

    try {
      setIsLoading(true);
      setIsRefreshing(true);
      setError(null);
      const conversations = await api.getConversations();

      if (conversations && conversations.length > 0) {
        const sortedConversations = conversations.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setConversations(sortedConversations);

        if (!selectedConversationId) {
          onConversationSelect(sortedConversations[0].id);
        }
      } else {
        setConversations([]);
      }
    } catch (error: any) {
      console.error("Error loading conversations:", error);

      if (handleAuthError(error, logout)) {
        return;
      }

      setError(error?.message || "Failed to load conversations");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleNewConversation = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const newConversation = await api.createConversation();

      // Update conversations list directly instead of calling loadConversations
      setConversations((prev) => [newConversation, ...prev]);
      onConversationSelect(newConversation.id);
    } catch (error: any) {
      console.error("Error creating conversation:", error);

      if (handleAuthError(error, logout)) {
        return;
      }

      setError(error?.message || "Failed to create conversation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConversation = async (
    conversationId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    try {
      setIsLoading(true);
      setError(null);
      await api.deleteConversation(conversationId);

      // Update conversations list directly instead of calling loadConversations
      setConversations((prev) =>
        prev.filter((conv) => conv.id !== conversationId)
      );

      if (selectedConversationId === conversationId) {
        const remainingConversations = conversations.filter(
          (conv) => conv.id !== conversationId
        );
        if (remainingConversations.length > 0) {
          onConversationSelect(remainingConversations[0].id);
        }
      }
    } catch (error: any) {
      console.error("Error deleting conversation:", error);

      if (handleAuthError(error, logout)) {
        return;
      }

      setError(error?.message || "Failed to delete conversation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConversationSelect = (id: string) => {
    onConversationSelect(id);
    setIsMobileOpen(false);
  };

  const filteredConversations = conversations.filter((conv) =>
    getConversationSummary(conv)
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Mobile Toggle Button — always shows in mobile view */}

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          width: isCollapsed ? 60 : 280,
          translateX:
            isMobileOpen || !isCollapsed || window.innerWidth >= 1024 ? 0 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`${
          isMobileOpen ? "translate-x-0" : "-translate-x-full "
        } fixed lg:relative h-full flex-shrink-0 transition-transform duration-300 ease-in-out z-50 lg:z-0`}
      >
        <div
          className={`w-full h-full flex flex-col lg:border-r lg:border-gray-800/30 relative ${
            isCollapsed ? "lg:bg-[#171717] bg-transparent" : "bg-[#171717]"
          }`}
        >
          {/* Sidebar Topbar */}
          <div className="flex-shrink-0 px-4 sm:px-8 py-3 md:py-8 bg-transparent">
            <div className="flex items-center justify-between">
              <AnimatePresence mode="wait">
                {!isCollapsed ? (
                  <motion.h1
                    key="expanded-title"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="text-white font-medium text-sm"
                  >
                    Chats
                  </motion.h1>
                ) : (
                  <motion.div
                    key="collapsed-title"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="w-6 h-6"
                  />
                )}
              </AnimatePresence>

              {/* Toggle Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-6 h-6 aspect-square bg-[#2a2a2a] hover:bg-[#333333] border border-gray-700 rounded-full items-center justify-center transition-colors flex"
              >
                <AnimatePresence mode="wait">
                  {isCollapsed ? (
                    <motion.div
                      key="expand"
                      initial={{ rotate: -180, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 180, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className="w-3 h-3 text-gray-300" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="collapse"
                      initial={{ rotate: 180, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -180, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronLeft className="w-3 h-3 text-gray-300" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>

          {/* Sidebar Content */}
          <div
            className={`flex-1 flex flex-col overflow-hidden ${
              isCollapsed ? "lg:block hidden" : "block"
            }`}
          >
            {/* New Chat Button */}
            <div className="flex-shrink-0 px-3 pt-1 pb-2">
              <AnimatePresence mode="wait">
                {!isCollapsed ? (
                  <motion.button
                    key="expanded-new-chat"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNewConversation}
                    className="w-full flex items-center justify-center p-2 rounded-md hover:bg-gray-800/50 transition-colors text-gray-400 hover:text-white"
                    title="New chat"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="text-sm">New Chat</span>
                  </motion.button>
                ) : (
                  <motion.button
                    key="collapsed-new-chat"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleNewConversation}
                    className="w-full p-2 rounded-lg hover:bg-gray-800/50 transition-colors flex items-center justify-center"
                    title="New chat"
                  >
                    <Plus className="w-5 h-5 text-gray-400" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Search */}
            <div className="flex-shrink-0 px-3 pb-3">
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="relative overflow-hidden"
                  >
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-3.5 w-3.5" />
                    <Input
                      placeholder="Search"
                      value={searchQuery}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSearchQuery(e.target.value)
                      }
                      className="pl-8 pr-3 h-8 bg-gray-800/50 border-gray-700/50 focus:border-gray-600 focus:ring-0 placeholder:text-gray-500 text-white text-sm rounded-md"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2">
              <div className="space-y-1">
                {filteredConversations.length === 0 ? (
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-8"
                      >
                        <MessageSquare className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No chats yet</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                ) : (
                  filteredConversations.map((conversation, index) => (
                    <motion.div
                      key={conversation.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleConversationSelect(conversation.id)}
                      className={`group flex items-center justify-between p-2 rounded-md cursor-pointer transition-all duration-200 ${
                        selectedConversationId === conversation.id
                          ? "bg-gray-800 shadow-sm"
                          : "hover:bg-gray-800/50"
                      }`}
                      title={
                        isCollapsed
                          ? getConversationSummary(conversation)
                          : undefined
                      }
                    >
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <MessageCircle
                          className={`${
                            isCollapsed ? "w-5 h-5" : "w-4 h-4"
                          } text-gray-500 flex-shrink-0`}
                        />
                        <AnimatePresence>
                          {!isCollapsed && (
                            <motion.span
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: "auto" }}
                              exit={{ opacity: 0, width: 0 }}
                              transition={{ duration: 0.2 }}
                              className="text-white text-sm truncate overflow-hidden"
                            >
                              {getConversationSummary(conversation)}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 0, scale: 1 }}
                            whileHover={{ opacity: 1, scale: 1.1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteConversation(conversation.id, e);
                            }}
                            className="group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
