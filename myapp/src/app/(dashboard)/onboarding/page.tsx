"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getStoredUser, getAuthToken } from "@/lib/api";
import { 
  FaUser, 
  FaCalendarAlt, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaHeartbeat,
  FaSpinner,
  FaArrowRight,
  FaArrowLeft,
  FaCheckCircle,
  FaStethoscope,
  FaLock
} from "react-icons/fa";

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    bloodType: "",
    height: "",
    weight: "",
    allergies: "",
    currentMedications: "",
    medicalConditions: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load user data on mount and pre-fill name fields
  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser && storedUser.firstName && storedUser.lastName) {
      setFormData(prev => ({
        ...prev,
        firstName: storedUser.firstName,
        lastName: storedUser.lastName
      }));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Prevent editing firstName and lastName
    if (name === "firstName" || name === "lastName") {
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
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
      const storedUser = getStoredUser();
      const token = getAuthToken();
      
      if (!storedUser || !token) {
        throw new Error("User not authenticated");
      }

      // Prepare User model updates
      const userUpdates: any = {
        phoneNumber: formData.phone,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
        gender: formData.gender as 'male' | 'female' | 'other' | undefined,
        address: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: "US" // Default or make it a field in the form
        }
      };

      // Prepare Patient model updates
      // Parse allergies from text to array
      const allergiesArray = formData.allergies
        ? formData.allergies.split(',').map(a => a.trim()).filter(a => a.length > 0)
        : [];

      // Parse medications from text to array
      const medicationsArray = formData.currentMedications
        ? formData.currentMedications.split(',').map(m => m.trim()).filter(m => m.length > 0)
        : [];

      // Parse medical conditions from text to array
      const conditionsArray = formData.medicalConditions
        ? formData.medicalConditions.split(',').map(c => c.trim()).filter(c => c.length > 0)
        : [];

      const patientUpdates: any = {
        emergencyContact: {
          name: formData.emergencyContactName,
          relationship: formData.emergencyContactRelation,
          phoneNumber: formData.emergencyContactPhone
        },
        medicalHistory: {
          allergies: allergiesArray,
          chronicConditions: conditionsArray,
          medications: medicationsArray,
          previousSurgeries: [], // Not in form, but keeping structure
          familyHistory: [] // Not in form, but keeping structure
        },
        bloodType: formData.bloodType || undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined
      };

      // Update User profile
      const userResponse = await fetch(`/api/users/${storedUser.uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userUpdates)
      });

      if (!userResponse.ok) {
        let errorMessage = 'Failed to update user profile';
        try {
          const errorData = await userResponse.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          const text = await userResponse.text();
          errorMessage = text || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Get the patient UID (it should be `patient_${userUid}`)
      const patientUid = `patient_${storedUser.uid}`;
      
      // Update Patient profile
      const patientResponse = await fetch(`/api/patients/${patientUid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(patientUpdates)
      });

      if (!patientResponse.ok) {
        let errorMessage = 'Failed to update patient profile';
        try {
          const errorData = await patientResponse.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          const text = await patientResponse.text();
          errorMessage = text || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Save to localStorage for backward compatibility
      localStorage.setItem("onboardingCompleted", "true");
      localStorage.setItem("userProfile", JSON.stringify(formData));
      
      router.push("/dashboard");
    } catch (error) {
      console.error("Profile creation error:", error);
      setErrors({ 
        general: error instanceof Error 
          ? error.message 
          : "Failed to create profile. Please try again." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { 
      number: 1, 
      title: "Personal Info", 
      icon: FaUser,
      description: "Basic information"
    },
    { 
      number: 2, 
      title: "Address", 
      icon: FaMapMarkerAlt,
      description: "Location details"
    },
    { 
      number: 3, 
      title: "Emergency", 
      icon: FaPhone,
      description: "Contact information"
    },
    { 
      number: 4, 
      title: "Medical", 
      icon: FaHeartbeat,
      description: "Health profile"
    }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2 mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-100 dark:bg-teal-900/30 mb-4">
                <FaUser className="text-3xl text-teal-600 dark:text-teal-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Personal Information</h2>
              <p className="text-gray-600 dark:text-gray-400">Let's start with your basic details</p>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    First Name <span className="text-red-500">*</span>
                    <FaLock className="text-xs text-gray-400" title="This field is locked from registration" />
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    readOnly
                    disabled
                    className={`h-14 rounded-xl border-2 bg-gray-50 dark:bg-gray-800 cursor-not-allowed border-gray-300 dark:border-gray-600 opacity-75`}
                    placeholder="John"
                  />
                  <AnimatePresence>
                    {errors.firstName && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-red-500"
                      >
                        {errors.firstName}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    Last Name <span className="text-red-500">*</span>
                    <FaLock className="text-xs text-gray-400" title="This field is locked from registration" />
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    readOnly
                    disabled
                    className={`h-14 rounded-xl border-2 bg-gray-50 dark:bg-gray-800 cursor-not-allowed border-gray-300 dark:border-gray-600 opacity-75`}
                    placeholder="Doe"
                  />
                  <AnimatePresence>
                    {errors.lastName && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-red-500"
                      >
                        {errors.lastName}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Rest of step 1 remains the same */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    Date of Birth <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className={`h-14 rounded-xl border-2 ${errors.dateOfBirth ? "border-red-500" : "border-gray-200 dark:border-gray-700"}`}
                  />
                  <AnimatePresence>
                    {errors.dateOfBirth && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-red-500"
                      >
                        {errors.dateOfBirth}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    Gender <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className={`flex h-14 w-full rounded-xl border-2 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium ${errors.gender ? "border-red-500" : "border-gray-200 dark:border-gray-700"}`}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                  <AnimatePresence>
                    {errors.gender && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-red-500"
                      >
                        {errors.gender}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`h-14 rounded-xl border-2 ${errors.phone ? "border-red-500" : "border-gray-200 dark:border-gray-700"}`}
                />
                <AnimatePresence>
                  {errors.phone && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-red-500"
                    >
                      {errors.phone}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        );
      
      case 2:
        // Keep the same address step
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2 mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-100 dark:bg-teal-900/30 mb-4">
                <FaMapMarkerAlt className="text-3xl text-teal-600 dark:text-teal-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Address Information</h2>
              <p className="text-gray-600 dark:text-gray-400">Where can we reach you?</p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Street Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="123 Main Street"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`h-14 rounded-xl border-2 ${errors.address ? "border-red-500" : "border-gray-200 dark:border-gray-700"}`}
                />
                <AnimatePresence>
                  {errors.address && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-red-500"
                    >
                      {errors.address}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`h-14 rounded-xl border-2 ${errors.city ? "border-red-500" : "border-gray-200 dark:border-gray-700"}`}
                    placeholder="New York"
                  />
                  <AnimatePresence>
                    {errors.city && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-red-500"
                      >
                        {errors.city}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    State <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={`h-14 rounded-xl border-2 ${errors.state ? "border-red-500" : "border-gray-200 dark:border-gray-700"}`}
                    placeholder="NY"
                  />
                  <AnimatePresence>
                    {errors.state && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-red-500"
                      >
                        {errors.state}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    ZIP Code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className={`h-14 rounded-xl border-2 ${errors.zipCode ? "border-red-500" : "border-gray-200 dark:border-gray-700"}`}
                    placeholder="10001"
                  />
                  <AnimatePresence>
                    {errors.zipCode && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-red-500"
                      >
                        {errors.zipCode}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        // Keep the same emergency contact step
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2 mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-100 dark:bg-teal-900/30 mb-4">
                <FaPhone className="text-3xl text-teal-600 dark:text-teal-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Emergency Contact</h2>
              <p className="text-gray-600 dark:text-gray-400">Who should we contact in case of emergency?</p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="emergencyContactName" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Contact Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="emergencyContactName"
                  name="emergencyContactName"
                  placeholder="Full name"
                  value={formData.emergencyContactName}
                  onChange={handleInputChange}
                  className={`h-14 rounded-xl border-2 ${errors.emergencyContactName ? "border-red-500" : "border-gray-200 dark:border-gray-700"}`}
                />
                <AnimatePresence>
                  {errors.emergencyContactName && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-red-500"
                    >
                      {errors.emergencyContactName}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="emergencyContactPhone"
                    name="emergencyContactPhone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.emergencyContactPhone}
                    onChange={handleInputChange}
                    className={`h-14 rounded-xl border-2 ${errors.emergencyContactPhone ? "border-red-500" : "border-gray-200 dark:border-gray-700"}`}
                  />
                  <AnimatePresence>
                    {errors.emergencyContactPhone && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-red-500"
                      >
                        {errors.emergencyContactPhone}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactRelation" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    Relationship <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="emergencyContactRelation"
                    name="emergencyContactRelation"
                    value={formData.emergencyContactRelation}
                    onChange={handleInputChange}
                    className={`flex h-14 w-full rounded-xl border-2 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium ${errors.emergencyContactRelation ? "border-red-500" : "border-gray-200 dark:border-gray-700"}`}
                  >
                    <option value="">Select relationship</option>
                    <option value="spouse">Spouse</option>
                    <option value="parent">Parent</option>
                    <option value="child">Child</option>
                    <option value="sibling">Sibling</option>
                    <option value="friend">Friend</option>
                    <option value="other">Other</option>
                  </select>
                  <AnimatePresence>
                    {errors.emergencyContactRelation && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-red-500"
                      >
                        {errors.emergencyContactRelation}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        // Keep the medical step (now step 4 instead of step 4)
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2 mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-100 dark:bg-teal-900/30 mb-4">
                <FaHeartbeat className="text-3xl text-teal-600 dark:text-teal-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Medical Information</h2>
              <p className="text-gray-600 dark:text-gray-400">Help us understand your health profile</p>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="bloodType" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    Blood Type
                  </Label>
                  <select
                    id="bloodType"
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleInputChange}
                    className="flex h-14 w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium"
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
                  <Label htmlFor="height" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    Height (cm)
                  </Label>
                  <Input
                    id="height"
                    name="height"
                    type="number"
                    placeholder="170"
                    value={formData.height}
                    onChange={handleInputChange}
                    className="h-14 rounded-xl border-2 border-gray-200 dark:border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    Weight (kg)
                  </Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    placeholder="70"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className="h-14 rounded-xl border-2 border-gray-200 dark:border-gray-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Known Allergies
                </Label>
                <textarea
                  id="allergies"
                  name="allergies"
                  placeholder="List any known allergies (medications, food, environmental, etc.)"
                  value={formData.allergies}
                  onChange={handleInputChange}
                  className="flex min-h-[100px] w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm font-medium resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentMedications" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Current Medications
                </Label>
                <textarea
                  id="currentMedications"
                  name="currentMedications"
                  placeholder="List current medications and dosages"
                  value={formData.currentMedications}
                  onChange={handleInputChange}
                  className="flex min-h-[100px] w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm font-medium resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medicalConditions" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Medical Conditions
                </Label>
                <textarea
                  id="medicalConditions"
                  name="medicalConditions"
                  placeholder="List any chronic conditions or past medical history"
                  value={formData.medicalConditions}
                  onChange={handleInputChange}
                  className="flex min-h-[100px] w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm font-medium resize-none"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Rest of the component remains the same...
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl">
              <FaStethoscope className="text-white text-2xl" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Swasthya
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400 font-medium">
            Complete your profile to get started
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex items-center flex-col gap-3 flex-1">
                  <div className={`flex items-center justify-center w-14 h-14 rounded-2xl border-2 transition-all ${
                    currentStep >= step.number 
                      ? "bg-gradient-to-br from-teal-600 to-cyan-600 border-teal-600 text-white shadow-lg" 
                      : "border-gray-300 dark:border-gray-700 text-gray-400 bg-white dark:bg-gray-800"
                  }`}>
                    {currentStep > step.number ? (
                      <FaCheckCircle className="text-xl" />
                    ) : (
                      <step.icon className="text-xl" />
                    )}
                  </div>
                  <div className="text-center">
                    <p className={`text-xs font-bold ${currentStep >= step.number ? "text-teal-600 dark:text-teal-400" : "text-gray-400"}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 rounded-full transition-all ${
                    currentStep > step.number ? "bg-gradient-to-r from-teal-600 to-cyan-600" : "bg-gray-200 dark:bg-gray-700"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 p-8 md:p-12">
            <AnimatePresence mode="wait">
              {renderStepContent()}
            </AnimatePresence>

            <AnimatePresence>
              {errors.general && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 p-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl border-2 border-red-200 dark:border-red-800 font-semibold"
                >
                  {errors.general}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className={`h-14 px-8 rounded-xl font-bold border-2 ${currentStep === 1 ? "invisible" : ""}`}
                >
                  <FaArrowLeft className="mr-2" />
                  Previous
                </Button>
              </motion.div>

              {currentStep < steps.length ? (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleNext}
                    className="h-14 px-8 rounded-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-lg"
                  >
                    Next
                    <FaArrowRight className="ml-2" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="h-14 px-8 rounded-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-lg"
                  >
                    {isLoading ? (
                      <>
                        <FaSpinner className="animate-spin mr-3" />
                        Creating Profile...
                      </>
                    ) : (
                      <>
                        Complete Setup
                        <FaCheckCircle className="ml-2" />
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
