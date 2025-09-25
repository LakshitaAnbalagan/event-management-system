const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/kongu-event-management')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Check events collection specifically
    const eventsCollection = mongoose.connection.db.collection('events');
    const allEvents = await eventsCollection.find({}).toArray();
    console.log(`Total events found: ${allEvents.length}`);
    
    if (allEvents.length > 0) {
      console.log('\n📋 Events with image details:');
      allEvents.forEach((event, index) => {
        console.log(`\n${index + 1}. Event: ${event.name || event.title}`);
        console.log(`   ID: ${event._id}`);
        console.log(`   Image URL: ${event.posterImage?.url || 'No image'}`);
        console.log(`   Image Public ID: ${event.posterImage?.public_id || 'No public_id'}`);
      });
      
      // Check if any event has the problematic image
      const hackvotrixEvent = allEvents.find(e => (e.name || e.title || '').toLowerCase().includes('hackv'));
      if (hackvotrixEvent) {
        console.log('\n🎯 Hackvotrix Event Details:');
        console.log('   Current Image URL:', hackvotrixEvent.posterImage?.url);
        console.log('   Current Public ID:', hackvotrixEvent.posterImage?.public_id);
        
        // Update the image to use an existing file
        const newImageUrl = '/uploads/image-1758616282364-629988247.jpeg';
        console.log(`\n🔧 Updating image to: ${newImageUrl}`);
        
        await eventsCollection.updateOne(
          { _id: hackvotrixEvent._id },
          {
            $set: {
              'posterImage.url': newImageUrl,
              'posterImage.public_id': 'image-1758616282364-629988247.jpeg'
            }
          }
        );
        
        console.log('✅ Image updated successfully!');
      }
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
