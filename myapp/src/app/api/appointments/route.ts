import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Appointment, Patient, Doctor, User } from '@/lib/models';
import { withAuth } from '@/lib/auth';

export const GET = withAuth(async (request: NextRequest, user: any) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Build query
    const query: any = {};

    if (status) query.status = status;
    if (type) query.type = type;

    if (dateFrom || dateTo) {
      query.appointmentDate = {};
      if (dateFrom) query.appointmentDate.$gte = new Date(dateFrom);
      if (dateTo) query.appointmentDate.$lte = new Date(dateTo);
    }

    // Filter based on user role
    if (user.role === 'patient') {
      // Find patient's profile
      const patient = await Patient.findOne({ 'userId.uid': user.uid });
      if (patient) {
        query.patientId = patient._id;
      } else {
        return NextResponse.json({ appointments: [], pagination: { page: 1, limit, total: 0, pages: 0 } });
      }
    } else if (user.role === 'doctor') {
      // Find doctor's profile
      const doctor = await Doctor.findOne({ 'userId.uid': user.uid });
      if (doctor) {
        query.doctorId = doctor._id;
      } else {
        return NextResponse.json({ appointments: [], pagination: { page: 1, limit, total: 0, pages: 0 } });
      }
    }
    // Admins can see all appointments

    const skip = (page - 1) * limit;

    const appointments = await Appointment.find(query)
      .populate('patientId', 'uid userId')
      .populate('doctorId', 'uid userId')
      .populate('patientId.userId', 'firstName lastName email')
      .populate('doctorId.userId', 'firstName lastName email specialization')
      .sort({ appointmentDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Appointment.countDocuments(query);

    return NextResponse.json({
      appointments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (request: NextRequest, user: any) => {
  try {
    const body = await request.json();
    const {
      doctorId,
      appointmentDate,
      duration = 30,
      type = 'consultation',
      reason,
      symptoms,
      notes,
    } = body;

    // Validate required fields
    if (!doctorId || !appointmentDate || !reason) {
      return NextResponse.json(
        { error: 'doctorId, appointmentDate, and reason are required' },
        { status: 400 }
      );
    }

    // Only patients can book appointments
    if (user.role !== 'patient') {
      return NextResponse.json(
        { error: 'Only patients can book appointments' },
        { status: 403 }
      );
    }

    await connectDB();

    // Find patient profile
    const patient = await Patient.findOne({ 'userId.uid': user.uid });
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient profile not found. Please complete your profile first.' },
        { status: 404 }
      );
    }

    // Find doctor
    const doctor = await Doctor.findOne({ uid: doctorId });
    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    // Check if doctor is accepting new patients
    if (!doctor.isAcceptingNewPatients) {
      return NextResponse.json(
        { error: 'Doctor is not accepting new patients' },
        { status: 400 }
      );
    }

    const appointmentDateTime = new Date(appointmentDate);

    // Check if appointment date is in the future
    if (appointmentDateTime <= new Date()) {
      return NextResponse.json(
        { error: 'Appointment date must be in the future' },
        { status: 400 }
      );
    }

    // Check doctor's availability for this time slot
    const dayOfWeek = appointmentDateTime.toLocaleLowerCase('en-US', { weekday: 'long' });
    const timeString = appointmentDateTime.toTimeString().substring(0, 5); // HH:MM format

    const isAvailable = doctor.availability.some((slot: any) => {
      if (slot.dayOfWeek !== dayOfWeek || !slot.isAvailable) return false;

      const startTime = slot.startTime;
      const endTime = slot.endTime;

      // Check if appointment time falls within available slot
      return timeString >= startTime && timeString <= endTime;
    });

    if (!isAvailable) {
      return NextResponse.json(
        { error: 'Doctor is not available at this time' },
        { status: 400 }
      );
    }

    // Check for conflicting appointments
    const appointmentEndTime = new Date(appointmentDateTime.getTime() + duration * 60000);

    const conflictingAppointment = await Appointment.findOne({
      doctorId: doctor._id,
      status: { $in: ['scheduled', 'confirmed', 'in_progress'] },
      $or: [
        {
          appointmentDate: { $lt: appointmentEndTime },
          $expr: {
            $gt: [
              { $add: ['$appointmentDate', { $multiply: ['$duration', 60000] }] },
              appointmentDateTime
            ]
          }
        }
      ]
    });

    if (conflictingAppointment) {
      return NextResponse.json(
        { error: 'Time slot conflicts with existing appointment' },
        { status: 409 }
      );
    }

    // Validate appointment type
    if (!['consultation', 'followup', 'emergency', 'checkup'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid appointment type' },
        { status: 400 }
      );
    }

    // Generate unique UID
    const uid = `appt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create appointment
    const appointment = new Appointment({
      uid,
      patientId: patient._id,
      doctorId: doctor._id,
      appointmentDate: appointmentDateTime,
      duration,
      type,
      status: 'scheduled',
      reason,
      symptoms,
      notes,
      paymentStatus: 'pending',
    });

    await appointment.save();

    // Populate data for response
    await appointment.populate('patientId', 'uid userId');
    await appointment.populate('doctorId', 'uid userId');
    await appointment.populate('patientId.userId', 'firstName lastName email');
    await appointment.populate('doctorId.userId', 'firstName lastName email specialization');

    return NextResponse.json({
      message: 'Appointment booked successfully',
      appointment,
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
