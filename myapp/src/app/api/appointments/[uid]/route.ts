import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Appointment, Patient, Doctor, User } from '@/lib/models';
import { withAuth } from '@/lib/auth';

export const GET = withAuth(async (request: NextRequest, user: any, { params }: { params: { uid: string } }) => {
  try {
    const { uid } = params;

    await connectDB();

    // Find appointment by UID
    const appointment = await Appointment.findOne({ uid })
      .populate('patientId', 'uid userId')
      .populate('doctorId', 'uid userId')
      .populate('patientId.userId', 'firstName lastName email phoneNumber')
      .populate('doctorId.userId', 'firstName lastName email phoneNumber specialization')
      .populate('cancelledBy', 'firstName lastName email');

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Check access permissions
    const patientUser = (appointment.patientId as any).userId;
    const doctorUser = (appointment.doctorId as any).userId;

    if (user.role === 'patient' && user.uid !== patientUser.uid) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    if (user.role === 'doctor' && user.uid !== doctorUser.uid) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({ appointment });
  } catch (error) {
    console.error('Get appointment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const PUT = withAuth(async (request: NextRequest, user: any, { params }: { params: { uid: string } }) => {
  try {
    const { uid } = params;

    await connectDB();

    // Find appointment by UID
    const appointment = await Appointment.findOne({ uid });
    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Check access permissions
    const patientUser = await User.findById((appointment.patientId as any).userId);
    const doctorUser = await User.findById((appointment.doctorId as any).userId);

    const isPatient = user.role === 'patient' && user.uid === patientUser?.uid;
    const isDoctor = user.role === 'doctor' && user.uid === doctorUser?.uid;
    const isAdmin = user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Define allowed fields based on user role
    let allowedFields = ['notes']; // Basic notes can be updated by anyone involved

    if (isDoctor || isAdmin) {
      allowedFields.push('status', 'diagnosis', 'prescription', 'followUpRequired', 'followUpDate', 'meetingLink');
    }

    if (isPatient || isAdmin) {
      allowedFields.push('reason', 'symptoms');
    }

    if (isAdmin) {
      allowedFields.push('paymentStatus', 'paymentAmount', 'location');
    }

    // Special handling for status updates
    if (body.status) {
      const validStatuses = ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'];

      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: 'Invalid appointment status' },
          { status: 400 }
        );
      }

      // Only doctors and admins can change status
      if (!isDoctor && !isAdmin) {
        return NextResponse.json(
          { error: 'Only doctors can update appointment status' },
          { status: 403 }
        );
      }

      // Handle cancellation
      if (body.status === 'cancelled' && appointment.status !== 'cancelled') {
        appointment.cancelledBy = user._id;
        appointment.cancellationReason = body.cancellationReason;
      }
    }

    // Handle rescheduling
    if (body.appointmentDate && body.appointmentDate !== appointment.appointmentDate.toISOString()) {
      // Only patients can reschedule, or doctors/admins
      if (!isPatient && !isDoctor && !isAdmin) {
        return NextResponse.json(
          { error: 'Only patients can reschedule appointments' },
          { status: 403 }
        );
      }

      const newDate = new Date(body.appointmentDate);

      // Check if new date is in the future
      if (newDate <= new Date()) {
        return NextResponse.json(
          { error: 'New appointment date must be in the future' },
          { status: 400 }
        );
      }

      // Check doctor's availability for new time slot
      const doctor = await Doctor.findById(appointment.doctorId);
      if (!doctor) {
        return NextResponse.json(
          { error: 'Doctor not found' },
          { status: 404 }
        );
      }

      const dayOfWeek = newDate.toLocaleLowerCase('en-US', { weekday: 'long' });
      const timeString = newDate.toTimeString().substring(0, 5);

      const isAvailable = doctor.availability.some((slot: any) => {
        if (slot.dayOfWeek !== dayOfWeek || !slot.isAvailable) return false;
        return timeString >= slot.startTime && timeString <= slot.endTime;
      });

      if (!isAvailable) {
        return NextResponse.json(
          { error: 'Doctor is not available at the new time' },
          { status: 400 }
        );
      }

      // Store old appointment for reference
      appointment.rescheduledFrom = appointment._id;

      // Update date
      appointment.appointmentDate = newDate;
    }

    // Filter body to only allowed fields
    const updates: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    // Update appointment
    Object.assign(appointment, updates);
    await appointment.save();

    // Populate data for response
    await appointment.populate('patientId', 'uid userId');
    await appointment.populate('doctorId', 'uid userId');
    await appointment.populate('patientId.userId', 'firstName lastName email phoneNumber');
    await appointment.populate('doctorId.userId', 'firstName lastName email phoneNumber specialization');
    await appointment.populate('cancelledBy', 'firstName lastName email');

    return NextResponse.json({
      message: 'Appointment updated successfully',
      appointment,
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (request: NextRequest, user: any, { params }: { params: { uid: string } }) => {
  try {
    // Only admins can delete appointments
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only administrators can delete appointments' },
        { status: 403 }
      );
    }

    const { uid } = params;

    await connectDB();

    // Find and delete appointment
    const deletedAppointment = await Appointment.findOneAndDelete({ uid });
    if (!deletedAppointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Appointment deleted successfully',
      appointment: {
        uid: deletedAppointment.uid,
        patientId: deletedAppointment.patientId,
        doctorId: deletedAppointment.doctorId,
        appointmentDate: deletedAppointment.appointmentDate,
      },
    });
  } catch (error) {
    console.error('Delete appointment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
