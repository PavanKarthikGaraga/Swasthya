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
      
      // Redirect to OTP verification (will then go to onboarding)
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
      
      // New users always need to complete onboarding
      router.push("/onboarding");
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
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-6">
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
              <div className="relative flex justify-center text-sm">
                <span className="bg-card px-4 text-muted-foreground">
                  or
                </span>
              </div>
            </div>

            {/* Name Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="firstName" className="text-sm font-semibold">First name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`h-14 rounded-sm border-2 focus:border-primary transition-colors ${errors.firstName ? "border-destructive" : "border-border"}`}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive flex items-center gap-2">
                    <span className="w-1 h-1 bg-destructive rounded-full" />
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div className="space-y-3">
                <Label htmlFor="lastName" className="text-sm font-semibold">Last name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`h-14 rounded-sm border-2 focus:border-primary transition-colors ${errors.lastName ? "border-destructive" : "border-border"}`}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive flex items-center gap-2">
                    <span className="w-1 h-1 bg-destructive rounded-full" />
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-semibold">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
                className={`h-14 rounded-sm border-2 focus:border-primary transition-colors ${errors.email ? "border-destructive" : "border-border"}`}
              />
              {errors.email && (
                <p className="text-sm text-destructive flex items-center gap-2">
                  <span className="w-1 h-1 bg-destructive rounded-full" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-3">
              <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`h-14 pr-14 rounded-sm border-2 focus:border-primary transition-colors ${errors.password ? "border-destructive" : "border-border"}`}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                </button>
              </div>
              {formData.password && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${passwordStrength.color}`}>
                      {passwordStrength.text}
                    </span>
                    {getPasswordStrength() >= 4 && (
                      <FaCheck className="text-primary text-sm" />
                    )}
                  </div>
                </div>
              )}
              {errors.password && (
                <p className="text-sm text-destructive flex items-center gap-2">
                  <span className="w-1 h-1 bg-destructive rounded-full" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-3">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold">Confirm password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`h-14 pr-14 rounded-sm border-2 focus:border-primary transition-colors ${errors.confirmPassword ? "border-destructive" : "border-border"}`}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                </button>
              </div>
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <div className="flex items-center gap-2 text-sm text-primary font-medium">
                  <FaCheck className="text-sm" />
                  <span>Passwords match</span>
                </div>
              )}
              {errors.confirmPassword && (
                <p className="text-sm text-destructive flex items-center gap-2">
                  <span className="w-1 h-1 bg-destructive rounded-full" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

          {/* General Error */}
          {errors.general && (
            <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-sm border border-destructive/20">
              {errors.general}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-14 bg-foreground text-background hover:bg-foreground/90 font-semibold rounded-sm shadow-soft hover:shadow-medium transition-all"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Creating account...
              </>
            ) : (
              "Create your account"
            )}
          </Button>

          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary hover:underline font-semibold"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
}
