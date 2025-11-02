"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setAuthToken, setStoredUser } from "@/lib/api";
import { FaCheckCircle, FaSpinner } from "react-icons/fa";

export default function AuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    const role = searchParams.get("role");

    if (!token) {
      setStatus("error");
      setError("No token provided");
      return;
    }

    try {
      // Store token and user data
      setAuthToken(token);
      
      // Parse token to get user info (basic - in production, verify token properly)
      const payload = JSON.parse(atob(token.split(".")[1]));
      setStoredUser({
        uid: payload.uid,
        email: payload.email,
        role: payload.role || role || "patient",
      });

      setStatus("success");
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      console.error("Error processing auth:", err);
      setStatus("error");
      setError("Failed to process authentication");
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 p-8 md:p-12 max-w-md w-full mx-4">
        {status === "loading" && (
          <div className="text-center space-y-4">
            <FaSpinner className="animate-spin text-4xl text-teal-600 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Processing authentication...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we sign you in.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center space-y-4">
            <FaCheckCircle className="text-4xl text-green-600 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Authentication Successful!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Redirecting you to the dashboard...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center space-y-4">
            <div className="text-4xl text-red-600 mx-auto">?</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Authentication Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {error || "Something went wrong during authentication."}
            </p>
            <button
              onClick={() => router.push("/auth/login")}
              className="mt-4 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
