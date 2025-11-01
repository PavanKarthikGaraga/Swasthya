"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FaEye, FaEyeSlash, FaSpinner, FaCheck } from "react-icons/fa";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain uppercase, lowercase, and number";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    
    return strength;
  };

  const getPasswordStrengthText = () => {
    const strength = getPasswordStrength();
    if (strength < 2) return { text: "Weak", color: "text-red-500" };
    if (strength < 4) return { text: "Medium", color: "text-yellow-500" };
    return { text: "Strong", color: "text-green-500" };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to OTP verification
      console.log("Signup attempt:", formData);
      router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}&type=signup`);
    } catch (error) {
      console.error("Signup error:", error);
      setErrors({ general: "Signup failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    
    try {
      // Simulate Google OAuth
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log("Google signup initiated");
      router.push("/dashboard");
    } catch (error) {
      console.error("Google signup error:", error);
      setErrors({ general: "Google signup failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrengthText();

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join Swasthya and start your health journey"
    >
      <form onSubmit={handleSubmit} className="animate-in fade-in-50 duration-500">
        <div className="space-y-4">
            {/* Google Signup */}
            <GoogleButton
              onClick={handleGoogleSignup}
              disabled={isLoading}
              text="Sign up with Google"
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-gray-500">
                  or
                </span>
              </div>
            </div>

            {/* Name Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="firstName" className="text-sm text-gray-700">First name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`h-10 ${errors.firstName ? "border-red-500" : ""}`}
                />
                {errors.firstName && (
                  <p className="text-xs text-red-500">{errors.firstName}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="lastName" className="text-sm text-gray-700">Last name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`h-10 ${errors.lastName ? "border-red-500" : ""}`}
                />
                {errors.lastName && (
                  <p className="text-xs text-red-500">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm text-gray-700">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
                className={`h-10 ${errors.email ? "border-red-500" : ""}`}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <Label htmlFor="password" className="text-sm text-gray-700">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`h-10 pr-10 ${errors.password ? "border-red-500" : ""}`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                </button>
              </div>
              {formData.password && (
                <div className="flex items-center gap-1 text-xs">
                  <span className={passwordStrength.color}>
                    {passwordStrength.text}
                  </span>
                  {getPasswordStrength() >= 4 && (
                    <FaCheck className="text-green-500 text-xs" />
                  )}
                </div>
              )}
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1">
              <Label htmlFor="confirmPassword" className="text-sm text-gray-700">Confirm password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`h-10 pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                </button>
              </div>
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <div className="flex items-center gap-1 text-xs text-green-500">
                  <FaCheck className="text-xs" />
                  <span>Match</span>
                </div>
              )}
              {errors.confirmPassword && (
                <p className="text-xs text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

          {/* General Error */}
          {errors.general && (
            <div className="p-2 text-xs text-red-600 bg-red-50 rounded border border-red-200">
              {errors.general}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg shadow-lg shadow-teal-600/25 hover:shadow-xl hover:shadow-teal-600/30 transition-all duration-200"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin text-sm" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>

          <p className="text-center text-xs text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-teal-600 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
