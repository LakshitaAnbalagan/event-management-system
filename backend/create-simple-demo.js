const mongoose = require('mongoose');
const Event = require('./src/models/Event');
const User = require('./src/models/User');
const Registration = require('./src/models/Registration');
const bcrypt = require('bcryptjs');

async function createSimpleDemo() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/kongu-event-management');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Event.deleteMany({});
    await User.deleteMany({});
    await Registration.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create demo users with proper validation
    console.log('\n👥 Creating demo users...');
    const users = [];
    
    for (let i = 1; i <= 5; i++) {
      const user = new User({
        name: `Student ${i}`,
        email: `student${i}@kongu.edu`,
        password: 'password123', // Will be hashed by pre-save hook
        phone: `987654321${i % 10}`, // Valid Indian phone format
        college: 'Kongu Engineering College',
        department: i <= 3 ? 'Computer Science' : 'Information Technology',
        year: ['1st Year', '2nd Year', '3rd Year', '4th Year'][Math.floor(Math.random() * 4)],
        rollNumber: `20CS${String(i).padStart(3, '0')}`,
        isVerified: true
      });
      
      await user.save();
      users.push(user);
      console.log(`   ✅ Created user: ${user.name} (${user.email})`);
    }

    // Create demo events
    console.log('\n🎉 Creating demo events...');
    const events = [];
    
    const eventData = [
      {
        name: 'Tech Symposium 2024',
        description: 'Annual technical symposium with coding competitions and tech talks.',
        startDate: new Date('2024-12-15T09:00:00Z'),
        endDate: new Date('2024-12-15T17:00:00Z'),
        venue: 'Main Auditorium',
        maxParticipants: 200,
        registrationFee: 500,
        eventType: 'technical'
      },
      {
        name: 'Cultural Fest 2024',
        description: 'Annual cultural festival with various competitions.',
        startDate: new Date('2024-12-20T10:00:00Z'),
        endDate: new Date('2024-12-22T18:00:00Z'),
        venue: 'College Campus',
        maxParticipants: 500,
        registrationFee: 300,
        eventType: 'cultural'
      }
    ];

    for (const eventInfo of eventData) {
      const event = new Event({
        ...eventInfo,
        organizer: users[0]._id,
        isActive: true,
        registrationStartDate: new Date('2024-11-01T00:00:00Z'),
        registrationEndDate: new Date('2024-12-10T23:59:59Z')
      });
      
      await event.save();
      events.push(event);
      console.log(`   ✅ Created event: ${event.name} (ID: ${event._id})`);
    }

    // Create demo registrations
    console.log('\n📝 Creating demo registrations...');
    let registrationCount = 0;
    
    for (const event of events) {
      // Create registrations for each user
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const registrationType = i % 3 === 0 ? 'team' : 'individual';
        
        const registration = new Registration({
          event: event._id,
          user: user._id,
          registrationType,
          registrationNumber: `REG${event.name.substring(0,3).toUpperCase()}${String(i + 1).padStart(3, '0')}`,
          status: ['approved', 'approved', 'pending', 'approved'][i % 4],
          teamName: registrationType === 'team' ? `Team Alpha ${i + 1}` : undefined,
          teamMembers: registrationType === 'team' ? [
            { 
              name: user.name, 
              email: user.email, 
              phone: user.phone,
              rollNumber: user.rollNumber,
              department: user.department 
            }
          ] : undefined,
          paymentStatus: 'completed',
          paymentAmount: event.registrationFee,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        });
        
        await registration.save();
        registrationCount++;
        console.log(`   ✅ Created registration: ${registration.registrationNumber} for ${event.name}`);
      }
    }

    console.log('\n🎉 Demo data created successfully!');
    console.log(`   📊 Created ${users.length} users`);
    console.log(`   🎪 Created ${events.length} events`);
    console.log(`   📝 Created ${registrationCount} registrations`);
    
    console.log('\n🎯 Event IDs for testing:');
    events.forEach((event, index) => {
      console.log(`   ${index + 1}. ${event.name}: ${event._id}`);
    });
    
    console.log('\n🌐 Test URLs (use the first Event ID):');
    console.log(`   Registrations: http://localhost:3000/admin/events/${events[0]._id}/registrations/detailed`);
    console.log(`   Attendance: http://localhost:3000/admin/events/${events[0]._id}/attendance`);
    console.log(`   Prizes: http://localhost:3000/admin/events/${events[0]._id}/prizes`);

  } catch (error) {
    console.error('❌ Error creating demo data:', error);
  } finally {
    mongoose.connection.close();
  }
}

createSimpleDemo();
