const mongoose = require('mongoose');
const Event = require('./src/models/Event');
const Registration = require('./src/models/Registration');

async function checkCurrentDb() {
  try {
    await mongoose.connect('mongodb://localhost:27017/kongu-event-management');
    console.log('✅ Connected to MongoDB');

    // Get all events with full details
    const events = await Event.find({});
    console.log(`\n📊 Found ${events.length} events in database`);
    
    if (events.length === 0) {
      console.log('❌ No events found in database!');
      console.log('💡 Creating new demo data...');
      mongoose.connection.close();
      return;
    }

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const regCount = await Registration.countDocuments({ event: event._id });
      
      console.log(`\n--- Event ${i + 1} ---`);
      console.log(`Name: ${event.name}`);
      console.log(`ID: ${event._id}`);
      console.log(`Active: ${event.isActive}`);
      console.log(`Registrations: ${regCount}`);
      console.log(`Created: ${event.createdAt}`);
      
      // Test if this event ID is valid
      try {
        const testEvent = await Event.findById(event._id);
        console.log(`✅ Event ID ${event._id} is VALID`);
        
        if (regCount > 0) {
          console.log(`\n🎯 WORKING URLS FOR THIS EVENT:`);
          console.log(`Registrations: http://localhost:3000/admin/events/${event._id}/registrations/detailed`);
          console.log(`Attendance: http://localhost:3000/admin/events/${event._id}/attendance`);
          console.log(`Prizes: http://localhost:3000/admin/events/${event._id}/prizes`);
        }
      } catch (error) {
        console.log(`❌ Event ID ${event._id} is INVALID: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkCurrentDb();
