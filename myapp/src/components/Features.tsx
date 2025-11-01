"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const features = [
  {
    tag: "Security",
    title: "Blockchain Infrastructure",
    description:
      "Your medical records are encrypted and stored across a distributed blockchain network. Immutable, transparent, and completely under your control.",
  },
  {
    tag: "Intelligence",
    title: "AI Diagnostics",
    description:
      "Advanced machine learning models analyze your health data in real-time, providing instant insights, predictions, and personalized recommendations.",
  },
  {
    tag: "Analytics",
    title: "Health Dashboard",
    description:
      "Comprehensive visualizations and insights help you understand patterns, track progress, and make informed decisions about your health.",
  },
  {
    tag: "Accessibility",
    title: "Cloud-Based Access",
    description:
      "Securely access your complete medical history from any device, anywhere in the world. Your health data travels with you.",
    },
  {
    tag: "Consultation",
    title: "Expert Network",
    description:
      "Connect with healthcare professionals instantly. Get second opinions, schedule appointments, and manage consultations all in one place.",
    },
    {
    tag: "Privacy",
    title: "End-to-End Encryption",
    description:
      "256-bit military-grade encryption ensures your sensitive health information remains private. You control who sees what, when.",
  },
];

export function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} id="features" className="py-32 bg-muted/30">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
            className="max-w-3xl mb-24"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/5 border border-primary/20 rounded-full mb-6">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-xs uppercase tracking-wider text-primary font-medium">
                Platform Features
              </span>
            </div>
            
            <h2 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              Everything you need for complete{" "}
              <span className="text-gradient">health management</span>
          </h2>

            <p className="text-xl text-muted-foreground leading-relaxed">
              Swasthya combines enterprise-grade security with cutting-edge AI to deliver
              a healthcare platform that's as powerful as it is simple.
          </p>
        </motion.div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="group"
              >
                {/* Tag */}
                <div className="mb-6">
                  <span className="inline-block px-3 py-1 text-xs font-medium uppercase tracking-wider border border-border rounded-full">
                    {feature.tag}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold mb-4 group-hover:text-gradient transition-all duration-300">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Line */}
                <div className="mt-6">
                  <motion.div
                    initial={{ width: 0 }}
                    whileHover={{ width: "60px" }}
                    className="h-0.5 bg-primary"
                    transition={{ duration: 0.3 }}
                  />
            </div>
              </motion.div>
              ))}
            </div>

            </div>
      </div>
    </section>
  );
}
