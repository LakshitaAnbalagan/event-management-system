const mongoose = require('mongoose');
const Event = require('./src/models/Event');

async function checkEvents() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/kongu-event-management');
    console.log('✅ Connected to MongoDB');

    // Get all events
    const events = await Event.find({}).select('_id name startDate venue isActive').limit(10);
    
    console.log('\n📋 Available Events:');
    console.log('='.repeat(50));
    
    if (events.length === 0) {
      console.log('❌ No events found in database');
      console.log('💡 You need to create some events first');
    } else {
      events.forEach((event, index) => {
        console.log(`${index + 1}. Event ID: ${event._id}`);
        console.log(`   Name: ${event.name}`);
        console.log(`   Date: ${event.startDate}`);
        console.log(`   Venue: ${event.venue}`);
        console.log(`   Active: ${event.isActive}`);
        console.log('');
      });
      
      console.log(`\n🎯 Use one of these Event IDs in your frontend URL:`);
      console.log(`Example: http://localhost:3000/admin/events/${events[0]._id}/registrations/detailed`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

checkEvents();
