"use client";

import React from "react";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import SubscriptionModal from "./SubscriptionModal";
import {
  UserCircleIcon,
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Crown, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TopbarProps {
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export default function Topbar({
  isSidebarOpen,
  onToggleSidebar,
}: TopbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="relative bg-gradient-to-r from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] border-b border-gray-800/30 backdrop-blur-sm">
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Mobile Menu Button - Only visible on mobile and when onToggleSidebar is provided */}
          {onToggleSidebar && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleSidebar}
              className="lg:hidden p-2.5 bg-gradient-to-r from-[#FFD45E] to-[#e6bf55] rounded-xl shadow-lg hover:from-[#e6bf55] hover:to-[#d4a94a] transition-all duration-300 border border-[#FFD45E]/20 touch-manipulation"
              aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
            >
              {isSidebarOpen ? (
                <XMarkIcon className="w-5 h-5 text-black" />
              ) : (
                <Bars3Icon className="w-5 h-5 text-black" />
              )}
            </motion.button>
          )}

          {/* Logo and Brand - Centered on mobile */}
          <div className="flex items-center space-x-3 lg:ml-0 ml-auto mr-auto lg:mr-0">
            {/* Logo */}
            <div
              className={`${
                onToggleSidebar ? "hidden lg:flex" : "flex"
              } w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FFD45E] via-[#e6bf55] to-[#d4a94a] rounded-2xl items-center justify-center shadow-lg ring-2 ring-[#FFD45E]/20 p-1.5 sm:p-2`}
            >
              <div className="relative w-full h-full rounded-xl overflow-hidden">
                <Image
                  src="/wakilimsomi.jpeg"
                  alt="Wakili Msomi"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 40px, 48px"
                />
              </div>
            </div>

            {/* Brand Text */}
            <div className="block">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white tracking-tight">
                Wakili Msomi
              </h1>
              <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">
                AI Legal Assistant
              </p>
            </div>
          </div>

          {/* User Menu */}
          <div className="relative" ref={dropdownRef}>
            {isAuthenticated ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 sm:space-x-3 bg-gray-800/60 hover:bg-gray-800/80 border border-gray-700/50 rounded-3xl px-3 sm:px-4 py-2 sm:py-2.5 transition-all backdrop-blur-sm"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#FFD45E] to-[#e6bf55] flex items-center justify-center shadow-md">
                    <UserCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                  </div>

                  <ChevronDownIcon
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </motion.button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700/50 py-2 z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-700/50">
                        <p className="text-sm font-medium text-white">
                          {user?.username || user?.id || "User"}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          @{user?.username || user?.id}
                        </p>
                        {/* Subscription Status */}
                        <div className="mt-2">
                          {user?.subscription_status === "free" ? (
                            <div className="flex items-center justify-between bg-gray-800/40 rounded-lg px-2 py-1">
                              <span className="text-xs text-orange-400">
                                {user.free_prompts_remaining ?? 0} free prompts
                                left
                              </span>
                              <Crown className="h-3 w-3 text-orange-400" />
                            </div>
                          ) : user?.subscription_status ? (
                            <div className="flex items-center justify-between bg-green-500/10 rounded-lg px-2 py-1">
                              <span className="text-xs text-green-400 font-medium">
                                {user.subscription_status.toUpperCase()} PLAN
                              </span>
                              <Crown className="h-3 w-3 text-[#FFD45E]" />
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="py-1">
                        <button className="flex items-center w-full px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors">
                          <UserCircleIcon className="w-4 h-4 mr-3" />
                          Profile Settings
                        </button>

                        <button
                          onClick={() => {
                            setShowSubscriptionModal(true);
                            setIsDropdownOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors"
                        >
                          <CreditCard className="w-4 h-4 mr-3" />
                          {user?.subscription_status === "free"
                            ? "Upgrade Plan"
                            : "Manage Subscription"}
                        </button>

                        <button
                          onClick={() => {
                            logout();
                            router.push("/auth");
                          }}
                          className="flex items-center w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                        >
                          <svg
                            className="w-4 h-4 mr-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/auth")}
                className="bg-gradient-to-r from-[#FFD45E] to-[#e6bf55] hover:from-[#e6bf55] hover:to-[#d4a94a] text-black font-semibold px-6 py-2.5 rounded-xl shadow-lg transition-all duration-300"
              >
                Sign In
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
    </header>
  );
}
