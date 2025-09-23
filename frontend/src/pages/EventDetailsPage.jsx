import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  IndianRupee,
  Share2,
  Heart,
  ArrowLeft,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Info,
  Trophy
} from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../context/authStore';
import LoadingSpinner from '../components/LoadingSpinner';

// Helper function to get proper image URL
const getImageUrl = (imagePath) => {
  console.log('EventDetails - Original image path:', imagePath);
  
  // TEMPORARY: Always use fallback images until backend is fixed
  const fallbackImages = [
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=400&fit=crop'
  ];
  
  
  // Use a consistent fallback image based on event title hash for consistency
  const hash = imagePath ? imagePath.length : 0;
  const imageIndex = hash % fallbackImages.length;
  const fallbackUrl = fallbackImages[imageIndex];
  
  console.log('EventDetails - Using fallback image:', fallbackUrl);
  return fallbackUrl;
};
import toast from 'react-hot-toast';

const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [isLiked, setIsLiked] = useState(false);

  // Fetch event details
  const { data: eventData, isLoading, error } = useQuery(
    ['event', id],
    () => api.get(`/events/${id}`),
    {
      enabled: !!id,
    }
  );

  const event = eventData?.data?.event;

  const handleShare = () => {
    if (event) {
      const message = `🎪 Check out this event: ${event.title}\n📅 Date: ${new Date(event.date).toLocaleDateString()}\n📍 Location: ${event.location}\n\nRegister now: ${window.location.href}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Event link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast.success(isLiked ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleRegister = () => {
    if (!isAuthenticated) {
      toast.info('Please login to register for events');
      navigate('/login');
      return;
    }

    // Navigate to registration page
    navigate(`/events/${id}/register`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    console.error('Event fetch error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error loading event</h2>
          <p className="text-gray-600 mb-4">
            {error.response?.data?.message || error.message || 'Failed to load event details'}
          </p>
          <Link to="/events" className="btn-primary">
            Browse Other Events
          </Link>
        </div>
      </div>
    );
  }

  if (!event && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event not found</h2>
          <p className="text-gray-600 mb-4">The event you're looking for doesn't exist or has been removed.</p>
          <Link to="/events" className="btn-primary">
            Browse Other Events
          </Link>
        </div>
      </div>
    );
  }

  const isRegistrationOpen = event && new Date(event.registrationDeadline || event.date) > new Date();
  const statusColor = 'bg-green-100 text-green-800'; // Default to active
  const daysUntil = event ? Math.ceil((new Date(event.date) - new Date()) / (1000 * 60 * 60 * 24)) + ' days to go' : '';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="btn-secondary flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleLike}
                className={`p-2 rounded-full transition-colors duration-200 ${
                  isLiked 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              
              <button
                onClick={handleShare}
                className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200"
              >
                <Share2 className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleCopyLink}
                className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200"
              >
                <ExternalLink className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Event Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card overflow-hidden"
            >
              <div className="relative">
                <img
                  src={getImageUrl(event.image)}
                  alt={event.title}
                  className="w-full h-64 md:h-80 object-cover"
                  onError={(e) => {
                    console.log('EventDetails - Image failed to load:', e.target.src);
                    e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop';
                  }}
                  onLoad={() => console.log('EventDetails - Image loaded successfully for:', event.title)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
                      {event.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {event.userRegistered && (
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Registered ✓
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.title}</h1>
                  <p className="text-lg text-gray-200">{event.category}</p>
                </div>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Event</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            </motion.div>

            {/* Requirements */}
            {event.requirements && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card p-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Info className="w-6 h-6 mr-2 text-blue-500" />
                  Requirements
                </h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {event.requirements}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Contact Information */}
            {(event.contactEmail || event.contactPhone) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card p-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Trophy className="w-6 h-6 mr-2 text-yellow-500" />
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {event.contactEmail && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                      <p className="text-gray-600">{event.contactEmail}</p>
                    </div>
                  )}
                  {event.contactPhone && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
                      <p className="text-gray-600">{event.contactPhone}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Event Details Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="card p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">Event Details</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-3 text-blue-500" />
                    <div>
                      <p className="font-medium">Date & Time</p>
                      <p className="text-sm">{new Date(event.date).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</p>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-3 text-blue-500" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm">{event.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Users className="w-5 h-5 mr-3 text-blue-500" />
                    <div>
                      <p className="font-medium">Category</p>
                      <p className="text-sm">{event.category}</p>
                    </div>
                  </div>

                  {event.maxParticipants && (
                    <div className="flex items-center text-gray-600">
                      <Users className="w-5 h-5 mr-3 text-blue-500" />
                      <div>
                        <p className="font-medium">Max Participants</p>
                        <p className="text-sm">{event.maxParticipants}</p>
                      </div>
                    </div>
                  )}

                  {event.registrationDeadline && (
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-5 h-5 mr-3 text-blue-500" />
                      <div>
                        <p className="font-medium">Registration Deadline</p>
                        <p className="text-sm">
                          {new Date(event.registrationDeadline).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Time Until Event */}
                <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-primary-600 font-medium">Event Status</p>
                    <p className="text-2xl font-bold text-primary-700">{daysUntil}</p>
                  </div>
                </div>
              </motion.div>

              {/* Registration Status */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="card p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">Registration</h3>
                
                <div className="space-y-4">
                  {/* Registration Count */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Registered</span>
                    <span className="font-semibold">
                      {event.registrations?.length || 0}
                      {event.maxParticipants && ` / ${event.maxParticipants}`}
                    </span>
                  </div>

                  {/* Spots Remaining */}
                  {event.maxParticipants && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Spots Remaining</span>
                      <span className={`font-semibold ${
                        (event.maxParticipants - (event.registrations?.length || 0)) < 10 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {event.maxParticipants - (event.registrations?.length || 0)}
                      </span>
                    </div>
                  )}

                  {/* Progress Bar */}
                  {event.maxParticipants && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min((event.registrations?.length || 0) / event.maxParticipants * 100, 100)}%`
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Registration Button */}
                <div className="mt-6">
                  {!isAuthenticated ? (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-3">Login to register for this event</p>
                      <Link to="/login" className="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Login to Register
                      </Link>
                    </div>
                  ) : event.userRegistered ? (
                    <div className="text-center">
                      <div className="flex items-center justify-center text-green-600 mb-2">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <span className="font-medium">You're registered!</span>
                      </div>
                      <Link 
                        to="/dashboard" 
                        className="inline-flex items-center justify-center w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        View Registration
                      </Link>
                    </div>
                  ) : !isRegistrationOpen ? (
                    <div className="text-center">
                      <div className="flex items-center justify-center text-red-600 mb-2">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        <span className="font-medium">Registration Closed</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {!event.isActive 
                          ? 'This event is inactive'
                          : 'Registration deadline has passed'
                        }
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={handleRegister}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Register Now
                    </button>
                  )}
                </div>
              </motion.div>


              {/* Organizer Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="card p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">Organized By</h3>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold text-xl">K</span>
                  </div>
                  <h4 className="font-semibold text-gray-900">Kongu Engineering College</h4>
                  <p className="text-sm text-gray-600">{event.category}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Created by: {event.createdBy?.name || 'Admin'}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPage;
