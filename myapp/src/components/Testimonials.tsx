"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

  const testimonials = [
    {
    quote: "Swasthya has completely transformed how we manage patient data. The blockchain security gives us peace of mind, and the AI insights are remarkably accurate.",
    author: "Dr. Sarah Chen",
    role: "Chief Medical Officer",
    company: "HealthCare Systems Inc.",
  },
  {
    quote: "The platform's intuitive design makes complex technology feel simple. Our patients love having complete control over their health records.",
    author: "Michael Rodriguez",
    role: "Director of Digital Health",
    company: "Metro Hospital Group",
    },
    {
    quote: "Finally, a solution that puts patients first. The security and accessibility features are exactly what modern healthcare needs.",
    author: "Dr. Emily Thompson",
    role: "Healthcare Innovation Lead",
    company: "MedTech Solutions",
    },
  ];

export function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} id="testimonials" className="py-32 bg-background">
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
                Testimonials
              </span>
            </div>
            
            <h2 className="text-5xl md:text-6xl font-bold leading-tight">
              Trusted by healthcare{" "}
              <span className="text-gradient">professionals</span>
          </h2>
        </motion.div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="h-full p-8 bg-card border border-border hover:border-primary/30 transition-colors duration-300 rounded-sm">
                  {/* Quote */}
                  <div className="mb-8">
                    <p className="text-lg leading-relaxed text-foreground">
                      "{testimonial.quote}"
                    </p>
                  </div>

                  {/* Author Info */}
                  <div className="space-y-1 border-t border-border pt-6">
                    <div className="font-bold">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.company}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-24 pt-16 border-t border-border"
          >
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold mb-2">Industry Compliance & Security</h3>
              <p className="text-muted-foreground">
                Meeting the highest standards in healthcare technology
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {["HIPAA Compliant", "ISO 27001", "SOC 2 Type II", "GDPR Ready"].map((badge, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.05 }}
                  className="flex items-center justify-center p-6 border border-border rounded-sm bg-card"
                >
                  <span className="text-sm font-medium text-center">{badge}</span>
                </motion.div>
            ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
