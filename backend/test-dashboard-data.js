const mongoose = require('mongoose');
const Event = require('./src/models/Event');
const Registration = require('./src/models/Registration');
const User = require('./src/models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/kongu-event-management')
.then(() => {
  console.log('Connected to MongoDB');
  testDashboardData();
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

async function testDashboardData() {
  try {
    console.log('\n🔍 Testing Dashboard Data...\n');

    // Test stats queries
    const totalUsers = await User.countDocuments({ role: 'student', isActive: true });
    const totalEvents = await Event.countDocuments({ isActive: true });
    const totalRegistrations = await Registration.countDocuments();
    const activeEvents = await Event.countDocuments({ 
      isActive: true,
      startDate: { $gte: new Date() }
    });

    console.log('📊 Dashboard Stats:');
    console.log(`   Total Users: ${totalUsers}`);
    console.log(`   Total Events: ${totalEvents}`);
    console.log(`   Total Registrations: ${totalRegistrations}`);
    console.log(`   Active Events: ${activeEvents}`);

    // Get all events
    const events = await Event.find({ isActive: true })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    console.log(`\n📋 Recent Events (${events.length} found):`);
    events.forEach((event, index) => {
      console.log(`   ${index + 1}. ${event.name}`);
      console.log(`      Department: ${event.department}`);
      console.log(`      Start Date: ${event.startDate}`);
      console.log(`      Venue: ${event.venue}`);
      console.log(`      Created By: ${event.createdBy?.name || 'Unknown'}`);
      console.log(`      Is Active: ${event.isActive}`);
      console.log('');
    });

    // Check if there are any events at all
    const allEvents = await Event.find({});
    console.log(`\n🔍 Total events in database (including inactive): ${allEvents.length}`);
    
    if (allEvents.length > 0) {
      console.log('\n📝 All events:');
      allEvents.forEach((event, index) => {
        console.log(`   ${index + 1}. ${event.name} (Active: ${event.isActive})`);
      });
    }

  } catch (error) {
    console.error('❌ Error testing dashboard data:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n✅ Test completed');
  }
}
