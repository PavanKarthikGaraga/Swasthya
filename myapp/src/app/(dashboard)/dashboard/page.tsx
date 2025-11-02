"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  FaHeartbeat, 
  FaUser, 
  FaSignOutAlt, 
  FaFileAlt, 
  FaImage, 
  FaUpload,
  FaRobot,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaLink,
  FaShieldAlt,
  FaChevronDown,
  FaIdCard,
  FaMapMarkerAlt,
  FaHospital,
  FaPhone,
} from "react-icons/fa";

interface Report {
  id: string;
  title: string;
  date: string;
  type: string;
  status: string;
  blockchainVerified: boolean;
  blockHash?: string;
  prevHash?: string;
}

interface DiagnosisResult {
  diagnosis: string;
  conditions: string[];
  confidence: number;
  findings: string[];
  recommendations?: string[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("records"); // Changed default from "upload" to "records"
  const [isMounted, setIsMounted] = useState(false);
  const [showAddRecordModal, setShowAddRecordModal] = useState(false); // New state for modal
  const [showProfileDropdown, setShowProfileDropdown] = useState(false); // Profile dropdown state
  const [showProfileModal, setShowProfileModal] = useState(false); // Profile modal state
  const [userProfile, setUserProfile] = useState<any>(null); // Store full profile data
  const [user, setUser] = useState({
    name: "Loading...",
    email: "",
    role: "Patient",
    uid: ""
  });

  // Get ML service URL from environment or default
  const ML_SERVICE_URL = process.env.NEXT_PUBLIC_ML_SERVICE_URL || 'http://localhost:4000';

  // Ensure component is mounted (client-side only)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Upload Records State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMetadata, setUploadMetadata] = useState({
    title: "",
    description: "",
    type: "lab_result"
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: string; message: string } | null>(null);

  // AI Diagnosis State
  const [symptoms, setSymptoms] = useState("");
  const [symptomDescription, setSymptomDescription] = useState("");
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [nearbyHospitals, setNearbyHospitals] = useState<any[]>([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);

  // AI Image Analysis State
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imageAnalysisResult, setImageAnalysisResult] = useState<DiagnosisResult | null>(null);

