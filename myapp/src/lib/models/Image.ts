import mongoose, { Document, Schema } from 'mongoose';

export interface IImage extends Document {
  uid: string; // Primary key
  reportId: mongoose.Types.ObjectId; // Reference to Report
  patientId: mongoose.Types.ObjectId; // Reference to Patient
  fileName: string;
  fileType: string; // MIME type (image/jpeg, image/png, etc.)
  fileSize: number; // in bytes
  fileData: Buffer; // Binary data for image storage
  caption?: string;
  altText?: string;
  category: 'xray' | 'mri' | 'ct_scan' | 'ultrasound' | 'photograph' | 'diagram' | 'other';
  metadata?: {
    width?: number;
    height?: number;
    colorSpace?: string;
    compression?: string;
    resolution?: {
      x: number;
      y: number;
      unit: string;
    };
  };
  aiAnnotations?: {
    labels: string[];
    confidence: number;
    boundingBoxes?: {
      x: number;
      y: number;
      width: number;
      height: number;
      label: string;
      confidence: number;
    }[];
    analyzedAt: Date;
  };
  isPrimary: boolean; // Whether this is the primary image for the report
  order: number; // Display order
  status: 'active' | 'archived' | 'deleted';
  createdAt: Date;
  updatedAt: Date;
}

const ImageSchema: Schema = new Schema({
  uid: {
    type: String,
    required: true,
    unique: true
  },
  reportId: {
    type: Schema.Types.ObjectId,
    ref: 'Report',
    required: true
  },
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true,
    match: /^image\//
  },
  fileSize: {
    type: Number,
    required: true,
    min: 0
  },
  fileData: {
    type: Buffer,
    required: true
  },
  caption: String,
  altText: String,
  category: {
    type: String,
    enum: ['xray', 'mri', 'ct_scan', 'ultrasound', 'photograph', 'diagram', 'other'],
    required: true
  },
  metadata: {
    width: Number,
    height: Number,
    colorSpace: String,
    compression: String,
    resolution: {
      x: Number,
      y: Number,
      unit: String
    }
  },
  aiAnnotations: {
    labels: [String],
    confidence: {
      type: Number,
      min: 0,
      max: 100
    },
    boundingBoxes: [{
      x: Number,
      y: Number,
      width: Number,
      height: Number,
      label: String,
      confidence: Number
    }],
    analyzedAt: Date
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active'
  }
}, {
  timestamps: true,
  collection: 'images'
});

// Index for efficient queries
ImageSchema.index({ reportId: 1, order: 1 });
ImageSchema.index({ patientId: 1, createdAt: -1 });
ImageSchema.index({ uid: 1 });
ImageSchema.index({ category: 1 });
ImageSchema.index({ status: 1 });

// Ensure only one primary image per report
ImageSchema.index({ reportId: 1, isPrimary: 1 }, { unique: true, partialFilterExpression: { isPrimary: true } });

export default mongoose.models.Image || mongoose.model<IImage>('Image', ImageSchema);
