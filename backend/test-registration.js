const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Test registration endpoint
async function testRegistration() {
  try {
    console.log('🧪 Testing registration endpoint...');
    
    const baseURL = 'http://localhost:5000/api';
    
    // First, let's test if the server is running
    try {
      const healthCheck = await axios.get(`${baseURL}/health`);
      console.log('✅ Server is running:', healthCheck.data.message);
    } catch (err) {
      console.error('❌ Server is not running. Please start the backend server first.');
      return;
    }
    
    // Test data
    const testData = {
      registrationType: 'individual',
      'contactDetails.email': 'test@example.com',
      'contactDetails.primaryPhone': '9876543210',
      'academicDetails.college': 'Test College',
      'academicDetails.department': 'Computer Science',
      'academicDetails.year': '3rd Year',
      'location.city': 'Chennai',
      'paymentDetails.amount': '100'
    };
    
    // Create form data
    const formData = new FormData();
    Object.keys(testData).forEach(key => {
      formData.append(key, testData[key]);
    });
    
    // Add a dummy image file if it exists
    const dummyImagePath = path.join(__dirname, 'test-image.jpg');
    if (fs.existsSync(dummyImagePath)) {
      formData.append('paymentScreenshot', fs.createReadStream(dummyImagePath));
      console.log('📎 Added test image file');
    } else {
      console.log('⚠️  No test image found, creating a dummy file...');
      // Create a small dummy file for testing
      const dummyContent = Buffer.from('dummy image content');
      fs.writeFileSync(dummyImagePath, dummyContent);
      formData.append('paymentScreenshot', fs.createReadStream(dummyImagePath));
    }
    
    // You'll need to replace this with a real JWT token from a logged-in user
    const testToken = 'your-jwt-token-here';
    
    console.log('📤 Sending registration request...');
    console.log('Data being sent:');
    Object.keys(testData).forEach(key => {
      console.log(`  ${key}: ${testData[key]}`);
    });
    
    // Make the request (replace eventId with a real event ID)
    const eventId = 'your-event-id-here';
    const response = await axios.post(
      `${baseURL}/registrations/event/${eventId}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${testToken}`
        }
      }
    );
    
    console.log('✅ Registration successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Registration failed:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
      
      if (error.response.data.errors) {
        console.error('Validation errors:');
        error.response.data.errors.forEach((err, index) => {
          console.error(`  ${index + 1}. ${err.path || err.param}: ${err.msg || err.message}`);
        });
      }
    } else if (error.request) {
      console.error('No response received:', error.message);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Instructions for running the test
console.log(`
🔧 Registration Test Script
==========================

To run this test:

1. Make sure your backend server is running (npm run dev)
2. Create a user account and get a JWT token
3. Create an event and get its ID
4. Update the testToken and eventId variables in this script
5. Run: node test-registration.js

This will help identify any issues with the registration process.
`);

// Uncomment the line below to run the test
// testRegistration();

module.exports = testRegistration;
