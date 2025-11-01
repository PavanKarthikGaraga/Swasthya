"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const footerSections = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Security", href: "#security" },
      { label: "Pricing", href: "/pricing" },
      { label: "Updates", href: "/updates" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "API Reference", href: "/api" },
      { label: "Support", href: "/support" },
      { label: "Status", href: "/status" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "HIPAA", href: "/hipaa" },
      { label: "Compliance", href: "/compliance" },
    ],
  },
];

const socialLinks = [
  { label: "Twitter", href: "https://twitter.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "GitHub", href: "https://github.com" },
];

export function Footer() {
  return (
    <footer id="footer" className="border-t border-border bg-background">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Main Footer Content */}
        <div className="py-20">
          <div className="grid md:grid-cols-6 gap-12 mb-16">
            {/* Brand Column */}
            <div className="md:col-span-2">
              <Link href="/" className="inline-block mb-6">
                <motion.span
                  whileHover={{ scale: 1.02 }}
                  className="text-2xl font-bold tracking-tight"
                >
                  Swasthya
                </motion.span>
            </Link>
              <p className="text-muted-foreground leading-relaxed mb-6 max-w-xs">
                Secure, intelligent healthcare management powered by blockchain and AI.
            </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>support@swasthya.com</div>
                <div>+1 (555) 123-4567</div>
            </div>
          </div>

            {/* Links Columns */}
            {footerSections.map((section, index) => (
              <div key={index}>
                <h3 className="font-semibold mb-4">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block relative group"
                      >
                        {link.label}
                        <span className="absolute left-0 -bottom-0.5 w-0 h-px bg-foreground group-hover:w-full transition-all duration-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
              ))}
          </div>

          {/* Newsletter */}
          <div className="py-12 border-t border-border">
            <div className="max-w-xl">
              <h3 className="text-xl font-bold mb-2">Stay updated</h3>
              <p className="text-muted-foreground mb-6">
                Subscribe to our newsletter for product updates and healthcare insights.
              </p>
              <form className="flex gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-muted border border-border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-foreground text-background hover:bg-foreground/90 rounded-sm text-sm font-medium transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Copyright */}
            <div className="text-sm text-muted-foreground">
              © 2025 Swasthya. All rights reserved.
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-8">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
