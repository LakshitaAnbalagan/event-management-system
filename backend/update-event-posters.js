const mongoose = require('mongoose');
const Event = require('./src/models/Event');

async function updateEventPosters() {
  try {
    await mongoose.connect('mongodb://localhost:27017/kongu-event-management');
    console.log('Connected to MongoDB');

    // Define poster images for each event
    const eventPosters = [
      {
        name: 'Hackverse\'25',
        posterImage: {
          public_id: 'hackverse_2025',
          url: 'https://via.placeholder.com/400x600/1a365d/ffffff?text=Hackverse%2725'
        }
      },
      {
        name: 'newells',
        posterImage: {
          public_id: 'newells_event',
          url: 'https://via.placeholder.com/400x600/2d3748/ffffff?text=Newells'
        }
      },
      {
        name: 'Hackvotrix',
        posterImage: {
          public_id: 'hackvotrix_event',
          url: 'https://via.placeholder.com/400x600/2b6cb0/ffffff?text=Hackvotrix'
        }
      }
    ];

    // Update each event
    for (const eventData of eventPosters) {
      const result = await Event.updateOne(
        { name: eventData.name },
        { $set: { posterImage: eventData.posterImage } }
      );
      
      if (result.matchedCount > 0) {
        console.log(`✅ Updated ${eventData.name}`);
      } else {
        console.log(`❌ Event ${eventData.name} not found`);
      }
    }

    console.log('\n🎉 Event posters updated!');
    console.log('🔄 Refresh your dashboard to see the changes');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

updateEventPosters();
