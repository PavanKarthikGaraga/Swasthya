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
  FaFileMedical,
  FaDownload,
  FaCalendar,
} from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadialBarChart, RadialBar } from "recharts";

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


  // My Records State
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);

  // Analysis Reports State
  const [analysisReports, setAnalysisReports] = useState<any[]>([]);
  const [isLoadingAnalysisReports, setIsLoadingAnalysisReports] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

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

  // Load analysis reports
  useEffect(() => {
    if (activeSection === "analysisReports" && user.uid) {
      loadAnalysisReports();
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
      // Call backend API to search for hospitals with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(
        `/api/hospitals/nearby?latitude=${userLocation.lat}&longitude=${userLocation.lng}&condition=${encodeURIComponent(condition)}`,
        { signal: controller.signal }
      );
      
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setNearbyHospitals(data.hospitals || []);
        
        // If no hospitals found, try again with 'general' condition after a delay
        if ((data.hospitals || []).length === 0 && condition !== 'general') {
          setTimeout(async () => {
            await fetchNearbyHospitals('general');
          }, 1000);
        }
      } else {
        console.error("Failed to fetch nearby hospitals:", response.status);
        setNearbyHospitals([]);
      }
    } catch (error: any) {
      console.error("Error fetching nearby hospitals:", error);
      // On timeout or error, try once more with 'general' condition
      if (condition !== 'general' && !error.message?.includes('aborted')) {
        setTimeout(async () => {
          await fetchNearbyHospitals('general');
        }, 500);
      } else {
        setNearbyHospitals([]);
      }
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


  const loadAnalysisReports = async () => {
    if (!user.uid) return;
    
    setIsLoadingAnalysisReports(true);
    try {
      const response = await fetch('/api/reports?type=ai_analysis', {
        credentials: 'include', // Include cookies for authentication
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load reports');
      }
      
      const data = await response.json();
      
      if (data.reports) {
        setAnalysisReports(data.reports);
      } else {
        setAnalysisReports([]);
      }
    } catch (error: any) {
      console.error("Error loading analysis reports:", error);
      // Show user-friendly error
      if (error.message.includes('Access denied') || error.message.includes('401')) {
        alert("Please log in again to view your reports");
        router.push('/auth/login');
      } else {
        // Set empty array on error to show empty state
        setAnalysisReports([]);
      }
    } finally {
      setIsLoadingAnalysisReports(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!diagnosisResult) {
      alert("No diagnosis result to save");
      return;
    }

    setIsGeneratingReport(true);
    try {
      const response = await fetch('/api/reports/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diagnosisResult,
          symptoms: symptoms.split(',').map(s => s.trim()).filter(s => s),
          description: symptomDescription,
          title: `AI Analysis - ${new Date().toLocaleDateString()}`
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("✅ Report generated and saved successfully!");
        // Reload reports if we're on the reports page
        if (activeSection === "analysisReports") {
          loadAnalysisReports();
        }
      } else {
        throw new Error(data.error || "Failed to generate report");
      }
    } catch (error: any) {
      console.error("Generate report error:", error);
      alert(`Failed to generate report: ${error.message}`);
    } finally {
      setIsGeneratingReport(false);
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

            <button
              onClick={() => setActiveSection("analysisReports")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === "analysisReports" 
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
              }`}
            >
            <FaFileMedical />
              <span>Analysis Reports</span>
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
                {activeSection === "analysisReports" && "Analysis Reports"}
              </h2>
              <p className="text-muted-foreground mt-1">
                {activeSection === "records" && "View and manage your blockchain-verified health records"}
                {activeSection === "diagnosis" && "Get AI-powered health insights from symptoms and medical images"}
                {activeSection === "analysisReports" && "View and manage your saved AI analysis reports"}
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

          {/* AI Analysis Section - Full Width */}
          {activeSection === "diagnosis" && (
            <div className="max-w-7xl mx-auto">
              {/* Symptom Diagnosis Card - Full Width */}
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
                      <div className="mt-6 space-y-6">
                        {/* Overview Section with Confidence */}
                        <div className="grid md:grid-cols-3 gap-4">
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-muted-foreground mb-1">Overall Confidence</p>
                                  <p className="text-3xl font-bold text-primary">
                                    {(diagnosisResult.confidence * 100).toFixed(1)}%
                                  </p>
                                </div>
                                <div className="w-16 h-16">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <RadialBarChart
                                      cx="50%"
                                      cy="50%"
                                      innerRadius="60%"
                                      outerRadius="100%"
                                      barSize={10}
                                      data={[
                                        {
                                          name: 'Confidence',
                                          value: diagnosisResult.confidence * 100,
                                          fill: '#14B8A6'
                                        }
                                      ]}
                                      startAngle={90}
                                      endAngle={-270}
                                    >
                                      <RadialBar
                                        dataKey="value"
                                        cornerRadius={10}
                                        fill="#14B8A6"
                                      />
                                    </RadialBarChart>
                                  </ResponsiveContainer>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <p className="text-sm text-muted-foreground mb-1">Possible Conditions</p>
                              <p className="text-3xl font-bold text-blue-600">
                                {diagnosisResult.suggestions?.length || 0}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">Conditions identified</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <p className="text-sm text-muted-foreground mb-1">Analysis Status</p>
                              <p className="text-3xl font-bold text-green-600">Complete</p>
                              <p className="text-xs text-muted-foreground mt-1">AI diagnosis ready</p>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Analysis Text */}
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="font-semibold mb-2">Analysis Summary:</p>
                          <p className="text-sm">{diagnosisResult.analysis}</p>
                        </div>

                        {/* Charts Section */}
                        {diagnosisResult.suggestions && diagnosisResult.suggestions.length > 0 && (
                          <div className="grid lg:grid-cols-2 gap-6">
                            {/* Condition Probabilities Bar Chart */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Condition Probabilities</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                  <BarChart
                                    data={diagnosisResult.suggestions.map((s: any) => ({
                                      condition: s.condition.length > 20 
                                        ? s.condition.substring(0, 20) + '...' 
                                        : s.condition,
                                      probability: (s.probability * 100).toFixed(1),
                                      fullCondition: s.condition
                                    }))}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                  >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
                                    <XAxis 
                                      dataKey="condition" 
                                      angle={-45} 
                                      textAnchor="end" 
                                      height={100}
                                      tick={{ fontSize: 12 }}
                                    />
                                    <YAxis 
                                      domain={[0, 100]}
                                      tick={{ fontSize: 12 }}
                                      label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft' }}
                                    />
                                    <Tooltip 
                                      formatter={(value: any) => [`${value}%`, 'Probability']}
                                      labelFormatter={(label) => {
                                        const fullCondition = diagnosisResult.suggestions?.find(
                                          (s: any) => (s.condition.length > 20 
                                            ? s.condition.substring(0, 20) + '...' 
                                            : s.condition) === label
                                        )?.condition || label;
                                        return fullCondition;
                                      }}
                                    />
                                    <Bar 
                                      dataKey="probability" 
                                      fill="#14B8A6"
                                      radius={[8, 8, 0, 0]}
                                    />
                                  </BarChart>
                                </ResponsiveContainer>
                              </CardContent>
                            </Card>

                            {/* Condition Distribution Pie Chart */}
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Condition Distribution</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                  <PieChart>
                                    <Pie
                                      data={diagnosisResult.suggestions.map((s: any) => ({
                                        name: s.condition.length > 25 
                                          ? s.condition.substring(0, 25) + '...' 
                                          : s.condition,
                                        value: parseFloat((s.probability * 100).toFixed(1)),
                                        fullName: s.condition
                                      }))}
                                      cx="50%"
                                      cy="50%"
                                      labelLine={false}
                                      label={({ name, value }) => `${name}: ${value}%`}
                                      outerRadius={80}
                                      fill="#8884d8"
                                      dataKey="value"
                                    >
                                      {diagnosisResult.suggestions.map((_: any, index: number) => {
                                        const colors = ['#14B8A6', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F59E0B'];
                                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                      })}
                                    </Pie>
                                    <Tooltip 
                                      formatter={(value: any) => [`${value}%`, 'Probability']}
                                      labelFormatter={(label) => {
                                        const fullCondition = diagnosisResult.suggestions?.find(
                                          (s: any) => (s.condition.length > 25 
                                            ? s.condition.substring(0, 25) + '...' 
                                            : s.condition) === label
                                        )?.condition || label;
                                        return fullCondition;
                                      }}
                                    />
                                    <Legend 
                                      verticalAlign="bottom" 
                                      height={36}
                                      formatter={(value) => {
                                        const fullCondition = diagnosisResult.suggestions?.find(
                                          (s: any) => (s.condition.length > 25 
                                            ? s.condition.substring(0, 25) + '...' 
                                            : s.condition) === value
                                        )?.condition || value;
                                        return fullCondition.length > 30 ? fullCondition.substring(0, 30) + '...' : fullCondition;
                                      }}
                                    />
                                  </PieChart>
                                </ResponsiveContainer>
                              </CardContent>
                            </Card>
                          </div>
                        )}

                        {/* Condition Details */}
                        {diagnosisResult.suggestions && diagnosisResult.suggestions.length > 0 && (
                          <div className="space-y-3">
                            <h3 className="font-semibold text-lg">Possible Conditions:</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                              {diagnosisResult.suggestions.map((suggestion: any, index: number) => (
                                <Card key={index}>
                                  <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                      <h4 className="font-semibold text-base">{suggestion.condition}</h4>
                                      <Badge className="bg-primary">
                                        {(suggestion.probability * 100).toFixed(0)}%
                                      </Badge>
                                    </div>
                                    {suggestion.description && (
                                      <p className="text-sm text-muted-foreground mb-3">{suggestion.description}</p>
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
                                        <p className="font-medium mb-2">Recommendations:</p>
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

                        {/* Nearby Hospitals Section */}
                        {locationPermissionGranted && (
                          <div className="mt-6">
                            <h3 className="font-semibold mb-3 flex items-center gap-2 text-lg">
                              <FaMapMarkerAlt className="text-primary" />
                              Nearby Hospitals
                            </h3>
                            {loadingHospitals ? (
                              <div className="flex items-center justify-center py-4">
                                <FaSpinner className="animate-spin text-primary" />
                                <span className="ml-2 text-sm text-muted-foreground">Finding nearby hospitals...</span>
                              </div>
                            ) : nearbyHospitals.length > 0 ? (
                              <div className="grid md:grid-cols-2 gap-4">
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

                        {/* Generate Report Button */}
                        <div className="mt-6 pt-4 border-t border-border">
                          <Button
                            onClick={handleGenerateReport}
                            disabled={isGeneratingReport}
                            className="w-full"
                            variant="outline"
                          >
                            {isGeneratingReport ? (
                              <>
                                <FaSpinner className="animate-spin mr-2" />
                                Generating Report...
                              </>
                            ) : (
                              <>
                                <FaFileMedical className="mr-2" />
                                Generate & Save Report
                              </>
                            )}
                          </Button>
                        </div>

                        <p className="text-xs text-muted-foreground p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded mt-4">
                          ⚠️ This AI analysis is for informational purposes only. Please consult a healthcare professional for proper diagnosis and treatment.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
            </div>
          )}

          {/* Analysis Reports Section */}
          {activeSection === "analysisReports" && (
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FaFileMedical className="text-blue-500" />
                  AI Analysis Reports
                </h3>
                <Button onClick={loadAnalysisReports} disabled={isLoadingAnalysisReports} variant="outline">
                  {isLoadingAnalysisReports ? <FaSpinner className="animate-spin" /> : "Refresh"}
                </Button>
              </div>

              {isLoadingAnalysisReports ? (
                <div className="flex items-center justify-center py-12">
                  <FaSpinner className="animate-spin text-4xl text-primary" />
                </div>
              ) : analysisReports.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FaFileMedical className="text-4xl text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-semibold mb-2">No analysis reports yet</p>
                    <p className="text-sm text-muted-foreground mb-6">
                      Generate reports from your AI diagnosis results to save them for future reference
                    </p>
                    <Button onClick={() => setActiveSection("diagnosis")}>
                      <FaRobot className="mr-2" />
                      Go to AI Analysis
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {analysisReports.map((report: any) => (
                    <Card key={report.uid || report._id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{report.title}</h4>
                              <Badge className="bg-blue-500">AI Analysis</Badge>
                              {report.aiAnalysis?.severity && (
                                <Badge className={`${
                                  report.aiAnalysis.severity === 'high' ? 'bg-red-500' :
                                  report.aiAnalysis.severity === 'medium' ? 'bg-yellow-500' :
                                  'bg-green-500'
                                }`}>
                                  {report.aiAnalysis.severity.toUpperCase()}
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-4 text-sm text-muted-foreground mb-2">
                              <span className="flex items-center gap-1">
                                <FaCalendar className="text-xs" />
                                {new Date(report.createdAt).toLocaleDateString()}
                              </span>
                              {report.aiAnalysis?.confidence !== undefined && (
                                <span>Confidence: {report.aiAnalysis.confidence.toFixed(1)}%</span>
                              )}
                            </div>
                            {report.aiAnalysis?.summary && (
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {report.aiAnalysis.summary}
                              </p>
                            )}
                            {report.aiAnalysis?.conditions && report.aiAnalysis.conditions.length > 0 && (
                              <div className="mb-3">
                                <p className="text-xs font-semibold text-muted-foreground mb-1">Conditions Identified:</p>
                                <div className="flex flex-wrap gap-1">
                                  {report.aiAnalysis.conditions.slice(0, 3).map((condition: string, idx: number) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {condition}
                                    </Badge>
                                  ))}
                                  {report.aiAnalysis.conditions.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{report.aiAnalysis.conditions.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                            {report.description && (
                              <p className="text-xs text-muted-foreground">
                                {report.description}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(`/api/reports/${report.uid}?download=true`, '_blank')}
                            >
                              <FaDownload className="mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
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
