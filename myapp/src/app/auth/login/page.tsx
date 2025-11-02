"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FaEye, FaEyeSlash, FaSpinner, FaGoogle, FaLock, FaEnvelope, FaStethoscope, FaHeartbeat, FaShieldAlt, FaCheck } from "react-icons/fa";
import { login, ApiError } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    
    try {
      const response = await login(formData.email, formData.password);
      console.log("Login successful:", response);
      // Use window.location to ensure cookie is sent with next request
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof ApiError) {
        setErrors({ general: error.message || "Login failed. Please check your credentials." });
      } else {
        setErrors({ general: "Login failed. Please try again." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrors({});
    
    try {
      window.location.href = '/api/auth/google';
    } catch (error) {
      console.error("Google login error:", error);
      setErrors({ general: "Google login failed. Please try again." });
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden absolute top-0 left-0 right-0 z-20 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-center p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
              <FaStethoscope className="text-sm text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Swasthya</span>
          </div>
        </div>
      </div>

      {/* Centered Login Form */}
      <div className="w-full flex items-center justify-center p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 lg:bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-lg space-y-8 pt-16 lg:pt-0"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl">
                <FaStethoscope className="text-white text-2xl" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Swasthya
              </span>
            </Link>
          </div>

          {/* Form Container */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 p-8 md:p-12 space-y-8">
            {/* Header */}
            <div className="space-y-3">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Sign In</h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Google Login */}
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full h-14 border-2 border-gray-200 dark:border-gray-700 hover:border-teal-500 dark:hover:border-teal-500 bg-white dark:bg-gray-800 font-semibold rounded-xl transition-all shadow-sm hover:shadow-md text-base"
                >
                  <FaGoogle className="text-red-500 mr-3 text-xl" />
                  Continue with Google
                </Button>
              </motion.div>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white dark:bg-gray-900 px-5 text-sm text-gray-500 dark:text-gray-400 font-medium">
                    or continue with email
                  </span>
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Email address
                </Label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors z-10">
                    <FaEnvelope className="text-xl" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    disabled={isLoading}
                    className={`h-14 pl-14 pr-5 rounded-xl border-2 transition-all text-base font-medium ${
                      errors.email
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : focusedField === "email"
                        ? "border-teal-500 focus:border-teal-500 focus:ring-teal-500/20"
                        : "border-gray-200 dark:border-gray-700 focus:border-teal-500 focus:ring-teal-500/20"
                    } bg-gray-50 dark:bg-gray-800 focus:ring-4 focus:bg-white dark:focus:bg-gray-800`}
                  />
                </div>
                <AnimatePresence>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-sm text-red-500 flex items-center gap-2 font-medium"
                    >
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                      {errors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Password Input */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    Password
                  </Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-semibold transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors z-10">
                    <FaLock className="text-xl" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    disabled={isLoading}
                    className={`h-14 pl-14 pr-14 rounded-xl border-2 transition-all text-base font-medium ${
                      errors.password
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : focusedField === "password"
                        ? "border-teal-500 focus:border-teal-500 focus:ring-teal-500/20"
                        : "border-gray-200 dark:border-gray-700 focus:border-teal-500 focus:ring-teal-500/20"
                    } bg-gray-50 dark:bg-gray-800 focus:ring-4 focus:bg-white dark:focus:bg-gray-800`}
                  />
                  <button
                    type="button"
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors p-2"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <FaEyeSlash className="text-xl" /> : <FaEye className="text-xl" />}
                  </button>
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-sm text-red-500 flex items-center gap-2 font-medium"
                    >
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                      {errors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* General Error */}
              <AnimatePresence>
                {errors.general && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl border-2 border-red-200 dark:border-red-800 font-semibold"
                  >
                    {errors.general}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin mr-3 text-lg" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In to Account"
                  )}
                </Button>
              </motion.div>

              {/* Sign Up Link */}
              <div className="text-center pt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/auth/signup"
                    className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-bold transition-colors"
                  >
                    Create account
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>
              By continuing, you agree to our{" "}
              <Link href="/terms" className="text-teal-600 dark:text-teal-400 hover:underline font-medium">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-teal-600 dark:text-teal-400 hover:underline font-medium">
                Privacy Policy
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
