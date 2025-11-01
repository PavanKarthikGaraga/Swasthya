"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Users, Target, TrendingUp, Star } from "lucide-react";

const fadeInScale = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export function Stats() {
  const stats = [
    { 
      icon: Users, 
      value: "50K+", 
      label: "Active Users",
      trend: "+23% this month",
      iconBg: "bg-teal-600"
    },
    { 
      icon: Target, 
      value: "99.5%", 
      label: "AI Accuracy",
      trend: "Clinical Grade",
      iconBg: "bg-cyan-600"
    },
    { 
      icon: TrendingUp, 
      value: "2.5M+", 
      label: "Diagnoses",
      trend: "Globally trusted",
      iconBg: "bg-blue-600"
    },
    { 
      icon: Star, 
      value: "4.9/5", 
      label: "User Rating",
      trend: "5,000+ reviews",
      iconBg: "bg-amber-500"
    },
  ];

  return (
    <section className="min-h-screen flex items-center justify-center py-20 px-4">
      <div className="container mx-auto w-[85%] max-w-7xl">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {stats.map((stat, index) => (
            <motion.div key={index} variants={fadeInScale}>
              <Card className="bg-white border border-gray-200 hover:border-teal-300 hover:shadow-xl transition-all duration-300 group overflow-hidden relative rounded-2xl">
                <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-full blur-2xl -mr-12 -mt-12 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="pb-2 relative">
                  <div className={`w-11 h-11 rounded-xl ${stat.iconBg} p-2.5 mb-3 group-hover:scale-110 transition-transform shadow-md`}>
                    <stat.icon className="w-full h-full text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-3xl font-bold mb-1 text-gray-900">
                    {stat.value}
                  </div>
                  <div className="text-xs font-semibold text-gray-700 mb-1">{stat.label}</div>
                  <div className="text-[10px] text-gray-500 font-medium">{stat.trend}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

