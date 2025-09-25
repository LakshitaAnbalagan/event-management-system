const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Event = require('./src/models/Event');

async function debugEvents() {
  try {
    console.log('🔍 Checking events in database...');
    
    // Get all events
    const allEvents = await Event.find({}).lean();
    console.log(`📊 Total events found: ${allEvents.length}`);
    
    if (allEvents.length > 0) {
      console.log('\n📋 Event details:');
      allEvents.forEach((event, index) => {
        console.log(`\n${index + 1}. Event: ${event.name || event.title || 'Unnamed'}`);
        console.log(`   ID: ${event._id}`);
        console.log(`   Status: ${event.status || 'No status'}`);
        console.log(`   IsActive: ${event.isActive}`);
        console.log(`   Department: ${event.department || 'No department'}`);
        console.log(`   Created: ${event.createdAt}`);
        console.log(`   Fields: ${Object.keys(event).join(', ')}`);
      });
    } else {
      console.log('\n❌ No events found in database');
    }
    
    // Check if there are events with different field names
    const db = mongoose.connection.db;
    const collection = db.collection('events');
    const rawEvents = await collection.find({}).toArray();
    console.log(`\n🔍 Raw events from collection: ${rawEvents.length}`);
    
    if (rawEvents.length > 0) {
      console.log('\n📋 Raw event structure:');
      rawEvents.forEach((event, index) => {
        console.log(`\n${index + 1}. Raw Event:`);
        console.log(`   Fields: ${Object.keys(event).join(', ')}`);
        console.log(`   Sample data:`, JSON.stringify(event, null, 2).substring(0, 500) + '...');
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugEvents();
