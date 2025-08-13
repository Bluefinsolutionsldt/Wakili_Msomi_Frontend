// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SideBar from "@/components/SideBar";
import Chat from "@/components/Chat";
import Topbar from "@/components/Topbar";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const [selectedConversationId, setSelectedConversationId] =
    useState<string>();
  const [isNewConversation, setIsNewConversation] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect to auth page if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth");
    }
  }, [isAuthenticated, router]);

  const handleConversationSelect = (id: string) => {
    setSelectedConversationId(id);
  };

  const handleNewConversation = () => {
    setSelectedConversationId(undefined);
  };

  // Show loading while checking authentication status
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] fixed inset-0">
      {/* Sidebar - Full height on the left */}
      <SideBar
        selectedConversationId={selectedConversationId}
        onConversationSelect={handleConversationSelect}
        isNewConversation={isNewConversation}
        onConversationsChange={(value: boolean) => setIsNewConversation(value)}
      />

      {/* Right side content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar - After sidebar */}
        <div className="flex-shrink-0 relative z-30 w-full">
          <Topbar />
        </div>

        {/* Chat Area - Below Topbar */}
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