  // My Records State
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // First try localStorage
        const storedUser = localStorage.getItem("user");
    const storedProfile = localStorage.getItem("userProfile");
        
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            if (userData.firstName && userData.lastName) {
              setUser({
                name: `${userData.firstName} ${userData.lastName}`,
                email: userData.email || "",
                role: userData.role || "Patient",
                uid: userData.uid || ""
              });
              return; // Successfully loaded from localStorage
            }
          } catch (e) {
            console.warn("Error parsing stored user:", e);
          }
        } else if (storedProfile) {
          try {
      const profile = JSON.parse(storedProfile);
            if (profile.firstName && profile.lastName) {
      setUser({
        name: `${profile.firstName} ${profile.lastName}`,
                email: profile.email || "",
        role: "Patient",
                uid: profile.uid || ""
              });
              return; // Successfully loaded from profile
            }
          } catch (e) {
            console.warn("Error parsing stored profile:", e);
          }
        }

        // If localStorage failed or incomplete, fetch from API
        const response = await fetch('/api/auth/me', {
          credentials: 'include', // Include cookies
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            const userData = data.user;
            setUser({
              name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'User',
              email: userData.email || "",
              role: userData.role || "Patient",
              uid: userData.uid || ""
            });
            // Also store in localStorage for next time
            localStorage.setItem("user", JSON.stringify(userData));
          }
        } else if (response.status === 401) {
          // Not authenticated, redirect to login
          router.push('/auth/login');
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        // If everything fails, try to redirect to login
        router.push('/auth/login');
      }
    };

    const loadProfileData = () => {
      try {
        const storedProfile = localStorage.getItem("userProfile");
        if (storedProfile) {
          setUserProfile(JSON.parse(storedProfile));
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
      }
    };

    if (isMounted) {
      loadUserData();
      loadProfileData();
    }
  }, [isMounted, router]);

  // Load blockchain records
  useEffect(() => {
    if (activeSection === "records" && user.uid) {
      loadBlockchainRecords();
    }
  }, [activeSection, user.uid]);

  const loadBlockchainRecords = async () => {
    if (!user.uid) return;
    
    setIsLoadingRecords(true);
    try {
      const response = await fetch(`${ML_SERVICE_URL}/records/patient/${user.uid}`);
      const data = await response.json();
      
      if (data.success && data.records) {
        // Handle new medical_records structure (clean, no chunks)
        const formattedReports: Report[] = data.records.map((record: any) => {
          // New structure from medical_records collection
          if (record.recordId && record.blockHash) {
            return {
              id: record.id || record.recordId,
              title: record.metadata?.title || record.originalName || record.filename,
              date: new Date(record.createdAt || record.updatedAt).toLocaleDateString(),
              type: record.metadata?.type || record.labels?.[0] || 'medical_record',
              status: record.blockchainVerified ? 'verified' : 'pending',
              blockchainVerified: record.blockchainVerified || !!record.blockHash,
              blockHash: record.blockHash,
              prevHash: record.prevHash
            };
          }
          // Fallback for old block structure
          return {
            id: record.data?.fileId || record.id,
            title: record.data?.metadata?.title || record.data?.filename || 'Record',
            date: new Date(record.timestamp || record.createdAt).toLocaleDateString(),
            type: record.data?.metadata?.type || 'medical_record',
            status: 'verified',
            blockchainVerified: true,
            blockHash: record.hash || record.blockHash,
            prevHash: record.prevHash
          };
        });
        setReports(formattedReports);
      }
    } catch (error) {
      console.error("Error loading blockchain records:", error);
      setUploadStatus({ type: "error", message: "Failed to load records from blockchain" });
    } finally {
      setIsLoadingRecords(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadStatus(null);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
      setImageAnalysisResult(null);
    }
  };

  const handleUploadRecord = async () => {
    if (!selectedFile || !uploadMetadata.title) {
      setUploadStatus({ type: "error", message: "Please select a file and provide a title" });
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);

    try {
      // Step 1: Upload file to blockchain backend
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('patientId', user.uid);
      formData.append('labels', JSON.stringify(['medical_record', uploadMetadata.type]));
      formData.append('tags', JSON.stringify(['healthcare', 'patient_upload']));
      formData.append('metadata', JSON.stringify({
        title: uploadMetadata.title,
        description: uploadMetadata.description,
        type: uploadMetadata.type,
        uploadedBy: user.name,
        uploadDate: new Date().toISOString()
      }));

      const uploadResponse = await fetch(`${ML_SERVICE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (uploadData.success) {
        setUploadStatus({
          type: "success",
          message: `✅ Record uploaded successfully to blockchain! Block Hash: ${uploadData.block.hash.substring(0, 16)}...`
        });
        
        // Reset form
        setSelectedFile(null);
        setUploadMetadata({ title: "", description: "", type: "lab_result" });
        
        // Reload records and close modal after a brief delay
    setTimeout(() => {
          loadBlockchainRecords();
          setShowAddRecordModal(false);
          setUploadStatus(null);
        }, 2000);
      } else {
        throw new Error(uploadData.error || "Upload failed");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      setUploadStatus({
        type: "error",
        message: `❌ Upload failed: ${error.message}`
      });
    } finally {
      setIsUploading(false);
    }
  };


  const requestLocationPermission = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return false;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
      setLocationPermissionGranted(true);
      return true;
    } catch (error: any) {
      console.error("Error getting location:", error);
      return false;
    }
  };

  const fetchNearbyHospitals = async (condition: string = 'general') => {
    if (!userLocation) return;

    setLoadingHospitals(true);
    try {
      // Call backend API to search for hospitals
      const response = await fetch(
        `/api/hospitals/nearby?latitude=${userLocation.lat}&longitude=${userLocation.lng}&condition=${encodeURIComponent(condition)}`
      );

      if (response.ok) {
        const data = await response.json();
        setNearbyHospitals(data.hospitals || []);
      } else {
        console.error("Failed to fetch nearby hospitals:", response.status);
        setNearbyHospitals([]);
      }
    } catch (error) {
      console.error("Error fetching nearby hospitals:", error);
      setNearbyHospitals([]);
    } finally {
      setLoadingHospitals(false);
    }
  };

  const handleAIDiagnosis = async () => {
    if (!symptoms.trim()) {
      alert("Please enter symptoms");
      return;
    }

    setIsDiagnosing(true);
    setDiagnosisResult(null);
    setNearbyHospitals([]);

    try {
      // Request location permission first
      const locationGranted = await requestLocationPermission();

      const symptomsArray = symptoms.split(',').map(s => s.trim()).filter(s => s);
      
      const response = await fetch(`${ML_SERVICE_URL}/ai/diagnose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms: symptomsArray,
          description: symptomDescription,
          patientId: user.uid
        }),
      });

      const data = await response.json();

      if (data.success) {
        setDiagnosisResult(data.diagnosis);
        
        // Get the main condition from diagnosis for hospital search
        let mainCondition = 'general';
        if (data.diagnosis?.suggestions && data.diagnosis.suggestions.length > 0) {
          mainCondition = data.diagnosis.suggestions[0].condition?.toLowerCase() || 'general';
        }
        
        // Fetch nearby hospitals if location permission was granted
        if (locationGranted) {
          await fetchNearbyHospitals(mainCondition);
        }
      } else {
        throw new Error(data.error || "Diagnosis failed");
      }
    } catch (error: any) {
      console.error("Diagnosis error:", error);
      alert(`AI Diagnosis failed: ${error.message}`);
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleImageAnalysis = async () => {
    if (!selectedImage) {
      alert("Please select an image");
      return;
    }

    setIsAnalyzing(true);
    setImageAnalysisResult(null);

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedImage);
      
      reader.onload = async () => {
        const base64Image = reader.result?.toString().split(',')[1];
        
        const response = await fetch(`${ML_SERVICE_URL}/ai/analyze-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Image,
            patientId: user.uid
          }),
        });

        const data = await response.json();

        if (data.success) {
          setImageAnalysisResult(data.analysis);
        } else {
          throw new Error(data.error || "Image analysis failed");
        }
        
        setIsAnalyzing(false);
      };

      reader.onerror = () => {
        setIsAnalyzing(false);
        alert("Failed to read image file");
      };
    } catch (error: any) {
      console.error("Image analysis error:", error);
      alert(`Image analysis failed: ${error.message}`);
      setIsAnalyzing(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Call logout API to clear cookie
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout API error:', error);
    }
    // Clear local storage
    localStorage.clear();
    // Redirect to login
    router.push("/auth/login");
  };

  // Prevent SSR issues - only render on client
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-primary" />
    </div>
  );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
              <FaHeartbeat className="text-white text-xl" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Swasthya</h1>
              <p className="text-xs text-muted-foreground">Healthcare Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4 space-y-2">
            <button
            onClick={() => setActiveSection("records")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeSection === "records"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
              }`}
            >
            <FaFileAlt />
            <span>Medical Records</span>
            </button>

            <button
              onClick={() => setActiveSection("diagnosis")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === "diagnosis" 
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
              }`}
            >
            <FaRobot />
              <span>AI Analysis</span>
            </button>
          </div>
        </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-card/50 backdrop-blur-sm border-b border-border px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <FaLink className="text-primary" />
                {activeSection === "records" && "Medical Records"}
                {activeSection === "diagnosis" && "AI Analysis"}
              </h2>
              <p className="text-muted-foreground mt-1">
                {activeSection === "records" && "View and manage your blockchain-verified health records"}
                {activeSection === "diagnosis" && "Get AI-powered health insights from symptoms and medical images"}
              </p>
            </div>
            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-muted transition-colors"
              >
              <div className="text-right">
                  <p className="font-semibold text-sm">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <FaUser className="text-primary" />
              </div>
                <FaChevronDown className={`text-muted-foreground transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showProfileDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowProfileDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg z-50">
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setShowProfileModal(true);
                          setShowProfileDropdown(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-muted transition-colors text-left"
                      >
                        <FaIdCard className="text-primary" />
                        <span>Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          handleLogout();
                          setShowProfileDropdown(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-muted transition-colors text-left text-destructive"
                      >
                        <FaSignOutAlt />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 overflow-auto">
          {/* Medical Records Section - Unified */}
          {activeSection === "records" && (
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FaShieldAlt className="text-green-500" />
                  Blockchain-Verified Records
                </h3>
                <div className="flex gap-3">
                  <Button onClick={loadBlockchainRecords} disabled={isLoadingRecords} variant="outline">
                    {isLoadingRecords ? <FaSpinner className="animate-spin" /> : "Refresh"}
                  </Button>
                  <Button onClick={() => setShowAddRecordModal(true)}>
                    <FaUpload className="mr-2" />
                    Add New Record
                  </Button>
                </div>
              </div>

              {isLoadingRecords ? (
                <div className="flex items-center justify-center py-12">
                  <FaSpinner className="animate-spin text-4xl text-primary" />
                </div>
              ) : reports.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FaFileAlt className="text-4xl text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-semibold mb-2">No medical records yet</p>
                    <p className="text-sm text-muted-foreground mb-6">Start by adding your first health record to the blockchain</p>
                    <Button onClick={() => setShowAddRecordModal(true)}>
                      <FaUpload className="mr-2" />
                      Add Your First Record
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <Card key={report.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{report.title}</h4>
                              {report.blockchainVerified && (
                                <Badge className="bg-green-500">
                                  <FaCheckCircle className="mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-4 text-sm text-muted-foreground">
                              <span>Date: {report.date}</span>
                              <span>Type: {report.type}</span>
                            </div>
                            {report.blockHash && (
                              <div className="mt-2 space-y-1">
                                <p className="text-xs text-muted-foreground font-mono">
                                  <span className="font-semibold">Hash:</span> {report.blockHash.substring(0, 24)}...
                                </p>
                                {report.prevHash && (
                                  <p className="text-xs text-muted-foreground font-mono">
                                    <span className="font-semibold">Prev:</span> {report.prevHash.substring(0, 24)}...
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Add Record Modal */}
              {showAddRecordModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAddRecordModal(false)}>
                  <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <FaUpload className="text-green-500" />
                          Add New Medical Record
                        </CardTitle>
                        <button 
                          onClick={() => setShowAddRecordModal(false)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          ✕
                        </button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="file">Select Medical Record *</Label>
                        <Input
                          id="file"
                          type="file"
                          onChange={handleFileSelect}
                          accept=".pdf,.jpg,.jpeg,.png,.dcm"
                          className="mt-2"
                        />
                        {selectedFile && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="title">Record Title *</Label>
                        <Input
                          id="title"
                          value={uploadMetadata.title}
                          onChange={(e) => setUploadMetadata({ ...uploadMetadata, title: e.target.value })}
                          placeholder="e.g., Blood Test Results - Jan 2024"
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="type">Record Type *</Label>
                        <select
                          id="type"
                          value={uploadMetadata.type}
                          onChange={(e) => setUploadMetadata({ ...uploadMetadata, type: e.target.value })}
                          className="w-full mt-2 px-3 py-2 border border-input rounded-md bg-background"
                        >
                          <option value="lab_result">Lab Result</option>
                          <option value="imaging">Imaging (X-ray, MRI, CT)</option>
                          <option value="prescription">Prescription</option>
                          <option value="discharge_summary">Discharge Summary</option>
                          <option value="consultation_notes">Consultation Notes</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="description">Description (Optional)</Label>
                        <textarea
                          id="description"
                          value={uploadMetadata.description}
                          onChange={(e) => setUploadMetadata({ ...uploadMetadata, description: e.target.value })}
                          placeholder="Additional notes about this record"
                          className="w-full mt-2 px-3 py-2 border border-input rounded-md min-h-[80px] bg-background"
                        />
                      </div>

                      {uploadStatus && (
                        <div className={`p-4 rounded-lg ${
                          uploadStatus.type === "success" ? "bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-100" : "bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-100"
                        }`}>
                          {uploadStatus.message}
                        </div>
                      )}

                      <div className="flex gap-3 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setShowAddRecordModal(false)}
                          className="flex-1"
                          disabled={isUploading}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleUploadRecord}
                          disabled={isUploading || !selectedFile || !uploadMetadata.title}
                          className="flex-1"
                        >
                          {isUploading ? (
                            <>
                              <FaSpinner className="animate-spin mr-2" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <FaLink className="mr-2" />
                              Upload to Blockchain
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* AI Analysis Section - Combined Side by Side */}
          {activeSection === "diagnosis" && (
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Symptom Diagnosis Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FaRobot className="text-blue-500" />
                      Symptom Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="symptoms">Symptoms (comma-separated) *</Label>
                      <Input
                        id="symptoms"
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        placeholder="e.g., fever, cough, headache"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="symptomDesc">Additional Details</Label>
                      <textarea
                        id="symptomDesc"
                        value={symptomDescription}
                        onChange={(e) => setSymptomDescription(e.target.value)}
                        placeholder="Describe how long you've had these symptoms, severity, etc."
                        className="w-full mt-2 px-3 py-2 border border-input rounded-md min-h-[80px] bg-background"
                      />
                    </div>

                    <Button
                      onClick={handleAIDiagnosis}
                      disabled={isDiagnosing || !symptoms.trim()}
                      className="w-full"
                    >
                      {isDiagnosing ? (
                        <>
                          <FaSpinner className="animate-spin mr-2" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <FaRobot className="mr-2" />
                          Get AI Diagnosis
                        </>
                      )}
                    </Button>

                    {diagnosisResult && (
                      <div className="mt-6 space-y-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="font-semibold mb-2">Confidence: {(diagnosisResult.confidence * 100).toFixed(1)}%</p>
                          <p className="text-sm">{diagnosisResult.analysis}</p>
                        </div>

                        {diagnosisResult.suggestions && diagnosisResult.suggestions.length > 0 && (
                          <div className="space-y-2">
                            <h3 className="font-semibold">Possible Conditions:</h3>
                            {diagnosisResult.suggestions.map((suggestion: any, index: number) => (
                              <Card key={index}>
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold">{suggestion.condition}</h4>
                                    <Badge>{(suggestion.probability * 100).toFixed(0)}%</Badge>
                                  </div>
                                  {suggestion.description && (
                                    <p className="text-sm text-muted-foreground mb-2">{suggestion.description}</p>
                                  )}
                                  {(suggestion.medications && suggestion.medications.length > 0) ? (
                                    <div className="text-sm mt-3">
                                      <p className="font-medium mb-2">Medications to Take:</p>
                                      <ul className="list-disc list-inside space-y-1">
                                        {suggestion.medications.map((med: string, i: number) => (
                                          <li key={i} className="text-muted-foreground">{med}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  ) : (suggestion.recommendations && suggestion.recommendations.length > 0) ? (
                                    <div className="text-sm mt-3">
                                      <p className="font-medium mb-2">Medications to Take:</p>
                                      <ul className="list-disc list-inside space-y-1">
                                        {suggestion.recommendations.map((rec: string, i: number) => (
                                          <li key={i} className="text-muted-foreground">{rec}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  ) : null}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}

                        {/* Nearby Hospitals Section */}
                        {locationPermissionGranted && (
                          <div className="mt-6">
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                              <FaMapMarkerAlt className="text-primary" />
                              Nearby Hospitals
                            </h3>
                            {loadingHospitals ? (
                              <div className="flex items-center justify-center py-4">
                                <FaSpinner className="animate-spin text-primary" />
                                <span className="ml-2 text-sm text-muted-foreground">Finding nearby hospitals...</span>
                              </div>
                            ) : nearbyHospitals.length > 0 ? (
                              <div className="space-y-3">
                                {nearbyHospitals.map((hospital: any, index: number) => {
                                  return (
                                    <Card key={index}>
                                      <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-2">
                                          <div className="flex-1">
                                            <h4 className="font-semibold flex items-center gap-2">
                                              <FaHospital className="text-primary" />
                                              {hospital.name}
                                            </h4>
                                            <p className="text-sm text-muted-foreground mt-1">
                                              {hospital.type}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                              <FaMapMarkerAlt className="inline mr-1" />
                                              {hospital.distance} away
                                            </p>
                                          </div>
                                        </div>
                                        {hospital.address && (
                                          <p className="text-xs text-muted-foreground mb-2">
                                            {hospital.address}
                                          </p>
                                        )}
                                        <div className="flex flex-col gap-1 mt-2">
                                          {hospital.phone && (
                                            <a
                                              href={`tel:${hospital.phone}`}
                                              className="text-xs text-primary hover:underline flex items-center gap-1"
                                            >
                                              <FaPhone className="text-xs" />
                                              {hospital.phone}
                                            </a>
                                          )}
                                          {hospital.lat && hospital.lng && (
                                            <a
                                              href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-xs text-primary hover:underline flex items-center gap-1"
                                            >
                                              <FaMapMarkerAlt className="text-xs" />
                                              Get Directions
                                            </a>
                                          )}
                                        </div>
                                      </CardContent>
                                    </Card>
                                  );
                                })}
                              </div>
                            ) : (
                              <Card>
                                <CardContent className="p-4 text-center space-y-2">
                                  <p className="text-sm text-muted-foreground">
                                    No hospitals found nearby.
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Please search for hospitals in your area or contact emergency services if needed.
                                  </p>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded mt-4">
                          ⚠️ This AI analysis is for informational purposes only. Please consult a healthcare professional for proper diagnosis and treatment.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Image Analysis Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FaImage className="text-purple-500" />
                      Image Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="image">Select Medical Image</Label>
                      <Input
                        id="image"
                        type="file"
                        onChange={handleImageSelect}
                        accept="image/*"
                        className="mt-2"
                      />
                      {selectedImage && (
                        <div className="mt-4">
                          <img
                            src={URL.createObjectURL(selectedImage)}
                            alt="Selected"
                            className="max-w-full h-auto rounded-lg border"
                          />
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={handleImageAnalysis}
                      disabled={isAnalyzing || !selectedImage}
                      className="w-full"
                    >
                      {isAnalyzing ? (
                        <>
                          <FaSpinner className="animate-spin mr-2" />
                          Analyzing Image...
                        </>
                      ) : (
                        <>
                          <FaImage className="mr-2" />
                          Analyze with AI
                        </>
                      )}
                    </Button>

                    {imageAnalysisResult && (
                      <div className="mt-6 space-y-4">
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <p className="font-semibold mb-2">Diagnosis: {imageAnalysisResult.diagnosis}</p>
                          <p className="text-sm">Confidence: {(imageAnalysisResult.confidence * 100).toFixed(1)}%</p>
                        </div>

                        {imageAnalysisResult.findings && imageAnalysisResult.findings.length > 0 && (
                          <div>
                            <h3 className="font-semibold mb-2">Findings:</h3>
                            <ul className="list-disc list-inside space-y-1">
                              {imageAnalysisResult.findings.map((finding, index) => (
                                <li key={index} className="text-sm">{finding}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {imageAnalysisResult.recommendations && imageAnalysisResult.recommendations.length > 0 && (
                          <div>
                            <h3 className="font-semibold mb-2">Recommendations:</h3>
                            <ul className="list-disc list-inside space-y-1">
                              {imageAnalysisResult.recommendations.map((rec, index) => (
                                <li key={index} className="text-sm">{rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                          ⚠️ AI image analysis should be verified by a qualified radiologist or healthcare professional.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowProfileModal(false)}>
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FaIdCard className="text-primary" />
                  My Profile
                </CardTitle>
                <button 
                  onClick={() => setShowProfileModal(false)}
                  className="text-muted-foreground hover:text-foreground text-2xl"
                >
                  ×
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {userProfile ? (
                <>
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <FaUser className="text-primary" />
                      Personal Information
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">First Name</Label>
                        <p className="font-medium">{userProfile.firstName || (user.name ? user.name.split(' ')[0] : 'N/A')}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Last Name</Label>
                        <p className="font-medium">{userProfile.lastName || (user.name ? user.name.split(' ')[1] || 'N/A' : 'N/A')}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Email</Label>
                        <p className="font-medium">{user.email || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Date of Birth</Label>
                        <p className="font-medium">{userProfile.dateOfBirth || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Gender</Label>
                        <p className="font-medium">{userProfile.gender || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Phone</Label>
                        <p className="font-medium">{userProfile.phone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Address Information */}
                  {(userProfile.address || userProfile.city || userProfile.state || userProfile.zipCode) && (
                    <>
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <FaShieldAlt className="text-primary" />
                          Address
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <Label className="text-muted-foreground">Street Address</Label>
                            <p className="font-medium">{userProfile.address || 'N/A'}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">City</Label>
                            <p className="font-medium">{userProfile.city || 'N/A'}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">State</Label>
                            <p className="font-medium">{userProfile.state || 'N/A'}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Zip Code</Label>
                            <p className="font-medium">{userProfile.zipCode || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      <Separator />
                    </>
                  )}

                  {/* Medical Information */}
                  {(userProfile.bloodType || userProfile.height || userProfile.weight || userProfile.allergies || userProfile.currentMedications || userProfile.medicalConditions) && (
                    <>
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <FaHeartbeat className="text-primary" />
                          Medical Information
                        </h3>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <Label className="text-muted-foreground">Blood Type</Label>
                            <p className="font-medium">{userProfile.bloodType || 'N/A'}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Height</Label>
                            <p className="font-medium">{userProfile.height || 'N/A'}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Weight</Label>
                            <p className="font-medium">{userProfile.weight || 'N/A'}</p>
                          </div>
                        </div>
                        {(userProfile.allergies || userProfile.currentMedications || userProfile.medicalConditions) && (
                          <div className="mt-4 space-y-4">
                            {userProfile.allergies && (
                              <div>
                                <Label className="text-muted-foreground">Allergies</Label>
                                <p className="font-medium">{userProfile.allergies}</p>
                              </div>
                            )}
                            {userProfile.currentMedications && (
                              <div>
                                <Label className="text-muted-foreground">Current Medications</Label>
                                <p className="font-medium">{userProfile.currentMedications}</p>
                              </div>
                            )}
                            {userProfile.medicalConditions && (
                              <div>
                                <Label className="text-muted-foreground">Medical Conditions</Label>
                                <p className="font-medium">{userProfile.medicalConditions}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <Separator />
                    </>
                  )}

                  {/* Emergency Contact */}
                  {(userProfile.emergencyContactName || userProfile.emergencyContactPhone || userProfile.emergencyContactRelation) && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FaShieldAlt className="text-primary" />
                        Emergency Contact
                      </h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-muted-foreground">Name</Label>
                          <p className="font-medium">{userProfile.emergencyContactName || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Phone</Label>
                          <p className="font-medium">{userProfile.emergencyContactPhone || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Relation</Label>
                          <p className="font-medium">{userProfile.emergencyContactRelation || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <FaUser className="text-4xl text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No profile information available</p>
                  <p className="text-sm text-muted-foreground mt-2">Complete your onboarding to add profile details</p>
                  <Button onClick={() => {
                    setShowProfileModal(false);
                    router.push('/onboarding');
                  }} className="mt-4">
                    Complete Onboarding
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
