const mongoose = require('mongoose');
require('dotenv').config();

async function fixEventsCreatedBy() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/event-management');
    
    const db = mongoose.connection.db;
    const eventsCollection = db.collection('events');
    const usersCollection = db.collection('users');
    
    console.log('🔧 Checking createdBy field for all events...');
    
    // Find events without createdBy field
    const eventsWithoutCreatedBy = await eventsCollection.find({ 
      createdBy: { $exists: false } 
    }).toArray();
    
    console.log(`📊 Events without createdBy: ${eventsWithoutCreatedBy.length}`);
    
    if (eventsWithoutCreatedBy.length > 0) {
      // Find an admin user to assign as creator
      const adminUser = await usersCollection.findOne({ role: 'admin' });
      
      if (adminUser) {
        console.log(`👤 Found admin user: ${adminUser.name} (${adminUser._id})`);
        
        // Update events to have this admin as creator
        const result = await eventsCollection.updateMany(
          { createdBy: { $exists: false } },
          { $set: { createdBy: adminUser._id } }
        );
        
        console.log(`✅ Updated ${result.modifiedCount} events with createdBy field`);
      } else {
        console.log('❌ No admin user found to assign as creator');
      }
    }
    
    // Verify all events now have createdBy
    const allEvents = await eventsCollection.find({}).toArray();
    console.log('\n📋 All events status:');
    allEvents.forEach((event, index) => {
      console.log(`${index + 1}. ${event.name || event.title}`);
      console.log(`   - isActive: ${event.isActive}`);
      console.log(`   - createdBy: ${event.createdBy ? 'Yes' : 'No'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixEventsCreatedBy();
