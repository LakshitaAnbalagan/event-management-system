const mongoose = require('mongoose');
const Event = require('./src/models/Event');
const User = require('./src/models/User');
const Registration = require('./src/models/Registration');

async function freshStart() {
  try {
    await mongoose.connect('mongodb://localhost:27017/kongu-event-management');
    console.log('✅ Connected to MongoDB');

    // COMPLETELY CLEAR DATABASE
    console.log('🧹 Clearing all data...');
    await Event.deleteMany({});
    await User.deleteMany({});
    await Registration.deleteMany({});
    console.log('✅ Database cleared');

    // Create admin user
    const admin = new User({
      name: 'Admin User',
      email: 'admin@kongu.edu',
      password: 'admin123',
      role: 'admin'
    });
    await admin.save();
    console.log('✅ Created admin user');

    // Create students
    const students = [];
    for (let i = 1; i <= 5; i++) {
      const student = new User({
        name: `Student ${i}`,
        email: `student${i}@kongu.edu`,
        password: 'password123'
      });
      await student.save();
      students.push(student);
      console.log(`✅ Created ${student.name}`);
    }

    // Create ONE event with all required fields
    const event = new Event({
      name: 'Demo Tech Event 2024',
      description: 'Demo event for testing admin features',
      department: 'Computer Science',
      college: 'Kongu Engineering College',
      posterImage: {
        public_id: 'demo_poster',
        url: 'https://via.placeholder.com/400x600/0066cc/ffffff?text=Demo+Event'
      },
      startDate: new Date('2024-12-15T09:00:00Z'),
      endDate: new Date('2024-12-15T17:00:00Z'),
      registrationDeadline: new Date('2024-12-10T23:59:59Z'),
      venue: 'Main Auditorium',
      maxParticipants: 100,
      registrationFee: 500,
      eventType: 'technical',
      createdBy: admin._id,
      isActive: true
    });
    
    await event.save();
    console.log('✅ Created event:', event.name);
    console.log('📋 Event ID:', event._id);

    // Create registrations for this event
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const registration = new Registration({
        event: event._id,
        user: student._id,
        registrationType: i % 2 === 0 ? 'individual' : 'team',
        registrationNumber: `DEMO${String(i + 1).padStart(3, '0')}`,
        status: 'approved',
        teamName: i % 2 === 0 ? undefined : `Team ${i + 1}`,
        contactDetails: {
          primaryPhone: '9876543210',
          email: student.email
        },
        academicDetails: {
          college: 'Kongu Engineering College',
          department: 'Computer Science',
          year: '3rd Year'
        },
        location: {
          city: 'Erode',
          state: 'Tamil Nadu',
          pincode: '638001'
        },
        paymentDetails: {
          amount: event.registrationFee,
          transactionId: `TXN${Date.now()}${i}`,
          paymentScreenshot: {
            public_id: `payment_${i + 1}`,
            url: 'https://via.placeholder.com/400x300/00cc66/ffffff?text=Payment+Screenshot'
          },
          paymentStatus: 'verified'
        }
      });
      
      await registration.save();
      console.log(`✅ Created registration: ${registration.registrationNumber}`);
    }

    // Verify the event exists and show URLs
    const verifyEvent = await Event.findById(event._id);
    const regCount = await Registration.countDocuments({ event: event._id });
    
    console.log('\n🎉 FRESH DEMO DATA CREATED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log(`Event Name: ${verifyEvent.name}`);
    console.log(`Event ID: ${verifyEvent._id}`);
    console.log(`Registrations: ${regCount}`);
    console.log(`Event Active: ${verifyEvent.isActive}`);
    
    console.log('\n🌐 WORKING URLS - COPY THESE:');
    console.log('='.repeat(60));
    console.log(`\nRegistrations:`);
    console.log(`http://localhost:3000/admin/events/${verifyEvent._id}/registrations/detailed`);
    console.log(`\nAttendance:`);
    console.log(`http://localhost:3000/admin/events/${verifyEvent._id}/attendance`);
    console.log(`\nPrizes:`);
    console.log(`http://localhost:3000/admin/events/${verifyEvent._id}/prizes`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

freshStart();
