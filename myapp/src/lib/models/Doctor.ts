import mongoose, { Document, Schema } from 'mongoose';

export interface IDoctor extends Document {
  uid: string; // Primary key
  userId: mongoose.Types.ObjectId; // Reference to User
  licenseNumber: string;
  specialization: string[];
  experience: number; // years of experience
  education: {
    degree: string;
    institution: string;
    year: number;
  }[];
  certifications: string[];
  languages: string[];
  availability: {
    dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
    isAvailable: boolean;
  }[];
  consultationFee: number; // in cents
  rating?: number;
  totalReviews?: number;
  isAcceptingNewPatients: boolean;
  hospitalAffiliation?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DoctorSchema: Schema = new Schema({
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
  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  specialization: [{
    type: String,
    required: true
  }],
  experience: {
    type: Number,
    required: true,
    min: 0
  },
  education: [{
    degree: {
      type: String,
      required: true
    },
    institution: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true
    }
  }],
  certifications: [String],
  languages: [{
    type: String,
    default: ['English']
  }],
  availability: [{
    dayOfWeek: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true
    },
    startTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    endTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  }],
  consultationFee: {
    type: Number,
    required: true,
    min: 0
  },
  rating: {
    type: Number,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0,
    min: 0
  },
  isAcceptingNewPatients: {
    type: Boolean,
    default: true
  },
  hospitalAffiliation: String,
  bio: String
}, {
  timestamps: true,
  collection: 'doctors'
});

// Index for efficient queries
DoctorSchema.index({ specialization: 1 });
DoctorSchema.index({ rating: -1 });

export default mongoose.models.Doctor || mongoose.model<IDoctor>('Doctor', DoctorSchema);
