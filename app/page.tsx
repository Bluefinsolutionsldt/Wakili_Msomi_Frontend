// src/app/page.tsx
"use client";

import { useState } from "react";
import SideBar from "@/components/SideBar";
import Chat from "@/components/Chat";
import Topbar from "@/components/Topbar";
import { useAuth } from "@/contexts/AuthContext";
import AuthForm from "@/components/auth/AuthForm";

export default function Home() {
  const [selectedConversationId, setSelectedConversationId] =
    useState<string>();
  const [isNewConversation, setIsNewConversation] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleConversationSelect = (id: string) => {
    setSelectedConversationId(id);
  };

  const handleNewConversation = () => {
    setSelectedConversationId(undefined);
  };

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] fixed inset-0">
      {/* Fixed Top Bar */}
      <div className="flex-shrink-0 relative z-50 w-full">
        <Topbar />
      </div>

      {/* Main Content Area - Below Top Bar */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar - Now handles its own toggle logic */}
        <SideBar
          selectedConversationId={selectedConversationId}
          onConversationSelect={handleConversationSelect}
          isNewConversation={isNewConversation}
          onConversationsChange={(value: boolean) =>
            setIsNewConversation(value)
          }
        />

        {/* Chat Area - Scrollable */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Chat
            selectedConversationId={selectedConversationId}
            onNewConversation={handleNewConversation}
            onConversationsChange={(value: boolean) =>
              setIsNewConversation(value)
            }
          />
        </div>
      </div>
    </div>
  );
}
