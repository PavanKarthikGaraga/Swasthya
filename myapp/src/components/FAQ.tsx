"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus } from "lucide-react";
import { useState } from "react";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How accurate is the AI diagnosis?",
      answer: "Our AI has 99.5% accuracy rate, validated through clinical trials and peer-reviewed research. It's trained on millions of medical cases and continuously updated with the latest medical knowledge."
    },
    {
      question: "Is my health data secure and private?",
      answer: "Absolutely. We use military-grade encryption (AES-256) and are fully HIPAA compliant. Your data is never shared with third parties without your explicit consent."
    },
    {
      question: "Can I consult with real doctors?",
      answer: "Yes! You can book video consultations with our network of 10,000+ verified healthcare professionals. Get second opinions and treatment plans from specialists."
    },
    {
      question: "What happens during a free trial?",
      answer: "You get full access to all Pro features for 30 days. No credit card required. You can cancel anytime before the trial ends with no charges."
    },
    {
      question: "How quickly can I get diagnosis results?",
      answer: "AI analysis provides instant results within seconds. For doctor consultations, most appointments are available within 24 hours, with emergency slots available immediately."
    },
    {
      question: "Do you support international patients?",
      answer: "Yes, we serve users in 150+ countries. Our platform supports multiple languages and connects you with healthcare professionals worldwide."
    }
  ];

  return (
    <section className="flex items-center justify-center py-12 px-4 bg-white">
      <div className="container mx-auto w-[85%] max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-gray-900">
            Frequently Asked{" "}
            <span className="text-teal-600">Questions</span>
          </h2>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about Swasthya
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div 
                className="bg-white border-2 border-gray-200 hover:border-teal-400 transition-all cursor-pointer rounded-xl overflow-hidden"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-gray-900 pr-4">
                      {faq.question}
                    </h3>
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center transition-all hover:scale-110">
                      {openIndex === index ? (
                        <Minus className="h-4 w-4 text-white" />
                      ) : (
                        <Plus className="h-4 w-4 text-white" />
                      )}
                    </div>
                  </div>
                  
                  <motion.div
                    initial={false}
                    animate={{
                      height: openIndex === index ? 'auto' : 0,
                      opacity: openIndex === index ? 1 : 0,
                      marginTop: openIndex === index ? '1rem' : 0
                    }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

