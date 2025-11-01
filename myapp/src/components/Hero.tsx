"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap, ArrowRight, Activity } from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center pt-32 pb-16 px-4 relative bg-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-teal-50/60 via-teal-25/40 to-white"></div>
      <div className="absolute inset-0 bg-linear-to-br from-transparent via-teal-50/20 to-teal-100/30"></div>
      <div className="container mx-auto w-[85%] max-w-7xl relative z-10">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="text-center"
        >
          {/* Badge */}
         

          {/* Main Heading */}
          <motion.h1
            variants={fadeInUp}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight text-gray-900"
          >
            AI-Powered
            <br />
            <span className="text-teal-600">
              Health Intelligence
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeInUp}
            className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            Transform your healthcare experience with cutting-edge AI diagnostics,
            <br className="hidden md:block" />
            real-time health monitoring, and instant access to medical expertise.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button className="group bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-8 py-5 text-sm font-semibold shadow-lg shadow-teal-600/25 hover:shadow-xl hover:shadow-teal-600/30 transition-all duration-300">
              <Zap className="mr-2 h-4 w-4" />
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Card className="border-2 border-gray-300 hover:border-teal-600 hover:bg-teal-50 hover:shadow-lg transition-all duration-300 bg-white rounded-xl overflow-hidden">
              <Button
                variant="ghost"
                className="w-full h-full px-8 py-5 text-sm font-semibold hover:bg-transparent"
              >
                <Activity className="mr-2 h-4 w-4" />
                Watch Demo
              </Button>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

