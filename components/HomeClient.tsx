// components/HomeClient.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SideBar from "@/components/SideBar";
import Chat from "@/components/Chat";
import Topbar from "@/components/Topbar";
import { useAuth } from "@/contexts/AuthContext";
import ClientOnly from "@/components/ClientOnly";

export default function HomeClient() {
  const [selectedConversationId, setSelectedConversationId] = useState<string>();
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
    <ClientOnly>
      <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] fixed inset-0">
        {/* SEO-friendly heading for screen readers */}
        <h1 className="sr-only">Wakili Msomi - AI Legal Assistant Dashboard</h1>
        
        {/* Fixed Top Bar */}
        <div className="flex-shrink-0 relative z-50 w-full">
          <Topbar />
        </div>

        {/* Main Content Area - Below Top Bar */}
        <div className="flex flex-1 overflow-hidden relative">
          <SideBar
            selectedConversationId={selectedConversationId}
            onConversationSelect={handleConversationSelect}
            isNewConversation={isNewConversation}
            onConversationsChange={(value: boolean) =>
              setIsNewConversation(value)
            }
          />

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
    </ClientOnly>
  );
}