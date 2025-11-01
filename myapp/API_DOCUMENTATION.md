# Swasthya Medical AI Bot - Backend API Documentation

## Overview

This is a comprehensive medical AI bot backend system built with Next.js 15, MongoDB, and JWT authentication. The system manages users, patients, doctors, appointments, medical reports, and images.

## Database Schema

### Users Collection
- **uid**: String (Primary Key)
- **email**: String (Unique)
- **password**: String (Hashed, optional for Google OAuth)
- **firstName**: String
- **lastName**: String
- **phoneNumber**: String
- **dateOfBirth**: Date
- **gender**: Enum ('male', 'female', 'other')
- **address**: Object
- **role**: Enum ('patient', 'doctor', 'admin')
- **profileImage**: String
- **googleId**: String (For Google OAuth)
- **isVerified**: Boolean
- **isActive**: Boolean
- **lastLogin**: Date

### Patients Collection
- **uid**: String (Primary Key)
- **userId**: ObjectId (Reference to User)
- **emergencyContact**: Object
- **medicalHistory**: Object (allergies, conditions, medications, etc.)
- **insurance**: Object
- **preferredLanguage**: String
- **bloodType**: Enum
- **height**: Number (cm)
- **weight**: Number (kg)
- **smokingStatus**: Enum
- **alcoholConsumption**: Enum

### Doctors Collection
- **uid**: String (Primary Key)
- **userId**: ObjectId (Reference to User)
- **licenseNumber**: String (Unique)
- **specialization**: Array
- **experience**: Number
- **education**: Array
- **certifications**: Array
- **languages**: Array
- **availability**: Array
- **consultationFee**: Number
- **rating**: Number
- **totalReviews**: Number
- **isAcceptingNewPatients**: Boolean
- **hospitalAffiliation**: String
- **bio**: String

### Appointments Collection
- **uid**: String (Primary Key)
- **patientId**: ObjectId (Reference to Patient)
- **doctorId**: ObjectId (Reference to Doctor)
- **appointmentDate**: Date
- **duration**: Number (minutes)
- **type**: Enum ('consultation', 'followup', 'emergency', 'checkup')
- **status**: Enum ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')
- **reason**: String
- **symptoms**: Array
- **notes**: String
- **prescription**: String
- **diagnosis**: String
- **paymentStatus**: Enum
- **paymentAmount**: Number
- **meetingLink**: String
- **location**: String

### Reports Collection
- **uid**: String (Primary Key)
- **patientId**: ObjectId (Reference to Patient)
- **doctorId**: ObjectId (Reference to Doctor)
- **appointmentId**: ObjectId (Reference to Appointment)
- **title**: String
- **type**: Enum ('lab_result', 'imaging', 'prescription', 'discharge_summary', 'consultation_notes', 'ai_analysis')
- **description**: String
- **fileName**: String
- **fileType**: String
- **fileSize**: Number
- **fileData**: Buffer (Binary data)
- **metadata**: Object
- **aiAnalysis**: Object
- **status**: Enum ('draft', 'final', 'archived')
- **isConfidential**: Boolean
- **tags**: Array

### Images Collection
- **uid**: String (Primary Key)
- **reportId**: ObjectId (Reference to Report)
- **patientId**: ObjectId (Reference to Patient)
- **fileName**: String
- **fileType**: String
- **fileSize**: Number
- **fileData**: Buffer (Binary data)
- **caption**: String
- **altText**: String
- **category**: Enum ('xray', 'mri', 'ct_scan', 'ultrasound', 'photograph', 'diagram', 'other')
- **isPrimary**: Boolean
- **order**: Number
- **status**: Enum ('active', 'archived', 'deleted')

## Authentication

