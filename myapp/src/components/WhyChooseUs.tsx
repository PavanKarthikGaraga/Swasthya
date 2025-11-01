"use client";

import { motion } from "framer-motion";
import { Award, Clock, Shield, Users, Zap, HeartPulse } from "lucide-react";

export function WhyChooseUs() {
  const benefits = [
    {
      icon: Zap,
      title: "Instant Results",
      description: "Get AI-powered health insights in seconds, not days. Our advanced algorithms provide accurate analysis instantly.",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Shield,
      title: "100% Secure",
      description: "Your health data is encrypted with military-grade security. HIPAA compliant and FDA approved platform.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Users,
      title: "Expert Network",
      description: "Access to 10,000+ verified healthcare professionals worldwide. Get second opinions from specialists.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Award,
      title: "Certified Accuracy",
      description: "99.5% diagnostic accuracy backed by clinical trials and peer-reviewed research studies.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Clock,
      title: "24/7 Availability",
      description: "Round-the-clock access to health monitoring and emergency consultations whenever you need them.",
      color: "from-indigo-500 to-blue-500"
    },
    {
      icon: HeartPulse,
      title: "Holistic Care",
      description: "Complete health management from diagnosis to treatment, all in one integrated platform.",
      color: "from-red-500 to-rose-500"
    },
  ];

  return (
    <section className="flex items-center justify-center py-12 px-4 bg-gray-50">
      <div className="container mx-auto w-[85%] max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-gray-900">
            The Swasthya{" "}
            <span className="text-teal-600">Advantage</span>
          </h2>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
            Experience healthcare that&apos;s smarter, faster, and more personalized
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex gap-4 group"
            >
              <div className={`shrink-0 w-16 h-16 rounded-xl bg-linear-to-br ${benefit.color} p-4 shadow-lg group-hover:scale-110 transition-transform`}>
                <benefit.icon className="w-full h-full text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

