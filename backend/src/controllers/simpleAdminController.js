const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Get dashboard statistics
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'student', isActive: true });
    const totalEvents = await Event.countDocuments({ isActive: true });
    const totalRegistrations = await Registration.countDocuments();
    const activeEvents = await Event.countDocuments({ 
      isActive: true,
      startDate: { $gte: new Date() }
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalEvents,
        totalRegistrations,
        activeEvents
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

// Get all events for admin
const getEvents = async (req, res) => {
  try {
    console.log('🔍 getEvents called with query:', req.query);
    
    const { limit } = req.query;
    const query = Event.find({ isActive: true })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    if (limit) {
      query.limit(parseInt(limit));
    }

    const events = await query;
    console.log(`📊 Found ${events.length} events in database`);
    
    if (events.length > 0) {
      console.log('📋 First event:', {
        name: events[0].name,
        isActive: events[0].isActive,
        createdBy: events[0].createdBy
      });
    }

    // Add registration count and map fields for frontend
    const eventsWithRegistrations = await Promise.all(
      events.map(async (event) => {
        const registrations = await Registration.find({ event: event._id });
        const eventObj = event.toObject();
        
        // Map backend fields to frontend expected fields
        return {
          ...eventObj,
          title: eventObj.name, // Map name to title
          date: eventObj.startDate, // Map startDate to date
          location: eventObj.venue, // Map venue to location
          category: eventObj.department, // Map department to category
          requirements: eventObj.instructions,
          image: eventObj.posterImage?.url,
          registrations
        };
      })
    );

    console.log(`✅ Sending ${eventsWithRegistrations.length} events to frontend`);
    
    res.status(200).json({
      success: true,
      data: {
        events: eventsWithRegistrations
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error.message
    });
  }
};

// Get single event
const getEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id).populate('createdBy', 'name email');
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const eventObj = event.toObject();
    
    // Map backend fields to frontend expected fields
    const mappedEvent = {
      ...eventObj,
      title: eventObj.name,
      date: eventObj.startDate,
      location: eventObj.venue,
      category: eventObj.department,
      requirements: eventObj.instructions,
      image: eventObj.posterImage?.url
    };

    res.status(200).json({
      success: true,
      data: { event: mappedEvent }
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event',
      error: error.message
    });
  }
};

// Create new event
const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      location,
      maxParticipants,
      category,
      registrationDeadline,
      requirements,
      contactEmail,
      contactPhone,
      isActive
    } = req.body;

    // Map frontend fields to backend Event model fields
    const eventData = {
      name: title, // Map title to name
      description,
      startDate: new Date(date), // Map date to startDate
      endDate: new Date(date), // Set same as startDate for now
      venue: location, // Map location to venue
      maxParticipants: parseInt(maxParticipants),
      department: category || 'General', // Map category to department
      instructions: requirements,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user._id,
      college: 'Kongu Engineering College'
    };

    if (registrationDeadline) {
      eventData.registrationDeadline = new Date(registrationDeadline);
    }

    // Handle image upload if provided
    if (req.file) {
      eventData.posterImage = {
        url: `/uploads/${req.file.filename}`
      };
    }

    const event = new Event(eventData);
    await event.save();

    const populatedEvent = await Event.findById(event._id)
      .populate('createdBy', 'name email');

    // Emit real-time event
    if (req.io) {
      req.io.emit('event-created', {
        eventId: event._id,
        eventName: event.name,
        createdBy: req.user.name,
        timestamp: new Date()
      });
    }

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: { event: populatedEvent }
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: error.message
    });
  }
};

// Update event
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      date,
      location,
      maxParticipants,
      category,
      registrationDeadline,
      requirements,
      contactEmail,
      contactPhone,
      isActive
    } = req.body;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Update fields
    if (title) event.title = title;
    if (description) event.description = description;
    if (date) event.date = new Date(date);
    if (location) event.location = location;
    if (maxParticipants) event.maxParticipants = parseInt(maxParticipants);
    if (category) event.category = category;
    if (registrationDeadline) event.registrationDeadline = new Date(registrationDeadline);
    if (requirements !== undefined) event.requirements = requirements;
    if (contactEmail) event.contactEmail = contactEmail;
    if (contactPhone !== undefined) event.contactPhone = contactPhone;
    if (isActive !== undefined) event.isActive = isActive;

    // Handle image upload if provided
    if (req.file) {
      event.image = `/uploads/${req.file.filename}`;
    }

    await event.save();

    const populatedEvent = await Event.findById(event._id)
      .populate('createdBy', 'name email');

    // Emit real-time event
    if (req.io) {
      req.io.emit('event-updated', {
        eventId: event._id,
        title: event.title,
        updatedBy: req.user.name,
        timestamp: new Date()
      });
    }

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: { event: populatedEvent }
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update event',
      error: error.message
    });
  }
};

// Delete event
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if event has registrations
    const registrationCount = await Registration.countDocuments({ event: id });
    if (registrationCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete event with existing registrations'
      });
    }

    await Event.findByIdAndDelete(id);

    // Emit real-time event
    if (req.io) {
      req.io.emit('event-deleted', {
        eventId: id,
        title: event.title,
        deletedBy: req.user.name,
        timestamp: new Date()
      });
    }

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event',
      error: error.message
    });
  }
};

// Toggle event status
const toggleEventStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    event.isActive = isActive;
    await event.save();

    res.status(200).json({
      success: true,
      message: `Event ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { event }
    });
  } catch (error) {
    console.error('Toggle event status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update event status',
      error: error.message
    });
  }
};

// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { users }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

// Get event registrations
const getEventRegistrations = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const registrations = await Registration.find({ event: id })
      .populate('user', 'name email phone college department year city')
      .sort({ createdAt: -1 });

    // Map backend fields to frontend expected fields for event
    const mappedEvent = {
      ...event.toObject(),
      title: event.name,
      date: event.startDate,
      location: event.venue,
      category: event.department,
      requirements: event.instructions,
      image: event.posterImage?.url
    };

    res.status(200).json({
      success: true,
      data: {
        event: mappedEvent,
        registrations
      }
    });
  } catch (error) {
    console.error('Get event registrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event registrations',
      error: error.message
    });
  }
};

module.exports = {
  getStats,
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleEventStatus,
  getUsers,
  getEventRegistrations
};
