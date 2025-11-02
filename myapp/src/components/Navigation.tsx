"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Testimonials", href: "#testimonials" },
];

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 50], [0, 1]);

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      setIsScrolled(latest > 50);
    });
  }, [scrollY]);

  useEffect(() => {
    // Close mobile menu on scroll
    if (isMobileMenuOpen) {
      const handleScroll = () => setIsMobileMenuOpen(false);
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Backdrop blur layer - appears on scroll */}
      <motion.div
        style={{ opacity }}
        className="fixed top-0 left-0 right-0 h-24 bg-background/60 backdrop-blur-2xl border-b border-border/50 z-40 pointer-events-none"
      />

      {/* Main Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <nav className="container mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-24">
              {/* Logo */}
            <Link href="/" className="relative z-10">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-primary rounded-sm" />
                <span className="text-xl font-bold tracking-tight">Swasthya</span>
              </motion.div>
              </Link>

            {/* Center Navigation */}
            <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2">
              <motion.div 
                className="flex items-center gap-2 px-6 py-2 bg-card/80 backdrop-blur-xl border border-border rounded-full shadow-lg"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {navLinks.map((link, index) => (
                  <motion.a
                    key={index}
                    href={link.href}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all rounded-full hover:bg-muted/50 relative group"
                  >
                    {link.label}
                    <motion.div
                      className="absolute inset-0 rounded-full bg-primary/5"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  </motion.a>
                ))}
              </motion.div>
              </div>

            {/* Right CTA */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="hidden md:flex items-center gap-3"
            >
                <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="font-medium text-sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                <Button
                  size="sm"
                  className="font-medium bg-foreground text-background hover:bg-foreground/90 rounded-sm px-6"
                >
                  Get Access
                  </Button>
                </Link>
            </motion.div>

            {/* Mobile Menu */}
            <div className="lg:hidden">
              <button 
                className="p-2 relative z-50" 
                aria-label="Menu"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <div className="space-y-1.5">
                  <motion.div
                    className="w-5 h-0.5 bg-foreground"
                    animate={isMobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                  <motion.div
                    className="w-5 h-0.5 bg-foreground"
                    animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                  <motion.div
                    className="w-5 h-0.5 bg-foreground"
                    animate={isMobileMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              </button>

              {/* Mobile Menu Dropdown */}
              <AnimatePresence>
                {isMobileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="fixed top-24 left-0 right-0 bg-card border-b border-border shadow-lg z-40"
                  >
                    <div className="container mx-auto px-6 py-6 space-y-4">
                      {navLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="block py-2 text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {link.label}
                        </Link>
                      ))}
                      <div className="pt-4 border-t border-border space-y-3">
                        <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start font-medium">
                            Sign In
                          </Button>
                        </Link>
                        <Link href="/auth/signup" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button className="w-full bg-foreground text-background hover:bg-foreground/90 font-medium">
                            Get Access
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}
