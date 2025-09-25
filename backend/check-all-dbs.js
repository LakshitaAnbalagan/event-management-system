const mongoose = require('mongoose');

async function checkAllDatabases() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/');
    console.log('Connected to MongoDB');
    
    // List all databases
    const admin = mongoose.connection.db.admin();
    const dbs = await admin.listDatabases();
    
    console.log('\n📁 Available Databases:');
    dbs.databases.forEach(db => {
      console.log(`  - ${db.name} (${db.sizeOnDisk} bytes)`);
    });
    
    // Check each database for events
    for (const dbInfo of dbs.databases) {
      if (dbInfo.name.includes('event') || dbInfo.name.includes('kongu')) {
        console.log(`\n🔍 Checking database: ${dbInfo.name}`);
        
        const db = mongoose.connection.client.db(dbInfo.name);
        const collections = await db.listCollections().toArray();
        
        console.log(`  Collections: ${collections.map(c => c.name).join(', ')}`);
        
        // Check all collections for documents
        for (const collection of collections) {
          const coll = db.collection(collection.name);
          const count = await coll.countDocuments();
          console.log(`    ${collection.name}: ${count} documents`);
          
          if (collection.name === 'events' && count > 0) {
            const events = await coll.find({}).toArray();
            console.log('\n    📋 Events found:');
            events.forEach((event, index) => {
              console.log(`      ${index + 1}. ${event.name || event.title}`);
              console.log(`         Image: ${event.posterImage?.url || 'No image'}`);
              console.log(`         ID: ${event._id}`);
            });
          }
        }
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAllDatabases();
