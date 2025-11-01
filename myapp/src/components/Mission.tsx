"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { FaLightbulb, FaRocket, FaUsers, FaGlobe } from "react-icons/fa";

const missions = [
  {
    icon: FaLightbulb,
    title: "Innovation First",
    description: "Pioneering the future of healthcare with cutting-edge AI and blockchain technology.",
    color: "#00FFFF",
  },
  {
    icon: FaRocket,
    title: "Patient Empowerment",
    description: "Putting you in control of your health data with secure, accessible solutions.",
    color: "#2ECC71",
  },
  {
    icon: FaUsers,
    title: "Trust & Privacy",
    description: "Building a foundation of trust with military-grade encryption and blockchain security.",
    color: "#00B4D8",
  },
  {
    icon: FaGlobe,
    title: "Global Access",
    description: "Making quality healthcare accessible to everyone, everywhere, at any time.",
    color: "#00FFFF",
  },
];

function TimelineItem({ mission, index }: { mission: typeof missions[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className={`flex items-center gap-8 ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
    >
      {/* Content Card */}
      <div className="flex-1">
        <motion.div
          whileHover={{ scale: 1.02, y: -5 }}
          className="p-6 bg-white dark:bg-[#0F1A2E] rounded-2xl shadow-xl border border-[#E2E8F0] dark:border-[#1E3A5F] hover:border-[#00B4D8] dark:hover:border-[#00FFFF] transition-all"
        >
          <div className="flex items-start gap-4">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="p-3 rounded-xl bg-gradient-to-br from-[#00B4D8]/10 to-[#2ECC71]/10 border border-[#00B4D8]/20"
              style={{ borderColor: `${mission.color}40` }}
            >
              <mission.icon className="text-2xl" style={{ color: mission.color }} />
            </motion.div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-[#0A2342] dark:text-white mb-2">
                {mission.title}
              </h3>
              <p className="text-[#4A5568] dark:text-[#94A3B8] leading-relaxed">
                {mission.description}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Timeline Node */}
      <div className="relative flex flex-col items-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ duration: 0.5, delay: index * 0.2 }}
          className="w-4 h-4 rounded-full bg-gradient-to-br from-[#00B4D8] to-[#2ECC71] shadow-lg z-10"
          style={{ boxShadow: `0 0 20px ${mission.color}80` }}
        />
        {index < missions.length - 1 && (
          <motion.div
            initial={{ height: 0 }}
            animate={isInView ? { height: "100%" } : {}}
            transition={{ duration: 0.8, delay: index * 0.2 + 0.3 }}
            className="absolute top-4 w-0.5 h-24 bg-gradient-to-b from-[#00B4D8] to-transparent"
          />
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />
    </motion.div>
  );
}

export function Mission() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="mission" className="py-24 bg-gradient-to-b from-[#F8F9FA] to-white dark:from-[#081229] dark:to-[#0F1A2E] relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 right-0 w-96 h-96 bg-[#00B4D8] rounded-full blur-[100px]"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-block mb-4"
          >
            <span className="px-4 py-2 bg-gradient-to-r from-[#00B4D8]/10 to-[#2ECC71]/10 border border-[#00B4D8]/20 rounded-full text-sm font-semibold text-[#00B4D8] dark:text-[#00FFFF]">
              Our Mission
            </span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-[#0A2342] dark:text-white mb-6">
            Empowering Users Through{" "}
            <span className="gradient-text">Secure, AI-Driven Healthcare</span>
          </h2>
          
          <p className="text-lg text-[#4A5568] dark:text-[#94A3B8] max-w-3xl mx-auto leading-relaxed">
            At Swasthya, we believe healthcare should be intelligent, secure, and accessible to everyone.
            Our platform combines the power of blockchain and AI to revolutionize how you manage your health.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto space-y-8">
          {missions.map((mission, index) => (
            <TimelineItem key={index} mission={mission} index={index} />
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto"
        >
          {[
            { value: "10K+", label: "Active Users" },
            { value: "99.9%", label: "Uptime" },
            { value: "50+", label: "Healthcare Partners" },
            { value: "1M+", label: "Records Secured" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, y: -5 }}
              className="p-6 bg-white dark:bg-[#0F1A2E] rounded-2xl shadow-lg border border-[#E2E8F0] dark:border-[#1E3A5F] text-center"
            >
              <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-[#4A5568] dark:text-[#94A3B8] font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

