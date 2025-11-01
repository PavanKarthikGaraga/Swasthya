"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { HeartPulse, Sparkles, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div
        className={`transition-all duration-500 ease-out ${
          isScrolled
            ? "pt-4 px-[7.5%]"
            : "pt-0 px-0"
        }`}
      >
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={`transition-all duration-500 ease-out ${
            isScrolled
              ? "backdrop-blur-xl bg-white/90 border-gray-200 shadow-xl rounded-2xl border"
              : "bg-transparent shadow-none border-none"
          }`}
        >
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 group">
                <div className="bg-teal-600 p-2 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300">
                  <HeartPulse className="h-5 w-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-lg text-gray-900 tracking-tight">
                    Swasthya
                  </span>
                  <span className="text-[9px] text-gray-500 font-medium -mt-0.5">
                    AI Health Platform
                  </span>
                </div>
              </Link>

              {/* Nav Links */}
              <div className="hidden lg:flex items-center gap-1">
                {["Features", "Services", "Testimonials", "FAQ"].map((item) => (
                  <Link
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="px-4 py-2 text-xs font-medium text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all duration-300"
                  >
                    {item}
                  </Link>
                ))}
                <Badge className="ml-2 bg-teal-600 text-white border-0 px-2 py-0.5 text-[10px] font-semibold shadow-md hover:bg-teal-600">
                  <Sparkles className="h-2.5 w-2.5 mr-1" />
                  NEW
                </Badge>
              </div>

              {/* CTA Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  className="text-xs font-semibold rounded-xl hover:bg-teal-50 h-8"
                >
                  Sign In
                </Button>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md shadow-teal-600/30 px-4 h-8 text-xs font-semibold">
                  Get Started
                  <ArrowRight className="ml-1.5 h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </motion.nav>
      </div>
    </div>
  );
}