### JWT Token
- **Format**: Bearer {token}
- **Expires**: 1 hour
- **Header**: `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Google OAuth
- **Initiate**: `GET /api/auth/google?role=patient|doctor|admin`
- **Callback**: `GET /api/auth/google/callback`
- **Redirect**: `/auth/success?token={jwt}&role={role}`

## API Endpoints

### Authentication Routes

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe",
  "role": "patient",
  "phoneNumber": "+1234567890",
  "dateOfBirth": "1990-01-01",
  "gender": "male"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### Google OAuth
```http
GET /api/auth/google?role=patient
```

### User Management

#### Get Users
```http
GET /api/users?page=1&limit=10&role=patient&search=john
Authorization: Bearer {token}
```

#### Create User (Admin Only)
```http
POST /api/users
Content-Type: application/json
Authorization: Bearer {token}

{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "patient",
  "phoneNumber": "+1234567890"
}
```

#### Get User by UID
```http
GET /api/users/{uid}
Authorization: Bearer {token}
```

#### Update User
```http
PUT /api/users/{uid}
Content-Type: application/json
Authorization: Bearer {token}

{
  "firstName": "Jane",
  "phoneNumber": "+1987654321"
}
```

#### Delete User (Admin Only)
```http
DELETE /api/users/{uid}
Authorization: Bearer {token}
```

### Patient Management

#### Get Patients
```http
GET /api/patients?page=1&limit=10&search=john
Authorization: Bearer {token}
```

#### Create Patient Profile
```http
POST /api/patients
Content-Type: application/json
Authorization: Bearer {token}

{
  "userId": "user_123456789",
  "emergencyContact": {
    "name": "Jane Doe",
    "relationship": "wife",
    "phoneNumber": "+1234567890"
  },
  "medicalHistory": {
    "allergies": ["penicillin"],
    "chronicConditions": ["diabetes"]
  }
}
```

#### Get Patient by UID
```http
GET /api/patients/{uid}
Authorization: Bearer {token}
```

#### Update Patient Profile
```http
PUT /api/patients/{uid}
Content-Type: application/json
Authorization: Bearer {token}

{
  "bloodType": "O+",
  "height": 175,
  "weight": 70
}
```

#### Delete Patient Profile (Admin Only)
```http
DELETE /api/patients/{uid}
Authorization: Bearer {token}
```

### Doctor Management

#### Get Doctors
```http
GET /api/doctors?page=1&limit=10&specialization=cardiology&available=true
Authorization: Bearer {token}
```

#### Create Doctor Profile (Admin Only)
```http
POST /api/doctors
Content-Type: application/json
Authorization: Bearer {token}

{
  "userId": "user_123456789",
  "licenseNumber": "MD123456",
  "specialization": ["cardiology", "internal medicine"],
  "experience": 10,
  "consultationFee": 15000
}
```

#### Get Doctor by UID
```http
GET /api/doctors/{uid}
Authorization: Bearer {token}
```

#### Update Doctor Profile
```http
PUT /api/doctors/{uid}
Content-Type: application/json
Authorization: Bearer {token}

{
  "consultationFee": 20000,
  "isAcceptingNewPatients": false
}
```

#### Delete Doctor Profile (Admin Only)
```http
DELETE /api/doctors/{uid}
Authorization: Bearer {token}
```

### Appointment Management

#### Get Appointments
```http
GET /api/appointments?page=1&limit=10&status=scheduled&type=consultation&dateFrom=2024-01-01&dateTo=2024-12-31
Authorization: Bearer {token}
```

#### Book Appointment (Patients Only)
```http
POST /api/appointments
Content-Type: application/json
Authorization: Bearer {token}

{
  "doctorId": "doctor_123456789",
  "appointmentDate": "2024-12-01T10:00:00Z",
  "duration": 30,
  "type": "consultation",
  "reason": "Regular checkup",
  "symptoms": ["headache", "fatigue"]
}
```

#### Get Appointment by UID
```http
GET /api/appointments/{uid}
Authorization: Bearer {token}
```

#### Update Appointment
```http
PUT /api/appointments/{uid}
Content-Type: application/json
Authorization: Bearer {token}

