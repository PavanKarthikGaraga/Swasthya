"use client";

import { motion } from "framer-motion";
import { UserPlus, Scan, FileCheck, Stethoscope } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      icon: UserPlus,
      step: "01",
      title: "Create Your Profile",
      description: "Sign up in under 30 seconds and build your comprehensive health profile with medical history, current medications, and health goals.",
      features: ["Quick registration", "Medical history upload", "Privacy protected"],
      color: "bg-teal-600",
      bgColor: "bg-teal-50"
    },
    {
      icon: Scan,
      step: "02", 
      title: "AI Health Analysis",
      description: "Upload symptoms, images, or lab reports for instant AI-powered analysis using advanced machine learning algorithms.",
      features: ["Image recognition", "Symptom checker", "Lab interpretation"],
      color: "bg-cyan-600",
      bgColor: "bg-cyan-50"
    },
    {
      icon: FileCheck,
      step: "03",
      title: "Personalized Results",
      description: "Get detailed health insights, risk assessments, and personalized recommendations tailored to your unique profile.",
      features: ["Detailed reports", "Risk analysis", "Custom recommendations"],
      color: "bg-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: Stethoscope,
      step: "04",
      title: "Expert Consultation",
      description: "Connect with board-certified doctors for video consultations, second opinions, and ongoing care management.",
      features: ["Video consultations", "Expert opinions", "Follow-up care"],
      color: "bg-indigo-600",
      bgColor: "bg-indigo-50"
    },
  ];

  return (
    <section id="how-it-works" className="flex items-center justify-center py-12 px-4 bg-white">
      <div className="container mx-auto w-[85%] max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-gray-900">
            Simple Steps to{" "}
            <span className="text-teal-600">Better Health</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Get started with Swasthya in just a few easy steps and transform your healthcare experience
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative text-center group"
            >
              {/* Background Number */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-8xl font-black text-teal-50 select-none pointer-events-none">
                {step.step}
              </div>
              
              {/* Icon Container */}
              <div className="relative z-10 mb-8">
                <div className="w-20 h-20 bg-linear-to-br from-teal-500 to-teal-600 rounded-3xl p-5 mx-auto transition-all duration-300 shadow-2xl shadow-teal-500/25">
                  <step.icon className="w-full h-full text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-teal-600 transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-base text-gray-600 leading-relaxed px-2">
                  {step.description}
                </p>
              </div>

              {/* Connecting Line (except for last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 -right-6 w-12 h-0.5 bg-linear-to-r from-teal-200 to-transparent"></div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-20"
        >
          <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-6 py-3 rounded-full text-sm font-medium border border-teal-200">
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
            Ready to start your health journey?
          </div>
        </motion.div>
      </div>
    </section>
  );
}

