const mongoose = require('mongoose');
const Event = require('./src/models/Event');
const Registration = require('./src/models/Registration');

async function debugAllEvents() {
  try {
    await mongoose.connect('mongodb://localhost:27017/kongu-event-management');
    console.log('✅ Connected to MongoDB');

    // Get ALL events in database
    const allEvents = await Event.find({});
    console.log(`\n📊 Total events in database: ${allEvents.length}`);
    
    if (allEvents.length === 0) {
      console.log('❌ No events found! Creating new demo data...');
      mongoose.connection.close();
      return;
    }

    console.log('\n📋 ALL Events in Database:');
    console.log('='.repeat(80));
    
    for (let i = 0; i < allEvents.length; i++) {
      const event = allEvents[i];
      const regCount = await Registration.countDocuments({ event: event._id });
      
      console.log(`\n${i + 1}. Event: ${event.name}`);
      console.log(`   ID: ${event._id}`);
      console.log(`   Created: ${event.createdAt}`);
      console.log(`   Active: ${event.isActive}`);
      console.log(`   Registrations: ${regCount}`);
      console.log(`   Status: ${event.status}`);
    }

    // Show the most recent event with registrations
    const eventsWithRegs = [];
    for (const event of allEvents) {
      const regCount = await Registration.countDocuments({ event: event._id });
      if (regCount > 0) {
        eventsWithRegs.push({ event, regCount });
      }
    }

    if (eventsWithRegs.length > 0) {
      const bestEvent = eventsWithRegs[0].event;
      console.log(`\n🎯 RECOMMENDED EVENT TO USE:`);
      console.log(`   Name: ${bestEvent.name}`);
      console.log(`   ID: ${bestEvent._id}`);
      console.log(`   Registrations: ${eventsWithRegs[0].regCount}`);
      
      console.log(`\n🌐 USE THESE URLS:`);
      console.log(`   Registrations: http://localhost:3000/admin/events/${bestEvent._id}/registrations/detailed`);
      console.log(`   Attendance:    http://localhost:3000/admin/events/${bestEvent._id}/attendance`);
      console.log(`   Prizes:        http://localhost:3000/admin/events/${bestEvent._id}/prizes`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugAllEvents();
