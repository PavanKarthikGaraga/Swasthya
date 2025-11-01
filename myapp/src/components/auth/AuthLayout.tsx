"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { HeartPulse } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2">
          <div className="bg-teal-600 p-2 rounded-xl shadow-sm">
            <HeartPulse className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900">Swasthya</span>
        </div>

        {/* Form content */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6">
          {/* Header inside card */}
          <div className="text-center space-y-2 mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-600">{subtitle}</p>
          </div>
          
          {children}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-teal-600 hover:underline transition-colors">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-teal-600 hover:underline transition-colors">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
