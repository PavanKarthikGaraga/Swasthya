import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
  uid: string; // Primary key
  patientId: mongoose.Types.ObjectId; // Reference to Patient
  doctorId?: mongoose.Types.ObjectId; // Reference to Doctor (optional for AI-generated reports)
  appointmentId?: mongoose.Types.ObjectId; // Reference to Appointment
  title: string;
  type: 'lab_result' | 'imaging' | 'prescription' | 'discharge_summary' | 'consultation_notes' | 'ai_analysis';
  description?: string;
  fileName: string;
  fileType: string; // MIME type
  fileSize: number; // in bytes
  gridFSId?: string; // GridFS file ID for large file storage
  fileData?: Buffer; // Fallback for small files (deprecated)
  metadata?: {
    testType?: string;
    labName?: string;
    imagingType?: string;
    dateOfTest?: Date;
    results?: any; // Flexible object for different test results
    normalRange?: any;
    interpretation?: string;
  };
  aiAnalysis?: {
    summary: string;
    recommendations: string[];
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence: number; // 0-100
    analyzedAt: Date;
    findings?: string[];
    conditions?: string[];
  };
  blockchainRecord?: {
    blockHash: string;
    storedAt: Date;
    verifiedAt?: Date;
    isVerified: boolean;
    blockchainId?: string;
  };
  status: 'draft' | 'final' | 'archived';
  isConfidential: boolean;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema: Schema = new Schema({
  uid: {
    type: String,
    required: true,
    unique: true
  },
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  appointmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['lab_result', 'imaging', 'prescription', 'discharge_summary', 'consultation_notes', 'ai_analysis'],
    required: true
  },
  description: String,
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true,
    min: 0
  },
  gridFSId: {
    type: String,
    sparse: true // Allow null values
  },
  fileData: {
    type: Buffer,
    required: false // Made optional for migration
  },
  metadata: {
    testType: String,
    labName: String,
    imagingType: String,
    dateOfTest: Date,
    results: Schema.Types.Mixed,
    normalRange: Schema.Types.Mixed,
    interpretation: String
  },
  aiAnalysis: {
    summary: String,
    recommendations: [String],
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100
    },
    analyzedAt: Date,
    findings: [String],
    conditions: [String]
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
  },
  status: {
    type: String,
    enum: ['draft', 'final', 'archived'],
    default: 'final'
  },
  isConfidential: {
    type: Boolean,
    default: false
  },
  tags: [String]
}, {
  timestamps: true,
  collection: 'reports'
});

// Index for efficient queries
ReportSchema.index({ patientId: 1, createdAt: -1 });
ReportSchema.index({ doctorId: 1, createdAt: -1 });
ReportSchema.index({ type: 1 });
ReportSchema.index({ status: 1 });
ReportSchema.index({ tags: 1 });

// Text index for search functionality
ReportSchema.index({
  title: 'text',
  description: 'text',
  'metadata.interpretation': 'text'
});

export default mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);
