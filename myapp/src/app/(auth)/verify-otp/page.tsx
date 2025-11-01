"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { OTPInput } from "@/components/auth/OTPInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FaSpinner, FaEnvelope } from "react-icons/fa";

export default function VerifyOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const type = searchParams.get("type") || "signup"; // signup, login, forgot-password
  
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      router.push("/login");
    }
  }, [email, router]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOTPComplete = async (otpValue: string) => {
    setOtp(otpValue);
    setError("");
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, accept any 6-digit OTP
      if (otpValue.length === 6) {
        console.log("OTP verified:", otpValue);
        
        // Redirect based on type
        if (type === "signup") {
          router.push("/onboarding"); // New users need to complete onboarding
        } else if (type === "login") {
          // Check if user has completed onboarding
          const hasCompletedOnboarding = localStorage.getItem("onboardingCompleted");
          if (hasCompletedOnboarding) {
            router.push("/dashboard");
          } else {
            router.push("/onboarding");
          }
        } else if (type === "forgot-password") {
          router.push("/reset-password");
        }
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setError("");
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log("OTP resent to:", email);
      setTimeLeft(300); // Reset timer
      setCanResend(false);
    } catch (error) {
      console.error("Resend OTP error:", error);
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const getTitle = () => {
    switch (type) {
      case "signup":
        return "Verify your email";
      case "login":
        return "Two-factor authentication";
      case "forgot-password":
        return "Reset your password";
      default:
        return "Verify your email";
    }
  };

  const getSubtitle = () => {
    switch (type) {
      case "signup":
        return "We've sent a verification code to your email address";
      case "login":
        return "Enter the verification code sent to your email";
      case "forgot-password":
        return "Enter the code we sent to reset your password";
      default:
        return "We've sent a verification code to your email address";
    }
  };

  if (!email) {
    return null; // Will redirect
  }

  return (
    <AuthLayout title={getTitle()} subtitle={getSubtitle()}>
      <div className="space-y-4">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-3">
            <FaEnvelope className="text-lg text-teal-600" />
          </div>
          <p className="text-sm text-gray-600">
            Code sent to {email}
          </p>
        </div>
        {/* OTP Input */}
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <OTPInput
              length={6}
              onComplete={handleOTPComplete}
              disabled={isLoading}
              error={!!error}
            />
            
            {error && (
              <div className="text-center">
                <p className="text-xs text-red-500">{error}</p>
              </div>
            )}

            {isLoading && (
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <FaSpinner className="animate-spin text-sm" />
                <span>Verifying...</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timer and Resend */}
        <div className="text-center space-y-2">
          {!canResend ? (
            <p className="text-xs text-gray-500">
              Expires in {formatTime(timeLeft)}
            </p>
          ) : (
            <div className="space-y-1">
              <p className="text-xs text-gray-500">
                Didn&apos;t receive it?
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResendOTP}
                disabled={isResending || isLoading}
                className="text-teal-600 hover:text-teal-700 text-xs h-8"
              >
                {isResending ? (
                  <>
                    <FaSpinner className="animate-spin mr-1 text-xs" />
                    Sending...
                  </>
                ) : (
                  "Resend code"
                )}
              </Button>
            </div>
          )}
        </div>

        <Button
          variant="outline"
          className="w-full h-10 border border-gray-300 hover:bg-gray-50 text-sm font-medium text-gray-700"
          onClick={() => router.back()}
          disabled={isLoading || isResending}
        >
          Back
        </Button>
      </div>
    </AuthLayout>
  );
}
