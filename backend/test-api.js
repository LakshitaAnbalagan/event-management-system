const axios = require('axios');

async function testAPI() {
  try {
    console.log('🔍 Testing events API...');
    
    const response = await axios.get('http://localhost:5000/api/events');
    console.log('✅ API Response Status:', response.status);
    // Don't log the full response as it's too large, just the events
    console.log('📊 Response Success:', response.data.success);
    
    if (response.data.data && response.data.data.events) {
      const events = response.data.data.events;
      console.log(`\n📋 Found ${events.length} events:`);
      
      events.forEach((event, index) => {
        console.log(`${index + 1}. ${event.name || event.title}`);
        console.log(`   Image: ${event.posterImage?.url || 'No image'}`);
        console.log(`   ID: ${event._id}`);
      });
    }
    
  } catch (error) {
    console.error('❌ API Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testAPI();
