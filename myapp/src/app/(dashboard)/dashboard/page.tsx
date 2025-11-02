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
  FaShieldAlt
} from "react-icons/fa";

interface Report {
  id: string;
  title: string;
  date: string;
  type: string;
  status: string;
  blockchainVerified: boolean;
  blockHash?: string;
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
  const [activeSection, setActiveSection] = useState("upload");
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState({
    name: "Loading...",
    email: "",
    role: "Patient",
    uid: ""
  });

  // Get ML service URL from environment or default
  const ML_SERVICE_URL = process.env.NEXT_PUBLIC_ML_SERVICE_URL || 'http://localhost:5000';

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

  // AI Image Analysis State
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imageAnalysisResult, setImageAnalysisResult] = useState<DiagnosisResult | null>(null);

  // My Records State
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);

  // Load user data
  useEffect(() => {
    const loadUserData = () => {
      try {
        const storedUser = localStorage.getItem("user");
    const storedProfile = localStorage.getItem("userProfile");
        
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser({
            name: `${userData.firstName} ${userData.lastName}`,
            email: userData.email || "",
            role: userData.role || "Patient",
            uid: userData.uid || ""
          });
        } else if (storedProfile) {
      const profile = JSON.parse(storedProfile);
      setUser({
        name: `${profile.firstName} ${profile.lastName}`,
            email: profile.email || "",
        role: "Patient",
            uid: profile.uid || ""
          });
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, []);

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
        const formattedReports: Report[] = data.records.map((record: any) => ({
          id: record.data.fileId,
          title: record.data.filename,
          date: new Date(record.timestamp).toLocaleDateString(),
          type: record.data.metadata?.type || 'medical_record',
          status: 'verified',
          blockchainVerified: true,
          blockHash: record.hash
        }));
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
        
        // Reload records
        if (activeSection === "records") {
          loadBlockchainRecords();
        }
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

  const handleAIDiagnosis = async () => {
    if (!symptoms.trim()) {
      alert("Please enter symptoms");
      return;
    }

    setIsDiagnosing(true);
    setDiagnosisResult(null);

    try {
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

  const handleLogout = () => {
    localStorage.clear();
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
            onClick={() => setActiveSection("upload")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeSection === "upload"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <FaUpload />
            <span>Upload Records</span>
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
              <span>AI Diagnosis</span>
            </button>

          <button
            onClick={() => setActiveSection("imageAnalysis")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeSection === "imageAnalysis"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <FaImage />
            <span>Image Analysis</span>
          </button>

            <button
            onClick={() => setActiveSection("records")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeSection === "records"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <FaFileAlt />
            <span>My Records</span>
            </button>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-border">
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="w-full justify-start gap-3"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </Button>
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
                {activeSection === "upload" && "Upload Medical Records"}
                {activeSection === "diagnosis" && "AI Symptom Diagnosis"}
                {activeSection === "imageAnalysis" && "AI Image Analysis"}
                {activeSection === "records" && "Blockchain Records"}
              </h2>
              <p className="text-muted-foreground mt-1">
                {activeSection === "upload" && "Securely store records on blockchain"}
                {activeSection === "diagnosis" && "Get AI-powered health insights"}
                {activeSection === "imageAnalysis" && "Analyze medical images with AI"}
                {activeSection === "records" && "View your blockchain-verified records"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <FaUser className="text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 overflow-auto">
          {/* Upload Records Section */}
          {activeSection === "upload" && (
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FaShieldAlt className="text-green-500" />
                  Upload to Blockchain
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="file">Select Medical Record</Label>
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
                  <Label htmlFor="type">Record Type</Label>
                  <select
                    id="type"
                    value={uploadMetadata.type}
                    onChange={(e) => setUploadMetadata({ ...uploadMetadata, type: e.target.value })}
                    className="w-full mt-2 px-3 py-2 border border-input rounded-md"
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
                    className="w-full mt-2 px-3 py-2 border border-input rounded-md min-h-[80px]"
                  />
                </div>

                {uploadStatus && (
                  <div className={`p-4 rounded-lg ${
                    uploadStatus.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                  }`}>
                    {uploadStatus.message}
                  </div>
                )}

                <Button
                  onClick={handleUploadRecord}
                  disabled={isUploading || !selectedFile || !uploadMetadata.title}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Uploading to Blockchain...
                    </>
                  ) : (
                    <>
                      <FaLink className="mr-2" />
                      Upload to Blockchain
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* AI Diagnosis Section */}
          {activeSection === "diagnosis" && (
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FaRobot className="text-blue-500" />
                  AI Symptom Analysis
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
                    className="w-full mt-2 px-3 py-2 border border-input rounded-md min-h-[80px]"
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
                    <div className="p-4 bg-blue-50 rounded-lg">
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
                              {suggestion.recommendations && (
                                <div className="text-sm">
                                  <p className="font-medium">Recommendations:</p>
                                  <ul className="list-disc list-inside">
                                    {suggestion.recommendations.map((rec: string, i: number) => (
                                      <li key={i}>{rec}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground p-2 bg-yellow-50 rounded">
                      ⚠️ This AI analysis is for informational purposes only. Please consult a healthcare professional for proper diagnosis and treatment.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Image Analysis Section */}
          {activeSection === "imageAnalysis" && (
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FaImage className="text-purple-500" />
                  Medical Image Analysis
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
                    <div className="p-4 bg-purple-50 rounded-lg">
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

                    <p className="text-xs text-muted-foreground p-2 bg-yellow-50 rounded">
                      ⚠️ AI image analysis should be verified by a qualified radiologist or healthcare professional.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* My Records Section */}
          {activeSection === "records" && (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FaShieldAlt className="text-green-500" />
                  Blockchain-Verified Records
                </h3>
                <Button onClick={loadBlockchainRecords} disabled={isLoadingRecords}>
                  {isLoadingRecords ? <FaSpinner className="animate-spin" /> : "Refresh"}
                </Button>
              </div>

              {isLoadingRecords ? (
                <div className="flex items-center justify-center py-12">
                  <FaSpinner className="animate-spin text-4xl text-primary" />
                </div>
              ) : reports.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FaFileAlt className="text-4xl text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No records found on blockchain</p>
                    <p className="text-sm text-muted-foreground mt-2">Upload your first record to get started!</p>
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
                              <p className="text-xs text-muted-foreground mt-2 font-mono">
                                Block: {report.blockHash.substring(0, 32)}...
                              </p>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
