"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center bg-background pt-24 pb-12">
      {/* Subtle Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(20,184,166,0.05),transparent_60%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(20,184,166,0.1),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Content */}
          <div className="max-w-5xl mx-auto text-center space-y-12">
            {/* Badge */}
        <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/20 rounded-full">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                <span className="text-sm font-medium">Healthcare Infrastructure for Tomorrow</span>
              </div>
            </motion.div>

          {/* Main Heading */}
          <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.1] tracking-tight"
          >
              Your health data.
            <br />
              <span className="text-gradient">Secure. Intelligent.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto"
          >
              Store, access, and analyze your medical records with blockchain security
              and AI-powered insights. Complete control, absolute privacy.
          </motion.p>

          {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/signup">
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-10 py-7 text-lg font-semibold bg-foreground text-background hover:bg-foreground/90 rounded-full shadow-lg hover:shadow-xl transition-all"
                >
                  Get Started Free
            </Button>
              </Link>
              <Link href="#how-it-works">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto px-10 py-7 text-lg font-semibold border-2 rounded-full"
                >
                  How It Works
                </Button>
              </Link>
          </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full" />
                <span>256-bit Encryption</span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full" />
                <span>10,000+ Active Users</span>
              </div>
        </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <div className="w-px h-16 bg-gradient-to-b from-transparent via-border to-transparent" />
          <span className="text-xs uppercase tracking-widest text-muted-foreground/50">Scroll</span>
        </motion.div>
      </motion.div>
    </section>
  );
}
