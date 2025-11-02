#!/usr/bin/env node

/**
 * API Test Script
 * Tests all API endpoints with dummy data
 * 
 * Usage: node test-apis.js
 * 
 * Make sure your server is running: npm run dev
 */

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

let authToken = '';
let patientUserId = '';
let doctorUserId = '';
let patientUid = '';
let doctorUid = '';
let appointmentUid = '';

// Helper functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

async function makeRequest(method, endpoint, body = null, token = null, timeout = 30000) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const options = {
    method,
    headers,
    signal: controller.signal,
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    clearTimeout(timeoutId);
    
    const data = await response.json().catch(() => ({ error: 'Invalid JSON response' }));
    
    return {
      status: response.status,
      ok: response.ok,
      data,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      return {
        status: 0,
        ok: false,
        error: `Request timeout after ${timeout}ms`,
      };
    }
    
    return {
      status: 0,
      ok: false,
      error: error.message,
    };
  }
}

async function test(name, testFn) {
  try {
    log(`\n[TEST] ${name}`, 'blue');
    const result = await testFn();
    if (result.ok) {
      log(`? ${name} - PASSED (Status: ${result.status})`, 'green');
      return { passed: true, result };
    } else {
      log(`? ${name} - FAILED (Status: ${result.status})`, 'red');
      log(`  Error: ${JSON.stringify(result.error || result.data, null, 2)}`, 'red');
      return { passed: false, result };
    }
  } catch (error) {
    log(`? ${name} - ERROR: ${error.message}`, 'red');
    return { passed: false, error: error.message };
  }
}

