import mongoose, { Document, Schema } from 'mongoose';

export interface IPatient extends Document {
  uid: string; // Primary key
  userId: mongoose.Types.ObjectId; // Reference to User
  emergencyContact?: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };
  medicalHistory?: {
    allergies: string[];
    chronicConditions: string[];
    medications: string[];
    previousSurgeries: string[];
    familyHistory: string[];
  };
  insurance?: {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
  };
  preferredLanguage?: string;
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  height?: number; // in cm
  weight?: number; // in kg
  smokingStatus?: 'never' | 'former' | 'current';
  alcoholConsumption?: 'none' | 'occasional' | 'moderate' | 'heavy';
  blockchainRecord?: {
    blockHash: string;
    storedAt: Date;
    verifiedAt?: Date;
    isVerified: boolean;
    blockchainId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema: Schema = new Schema({
  uid: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phoneNumber: String
  },
  medicalHistory: {
    allergies: [String],
    chronicConditions: [String],
    medications: [String],
    previousSurgeries: [String],
    familyHistory: [String]
  },
  insurance: {
    provider: String,
    policyNumber: String,
    groupNumber: String
  },
  preferredLanguage: {
    type: String,
    default: 'English'
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  height: {
    type: Number,
    min: 0
  },
  weight: {
    type: Number,
    min: 0
  },
  smokingStatus: {
    type: String,
    enum: ['never', 'former', 'current']
  },
  alcoholConsumption: {
    type: String,
    enum: ['none', 'occasional', 'moderate', 'heavy']
  },
  blockchainRecord: {
    blockHash: String,
    storedAt: Date,
    verifiedAt: Date,
    isVerified: {
      type: Boolean,
      default: false
    },
    blockchainId: String
  }
}, {
  timestamps: true,
  collection: 'patients'
});

// Index for efficient queries
// uid and userId already have unique indexes

export default mongoose.models.Patient || mongoose.model<IPatient>('Patient', PatientSchema);
