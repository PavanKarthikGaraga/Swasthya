import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  uid: string; // Primary key
  patientId: mongoose.Types.ObjectId; // Reference to Patient
  doctorId: mongoose.Types.ObjectId; // Reference to Doctor
  appointmentDate: Date;
  duration: number; // in minutes
  type: 'consultation' | 'followup' | 'emergency' | 'checkup';
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  reason: string;
  symptoms?: string[];
  notes?: string;
  prescription?: string;
  diagnosis?: string;
  followUpRequired?: boolean;
  followUpDate?: Date;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'cancelled';
  paymentAmount?: number;
  meetingLink?: string; // For video consultations
  location?: string; // For in-person appointments
  cancelledBy?: mongoose.Types.ObjectId; // User who cancelled
  cancellationReason?: string;
  rescheduledFrom?: mongoose.Types.ObjectId; // Previous appointment if rescheduled
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema: Schema = new Schema({
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
    ref: 'Doctor',
    required: true
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 15,
    max: 480 // 8 hours max
  },
  type: {
    type: String,
    enum: ['consultation', 'followup', 'emergency', 'checkup'],
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'scheduled'
  },
  reason: {
    type: String,
    required: true
  },
  symptoms: [String],
  notes: String,
  prescription: String,
  diagnosis: String,
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: Date,
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'cancelled'],
    default: 'pending'
  },
  paymentAmount: {
    type: Number,
    min: 0
  },
  meetingLink: String,
  location: String,
  cancelledBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellationReason: String,
  rescheduledFrom: {
    type: Schema.Types.ObjectId,
    ref: 'Appointment'
  }
}, {
  timestamps: true,
  collection: 'appointments'
});

// Index for efficient queries
AppointmentSchema.index({ patientId: 1, appointmentDate: -1 });
AppointmentSchema.index({ doctorId: 1, appointmentDate: -1 });
AppointmentSchema.index({ status: 1 });
AppointmentSchema.index({ appointmentDate: 1 });
AppointmentSchema.index({ type: 1 });

// Compound index for availability checks
AppointmentSchema.index({ doctorId: 1, appointmentDate: 1, status: 1 });

export default mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);
