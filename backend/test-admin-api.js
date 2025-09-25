const axios = require('axios');

async function testAdminAPI() {
  try {
    console.log('🔍 Testing admin events API...');
    
    // Test the admin events endpoint without auth
    console.log('Testing admin events without auth...');
    const eventsResponse = await axios.get('http://localhost:5000/api/admin/test-events-no-auth');
    console.log('Events Response:', eventsResponse.status);
    console.log('Events Data:', JSON.stringify(eventsResponse.data, null, 2));
    
    console.log('\nTesting admin stats without auth...');
    const statsResponse = await axios.get('http://localhost:5000/api/admin/test-stats-no-auth');
    console.log('Stats Response:', statsResponse.status);
    console.log('Stats Data:', JSON.stringify(statsResponse.data, null, 2));
    
    if (eventsResponse.data.success) {
      console.log(`📋 Found ${eventsResponse.data.data.events.length} events`);
      eventsResponse.data.data.events.forEach((event, index) => {
        console.log(`${index + 1}. ${event.title || event.name} - ${event.category || event.department}`);
      });
    } else {
      console.log('❌ API returned success: false');
    }
    
  } catch (error) {
    console.error('❌ API Error:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
  }
}

testAdminAPI();
