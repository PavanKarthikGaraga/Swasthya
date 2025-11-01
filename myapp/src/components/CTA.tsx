"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, MessageSquare, CheckCircle } from "lucide-react";

export function CTA() {
  return (
    <section className="flex items-center justify-center py-12 px-4 bg-gray-50">
      <div className="container mx-auto w-[85%] max-w-5xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden bg-teal-600 shadow-xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwdjJoLTYwek0tMTAgMTBoNjB2MmgtNjB6IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii4wNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNhKSIvPjwvc3ZnPg==')] opacity-50" />
          
          <div className="relative p-12 md:p-16 text-center">
            <Badge className="mb-6 bg-white/20 backdrop-blur-sm text-white border-white/30 px-3 py-1.5 text-xs font-semibold hover:bg-white/20">
              <Sparkles className="h-3 w-3 mr-1" />
              Limited Time Offer
            </Badge>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Start Your Health Journey
              <br />
              Today - It's Free!
            </h2>
            
            <p className="text-base md:text-lg text-teal-50 mb-10 max-w-xl mx-auto leading-relaxed">
              Join 50,000+ users who've transformed their healthcare experience. No credit card required.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button className="bg-white text-teal-600 hover:bg-teal-50 rounded-xl px-8 py-5 text-sm font-semibold shadow-xl hover:shadow-2xl transition-all group">
                <Sparkles className="mr-2 h-4 w-4" />
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button variant="outline" className="bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/20 rounded-xl px-8 py-5 text-sm font-semibold">
                <MessageSquare className="mr-2 h-4 w-4" />
                Talk to Sales
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-5 text-white/90 text-xs">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4" />
                <span>Free 30-day trial</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4" />
                <span>No credit card</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
