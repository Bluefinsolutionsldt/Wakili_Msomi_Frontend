"use client";

import { useEffect } from "react";
import { Metadata } from "next";
import { generateMetadata } from "@/components/seo/SEOHead";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AuthForm from "@/components/auth/AuthForm";

export default function AuthPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  // Show loading while checking authentication status
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="text-white">Redirecting...</div>
      </div>
    );
  }

  return <AuthForm />;
}
