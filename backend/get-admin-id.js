const mongoose = require('mongoose');
const User = require('./src/models/User');

async function getAdminId() {
  try {
    await mongoose.connect('mongodb://localhost:27017/kongu-event-management');
    
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      console.log('Admin ID:', admin._id);
      console.log('Admin Name:', admin.name);
      console.log('Admin Email:', admin.email);
    } else {
      console.log('No admin user found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

getAdminId();