{
  "status": "confirmed",
  "notes": "Patient confirmed appointment",
  "appointmentDate": "2024-12-01T11:00:00Z" // Reschedule
}
```

#### Cancel Appointment
```http
PUT /api/appointments/{uid}
Content-Type: application/json
Authorization: Bearer {token}

{
  "status": "cancelled",
  "cancellationReason": "Patient requested cancellation"
}
```

#### Delete Appointment (Admin Only)
```http
DELETE /api/appointments/{uid}
Authorization: Bearer {token}
```

### Report Management

#### Get Reports
```http
GET /api/reports?page=1&limit=10&type=lab_result&status=final&search=blood
Authorization: Bearer {token}
```

#### Upload Report (Doctors/Admins Only)
```http
POST /api/reports
Content-Type: multipart/form-data
Authorization: Bearer {token}

file: {pdf_file}
patientId: patient_123456789
title: Blood Test Results
type: lab_result
description: Complete blood count results
```

#### Get Report by UID
```http
GET /api/reports/{uid}
Authorization: Bearer {token}
```

#### Download Report
```http
GET /api/reports/{uid}?download=true
Authorization: Bearer {token}
```

#### Update Report
```http
PUT /api/reports/{uid}
Content-Type: multipart/form-data
Authorization: Bearer {token}

title: Updated Blood Test Results
status: final
```

#### Delete Report (Admin Only)
```http
DELETE /api/reports/{uid}
Authorization: Bearer {token}
```

### Image Management

#### Get Images
```http
GET /api/images?page=1&limit=10&reportId=report_123&category=xray&status=active
Authorization: Bearer {token}
```

#### Upload Image (Doctors/Admins Only)
```http
POST /api/images
Content-Type: multipart/form-data
Authorization: Bearer {token}

file: {image_file}
reportId: report_123456789
patientId: patient_123456789
category: xray
caption: Chest X-ray
isPrimary: true
```

#### Get Image by UID
```http
GET /api/images/{uid}
Authorization: Bearer {token}
```

#### View/Download Image
```http
GET /api/images/{uid}?download=true
Authorization: Bearer {token}
```

#### Update Image
```http
PUT /api/images/{uid}
Content-Type: multipart/form-data
Authorization: Bearer {token}

caption: Updated caption
category: mri
```

#### Delete Image (Admin Only)
```http
DELETE /api/images/{uid}
Authorization: Bearer {token}
```

## Response Formats

### Success Response
```json
{
  "message": "Operation successful",
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

## Environment Variables

```env
# Database
MONGODB_URI=mongodb://adminuser:oNC4IFPf6h7x1H5E@82.112.226.108:27017/swast?authSource=admin

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=1h

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

## Installation & Setup

1. **Install Dependencies**
```bash
npm install
```

2. **Set Environment Variables**
Create `.env.local` file with the required variables above.

3. **Start Development Server**
```bash
npm run dev
```

4. **Database Connection**
The app automatically connects to MongoDB on startup.

## Security Features

- JWT authentication with 1-hour expiration
- Role-based access control (patient, doctor, admin)
- Password hashing with bcrypt
- File upload validation and size limits
- Input sanitization and validation
- CORS protection

## File Upload Limits

- **Reports**: 10MB max, PDF, DOC, DOCX, TXT files
- **Images**: 5MB max, JPEG, PNG, GIF, WebP, BMP files

## Notes

- All dates are in ISO 8601 format (UTC)
- All monetary values are in cents (e.g., $150 = 15000)
- UIDs are unique identifiers for each resource
- Binary data (files) are stored directly in MongoDB
- API responses exclude binary data by default (use download=true to retrieve files)

## Error Codes

- `400`: Bad Request - Invalid input
- `401`: Unauthorized - Missing/invalid token
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource not found
- `409`: Conflict - Resource already exists
- `500`: Internal Server Error - Server error
