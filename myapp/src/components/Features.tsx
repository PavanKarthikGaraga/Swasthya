"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Brain,
  Activity,
  Stethoscope,
  CheckCircle,
  Microscope,
  Fingerprint,
  BarChart3,
  Calendar,
  FileText,
  Shield,
} from "lucide-react";

export function Features() {
  const diagnosisFeatures = [
    {
      icon: Brain,
      title: "Advanced AI Analysis",
      description: "State-of-the-art machine learning algorithms analyze symptoms and medical images with 99.5% accuracy.",
      features: ["Image Recognition", "Symptom Analysis", "Instant Results"],
      iconColor: "bg-teal-600",
    },
    {
      icon: Microscope,
      title: "Lab Report Insights",
      description: "Upload lab results and get AI-powered interpretations with personalized health recommendations.",
      features: ["Auto-Detection", "Trend Analysis", "Comparisons"],
      iconColor: "bg-cyan-600",
    },
    {
      icon: Fingerprint,
      title: "Personalized Health",
      description: "Receive customized health insights based on your unique medical history and lifestyle factors.",
      features: ["Custom Plans", "Risk Assessment", "Prevention Tips"],
      iconColor: "bg-blue-600",
    },
  ];

  const trackingFeatures = [
    {
      icon: Activity,
      title: "Vital Signs Monitor",
      description: "Track heart rate, blood pressure, temperature, and more with real-time sync and alerts.",
      features: ["Real-time Sync", "Smart Alerts", "Historical Data"],
      iconColor: "bg-red-600",
    },
    {
      icon: BarChart3,
      title: "Health Analytics",
      description: "Visualize your health trends with beautiful charts and get AI-powered insights on your progress.",
      features: ["Trend Analysis", "Custom Reports", "Export Data"],
      iconColor: "bg-indigo-600",
    },
    {
      icon: Calendar,
      title: "Medication Reminder",
      description: "Never miss a dose with intelligent reminders and medication tracking with refill alerts.",
      features: ["Smart Reminders", "Refill Alerts", "Dosage Tracking"],
      iconColor: "bg-green-600",
    },
  ];

  const connectFeatures = [
    {
      icon: Stethoscope,
      title: "Expert Consultations",
      description: "Connect with board-certified doctors via video call, chat, or phone within minutes.",
      features: ["Video Calls", "Instant Chat", "24/7 Available"],
      iconColor: "bg-cyan-600",
    },
    {
      icon: FileText,
      title: "Second Opinions",
      description: "Get expert second opinions on diagnoses and treatment plans from leading specialists.",
      features: ["Specialist Access", "Quick Turnaround", "Detailed Reports"],
      iconColor: "bg-violet-600",
    },
    {
      icon: Shield,
      title: "Secure Records",
      description: "All your medical records and consultations are encrypted and HIPAA compliant.",
      features: ["End-to-End Encryption", "HIPAA Compliant", "Secure Storage"],
      iconColor: "bg-emerald-600",
    },
  ];

  const FeatureCard = ({ feature, index }: { feature: typeof diagnosisFeatures[0], index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="h-full bg-white border border-gray-200 hover:border-teal-400 hover:shadow-xl transition-all duration-300 group rounded-2xl overflow-hidden">
        <CardHeader className="pb-3">
          <div className={`w-12 h-12 rounded-xl ${feature.iconColor} p-3 mb-3 transition-transform shadow-lg`}>
            <feature.icon className="w-full h-full text-white" />
          </div>
          <CardTitle className="text-lg font-bold text-gray-900">{feature.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <CardDescription className="text-sm text-gray-600 leading-relaxed">
            {feature.description}
          </CardDescription>
          <Separator />
          <div className="space-y-1.5">
            {feature.features.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <CheckCircle className="h-3.5 w-3.5 text-teal-600" />
                <span className="text-gray-700 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <section id="features" className="flex items-center justify-center py-12 px-4 bg-gray-50">
      <div className="container mx-auto w-[85%] max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-gray-900">
            Everything You Need for
            <br />
            <span className="text-teal-600">Optimal Health</span>
          </h2>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
            Comprehensive AI-powered tools designed for modern healthcare
          </p>
        </motion.div>

        <Tabs defaultValue="diagnosis" className="w-full">
          <TabsList className="grid w-full max-w-xl mx-auto grid-cols-3 mb-10 h-11 bg-white rounded-xl p-1.5 shadow-md border border-gray-200">
            <TabsTrigger value="diagnosis" className="rounded-lg text-xs font-semibold data-[state=active]:bg-teal-600 data-[state=active]:text-white">
              <Brain className="h-3.5 w-3.5 mr-1.5" />
              AI Diagnosis
            </TabsTrigger>
            <TabsTrigger value="tracking" className="rounded-lg text-xs font-semibold data-[state=active]:bg-teal-600 data-[state=active]:text-white">
              <Activity className="h-3.5 w-3.5 mr-1.5" />
              Health Tracking
            </TabsTrigger>
            <TabsTrigger value="connect" className="rounded-lg text-xs font-semibold data-[state=active]:bg-teal-600 data-[state=active]:text-white">
              <Stethoscope className="h-3.5 w-3.5 mr-1.5" />
              Doctor Connect
            </TabsTrigger>
          </TabsList>

          <TabsContent value="diagnosis" className="mt-0">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {diagnosisFeatures.map((feature, index) => (
                <FeatureCard key={index} feature={feature} index={index} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tracking" className="mt-0">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {trackingFeatures.map((feature, index) => (
                <FeatureCard key={index} feature={feature} index={index} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="connect" className="mt-0">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {connectFeatures.map((feature, index) => (
                <FeatureCard key={index} feature={feature} index={index} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

