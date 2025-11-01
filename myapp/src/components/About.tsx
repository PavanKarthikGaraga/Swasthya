"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const principles = [
  {
    number: "01",
    title: "Patient-Centric Design",
    description: "Every feature built with your privacy and control at the forefront. Your data belongs to you, period.",
  },
  {
    number: "02",
    title: "Cutting-Edge Security",
    description: "Military-grade encryption and blockchain immutability ensure your medical records stay private and tamper-proof.",
  },
  {
    number: "03",
    title: "AI-Powered Insights",
    description: "Advanced machine learning transforms your health data into actionable insights and personalized recommendations.",
  },
  {
    number: "04",
    title: "Universal Access",
    description: "Access your complete medical history anytime, anywhere, from any device. Healthcare without boundaries.",
  },
];

export function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} id="about" className="py-32 bg-background">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Split Screen Layout */}
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Left Column - Sticky Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="lg:sticky lg:top-32 lg:h-fit"
            >
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/5 border border-primary/20 rounded-full">
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-xs uppercase tracking-wider text-primary font-medium">
                    Our Mission
                  </span>
                </div>
                
                <h2 className="text-5xl md:text-6xl font-bold leading-tight">
                  Healthcare designed for{" "}
                  <span className="text-gradient">tomorrow</span>
                </h2>

                <p className="text-lg text-muted-foreground leading-relaxed">
                  Swasthya is building the future of healthcare infrastructure.
                  A platform where blockchain security meets artificial intelligence,
                  creating an ecosystem that's secure, intelligent, and accessible.
                </p>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-border">
                  <div>
                    <div className="text-4xl font-bold mb-2">256-bit</div>
                    <div className="text-sm text-muted-foreground">Encryption Standard</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold mb-2">100%</div>
                    <div className="text-sm text-muted-foreground">HIPAA Compliant</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Principles */}
            <div className="space-y-16">
              {principles.map((principle, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  className="group"
                >
                  <div className="flex gap-8">
                    {/* Number */}
                    <div className="flex-shrink-0">
                      <span className="text-6xl font-bold text-muted-foreground/20 group-hover:text-primary/30 transition-colors duration-300">
                        {principle.number}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-2 space-y-3">
                      <h3 className="text-2xl font-bold">{principle.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {principle.description}
                      </p>
                      
                      {/* Decorative Line */}
                      <div className="pt-6">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={isInView ? { width: "100%" } : {}}
                          transition={{ duration: 0.8, delay: index * 0.15 + 0.3 }}
                          className="h-px bg-gradient-to-r from-primary/50 to-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

