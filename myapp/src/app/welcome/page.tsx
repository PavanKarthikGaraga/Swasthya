"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaHeartbeat, FaCheckCircle, FaArrowRight } from "react-icons/fa";

export default function WelcomePage() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect to dashboard after 10 seconds
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 10000);

    return () => clearTimeout(timer);
  }, [router]);

  const handleContinue = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="text-center shadow-lg border border-gray-200">
          <CardHeader className="pb-4">
            <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6">
              <FaCheckCircle className="text-4xl text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome to Swasthya!
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                Your account has been successfully created and verified. 
                You&apos;re now part of the Swasthya community!
              </p>

              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <FaHeartbeat className="text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Track Your Health
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      Monitor vitals, medications, and appointments
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <FaCheckCircle className="text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Secure & Private
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      Your health data is encrypted and protected
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <FaArrowRight className="text-purple-600 dark:text-purple-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Get Started
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      Set up your profile and health preferences
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleContinue}
                className="w-full h-11 bg-primary hover:bg-primary/90"
              >
                Continue to Dashboard
                <FaArrowRight className="ml-2" />
              </Button>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Redirecting automatically in 10 seconds...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
