const mongoose = require('mongoose');
const Event = require('./src/models/Event');

async function simpleCheck() {
  try {
    await mongoose.connect('mongodb://localhost:27017/kongu-event-management');
    console.log('Connected to MongoDB');

    const events = await Event.find({}).select('_id name');
    
    console.log('\nEvent IDs:');
    events.forEach((event, index) => {
      console.log(`${index + 1}. ${event.name}`);
      console.log(`   ID: ${event._id}`);
    });

    if (events.length > 0) {
      const firstEventId = events[0]._id;
      console.log(`\nUse this Event ID: ${firstEventId}`);
      console.log(`\nCorrect URLs:`);
      console.log(`http://localhost:3000/admin/events/${firstEventId}/registrations/detailed`);
      console.log(`http://localhost:3000/admin/events/${firstEventId}/attendance`);
      console.log(`http://localhost:3000/admin/events/${firstEventId}/prizes`);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

simpleCheck();
