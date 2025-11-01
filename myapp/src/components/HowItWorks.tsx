"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

  const steps = [
    {
    number: "01",
    title: "Upload & Encrypt",
    description: "Upload your medical records, prescriptions, and test results. All data is automatically encrypted with 256-bit AES before leaving your device.",
    },
    {
    number: "02",
    title: "Blockchain Storage",
    description: "Encrypted data is distributed across our blockchain network, creating an immutable, tamper-proof record of your health history.",
    },
    {
    number: "03",
    title: "AI Analysis",
    description: "Advanced machine learning models analyze your health data to provide instant insights, predictions, and personalized recommendations.",
  },
  {
    number: "04",
    title: "Access Anywhere",
    description: "Retrieve your complete medical history from any device, anytime. Share with healthcare providers with granular permission controls.",
  },
];

const techStack = [
  {
    label: "Blockchain Layer",
    items: ["Ethereum Network", "IPFS Storage", "Smart Contracts"],
  },
  {
    label: "AI & Analytics",
    items: ["TensorFlow Models", "PyTorch Neural Nets", "GPT Integration"],
  },
  {
    label: "Security Layer",
    items: ["256-bit AES Encryption", "Zero-Knowledge Proofs", "Multi-Factor Auth"],
  },
];

export function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} id="how-it-works" className="py-32 bg-muted/30">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mb-24"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/20 rounded-full mb-6">
              <span className="text-sm font-medium">How It Works</span>
            </div>
            
            <h2 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              Four simple steps to{" "}
              <span className="text-gradient">complete control</span>
          </h2>

            <p className="text-xl text-muted-foreground leading-relaxed">
              From upload to insights in minutes. Your health data journey,
              secured by blockchain and powered by AI.
          </p>
        </motion.div>

          {/* Process Steps */}
          <div className="relative">
            {/* Connection Line - Desktop */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-border to-transparent hidden lg:block" />

            {/* Steps Grid */}
            <div className="grid lg:grid-cols-4 gap-8 lg:gap-4 relative">
          {steps.map((step, index) => (
            <motion.div
              key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
                  className="relative group"
            >
                  {/* Step Card */}
                  <div className="bg-card border border-border rounded-2xl p-8 hover:border-primary/30 transition-all duration-300 relative h-full">
                    {/* Number Badge */}
                    <div className="absolute -top-6 left-8">
                      <div className="w-12 h-12 bg-primary text-primary-foreground border-4 border-background rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                        {step.number}
                </div>
              </div>

              {/* Content */}
                    <div className="pt-8 space-y-4">
                      <h3 className="text-2xl font-bold">{step.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>

                    {/* Decorative Line */}
                    <motion.div
                      initial={{ width: 0 }}
                      animate={isInView ? { width: "100%" } : {}}
                      transition={{ duration: 0.8, delay: 0.8 + index * 0.15 }}
                      className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-primary/50 to-transparent"
                    />
                  </div>

                  {/* Arrow - Desktop Only */}
              {index < steps.length - 1 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={isInView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ duration: 0.5, delay: 0.8 + index * 0.15 }}
                      className="hidden lg:flex absolute -right-2 top-1/2 -translate-y-1/2 z-20 w-4 h-4 items-center justify-center"
                    >
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    </motion.div>
              )}
            </motion.div>
          ))}
            </div>
        </div>

          {/* Technology Stack */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-32"
          >
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4">Built on proven technology</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Enterprise-grade infrastructure powering secure healthcare data management
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {techStack.map((tech, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 1.2 + index * 0.15 }}
                  className="p-8 bg-card border border-border rounded-2xl hover:border-primary/30 transition-colors"
                >
                  <h4 className="font-bold text-xl mb-6">{tech.label}</h4>
                  <div className="space-y-3">
                    {tech.items.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <span className="text-muted-foreground leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
          </div>
        </motion.div>
        </div>
      </div>
    </section>
  );
}
