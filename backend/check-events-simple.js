const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event-management');

async function checkEvents() {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection('events');
    
    const events = await collection.find({}).toArray();
    console.log(`Found ${events.length} events`);
    
    if (events.length > 0) {
      console.log('\nFirst event structure:');
      const firstEvent = events[0];
      console.log('Fields:', Object.keys(firstEvent));
      console.log('Name/Title:', firstEvent.name || firstEvent.title);
      console.log('IsActive:', firstEvent.isActive);
      console.log('Status:', firstEvent.status);
      console.log('Department:', firstEvent.department);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkEvents();
