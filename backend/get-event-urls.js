const mongoose = require('mongoose');
const Event = require('./src/models/Event');
const Registration = require('./src/models/Registration');

async function getEventUrls() {
  try {
    await mongoose.connect('mongodb://localhost:27017/kongu-event-management');
    console.log('✅ Connected to MongoDB');

    const events = await Event.find({}).select('_id name').limit(5);
    
    if (events.length === 0) {
      console.log('❌ No events found. Run: node quick-demo.js first');
      return;
    }

    console.log('\n🎯 Available Events and URLs:');
    console.log('='.repeat(60));
    
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const regCount = await Registration.countDocuments({ event: event._id });
      
      console.log(`\n${i + 1}. Event: ${event.name}`);
      console.log(`   ID: ${event._id}`);
      console.log(`   Registrations: ${regCount}`);
      console.log(`   
   🌐 URLs for this event:`);
      console.log(`   Registrations: http://localhost:3000/admin/events/${event._id}/registrations/detailed`);
      console.log(`   Attendance:    http://localhost:3000/admin/events/${event._id}/attendance`);
      console.log(`   Prizes:        http://localhost:3000/admin/events/${event._id}/prizes`);
    }

    console.log('\n💡 Copy and paste one of these URLs into your browser!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

getEventUrls();
