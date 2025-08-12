"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";
import { SubscriptionPlan } from "@/types/auth";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "daily",
    name: "Daily",
    description: "24 hours",
    price: 1500,
    duration: "24 hours",
    features: ["Unlimited queries", "Priority responses"],
  },
  {
    id: "weekly",
    name: "Weekly",
    description: "7 days",
    price: 8000,
    duration: "7 days",
    features: ["All daily features", "Advanced templates"],
  },
  {
    id: "monthly",
    name: "Monthly",
    description: "30 days - Best Value",
    price: 25000,
    duration: "30 days",
    features: ["All weekly features", "Priority support"],
  },
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-TZ", {
    style: "currency",
    currency: "TZS",
    minimumFractionDigits: 0,
  }).format(price);
};

export default function SubscriptionModal({
  isOpen,
  onClose,
}: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");
  const { user, refreshUserInfo } = useAuth();

  const handleSubscribe = async (planId: string) => {
    if (!phone) {
      setError("Please enter your phone number");
      return;
    }

    if (!/^255\d{9}$/.test(phone.replace(/\s/g, ""))) {
      setError("Please enter a valid Tanzanian phone number (255XXXXXXXXX)");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await api.createSubscriptionOrder(
        planId,
        parseInt(phone.replace(/\s/g, ""))
      );

      // Debug: Log the full response
      console.log("Subscription response:", response);

      // Check if we got a payment URL
      if (response.payment_url) {
        console.log("Payment URL received:", response.payment_url);
        setPaymentUrl(response.payment_url); // Store for manual backup

        // Try opening in new tab first
        const newWindow = window.open(
          response.payment_url,
          "_blank",
          "noopener,noreferrer"
        );

        // If popup was blocked, redirect in current tab
        if (
          !newWindow ||
          newWindow.closed ||
          typeof newWindow.closed === "undefined"
        ) {
          console.log("Popup blocked, redirecting in current tab...");
          window.location.href = response.payment_url;
          return; // Don't execute the rest if redirecting
        }

        // Handle successful payment initiation
        setSuccess(true);
        await refreshUserInfo(); // Refresh user info to get updated subscription status

        setTimeout(() => {
          onClose();
          setSuccess(false);
          setSelectedPlan("");
          setPhone("");
          setPaymentUrl("");
        }, 5000); // Give more time to complete payment
      } else {
        console.error("No payment_url in response:", response);
        throw new Error("No payment URL received from server");
      }
    } catch (error: any) {
      console.error("Subscription error:", error);
      setError(
        error.message || "Failed to process subscription. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove non-digits

    // Format as 255 XXX XXX XXX
    if (value.length > 3) {
      value = value.substring(0, 3) + " " + value.substring(3);
    }
    if (value.length > 7) {
      value = value.substring(0, 7) + " " + value.substring(7);
    }
    if (value.length > 11) {
      value = value.substring(0, 11) + " " + value.substring(11, 14);
    }

    setPhone(value.substring(0, 15)); // Limit to 15 characters (255 XXX XXX XXX)
  };

  if (success) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800">
          <div className="text-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Check className="h-8 w-8 text-green-400" />
            </motion.div>
            <h3 className="text-xl font-bold text-white mb-2">
              Redirecting to Payment Gateway!
            </h3>
            <p className="text-gray-400 mb-4">
              You will be redirected to the payment gateway to complete your
              payment. If the redirect doesn't work automatically, please check
              your browser's popup settings and try again.
            </p>
            <div className="flex gap-3 justify-center">
              {paymentUrl && (
                <Button
                  onClick={() =>
                    window.open(paymentUrl, "_blank", "noopener,noreferrer")
                  }
                  className="bg-green-600 text-white hover:bg-green-700"
                >
                  Open Payment Gateway
                </Button>
              )}
              <Button
                onClick={onClose}
                className="bg-[#FFD45E] text-black hover:bg-[#e6bf55]"
              >
                Got it
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            Choose Plan
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-sm">
            {user?.free_prompts_remaining !== undefined && (
              <span>{user.free_prompts_remaining} free prompts left</span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 my-4">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative p-3 border rounded-lg cursor-pointer transition-all ${
                selectedPlan === plan.id
                  ? "border-[#FFD45E] bg-[#FFD45E]/5"
                  : "border-gray-700 hover:border-gray-600 bg-gray-800/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold">{plan.name}</h3>
                  <p className="text-gray-400 text-sm">{plan.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white">
                    {formatPrice(plan.price)}
                  </div>
                  <div className="text-xs text-gray-400">
                    per {plan.duration}
                  </div>
                </div>
              </div>
              <div className="mt-2 flex gap-2 text-xs text-gray-300">
                {plan.features.map((feature, index) => (
                  <span key={index} className="flex items-center">
                    <Check className="h-3 w-3 text-[#FFD45E] mr-1" />
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {selectedPlan && (
          <div className="border-t border-gray-800 pt-3 space-y-3">
            <div>
              <Label htmlFor="phone" className="text-gray-300 text-sm">
                M-Pesa Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="255XXXXXXXXX"
                value={phone}
                onChange={handlePhoneChange}
                className="mt-1 bg-gray-800 border-gray-700 text-white text-sm"
                disabled={isLoading}
              />
            </div>

            {error && <div className="text-red-400 text-xs">{error}</div>}

            <div className="flex gap-2">
              <Button
                onClick={() => handleSubscribe(selectedPlan)}
                disabled={isLoading || !phone}
                className="flex-1 bg-[#FFD45E] text-black hover:bg-[#e6bf55] disabled:opacity-50 text-sm py-2"
              >
                {isLoading ? "Processing..." : "Pay Now"}
              </Button>
              <Button
                onClick={() => {
                  setSelectedPlan("");
                  setPhone("");
                  setError("");
                }}
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-gray-800 text-sm py-2"
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