// Test cases
async function runTests() {
  logSection('?? API Testing Suite');
  log(`Testing against: ${BASE_URL}\n`, 'yellow');

  // Check if server is running
  log('Checking if server is running...', 'yellow');
  try {
    const healthCheck = await makeRequest('GET', '/api/users', null, null, 5000);
    if (!healthCheck.ok && healthCheck.status === 0) {
      log('??  Server appears to be offline or unreachable. Make sure you have run: npm run dev', 'red');
      log('   The test will continue but may fail if the server is not running.', 'yellow');
    } else {
      log('? Server is running', 'green');
    }
  } catch (error) {
    log('??  Could not verify server status. Continuing anyway...', 'yellow');
  }

  const results = [];

  // ==================== AUTHENTICATION ====================
  logSection('1. Authentication APIs');

  // Test 1: Register User
  const registerResult = await test('Register User (Patient)', async () => {
    const userData = {
      email: `testpatient_${Date.now()}@example.com`,
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'Patient',
      role: 'patient',
      phoneNumber: '+1234567890',
    };
    const result = await makeRequest('POST', '/api/auth/register', userData);
    if (result.ok && result.data.token) {
      authToken = result.data.token;
      patientUserId = result.data.user?.uid || '';
      log(`  Token received: ${authToken.substring(0, 20)}...`, 'yellow');
      log(`  User UID: ${patientUserId}`, 'yellow');
    }
    return result;
  });
  results.push(registerResult);

  // Test 2: Login User
  const loginResult = await test('Login User', async () => {
    const loginData = {
      email: registerResult.result?.data?.user?.email || `testpatient_${Date.now()}@example.com`,
      password: 'TestPassword123!',
    };
    const result = await makeRequest('POST', '/api/auth/login', loginData);
    if (result.ok && result.data.token) {
      authToken = result.data.token;
    }
    return result;
  });
  results.push(loginResult);

  // Test 3: Register Doctor User
  const doctorRegisterResult = await test('Register Doctor User', async () => {
    const doctorData = {
      email: `testdoctor_${Date.now()}@example.com`,
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'Doctor',
      role: 'doctor',
    };
    const result = await makeRequest('POST', '/api/auth/register', doctorData);
    if (result.ok && result.data.token) {
      doctorUserId = result.data.user?.uid || '';
      log(`  Doctor UID: ${doctorUserId}`, 'yellow');
    }
    return result;
  });
  results.push(doctorRegisterResult);
  
  // Store doctor token for later use
  let doctorToken = doctorRegisterResult.result?.data?.token || '';

  // ==================== USERS ====================
  logSection('2. User APIs');

  results.push(await test('GET /api/users (List Users)', async () => {
    return await makeRequest('GET', '/api/users', null, authToken);
  }));

  results.push(await test('GET /api/users/[uid] (Get User)', async () => {
    if (!patientUserId) return { ok: false, error: 'No user UID available' };
    return await makeRequest('GET', `/api/users/${patientUserId}`, null, authToken);
  }));

  results.push(await test('PUT /api/users/[uid] (Update User)', async () => {
    if (!patientUserId) return { ok: false, error: 'No user UID available' };
    return await makeRequest('PUT', `/api/users/${patientUserId}`, {
      phoneNumber: '+9876543210',
      firstName: 'Updated',
    }, authToken);
  }));

  // ==================== PATIENTS ====================
  logSection('3. Patient APIs');

  results.push(await test('GET /api/patients (List Patients)', async () => {
    return await makeRequest('GET', '/api/patients', null, authToken);
  }));

  results.push(await test('GET /api/patients/[uid] (Get Patient)', async () => {
    const patientsResult = await makeRequest('GET', '/api/patients', null, authToken);
    if (patientsResult.ok && patientsResult.data.patients?.length > 0) {
      patientUid = patientsResult.data.patients[0].uid;
      return await makeRequest('GET', `/api/patients/${patientUid}`, null, authToken);
    }
    return { ok: false, error: 'No patients found' };
  }));

  results.push(await test('PUT /api/patients/[uid] (Update Patient)', async () => {
    if (!patientUid) return { ok: false, error: 'No patient UID available' };
    return await makeRequest('PUT', `/api/patients/${patientUid}`, {
      bloodType: 'O+',
      height: 175,
      weight: 70,
    }, authToken);
  }));

  // ==================== DOCTORS ====================
  logSection('4. Doctor APIs');

  results.push(await test('GET /api/doctors (List Doctors)', async () => {
    return await makeRequest('GET', '/api/doctors', null, authToken);
  }));

  // Create doctor profile if doctor user was registered
  if (doctorToken && doctorUserId) {
    const createDoctorProfileResult = await test('Create Doctor Profile', async () => {
      const result = await makeRequest('POST', '/api/doctors', {
        licenseNumber: `LIC${Date.now()}`,
        specialization: ['General Medicine'],
        experience: 5,
        consultationFee: 5000, // $50.00 in cents
        availability: [
          { dayOfWeek: 'monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { dayOfWeek: 'tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { dayOfWeek: 'wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { dayOfWeek: 'thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { dayOfWeek: 'friday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        ],
        isAcceptingNewPatients: true,
      }, doctorToken);
      
      // If profile already exists (409), try to get existing doctor UID
      if (!result.ok && result.status === 409) {
        log(`  Doctor profile already exists, trying to find existing profile...`, 'yellow');
        // Try to get all doctors with a high limit to find the one matching this user
        const doctorsResult = await makeRequest('GET', '/api/doctors?limit=100', null, doctorToken);
        if (doctorsResult.ok && doctorsResult.data.doctors?.length > 0) {
          // Find doctor that matches this user
          for (const doc of doctorsResult.data.doctors) {
            if (doc.userId && (doc.userId.uid === doctorUserId || doc.userId._id?.toString() === doctorUserId)) {
              doctorUid = doc.uid;
              log(`  Using existing Doctor Profile UID: ${doctorUid}`, 'yellow');
              return { ok: true, status: 200, data: { doctor: doc, message: 'Using existing profile' } };
            }
          }
        }
        // If we still can't find it, return the 409 error
        log(`  Could not find existing doctor profile for user ${doctorUserId}`, 'yellow');
      }
      
      // If creation succeeded, store the doctor UID
      if (result.ok && result.data?.doctor?.uid) {
        doctorUid = result.data.doctor.uid;
      }
      
      return result;
    });
    results.push(createDoctorProfileResult);
    
    // Store doctor UID if profile was created or found
    if (!doctorUid && createDoctorProfileResult.passed && createDoctorProfileResult.result?.data?.doctor?.uid) {
      doctorUid = createDoctorProfileResult.result.data.doctor.uid;
      log(`  Doctor Profile UID: ${doctorUid}`, 'yellow');
    }
  }

  const getDoctorResult = await test('GET /api/doctors/[uid] (Get Doctor)', async () => {
    if (!doctorUid) {
      const doctorsResult = await makeRequest('GET', '/api/doctors', null, authToken);
      if (doctorsResult.ok && doctorsResult.data.doctors?.length > 0) {
        doctorUid = doctorsResult.data.doctors[0].uid;
        return await makeRequest('GET', `/api/doctors/${doctorUid}`, null, authToken);
      }
      return { ok: false, error: 'No doctors found' };
    }
    return await makeRequest('GET', `/api/doctors/${doctorUid}`, null, authToken);
  });
  results.push(getDoctorResult);

  // Set up availability for the doctor so appointments can be created (if not already set during profile creation)
  if (doctorUid && doctorToken) {
    const setupAvailabilityResult = await test('Setup Doctor Availability', async () => {
      // Set up availability for the next 7 days (all weekdays)
      const availability = [
        { dayOfWeek: 'monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { dayOfWeek: 'tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { dayOfWeek: 'wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { dayOfWeek: 'thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { dayOfWeek: 'friday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      ];
      
      return await makeRequest('PUT', `/api/doctors/${doctorUid}`, {
        availability,
        consultationFee: 5000, // $50.00 in cents
        isAcceptingNewPatients: true,
      }, doctorToken);
    });
    results.push(setupAvailabilityResult);
  }

  // ==================== APPOINTMENTS ====================
  logSection('5. Appointment APIs');

  results.push(await test('GET /api/appointments (List Appointments)', async () => {
    return await makeRequest('GET', '/api/appointments', null, authToken);
  }));

  const createAppointmentResult = await test('POST /api/appointments (Create Appointment)', async () => {
    if (!doctorUid) return { ok: false, error: 'No doctor UID available' };
    
    // Calculate next weekday (Monday-Friday) at 10:00 AM local time
    // Find next weekday starting from tomorrow
    let daysToAdd = 1;
    let futureDate = null;
    
    while (daysToAdd < 14) {
      const testDate = new Date();
      testDate.setDate(testDate.getDate() + daysToAdd);
      testDate.setHours(10, 0, 0, 0); // Set to 10:00 AM local time
      
      const dayOfWeek = testDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 5 = Friday
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        futureDate = testDate;
        break;
      }
      daysToAdd++;
    }
    
    if (!futureDate) {
      return { ok: false, error: 'Could not find a suitable appointment date' };
    }

    // Convert to ISO string (this will include timezone offset)
    const appointmentDateISO = futureDate.toISOString();

    return await makeRequest('POST', '/api/appointments', {
      doctorId: doctorUid,
      appointmentDate: appointmentDateISO,
      duration: 30,
      type: 'consultation',
      reason: 'General checkup',
      symptoms: ['Headache', 'Fatigue'],
    }, authToken);
  });
  results.push(createAppointmentResult);
  
  // Store appointment UID if creation was successful
  if (createAppointmentResult.passed && createAppointmentResult.result?.data?.appointment?.uid) {
    appointmentUid = createAppointmentResult.result.data.appointment.uid;
  }

  results.push(await test('GET /api/appointments/[uid] (Get Appointment)', async () => {
    if (!appointmentUid) {
      // Try to get from list if not set from creation
      const appointmentsResult = await makeRequest('GET', '/api/appointments', null, authToken);
      if (appointmentsResult.ok && appointmentsResult.data.appointments?.length > 0) {
        appointmentUid = appointmentsResult.data.appointments[0].uid;
        return await makeRequest('GET', `/api/appointments/${appointmentUid}`, null, authToken);
      }
      return { ok: false, error: 'No appointments found' };
    }
    return await makeRequest('GET', `/api/appointments/${appointmentUid}`, null, authToken);
  }));

  results.push(await test('PUT /api/appointments/[uid] (Update Appointment)', async () => {
    if (!appointmentUid) return { ok: false, error: 'No appointment UID available' };
    return await makeRequest('PUT', `/api/appointments/${appointmentUid}`, {
      notes: 'Patient seems healthy, follow-up in 3 months',
    }, authToken);
  }));

  // ==================== REPORTS ====================
  logSection('6. Report APIs');

  results.push(await test('GET /api/reports (List Reports)', async () => {
    return await makeRequest('GET', '/api/reports', null, authToken);
  }));

  // Note: Report creation requires file upload, skipping for now
  log('  ? Skipping POST /api/reports (requires file upload)', 'yellow');

  // ==================== IMAGES ====================
  logSection('7. Image APIs');

  results.push(await test('GET /api/images (List Images)', async () => {
    return await makeRequest('GET', '/api/images', null, authToken);
  }));

  // Note: Image creation requires file upload, skipping for now
  log('  ? Skipping POST /api/images (requires file upload)', 'yellow');

  // ==================== SUMMARY ====================
  logSection('?? Test Summary');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  const percentage = ((passed / total) * 100).toFixed(1);

  log(`\nTotal Tests: ${total}`, 'cyan');
  log(`Passed: ${passed}`, 'green');
  log(`Failed: ${total - passed}`, 'red');
  log(`Success Rate: ${percentage}%`, passed === total ? 'green' : 'yellow');

  if (passed === total) {
    log('\n? All tests passed!', 'green');
  } else {
    log('\n? Some tests failed. Please review the errors above.', 'red');
  }
}

// Run tests
runTests().catch(error => {
  log(`\n? Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
