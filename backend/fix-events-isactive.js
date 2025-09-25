const mongoose = require('mongoose');
require('dotenv').config();

async function fixEventsIsActive() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event-management');
    
    const db = mongoose.connection.db;
    const collection = db.collection('events');
    
    console.log('🔧 Fixing isActive field for all events...');
    
    // Update all events to have isActive: true
    const result = await collection.updateMany(
      { isActive: { $ne: true } }, // Events where isActive is not true
      { $set: { isActive: true } }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} events to isActive: true`);
    
    // Verify the fix
    const activeEvents = await collection.find({ isActive: true }).toArray();
    console.log(`🟢 Total active events now: ${activeEvents.length}`);
    
    activeEvents.forEach((event, index) => {
      console.log(`${index + 1}. ${event.name || event.title} - isActive: ${event.isActive}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixEventsIsActive();
