const mongoose = require('mongoose');
const Event = require('./src/models/Event');
const User = require('./src/models/User');
const Registration = require('./src/models/Registration');

async function quickDemo() {
  try {
    await mongoose.connect('mongodb://localhost:27017/kongu-event-management');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Event.deleteMany({});
    await User.deleteMany({});
    await Registration.deleteMany({});

    // Create a simple admin user
    const admin = new User({
      name: 'Admin User',
      email: 'admin@kongu.edu',
      password: 'admin123',
      role: 'admin'
    });
    await admin.save();
    console.log('✅ Created admin user');

    // Create demo users
    const users = [];
    for (let i = 1; i <= 3; i++) {
      const user = new User({
        name: `Student ${i}`,
        email: `student${i}@kongu.edu`,
        password: 'password123'
      });
      await user.save();
      users.push(user);
      console.log(`✅ Created user: ${user.name}`);
    }

    // Create demo events
    const event1 = new Event({
      name: 'Tech Symposium 2024',
      description: 'Annual technical symposium with coding competitions.',
      department: 'Computer Science',
      college: 'Kongu Engineering College',
      posterImage: {
        public_id: 'demo_poster_1',
        url: 'https://via.placeholder.com/400x600/0066cc/ffffff?text=Tech+Symposium'
      },
      startDate: new Date('2024-12-15T09:00:00Z'),
      endDate: new Date('2024-12-15T17:00:00Z'),
      registrationDeadline: new Date('2024-12-10T23:59:59Z'),
      venue: 'Main Auditorium',
      maxParticipants: 200,
      registrationFee: 500,
      eventType: 'technical',
      createdBy: admin._id,
      isActive: true,
      registrationStartDate: new Date('2024-11-01T00:00:00Z'),
      registrationEndDate: new Date('2024-12-10T23:59:59Z')
    });
    await event1.save();
    console.log(`✅ Created event: ${event1.name} (ID: ${event1._id})`);

    const event2 = new Event({
      name: 'Cultural Fest 2024',
      description: 'Annual cultural festival with various competitions.',
      department: 'All Departments',
      college: 'Kongu Engineering College',
      posterImage: {
        public_id: 'demo_poster_2',
        url: 'https://via.placeholder.com/400x600/cc6600/ffffff?text=Cultural+Fest'
      },
      startDate: new Date('2024-12-20T10:00:00Z'),
      endDate: new Date('2024-12-22T18:00:00Z'),
      registrationDeadline: new Date('2024-12-15T23:59:59Z'),
      venue: 'College Campus',
      maxParticipants: 500,
      registrationFee: 300,
      eventType: 'cultural',
      createdBy: admin._id,
      isActive: true,
      registrationStartDate: new Date('2024-11-01T00:00:00Z'),
      registrationEndDate: new Date('2024-12-10T23:59:59Z')
    });
    await event2.save();
    console.log(`✅ Created event: ${event2.name} (ID: ${event2._id})`);

    // Create registrations
    let regCount = 0;
    for (const event of [event1, event2]) {
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const registration = new Registration({
          event: event._id,
          user: user._id,
          registrationType: i % 2 === 0 ? 'individual' : 'team',
          registrationNumber: `REG${regCount + 1}`,
          status: 'approved',
          teamName: i % 2 === 0 ? undefined : `Team ${i + 1}`,
          contactDetails: {
            primaryPhone: '9876543210',
            email: user.email
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
              public_id: `payment_${regCount + 1}`,
              url: 'https://via.placeholder.com/400x300/00cc66/ffffff?text=Payment+Screenshot'
            },
            paymentStatus: 'verified'
          }
        });
        await registration.save();
        regCount++;
        console.log(`✅ Created registration: ${registration.registrationNumber}`);
      }
    }

    console.log('\n🎉 Demo data created successfully!');
    console.log(`📊 Created ${users.length + 1} users (including admin)`);
    console.log(`🎪 Created 2 events`);
    console.log(`📝 Created ${regCount} registrations`);
    
    console.log('\n🎯 Test with these Event IDs:');
    console.log(`1. ${event1.name}: ${event1._id}`);
    console.log(`2. ${event2.name}: ${event2._id}`);
    
    console.log('\n🌐 Test URLs:');
    console.log(`Registrations: http://localhost:3000/admin/events/${event1._id}/registrations/detailed`);
    console.log(`Attendance: http://localhost:3000/admin/events/${event1._id}/attendance`);
    console.log(`Prizes: http://localhost:3000/admin/events/${event1._id}/prizes`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

quickDemo();
