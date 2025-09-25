const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/event-management')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Event schema (simplified)
const eventSchema = new mongoose.Schema({}, { strict: false });
const Event = mongoose.model('Event', eventSchema);

async function fixEventImages() {
  try {
    console.log('🔍 Checking event images...');
    
    // Get all events
    const events = await Event.find({});
    console.log(`Found ${events.length} events`);
    
    // Check available images in uploads directory
    const uploadsDir = path.join(__dirname, 'uploads');
    const availableImages = fs.readdirSync(uploadsDir)
      .filter(file => file.match(/\.(jpg|jpeg|png|gif)$/i));
    
    console.log('📁 Available images:', availableImages);
    
    // Check each event's poster image
    for (const event of events) {
      console.log(`\n📋 Event: ${event.name || event.title}`);
      
      if (event.posterImage) {
        console.log(`Current poster: ${event.posterImage.url || event.posterImage}`);
        
        // Extract filename from URL
        const imageUrl = event.posterImage.url || event.posterImage;
        const filename = imageUrl.split('/').pop();
        
        // Check if file exists
        const imagePath = path.join(uploadsDir, filename);
        if (!fs.existsSync(imagePath)) {
          console.log(`❌ Image not found: ${filename}`);
          
          // Assign the first available image
          if (availableImages.length > 0) {
            const newImageUrl = `/uploads/${availableImages[0]}`;
            console.log(`🔧 Updating to: ${newImageUrl}`);
            
            // Update the event
            await Event.findByIdAndUpdate(event._id, {
              $set: {
                'posterImage.url': newImageUrl,
                'posterImage.public_id': availableImages[0]
              }
            });
            
            console.log('✅ Updated successfully');
          }
        } else {
          console.log('✅ Image exists');
        }
      } else {
        console.log('⚠️  No poster image set');
        
        // Assign the first available image if none is set
        if (availableImages.length > 0) {
          const newImageUrl = `/uploads/${availableImages[0]}`;
          console.log(`🔧 Setting poster to: ${newImageUrl}`);
          
          await Event.findByIdAndUpdate(event._id, {
            $set: {
              posterImage: {
                url: newImageUrl,
                public_id: availableImages[0]
              }
            }
          });
          
          console.log('✅ Poster image set');
        }
      }
    }
    
    console.log('\n🎉 Image fix completed!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error fixing images:', error);
    process.exit(1);
  }
}

fixEventImages();
