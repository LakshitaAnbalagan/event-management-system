# Event Management System - Setup Guide

## Quick Fix for "Something went wrong!" Error

If you're seeing a "Something went wrong!" error during event registration, follow these steps:

### 1. Environment Configuration

1. **Copy the environment template:**
   ```bash
   cd backend
   cp env.template .env
   ```

2. **Configure Cloudinary (Required for file uploads):**
   - Sign up for a free account at [Cloudinary](https://cloudinary.com/)
   - Go to your Dashboard and copy your credentials
   - Update your `.env` file with:
   ```env
   CLOUDINARY_CLOUD_NAME=your-cloud-name-here
   CLOUDINARY_API_KEY=your-api-key-here
   CLOUDINARY_API_SECRET=your-api-secret-here
   ```

3. **Set other required environment variables:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/event-management
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

### 2. Database Setup

Make sure MongoDB is running:
```bash
# On Windows
net start MongoDB

# On macOS/Linux
sudo systemctl start mongod
```

### 3. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Start the Application

```bash
# Start backend (from backend directory)
npm run dev

# Start frontend (from frontend directory)
npm start
```

### 5. Test Registration

1. Navigate to `http://localhost:3000`
2. Login or register as a user
3. Try registering for an event
4. Check the backend console for any error messages

## Common Issues and Solutions

### Issue: "Something went wrong!" during registration

**Possible Causes:**
1. **Missing Cloudinary configuration** - File uploads will fail
2. **Database connection issues** - MongoDB not running
3. **Validation errors** - Form data not properly formatted
4. **Authentication issues** - User not properly logged in

**Solutions:**
1. Check backend console logs for specific error messages
2. Ensure all environment variables are set correctly
3. Verify MongoDB is running and accessible
4. Check browser developer tools for network errors

### Issue: File upload fails

**Solution:**
- Ensure Cloudinary credentials are correctly set in `.env`
- Check file size (max 3MB for payment screenshots)
- Ensure file is an image format (JPG, PNG, etc.)

### Issue: Validation errors

**Solution:**
- Ensure all required fields are filled:
  - Email and phone number
  - College, department, and year
  - City
  - Payment screenshot (for paid events)

## Development Tips

1. **Enable detailed logging:**
   - Check backend console for request logs
   - Use browser developer tools to inspect network requests

2. **Test with different scenarios:**
   - Free events (no payment screenshot required)
   - Paid events (payment screenshot required)
   - Individual vs team registration

3. **Database inspection:**
   ```bash
   # Connect to MongoDB
   mongosh
   use event-management
   db.registrations.find().pretty()
   ```

## Support

If you continue to experience issues:
1. Check the backend console logs
2. Verify all environment variables are set
3. Ensure MongoDB is running
4. Test with a simple registration first

The system now includes better error logging and validation to help identify specific issues.
