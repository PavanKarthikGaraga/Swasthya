"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  FaUser, 
  FaCalendarAlt, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaHeartbeat,
  FaAllergies,
  FaPills,
  FaUserMd,
  FaSpinner,
  FaArrowRight,
  FaCheckCircle
} from "react-icons/fa";
import { HeartPulse } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    
    // Medical Information
    bloodType: "",
    height: "",
    weight: "",
    allergies: "",
    currentMedications: "",
    medicalConditions: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    
    // Healthcare Provider
    primaryDoctor: "",
    doctorPhone: "",
    preferredHospital: "",
    insuranceProvider: "",
    insurancePolicyNumber: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
      if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
      if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
      if (!formData.gender) newErrors.gender = "Gender is required";
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    } else if (step === 2) {
      if (!formData.address.trim()) newErrors.address = "Address is required";
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (!formData.state.trim()) newErrors.state = "State is required";
      if (!formData.zipCode.trim()) newErrors.zipCode = "ZIP code is required";
    } else if (step === 3) {
      if (!formData.emergencyContactName.trim()) newErrors.emergencyContactName = "Emergency contact name is required";
      if (!formData.emergencyContactPhone.trim()) newErrors.emergencyContactPhone = "Emergency contact phone is required";
      if (!formData.emergencyContactRelation.trim()) newErrors.emergencyContactRelation = "Relationship is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsLoading(true);
    
    try {
      // Simulate API call to save user profile
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log("User profile created:", formData);
      
      // Mark onboarding as completed
      localStorage.setItem("onboardingCompleted", "true");
      localStorage.setItem("userProfile", JSON.stringify(formData));
      
      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Profile creation error:", error);
      setErrors({ general: "Failed to create profile. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <FaUser className="mx-auto text-3xl text-teal-600" />
        <h2 className="text-2xl font-semibold text-gray-900">Personal Information</h2>
        <p className="text-gray-600">Let's start with your basic details</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className={errors.firstName ? "border-red-500" : ""}
            />
            {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className={errors.lastName ? "border-red-500" : ""}
            />
            {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth *</Label>
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className={errors.dateOfBirth ? "border-red-500" : ""}
            />
            {errors.dateOfBirth && <p className="text-xs text-red-500">{errors.dateOfBirth}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender *</Label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className={`flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm ${errors.gender ? "border-red-500" : ""}`}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
            {errors.gender && <p className="text-xs text-red-500">{errors.gender}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={formData.phone}
            onChange={handleInputChange}
            className={errors.phone ? "border-red-500" : ""}
          />
          {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
        </div>
      </div>
    </div>
  );

  const renderAddressInfo = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <FaMapMarkerAlt className="mx-auto text-3xl text-teal-600" />
        <h2 className="text-2xl font-semibold text-gray-900">Address Information</h2>
        <p className="text-gray-600">Where can we reach you?</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="address">Street Address *</Label>
          <Input
            id="address"
            name="address"
            placeholder="123 Main Street"
            value={formData.address}
            onChange={handleInputChange}
            className={errors.address ? "border-red-500" : ""}
          />
          {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className={errors.city ? "border-red-500" : ""}
            />
            {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State *</Label>
            <Input
              id="state"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              className={errors.state ? "border-red-500" : ""}
            />
            {errors.state && <p className="text-xs text-red-500">{errors.state}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="zipCode">ZIP Code *</Label>
            <Input
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleInputChange}
              className={errors.zipCode ? "border-red-500" : ""}
            />
            {errors.zipCode && <p className="text-xs text-red-500">{errors.zipCode}</p>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMedicalInfo = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <FaHeartbeat className="mx-auto text-3xl text-teal-600" />
        <h2 className="text-2xl font-semibold text-gray-900">Medical Information</h2>
        <p className="text-gray-600">Help us understand your health profile</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bloodType">Blood Type</Label>
            <select
              id="bloodType"
              name="bloodType"
              value={formData.bloodType}
              onChange={handleInputChange}
              className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">Select blood type</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              id="height"
              name="height"
              type="number"
              placeholder="170"
              value={formData.height}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              name="weight"
              type="number"
              placeholder="70"
              value={formData.weight}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="allergies">Known Allergies</Label>
          <textarea
            id="allergies"
            name="allergies"
            placeholder="List any known allergies (medications, food, environmental, etc.)"
            value={formData.allergies}
            onChange={handleInputChange}
            className="flex min-h-[80px] w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentMedications">Current Medications</Label>
          <textarea
            id="currentMedications"
            name="currentMedications"
            placeholder="List current medications and dosages"
            value={formData.currentMedications}
            onChange={handleInputChange}
            className="flex min-h-[80px] w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="medicalConditions">Medical Conditions</Label>
          <textarea
            id="medicalConditions"
            name="medicalConditions"
            placeholder="List any chronic conditions or past medical history"
            value={formData.medicalConditions}
            onChange={handleInputChange}
            className="flex min-h-[80px] w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>
    </div>
  );

  const renderEmergencyContact = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <FaPhone className="mx-auto text-3xl text-teal-600" />
        <h2 className="text-2xl font-semibold text-gray-900">Emergency Contact</h2>
        <p className="text-gray-600">Who should we contact in case of emergency?</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="emergencyContactName">Contact Name *</Label>
          <Input
            id="emergencyContactName"
            name="emergencyContactName"
            placeholder="Full name"
            value={formData.emergencyContactName}
            onChange={handleInputChange}
            className={errors.emergencyContactName ? "border-red-500" : ""}
          />
          {errors.emergencyContactName && <p className="text-xs text-red-500">{errors.emergencyContactName}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="emergencyContactPhone">Phone Number *</Label>
            <Input
              id="emergencyContactPhone"
              name="emergencyContactPhone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.emergencyContactPhone}
              onChange={handleInputChange}
              className={errors.emergencyContactPhone ? "border-red-500" : ""}
            />
            {errors.emergencyContactPhone && <p className="text-xs text-red-500">{errors.emergencyContactPhone}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyContactRelation">Relationship *</Label>
            <select
              id="emergencyContactRelation"
              name="emergencyContactRelation"
              value={formData.emergencyContactRelation}
              onChange={handleInputChange}
              className={`flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm ${errors.emergencyContactRelation ? "border-red-500" : ""}`}
            >
              <option value="">Select relationship</option>
              <option value="spouse">Spouse</option>
              <option value="parent">Parent</option>
              <option value="child">Child</option>
              <option value="sibling">Sibling</option>
              <option value="friend">Friend</option>
              <option value="other">Other</option>
            </select>
            {errors.emergencyContactRelation && <p className="text-xs text-red-500">{errors.emergencyContactRelation}</p>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderHealthcareProvider = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <FaUserMd className="mx-auto text-3xl text-teal-600" />
        <h2 className="text-2xl font-semibold text-gray-900">Healthcare Information</h2>
        <p className="text-gray-600">Your healthcare providers and insurance details</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primaryDoctor">Primary Doctor</Label>
            <Input
              id="primaryDoctor"
              name="primaryDoctor"
              placeholder="Dr. Smith"
              value={formData.primaryDoctor}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="doctorPhone">Doctor's Phone</Label>
            <Input
              id="doctorPhone"
              name="doctorPhone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.doctorPhone}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferredHospital">Preferred Hospital</Label>
          <Input
            id="preferredHospital"
            name="preferredHospital"
            placeholder="City General Hospital"
            value={formData.preferredHospital}
            onChange={handleInputChange}
          />
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="insuranceProvider">Insurance Provider</Label>
            <Input
              id="insuranceProvider"
              name="insuranceProvider"
              placeholder="Blue Cross Blue Shield"
              value={formData.insuranceProvider}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="insurancePolicyNumber">Policy Number</Label>
            <Input
              id="insurancePolicyNumber"
              name="insurancePolicyNumber"
              placeholder="ABC123456789"
              value={formData.insurancePolicyNumber}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: "Personal", component: renderPersonalInfo },
    { number: 2, title: "Address", component: renderAddressInfo },
    { number: 3, title: "Medical", component: renderMedicalInfo },
    { number: 4, title: "Emergency", component: renderEmergencyContact },
    { number: 5, title: "Healthcare", component: renderHealthcareProvider }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-teal-600 p-2 rounded-xl shadow-sm">
              <HeartPulse className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Swasthya</h1>
          </div>
          <p className="text-gray-600">Complete your profile to get started</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.number 
                    ? "bg-teal-600 border-teal-600 text-white" 
                    : "border-gray-300 text-gray-400"
                }`}>
                  {currentStep > step.number ? (
                    <FaCheckCircle className="text-sm" />
                  ) : (
                    step.number
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= step.number ? "text-teal-600" : "text-gray-400"
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-4 ${
                    currentStep > step.number ? "bg-teal-600" : "bg-gray-300"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <Card className="shadow-lg">
          <CardContent className="p-8">
            {steps[currentStep - 1].component()}

            {errors.general && (
              <div className="mt-6 p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
                {errors.general}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className={currentStep === 1 ? "invisible" : ""}
              >
                Previous
              </Button>

              {currentStep < steps.length ? (
                <Button
                  onClick={handleNext}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  Next
                  <FaArrowRight className="ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Creating Profile...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <FaCheckCircle className="ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
