const mongoose = require('mongoose');
const Event = require('./src/models/Event');
const Registration = require('./src/models/Registration');

async function getExactId() {
  try {
    await mongoose.connect('mongodb://localhost:27017/kongu-event-management');
    
    const events = await Event.find({}).sort({ createdAt: -1 }).limit(1);
    if (events.length > 0) {
      const event = events[0];
      const regCount = await Registration.countDocuments({ event: event._id });
      
      console.log('EVENT ID:', event._id.toString());
      console.log('EVENT NAME:', event.name);
      console.log('REGISTRATIONS:', regCount);
      console.log('');
      console.log('COPY THESE URLS:');
      console.log('');
      console.log('Registrations:');
      console.log(`http://localhost:3000/admin/events/${event._id}/registrations/detailed`);
      console.log('');
      console.log('Attendance:');
      console.log(`http://localhost:3000/admin/events/${event._id}/attendance`);
      console.log('');
      console.log('Prizes:');
      console.log(`http://localhost:3000/admin/events/${event._id}/prizes`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

getExactId();
