"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FaExclamationTriangle } from "react-icons/fa";

export default function AuthErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "Unknown error occurred";

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case "access_denied":
        return "Access was denied. Please try again.";
      case "oauth_callback_failed":
        return "OAuth callback failed. Please try again.";
      default:
        return `Authentication error: ${errorCode}`;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 p-8 md:p-12 max-w-md w-full mx-4">
        <div className="text-center space-y-4">
          <FaExclamationTriangle className="text-4xl text-red-600 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Authentication Error
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {getErrorMessage(error)}
          </p>
          <div className="flex gap-4 justify-center mt-6">
            <button
              onClick={() => router.push("/auth/login")}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Go to Login
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
