import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Trophy, 
  Users, 
  CheckCircle, 
  AlertCircle,
  Eye,
  MapPin,
  Filter,
  Download,
  Share2
} from 'lucide-react';
import registrationService from '../services/registrationService';
import eventService from '../services/eventService';
import { useAuthStore } from '../context/authStore';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardPage = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch user registrations
  const { data: registrationsData, isLoading: registrationsLoading } = useQuery(
    ['user-registrations', statusFilter],
    () => registrationService.getUserRegistrations({
      status: statusFilter !== 'all' ? statusFilter : undefined
    })
  );

  // Fetch user registration stats
  const { data: statsData, isLoading: statsLoading } = useQuery(
    'user-registration-stats',
    registrationService.getUserRegistrationStats
  );

  const registrations = registrationsData?.data?.registrations || [];
  const stats = statsData?.data || {};

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Trophy },
    { id: 'registrations', label: 'My Registrations', icon: Calendar },
    { id: 'upcoming', label: 'Upcoming Events', icon: Clock }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                Track your event registrations and discover new opportunities
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/events" className="btn-primary">
                Browse Events
              </Link>
              <Link to="/profile" className="btn-secondary">
                Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <OverviewTab 
            stats={stats} 
            registrations={registrations} 
            isLoading={statsLoading || registrationsLoading}
            setActiveTab={setActiveTab}
          />
        )}
        
        {activeTab === 'registrations' && (
          <RegistrationsTab 
            registrations={registrations}
            isLoading={registrationsLoading}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        )}
        
        {activeTab === 'upcoming' && (
          <UpcomingTab />
        )}
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ stats, registrations, isLoading, setActiveTab }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const recentRegistrations = registrations.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.totalRegistrations || 0}</p>
              <p className="text-gray-600">Total Events</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {stats.statusBreakdown?.find(s => s._id === 'approved')?.count || 0}
              </p>
              <p className="text-gray-600">Approved</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {stats.statusBreakdown?.find(s => s._id === 'submitted')?.count || 0}
              </p>
              <p className="text-gray-600">Pending</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Trophy className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.upcomingEvents || 0}</p>
              <p className="text-gray-600">Upcoming</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/events" className="btn-primary text-center">
            Browse New Events
          </Link>
          <Link to="/events?status=upcoming" className="btn-secondary text-center">
            View Upcoming Events
          </Link>
          <Link to="/profile" className="btn-secondary text-center">
            Update Profile
          </Link>
        </div>
      </motion.div>

      {/* Recent Registrations */}
      {recentRegistrations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Registrations</h2>
            <button 
              onClick={() => setActiveTab('registrations')} 
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentRegistrations.map((registration) => (
              <div key={registration._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <img
                    src={registration.event?.posterImage?.url || '/api/placeholder/60/60'}
                    alt={registration.event?.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900">{registration.event?.name}</h3>
                    <p className="text-sm text-gray-600">
                      {registration.event?.venue} • {eventService.formatEventDate(registration.event?.startDate)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`badge ${registrationService.getStatusColor(registration.status)}`}>
                    {registrationService.getStatusText(registration.status)}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {registrationService.formatRegistrationDate(registration.submittedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Welcome Message for New Users */}
      {registrations.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-8 text-center"
        >
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Kongu Events!</h2>
          <p className="text-gray-600 mb-6">
            You haven't registered for any events yet. Start exploring amazing events happening at our college.
          </p>
          <Link to="/events" className="btn-kongu">
            Discover Events
          </Link>
        </motion.div>
      )}
    </div>
  );
};

// Registrations Tab Component
const RegistrationsTab = ({ registrations, isLoading, statusFilter, onStatusFilterChange }) => {
  const handleShare = (registration) => {
    registrationService.shareRegistrationWhatsApp(registration);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="input-field w-48"
            >
              <option value="all">All Registrations</option>
              <option value="submitted">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <p className="text-sm text-gray-600">
            {registrations.length} registration{registrations.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Registrations List */}
      {registrations.length === 0 ? (
        <div className="card p-8 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No registrations found</h3>
          <p className="text-gray-600 mb-4">
            {statusFilter === 'all' 
              ? "You haven't registered for any events yet."
              : `No registrations with status "${statusFilter}" found.`
            }
          </p>
          <Link to="/events" className="btn-primary">
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {registrations.map((registration, index) => (
            <motion.div
              key={registration._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <img
                    src={registration.event?.posterImage?.url || '/api/placeholder/80/80'}
                    alt={registration.event?.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{registration.event?.name}</h3>
                        <p className="text-gray-600">{registration.event?.department}</p>
                      </div>
                      <span className={`badge ${registrationService.getStatusColor(registration.status)}`}>
                        {registrationService.getStatusText(registration.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {eventService.formatEventDate(registration.event?.startDate)}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {registration.event?.venue}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        {registration.registrationType}
                      </div>
                      <div className="flex items-center">
                        <Trophy className="w-4 h-4 mr-2" />
                        {registration.registrationNumber}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Registered on {registrationService.formatRegistrationDate(registration.submittedAt)}
                        {registration.teamName && (
                          <span className="ml-2">• Team: {registration.teamName}</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/events/${registration.event?._id}`}
                          className="btn-secondary text-sm flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Event
                        </Link>
                        <button
                          onClick={() => handleShare(registration)}
                          className="btn-secondary text-sm flex items-center"
                        >
                          <Share2 className="w-4 h-4 mr-1" />
                          Share
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// Upcoming Tab Component
const UpcomingTab = () => {
  const { data: upcomingData, isLoading } = useQuery(
    'upcoming-events',
    () => eventService.getUpcomingEvents(12)
  );

  const upcomingEvents = upcomingData?.data?.events || [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
        <p className="text-gray-600">
          Don't miss out on these exciting upcoming events at Kongu Engineering College
        </p>
      </div>

      {upcomingEvents.length === 0 ? (
        <div className="card p-8 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming events</h3>
          <p className="text-gray-600">Check back later for new events!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingEvents.map((event, index) => (
            <motion.div
              key={event._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="event-card group"
            >
              <div className="relative overflow-hidden">
                <img
                  src={event.posterImage?.url || '/api/placeholder/400/200'}
                  alt={event.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className={`badge ${eventService.getStatusColor(event.status)}`}>
                    {eventService.getDaysUntilEvent(event.startDate)}
                  </span>
                </div>
                {event.registrationFee > 0 && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded text-sm font-medium">
                    ₹{event.registrationFee}
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-200">
                  {event.name}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {event.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-2" />
                    {eventService.formatEventDate(event.startDate)}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="w-4 h-4 mr-2" />
                    {event.venue}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-2" />
                    {event.department}
                  </div>
                </div>
                
                <Link
                  to={`/events/${event._id}`}
                  className="btn-primary w-full text-center"
                >
                  View Details
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
