"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { FaSpinner, FaArrowLeft, FaEnvelope } from "react-icons/fa";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError("");
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log("Password reset requested for:", email);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Forgot password error:", error);
      setError("Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log("Reset email resent to:", email);
    } catch (error) {
      console.error("Resend error:", error);
      setError("Failed to resend email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle="We've sent password reset instructions to your email"
      >
        <div className="space-y-4">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <FaEnvelope className="text-lg text-green-600" />
            </div>
            <p className="text-sm text-gray-600">
              Email sent to {email}
            </p>
          </div>
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-6 text-center space-y-4">
              <p className="text-xs text-gray-500">
                If an account exists, we&apos;ve sent you a reset link.
              </p>
              
              <div className="space-y-1">
                <p className="text-xs text-gray-500">
                  Didn&apos;t receive it?
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResendEmail}
                  disabled={isLoading}
                  className="text-teal-600 hover:text-teal-700 text-xs h-8"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin mr-1 text-xs" />
                      Sending...
                    </>
                  ) : (
                    "Resend email"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-xl border border-red-200 text-center">
              {error}
            </div>
          )}

          <Button
            variant="outline"
            className="w-full h-10 border border-gray-300 hover:bg-gray-50 text-sm font-medium text-gray-700"
            onClick={() => router.push("/login")}
          >
            <FaArrowLeft className="mr-2 text-sm" />
            Back to login
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email" className="text-sm text-gray-700">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              disabled={isLoading}
              className={`h-10 ${error ? "border-red-500" : ""}`}
            />
            {error && (
              <p className="text-xs text-red-500">{error}</p>
            )}
          </div>

          <div className="p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-xs text-blue-700">
              We&apos;ll send reset instructions. Link expires in 1 hour.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg shadow-lg shadow-teal-600/25 hover:shadow-xl hover:shadow-teal-600/30 transition-all duration-200"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin text-sm" />
                Sending...
              </>
            ) : (
              "Send reset email"
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full text-gray-600 hover:text-gray-800 hover:bg-gray-50 text-sm"
            onClick={() => router.push("/login")}
            disabled={isLoading}
          >
            <FaArrowLeft className="mr-2 text-sm" />
            Back to login
          </Button>

          <p className="text-center text-xs text-gray-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-teal-600 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
