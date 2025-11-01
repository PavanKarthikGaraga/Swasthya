"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { FaDatabase, FaUserShield, FaLock, FaBrain, FaNetworkWired, FaCube } from "react-icons/fa";

const nodes = [
  { icon: FaDatabase, label: "Health Data", position: { x: 50, y: 20 }, color: "#00B4D8" },
  { icon: FaUserShield, label: "User", position: { x: 20, y: 50 }, color: "#2ECC71" },
  { icon: FaLock, label: "Encryption", position: { x: 50, y: 50 }, color: "#00FFFF" },
  { icon: FaBrain, label: "AI Analysis", position: { x: 80, y: 50 }, color: "#00B4D8" },
  { icon: FaCube, label: "Blockchain", position: { x: 35, y: 80 }, color: "#2ECC71" },
  { icon: FaNetworkWired, label: "Network", position: { x: 65, y: 80 }, color: "#00FFFF" },
];

const connections = [
  { from: 1, to: 2 },
  { from: 2, to: 0 },
  { from: 2, to: 3 },
  { from: 2, to: 4 },
  { from: 3, to: 5 },
  { from: 4, to: 5 },
];

function Node({ node, index }: { node: typeof nodes[0]; index: number }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="absolute"
      style={{
        left: `${node.position.x}%`,
        top: `${node.position.y}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: index * 0.2,
        }}
        className="relative"
      >
        {/* Glow */}
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: index * 0.2,
          }}
          className="absolute inset-0 rounded-full blur-xl"
          style={{ backgroundColor: node.color, transform: "scale(1.5)" }}
        />

        {/* Node */}
        <div
          className="relative w-20 h-20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 shadow-2xl"
          style={{
            borderColor: node.color,
            backgroundColor: `${node.color}20`,
          }}
        >
          <node.icon className="text-2xl" style={{ color: node.color }} />
        </div>

        {/* Label */}
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span
            className="text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm border"
            style={{
              color: node.color,
              borderColor: `${node.color}40`,
              backgroundColor: `${node.color}10`,
            }}
          >
            {node.label}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Connection({ from, to, delay }: { from: number; to: number; delay: number }) {
  const fromNode = nodes[from];
  const toNode = nodes[to];

  return (
    <motion.svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      <motion.line
        x1={`${fromNode.position.x}%`}
        y1={`${fromNode.position.y}%`}
        x2={`${toNode.position.x}%`}
        y2={`${toNode.position.y}%`}
        stroke="url(#gradient)"
        strokeWidth="2"
        strokeDasharray="5,5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, delay, repeat: Infinity, repeatDelay: 2 }}
      />
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00B4D8" stopOpacity="0.5" />
          <stop offset="50%" stopColor="#00FFFF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#2ECC71" stopOpacity="0.5" />
        </linearGradient>
      </defs>
    </motion.svg>
  );
}

export function BlockchainVisual() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 bg-gradient-to-b from-[#F8F9FA] to-white dark:from-[#081229] dark:to-[#0F1A2E] relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,180,216,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,180,216,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
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
              How It Works
            </span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-[#0A2342] dark:text-white mb-6">
            AI + Blockchain{" "}
            <span className="gradient-text">Architecture</span>
          </h2>
          
          <p className="text-lg text-[#4A5568] dark:text-[#94A3B8] max-w-3xl mx-auto leading-relaxed">
            See how our innovative platform combines artificial intelligence and blockchain technology
            to create a secure, intelligent healthcare ecosystem.
          </p>
        </motion.div>

        {/* Visual Network */}
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8 }}
            className="relative h-[600px] bg-gradient-to-br from-[#0A2342]/5 via-[#00B4D8]/5 to-[#2ECC71]/5 dark:from-[#0A2342]/20 dark:via-[#00B4D8]/10 dark:to-[#2ECC71]/10 rounded-3xl border border-[#00B4D8]/20 shadow-2xl backdrop-blur-sm overflow-hidden"
          >
            {/* Connections */}
            {connections.map((conn, index) => (
              <Connection
                key={index}
                from={conn.from}
                to={conn.to}
                delay={index * 0.2 + 0.5}
              />
            ))}

            {/* Nodes */}
            {nodes.map((node, index) => (
              <Node key={index} node={node} index={index} />
            ))}

            {/* Center Pulse */}
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              animate={{
                scale: [1, 2, 1],
                opacity: [0.3, 0, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
            >
              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-[#00B4D8]/20 to-[#2ECC71]/20 blur-2xl" />
            </motion.div>
          </motion.div>
        </div>

        {/* Features List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {[
            {
              icon: FaLock,
              title: "End-to-End Encryption",
              description: "Your data is encrypted before leaving your device and remains secure throughout the network.",
            },
            {
              icon: FaBrain,
              title: "Real-Time AI Processing",
              description: "Machine learning models analyze your health data instantly to provide actionable insights.",
            },
            {
              icon: FaCube,
              title: "Immutable Records",
              description: "Blockchain ensures your medical history can never be altered or tampered with.",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
              whileHover={{ y: -5 }}
              className="p-6 bg-white dark:bg-[#0F1A2E] rounded-2xl border border-[#E2E8F0] dark:border-[#1E3A5F] shadow-lg"
            >
              <item.icon className="text-3xl text-[#00B4D8] dark:text-[#00FFFF] mb-4" />
              <h3 className="text-xl font-bold text-[#0A2342] dark:text-white mb-2">
                {item.title}
              </h3>
              <p className="text-[#4A5568] dark:text-[#94A3B8] text-sm leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

