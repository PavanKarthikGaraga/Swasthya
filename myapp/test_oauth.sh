# Test Script for Google OAuth API Testing
#!/bin/bash

# Test 1: Check if server is running
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/auth/google?role=patient

# Test 2: Test OAuth initiation (should return 307)
curl -s -o /dev/null -w "%{http_code} %{redirect_url}" http://localhost:3000/api/auth/google?role=doctor

# Test 3: Test error handling
curl -s http://localhost:3000/api/auth/google/callback?error=access_denied | grep -o "location:.*"
