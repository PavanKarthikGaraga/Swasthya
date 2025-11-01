"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { FaHome, FaStar, FaChartLine, FaEnvelope, FaUser } from "react-icons/fa";

const navItems = [
  { icon: FaHome, label: "Home", href: "#home" },
  { icon: FaStar, label: "Features", href: "#features" },
  { icon: FaChartLine, label: "Dashboard", href: "/dashboard" },
  { icon: FaEnvelope, label: "Contact", href: "#footer" },
  { icon: FaUser, label: "Login", href: "/login" },
];

export function FloatingNav() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show nav after scrolling 50% of hero section (assuming hero is viewport height)
      const heroHeight = window.innerHeight;
      setIsVisible(window.scrollY > heroHeight * 0.5);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      window.location.href = href;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, x: 100 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.5, x: 100 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-8 right-8 z-50"
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
        >
          <div className="relative">
            {/* Main Circle Button */}
            <motion.div
              className="w-16 h-16 bg-gradient-to-br from-[#00B4D8] to-[#0A2342] rounded-full flex items-center justify-center cursor-pointer shadow-2xl glow"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-6 h-6 flex flex-col items-center justify-center gap-1">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
              </motion.div>
            </motion.div>

            {/* Expanded Menu Items */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-0 right-0"
                >
                  {navItems.map((item, index) => {
                    const angle = (index * 60 - 60) * (Math.PI / 180); // Spread items in arc
                    const radius = 100;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;

                    return (
                      <motion.button
                        key={item.label}
                        initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                        animate={{
                          x,
                          y,
                          opacity: 1,
                          scale: 1,
                        }}
                        exit={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 260,
                          damping: 20,
                          delay: index * 0.05,
                        }}
                        onClick={() => handleNavClick(item.href)}
                        className="absolute bottom-0 right-0 w-12 h-12 bg-white dark:bg-[#0F1A2E] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow group border-2 border-[#00B4D8]"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <item.icon className="text-[#0A2342] dark:text-[#00FFFF] text-lg group-hover:text-[#00B4D8] dark:group-hover:text-[#2ECC71] transition-colors" />
                        
                        {/* Tooltip */}
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          whileHover={{ opacity: 1, x: 0 }}
                          className="absolute right-full mr-3 px-3 py-1.5 bg-[#0A2342] text-white text-xs rounded-lg whitespace-nowrap pointer-events-none"
                        >
                          {item.label}
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-4 border-l-[#0A2342]" />
                        </motion.div>
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

