"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Marquee } from "@/components/ui/marquee";
import { Star, Quote } from "lucide-react";

export function Testimonials() {
  const testimonials = [
    {
      name: "Dr. Priya Sharma",
      role: "Cardiologist",
      avatar: "PS",
      rating: 5,
      quote: "Swasthya's AI diagnosis tools have revolutionized how I analyze patient data. The accuracy is remarkable and saves hours of my time.",
      color: "bg-teal-600"
    },
    {
      name: "Dr. Rajesh Kumar",
      role: "General Physician",
      avatar: "RK",
      rating: 5,
      quote: "The platform's intuitive design and powerful features make it indispensable for modern medical practice. Highly recommended!",
      color: "bg-cyan-600"
    },
    {
      name: "Anjali Mehta",
      role: "Patient",
      avatar: "AM",
      rating: 5,
      quote: "Getting instant health insights and connecting with doctors has never been easier. Swasthya truly cares about patient experience.",
      color: "bg-blue-600"
    },
    {
      name: "Dr. Michael Chen",
      role: "Dermatologist",
      avatar: "MC",
      rating: 5,
      quote: "The AI-powered skin analysis feature is incredibly accurate. It's like having a second opinion instantly available.",
      color: "bg-orange-600"
    },
    {
      name: "Sarah Johnson",
      role: "Healthcare Manager",
      avatar: "SJ",
      rating: 5,
      quote: "Managing patient records and coordinating care has become seamless with Swasthya. It's a game-changer for our clinic.",
      color: "bg-indigo-600"
    },
    {
      name: "Dr. Amit Patel",
      role: "Neurologist",
      avatar: "AP",
      rating: 5,
      quote: "The real-time monitoring and alert system helps me stay connected with my patients' health 24/7. Outstanding platform!",
      color: "bg-emerald-600"
    },
  ];

  const firstRow = testimonials.slice(0, testimonials.length / 2);
  const secondRow = testimonials.slice(testimonials.length / 2);

  const TestimonialCard = ({
    avatar,
    name,
    role,
    quote,
    rating,
    color,
  }: {
    avatar: string;
    name: string;
    role: string;
    quote: string;
    rating: number;
    color: string;
  }) => {
    return (
      <Card className="bg-linear-to-br from-gray-50 to-white border border-teal-500 rounded-2xl hover:shadow-xl transition-all duration-300 relative w-[350px] overflow-hidden">
        <Quote className="absolute top-4 right-4 h-10 w-10 text-teal-100 z-10" />

        <CardContent className="p-4 relative">
          <div className="flex gap-1 mb-4">
            {[...Array(rating)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>

          <p className="text-sm text-gray-700 leading-relaxed mb-6 relative z-10">
            &quot;{quote}&quot;
          </p>

          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 border-2 border-white shadow-lg">
              <AvatarFallback className={`${color} text-white font-bold text-sm`}>
                {avatar}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-bold text-gray-900">{name}</div>
              <div className="text-xs text-gray-600">{role}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <section id="testimonials" className="flex items-center justify-center py-12 px-4 bg-white overflow-hidden">
      <div className="container mx-auto w-full max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-gray-900">
            Loved by
            <span className="text-teal-600"> Healthcare Professionals</span>
          </h2>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
            Join thousands of doctors and patients who trust Swasthya
          </p>
        </motion.div>

        <div className="relative flex flex-col gap-4">
          <Marquee pauseOnHover className="[--duration:40s]">
            {firstRow.map((testimonial) => (
              <TestimonialCard key={testimonial.name} {...testimonial} />
            ))}
          </Marquee>
          <Marquee reverse pauseOnHover className="[--duration:40s]">
            {secondRow.map((testimonial) => (
              <TestimonialCard key={testimonial.name} {...testimonial} />
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}

