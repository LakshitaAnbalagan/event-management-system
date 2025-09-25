const axios = require('axios');

async function testServerConnection() {
  console.log('🔍 Testing Backend Server Connection...\n');

  const baseURL = 'http://localhost:5000';
  
  try {
    // Test 1: Check if server is running
    console.log('1. Testing server health...');
    const healthResponse = await axios.get(`${baseURL}/api/health`);
    console.log('   ✅ Server is running');
    console.log('   📊 Response:', healthResponse.data);
    
    // Test 2: Check CORS headers
    console.log('\n2. Testing CORS configuration...');
    const corsResponse = await axios.options(`${baseURL}/api/auth/login`, {
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    console.log('   ✅ CORS preflight successful');
    
    // Test 3: Test login endpoint structure (without credentials)
    console.log('\n3. Testing login endpoint...');
    try {
      await axios.post(`${baseURL}/api/auth/login`, {
        email: 'test@test.com',
        password: 'test123'
      });
    } catch (error) {
      if (error.response && error.response.status) {
        console.log(`   ✅ Login endpoint is accessible (returned ${error.response.status})`);
        console.log('   📝 Error message:', error.response.data?.message || 'No message');
      } else {
        throw error;
      }
    }
    
    console.log('\n✅ All tests passed! Server is running correctly.');
    
  } catch (error) {
    console.error('\n❌ Server connection test failed:');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('   🚫 Server is not running on port 5000');
      console.error('   💡 Please start the backend server first');
    } else if (error.code === 'ENOTFOUND') {
      console.error('   🚫 Cannot resolve localhost');
    } else {
      console.error('   🚫 Error:', error.message);
    }
    
    console.error('\n🔧 To fix this:');
    console.error('   1. Make sure MongoDB is running');
    console.error('   2. Start the backend server: npm start');
    console.error('   3. Check if port 5000 is available');
  }
}

testServerConnection();
