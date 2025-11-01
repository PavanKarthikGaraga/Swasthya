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
  FaCog, 
  FaEye,
  FaUpload,
  FaRobot,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEdit,
  FaSave
} from "react-icons/fa";

export default function DashboardPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("reports");
  const [user, setUser] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Patient",
    avatar: null
  });

  // Load user data from onboarding
  useEffect(() => {
    const storedProfile = localStorage.getItem("userProfile");
    if (storedProfile) {
      const profile = JSON.parse(storedProfile);
      setUser({
        name: `${profile.firstName} ${profile.lastName}`,
        email: profile.email || "john.doe@example.com",
        role: "Patient",
        avatar: null
      });
      setProfileData({
        name: `${profile.firstName} ${profile.lastName}`,
        email: profile.email || "john.doe@example.com",
        role: "Patient",
        avatar: null
      });
    }
  }, []);

  // Image diagnosis state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Profile editing state
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(user);

  // Mock reports data
  const reports = [
    {
      id: 1,
      title: "Blood Test Results",
      date: "2024-01-15",
      status: "completed",
      type: "Lab Report"
    },
    {
      id: 2,
      title: "X-Ray Chest Analysis",
      date: "2024-01-10",
      status: "completed",
      type: "Imaging"
    },
    {
      id: 3,
      title: "AI Skin Lesion Analysis",
      date: "2024-01-08",
      status: "pending",
      type: "AI Diagnosis"
    },
    {
      id: 4,
      title: "ECG Report",
      date: "2024-01-05",
      status: "completed",
      type: "Cardiac"
    }
  ];

  const handleLogout = () => {
    console.log("Logging out...");
    router.push("/");
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setDiagnosisResult(null);
    }
  };

  const runDiagnosis = async () => {
    if (!selectedImage) return;
    
    setIsProcessing(true);
    // Simulate AI processing
    setTimeout(() => {
      setDiagnosisResult({
        confidence: 87,
        diagnosis: "Benign Nevus",
        recommendations: [
          "Monitor for changes in size, shape, or color",
          "Schedule follow-up in 6 months",
          "Use sunscreen regularly"
        ],
        riskLevel: "low"
      });
      setIsProcessing(false);
    }, 3000);
  };

  const handleProfileSave = () => {
    setUser(profileData);
    setIsEditing(false);
    // In real app, save to backend
    console.log("Profile saved:", profileData);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Completed</Badge>;
      case "pending":
        return <Badge className="bg-muted text-muted-foreground hover:bg-muted">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const renderReportsSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Medical Reports</h2>
        <Button className="bg-foreground text-background hover:bg-foreground/90 rounded-sm">
          <FaFileAlt className="mr-2" />
          New Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <Card key={report.id} className="hover:shadow-medium transition-shadow shadow-soft">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg font-semibold">{report.title}</CardTitle>
                {getStatusBadge(report.status)}
              </div>
              <p className="text-sm text-muted-foreground">{report.type}</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Date: {report.date}</p>
                <Button variant="outline" className="w-full rounded-sm">
                  <FaEye className="mr-2" />
                  View Report
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderImageDiagnosisSection = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">AI Image Diagnosis</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaImage className="text-primary" />
              Upload Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-sm p-6 text-center hover:border-primary transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <FaUpload className="mx-auto text-3xl text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, JPEG up to 10MB
                </p>
              </label>
            </div>

            {selectedImage && (
              <div className="space-y-3">
                <p className="text-sm font-medium">Selected: {selectedImage.name}</p>
                <Button 
                  onClick={runDiagnosis} 
                  disabled={isProcessing}
                  className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-sm"
                >
                  {isProcessing ? (
                    <>
                      <FaSpinner className="mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaRobot className="mr-2" />
                      Run AI Diagnosis
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaRobot className="text-primary" />
              Diagnosis Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!diagnosisResult && !isProcessing && (
              <div className="text-center py-8 text-muted-foreground">
                <FaImage className="mx-auto text-4xl mb-3 opacity-50" />
                <p>Upload an image and run diagnosis to see results</p>
              </div>
            )}

            {isProcessing && (
              <div className="text-center py-8">
                <FaSpinner className="mx-auto text-4xl text-primary animate-spin mb-3" />
                <p className="text-muted-foreground">AI is analyzing your image...</p>
              </div>
            )}

            {diagnosisResult && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" />
                  <span className="font-medium">Analysis Complete</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Diagnosis</Label>
                    <p className="text-lg font-semibold">{diagnosisResult.diagnosis}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Confidence Level</Label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${diagnosisResult.confidence}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{diagnosisResult.confidence}%</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Risk Level</Label>
                    <Badge 
                      className={`ml-2 ${
                        diagnosisResult.riskLevel === 'low' 
                          ? 'bg-primary/10 text-primary hover:bg-primary/10' 
                          : 'bg-destructive/10 text-destructive hover:bg-destructive/10'
                      }`}
                    >
                      {diagnosisResult.riskLevel.toUpperCase()}
                    </Badge>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Recommendations</Label>
                    <ul className="mt-2 space-y-2">
                      {diagnosisResult.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Profile Settings</h2>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} variant="outline" className="rounded-sm">
            <FaEdit className="mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleProfileSave} className="bg-foreground text-background hover:bg-foreground/90 rounded-sm">
              <FaSave className="mr-2" />
              Save Changes
            </Button>
            <Button onClick={() => setIsEditing(false)} variant="outline" className="rounded-sm">
              Cancel
            </Button>
          </div>
        )}
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              value={profileData.role}
              onChange={(e) => setProfileData({...profileData, role: e.target.value})}
              disabled={!isEditing}
            />
          </div>

          {isEditing && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Change Password</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-soft">
        <div className="w-full px-6 lg:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-sm">
              <FaHeartbeat className="h-5 w-5 text-white m-1.5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Swasthya</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <FaUser className="text-primary" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <FaSignOutAlt className="mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="w-full px-6 lg:px-12 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 lg:sticky lg:top-6 lg:self-start">
            <Card className="shadow-soft">
              <CardContent className="p-4">
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveSection("reports")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-left transition-colors font-medium ${
                      activeSection === "reports" 
                        ? "bg-primary/10 text-primary" 
                        : "hover:bg-muted"
                    }`}
                  >
                    <FaFileAlt />
                    Reports
                  </button>
                  <button
                    onClick={() => setActiveSection("diagnosis")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-left transition-colors font-medium ${
                      activeSection === "diagnosis" 
                        ? "bg-primary/10 text-primary" 
                        : "hover:bg-muted"
                    }`}
                  >
                    <FaImage />
                    AI Diagnosis
                  </button>
                  <button
                    onClick={() => setActiveSection("profile")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-left transition-colors font-medium ${
                      activeSection === "profile" 
                        ? "bg-primary/10 text-primary" 
                        : "hover:bg-muted"
                    }`}
                  >
                    <FaCog />
                    Profile Settings
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeSection === "reports" && renderReportsSection()}
            {activeSection === "diagnosis" && renderImageDiagnosisSection()}
            {activeSection === "profile" && renderProfileSection()}
          </div>
        </div>
      </div>
    </div>
  );
}
