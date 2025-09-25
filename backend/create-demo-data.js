const mongoose = require('mongoose');
const Event = require('./src/models/Event');
const User = require('./src/models/User');
const Registration = require('./src/models/Registration');

async function createDemoData() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/kongu-event-management');
    console.log('✅ Connected to MongoDB');

    // Create demo users
    console.log('\n👥 Creating demo users...');
    const users = [];
    
    for (let i = 1; i <= 10; i++) {
      const user = new User({
        name: `Student ${i}`,
        email: `student${i}@kongu.edu`,
        phone: `987654321${i}`,
        college: 'Kongu Engineering College',
        department: i <= 5 ? 'Computer Science' : 'Information Technology',
        year: Math.floor(Math.random() * 4) + 1,
        rollNumber: `20CS${String(i).padStart(3, '0')}`,
        password: 'hashedpassword123', // In real app, this would be hashed
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
        description: 'Annual technical symposium with coding competitions, paper presentations, and tech talks.',
        startDate: new Date('2024-12-15T09:00:00Z'),
        endDate: new Date('2024-12-15T17:00:00Z'),
        venue: 'Main Auditorium',
        maxParticipants: 200,
        registrationFee: 500,
        eventType: 'technical'
      },
      {
        name: 'Cultural Fest 2024',
        description: 'Annual cultural festival with dance, music, drama, and art competitions.',
        startDate: new Date('2024-12-20T10:00:00Z'),
        endDate: new Date('2024-12-22T18:00:00Z'),
        venue: 'College Campus',
        maxParticipants: 500,
        registrationFee: 300,
        eventType: 'cultural'
      },
      {
        name: 'Hackathon 2024',
        description: '24-hour coding hackathon with exciting prizes and industry mentors.',
        startDate: new Date('2024-12-25T08:00:00Z'),
        endDate: new Date('2024-12-26T08:00:00Z'),
        venue: 'Computer Lab',
        maxParticipants: 100,
        registrationFee: 200,
        eventType: 'technical'
      }
    ];

    for (const eventInfo of eventData) {
      const event = new Event({
        ...eventInfo,
        organizer: users[0]._id, // First user as organizer
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
      // Create 5-8 registrations per event
      const numRegistrations = Math.floor(Math.random() * 4) + 5;
      
      for (let i = 0; i < numRegistrations && i < users.length; i++) {
        const user = users[i];
        const registrationType = Math.random() > 0.7 ? 'team' : 'individual';
        
        const registration = new Registration({
          event: event._id,
          user: user._id,
          registrationType,
          registrationNumber: `REG${Date.now()}${i}`,
          status: ['approved', 'pending', 'approved', 'approved'][Math.floor(Math.random() * 4)],
          teamName: registrationType === 'team' ? `Team ${i + 1}` : undefined,
          teamMembers: registrationType === 'team' ? [
            { name: user.name, email: user.email, phone: user.phone },
            { name: `Member ${i + 1}`, email: `member${i + 1}@kongu.edu`, phone: `987654${i}210` }
          ] : undefined,
          paymentStatus: 'completed',
          paymentAmount: event.registrationFee,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random date within last week
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
    
    console.log('\n🎯 You can now test with these Event IDs:');
    events.forEach((event, index) => {
      console.log(`   ${index + 1}. ${event.name}: ${event._id}`);
    });
    
    console.log('\n🌐 Test URLs:');
    console.log(`   Registrations: http://localhost:3000/admin/events/${events[0]._id}/registrations/detailed`);
    console.log(`   Attendance: http://localhost:3000/admin/events/${events[0]._id}/attendance`);
    console.log(`   Prizes: http://localhost:3000/admin/events/${events[0]._id}/prizes`);

  } catch (error) {
    console.error('❌ Error creating demo data:', error);
  } finally {
    mongoose.connection.close();
  }
}

createDemoData();
