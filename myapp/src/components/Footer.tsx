import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { HeartPulse, Globe, Mail, MessageSquare, Shield, Award } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-100 py-12 px-4">
      <div className="container mx-auto w-[85%] max-w-7xl">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="bg-teal-600 p-2 rounded-xl shadow-md">
                <HeartPulse className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-white">
                  Swasthya
                </span>
                <span className="text-[10px] text-gray-400">AI Health Platform</span>
              </div>
            </Link>
            <p className="text-xs text-gray-300 leading-relaxed mb-4 max-w-sm">
              Transforming healthcare with AI-powered diagnostics and personalized health insights for everyone.
            </p>
            <div className="flex gap-2">
              {[
                { icon: Globe, label: "Website" },
                { icon: Mail, label: "Email" },
                { icon: MessageSquare, label: "Chat" },
              ].map((social, i) => (
                <Button key={i} variant="outline" size="icon" className="h-8 w-8 rounded-lg bg-gray-800 border-gray-700 hover:bg-teal-600 hover:border-teal-600 transition-colors">
                  <social.icon className="h-3.5 w-3.5" />
                </Button>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold text-sm mb-3 text-white">Product</h3>
            <ul className="space-y-2">
              {["Features", "Pricing", "Security", "Integrations", "API"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-gray-400 hover:text-teal-400 transition-colors text-xs">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-sm mb-3 text-white">Company</h3>
            <ul className="space-y-2">
              {["About", "Blog", "Careers", "Press", "Partners"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-gray-400 hover:text-teal-400 transition-colors text-xs">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-sm mb-3 text-white">Legal</h3>
            <ul className="space-y-2">
              {["Privacy", "Terms", "HIPAA", "Compliance", "Licenses"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-gray-400 hover:text-teal-400 transition-colors text-xs">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="mb-6" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            © 2025 Swasthya Health Intelligence. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-0 text-[10px]">
              <Shield className="h-2.5 w-2.5 mr-1" />
              HIPAA Compliant
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0 text-[10px]">
              <Award className="h-2.5 w-2.5 mr-1" />
              FDA Approved
            </Badge>
          </div>
        </div>
      </div>
    </footer>
  );
}

