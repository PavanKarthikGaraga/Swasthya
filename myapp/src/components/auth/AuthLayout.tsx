"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6">
      {/* Subtle Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(20,184,166,0.05),transparent_60%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(20,184,166,0.1),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md space-y-8 relative z-10"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-sm" />
          <motion.span
            whileHover={{ scale: 1.02 }}
            className="text-2xl font-bold tracking-tight"
          >
            Swasthya
          </motion.span>
        </Link>

        {/* Form content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-card border border-border rounded-2xl shadow-medium p-8"
        >
          {/* Header inside card */}
          <div className="text-center space-y-3 mb-8">
            <h1 className="text-3xl font-bold leading-tight">{title}</h1>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>
          
          {children}
        </motion.div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center text-sm text-muted-foreground"
        >
          <p>
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-primary hover:underline transition-colors">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:underline transition-colors">
              Privacy Policy
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
