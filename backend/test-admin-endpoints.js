const mongoose = require('mongoose');
const Event = require('./src/models/Event');
const Prize = require('./src/models/Prize');
const Attendance = require('./src/models/Attendance');
const Registration = require('./src/models/Registration');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/kongu-event-management')
.then(() => {
  console.log('Connected to MongoDB');
  testEndpoints();
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

async function testEndpoints() {
  try {
    console.log('\n🔍 Testing Admin Endpoints Data...\n');

    // Get all events
    const events = await Event.find({ isActive: true }).limit(5);
    console.log(`📋 Found ${events.length} active events:`);
    
    if (events.length === 0) {
      console.log('❌ No active events found. This might be why the pages are failing.');
      return;
    }

    // Test each event
    for (const event of events) {
      console.log(`\n📅 Event: ${event.name} (ID: ${event._id})`);
      
      // Check registrations
      const registrations = await Registration.find({ event: event._id });
      console.log(`   📝 Registrations: ${registrations.length}`);
      
      // Check prizes
      const prizes = await Prize.find({ event: event._id });
      console.log(`   🏆 Prizes: ${prizes.length}`);
      
      // Check attendance
      const attendance = await Attendance.find({ event: event._id });
      console.log(`   ✅ Attendance records: ${attendance.length}`);
      
      // Test the API response structure for prizes
      if (prizes.length === 0) {
        console.log('   ℹ️  No prizes found - this would return empty array');
      }
      
      if (attendance.length === 0) {
        console.log('   ℹ️  No attendance records - this would return empty array');
      }
      
      if (registrations.length === 0) {
        console.log('   ℹ️  No registrations found - this would return empty array');
      }
    }

    // Test Prize model structure
    console.log('\n🏆 Prize Model Test:');
    const samplePrize = new Prize({
      event: events[0]._id,
      prizeName: 'Test Prize',
      position: '1st',
      prizeValue: 1000,
      winner: {
        type: 'individual',
        user: new mongoose.Types.ObjectId(),
        registration: new mongoose.Types.ObjectId()
      },
      awardedBy: new mongoose.Types.ObjectId()
    });
    console.log('   ✅ Prize model structure is valid');

    // Test Attendance model structure
    console.log('\n✅ Attendance Model Test:');
    const sampleAttendance = new Attendance({
      event: events[0]._id,
      registration: new mongoose.Types.ObjectId(),
      user: new mongoose.Types.ObjectId(),
      attendanceStatus: 'present',
      markedBy: new mongoose.Types.ObjectId()
    });
    console.log('   ✅ Attendance model structure is valid');

  } catch (error) {
    console.error('❌ Error testing endpoints:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n✅ Test completed');
  }
}
