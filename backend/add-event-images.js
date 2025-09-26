const mongoose = require('mongoose');
const Event = require('./src/models/Event');

async function addEventImages() {
  try {
    await mongoose.connect('mongodb://localhost:27017/kongu-event-management');
    console.log('✅ Connected to MongoDB');

    // Get all events that need images
    const events = await Event.find({});
    console.log(`📋 Found ${events.length} events`);

    // Sample poster images for different event types
    const posterImages = {
      'Hackverse\'25': {
        public_id: 'hackverse_poster',
        url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=600&fit=crop&crop=center'
      },
      'newells': {
        public_id: 'newells_poster', 
        url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=600&fit=crop&crop=center'
      },
      'Hackvotrix': {
        public_id: 'hackvotrix_poster',
        url: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=600&fit=crop&crop=center'
      },
      'Demo Tech Event 2024': {
        public_id: 'demo_tech_poster',
        url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&h=600&fit=crop&crop=center'
      },
      'Tech Symposium 2024': {
        public_id: 'tech_symposium_poster',
        url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=600&fit=crop&crop=center'
      },
      'Cultural Fest 2024': {
        public_id: 'cultural_fest_poster',
        url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=600&fit=crop&crop=center'
      }
    };

    // Update events with poster images
    for (const event of events) {
      const eventName = event.name;
      
      // Check if event already has a poster image
      if (event.posterImage && event.posterImage.url && !event.posterImage.url.includes('placeholder')) {
        console.log(`✅ ${eventName} already has an image`);
        continue;
      }

      // Find matching poster image or use a default tech image
      let posterImage = posterImages[eventName];
      
      if (!posterImage) {
        // Default tech event image for unknown events
        posterImage = {
          public_id: `${eventName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_poster`,
          url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=600&fit=crop&crop=center'
        };
      }

      // Update the event
      await Event.findByIdAndUpdate(event._id, {
        posterImage: posterImage
      });

      console.log(`✅ Updated ${eventName} with poster image`);
      console.log(`   URL: ${posterImage.url}`);
    }

    console.log('\n🎉 All events updated with poster images!');
    console.log('\n🔄 Refresh your dashboard to see the new images');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

addEventImages();
