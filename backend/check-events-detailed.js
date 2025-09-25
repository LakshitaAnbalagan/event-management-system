const mongoose = require('mongoose');
require('dotenv').config();

async function connectDB() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event-management');
}

async function checkEventsDetailed() {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection('events');
    
    const events = await collection.find({}).toArray();
    console.log(`📊 Total events in database: ${events.length}`);
    
    if (events.length > 0) {
      events.forEach((event, index) => {
        console.log(`\n${index + 1}. Event Details:`);
        console.log(`   Name: ${event.name || 'NO NAME'}`);
        console.log(`   Title: ${event.title || 'NO TITLE'}`);
        console.log(`   IsActive: ${event.isActive}`);
        console.log(`   CreatedBy: ${event.createdBy || 'NO CREATED_BY'}`);
        console.log(`   Status: ${event.status || 'NO STATUS'}`);
        console.log(`   Department: ${event.department || 'NO DEPARTMENT'}`);
        console.log(`   StartDate: ${event.startDate || 'NO START_DATE'}`);
        console.log(`   Date: ${event.date || 'NO DATE'}`);
        console.log(`   Venue: ${event.venue || 'NO VENUE'}`);
        console.log(`   Location: ${event.location || 'NO LOCATION'}`);
      });
      
      // Check specifically for isActive field
      const activeEvents = await collection.find({ isActive: true }).toArray();
      console.log(`\n🟢 Active events (isActive: true): ${activeEvents.length}`);
      
      const inactiveEvents = await collection.find({ isActive: false }).toArray();
      console.log(`🔴 Inactive events (isActive: false): ${inactiveEvents.length}`);
      
      const noActiveField = await collection.find({ isActive: { $exists: false } }).toArray();
      console.log(`⚪ Events without isActive field: ${noActiveField.length}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

async function main() {
  await connectDB();
  await checkEventsDetailed();
}

main();
