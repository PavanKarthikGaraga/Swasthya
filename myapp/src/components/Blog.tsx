"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ArrowRight, Calendar, Clock } from "lucide-react";

export function Blog() {
  const articles = [
    {
      category: "AI Technology",
      title: "How AI is Revolutionizing Early Disease Detection",
      excerpt: "Discover how machine learning algorithms can detect diseases years before traditional methods.",
      image: "bg-gradient-to-br from-blue-500 to-cyan-500",
      date: "Nov 1, 2024",
      readTime: "5 min read"
    },
    {
      category: "Health Tips",
      title: "10 Daily Habits for Better Heart Health",
      excerpt: "Simple lifestyle changes that can significantly reduce your risk of cardiovascular disease.",
      image: "bg-gradient-to-br from-teal-500 to-green-500",
      date: "Oct 28, 2024",
      readTime: "4 min read"
    },
    {
      category: "Platform Updates",
      title: "New Feature: Real-time Health Monitoring",
      excerpt: "Track your vital signs 24/7 with our latest wearable device integration.",
      image: "bg-gradient-to-br from-purple-500 to-pink-500",
      date: "Oct 25, 2024",
      readTime: "3 min read"
    }
  ];

  return (
    <section className="flex items-center justify-center py-12 px-4 bg-gray-50">
      <div className="container mx-auto w-[85%] max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-gray-900">
            Health & Wellness{" "}
            <span className="text-teal-600">Blog</span>
          </h2>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
            Expert insights, health tips, and platform updates
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-white rounded-xl border border-gray-200 hover:border-teal-300 hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className={`h-48 ${article.image} relative`}>
                  <Badge className="absolute top-3 left-3 bg-white text-gray-900 text-xs">
                    {article.category}
                  </Badge>
                </div>
                
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-teal-600 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    {article.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{article.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{article.readTime}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 p-0 h-auto">
                      Read More
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-8 py-5 text-sm font-semibold">
            View All Articles
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

