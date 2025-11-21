import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  ChevronDown,
  Grid3X3,
  List,
  X
} from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../context/authStore';
import LoadingSpinner from '../components/LoadingSpinner';

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL 
  || (import.meta.env.DEV 
    ? 'http://localhost:5000' 
    : 'https://event-management-system-1-4yi9.onrender.com');

// Helper function to get proper image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=250&fit=crop';
  }
  
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  return `${BACKEND_BASE_URL}${imagePath}`;
};

const EventsPage = () => {
  const { isAuthenticated } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State for filters and view
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'all');
  const [selectedDepartment, setSelectedDepartment] = useState(searchParams.get('department') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'startDate');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'asc');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  // Department options
  const departments = [
    'Computer Science and Engineering',
    'Electronics and Communication Engineering',
    'Mechanical Engineering',
    'Electrical and Electronics Engineering',
    'Civil Engineering',
    'Information Technology',
    'Biomedical Engineering',
    'Textile Technology',
    'Fashion Technology',
    'MBA',
    'MCA'
  ];

  // Fetch events with filters
  const { data: eventsData, isLoading, error } = useQuery(
    ['events', { searchQuery, selectedStatus, selectedDepartment, sortBy, sortOrder, page }],
    () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (selectedDepartment !== 'all') params.append('department', selectedDepartment);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      params.append('page', page);
      params.append('limit', '12');
      
      return api.get(`/events?${params.toString()}`);
    },
    {
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedStatus !== 'all') params.set('status', selectedStatus);
    if (selectedDepartment !== 'all') params.set('department', selectedDepartment);
    if (sortBy !== 'startDate') params.set('sortBy', sortBy);
    if (sortOrder !== 'asc') params.set('sortOrder', sortOrder);
    
    setSearchParams(params);
  }, [searchQuery, selectedStatus, selectedDepartment, sortBy, sortOrder, setSearchParams]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('all');
    setSelectedDepartment('all');
    setSortBy('startDate');
    setSortOrder('asc');
    setPage(1);
  };

  const events = eventsData?.data?.events || [];
  const pagination = eventsData?.data?.pagination || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Discover Events
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore all the amazing events, competitions, and activities happening at Kongu Engineering College
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search events..."
                  className="input-field pl-10 pr-4"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>

            {/* View Toggle and Filter Button */}
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary flex items-center"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                <ChevronDown 
                  className={`w-4 h-4 ml-1 transition-transform duration-200 ${
                    showFilters ? 'rotate-180' : ''
                  }`} 
                />
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-gray-50 rounded-lg border"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="label">Status</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="input-field"
                    >
                      <option value="all">All Status</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  {/* Department Filter */}
                  <div>
                    <label className="label">Department</label>
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="input-field"
                    >
                      <option value="all">All Departments</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept.length > 20 ? `${dept.substring(0, 20)}...` : dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="label">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="input-field"
                    >
                      <option value="startDate">Date</option>
                      <option value="name">Name</option>
                      <option value="registrationFee">Fee</option>
                      <option value="createdAt">Created</option>
                    </select>
                  </div>

                  {/* Sort Order */}
                  <div>
                    <label className="label">Order</label>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="input-field"
                    >
                      <option value="asc">Ascending</option>
                      <option value="desc">Descending</option>
                    </select>
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="btn-secondary flex items-center"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-gray-600">
              {isLoading 
                ? 'Loading events...' 
                : `Showing ${events.length} of ${pagination.totalEvents || 0} events`
              }
            </p>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-600">Failed to load events. Please try again.</p>
            </div>
          </div>
        )}

        {/* No Results */}
        {!isLoading && !error && events.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-lg p-8 max-w-md mx-auto">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or filters
              </p>
              <button onClick={clearFilters} className="btn-primary">
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Events Grid/List */}
        {!isLoading && !error && events.length > 0 && (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-6'
          }>
            {events.map((event, index) => (
              <EventCard 
                key={event._id} 
                event={event} 
                viewMode={viewMode} 
                index={index} 
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !error && pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={!pagination.hasPrevPage}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              
              <button
                onClick={() => setPage(page + 1)}
                disabled={!pagination.hasNextPage}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Event Card Component
const EventCard = ({ event, viewMode, index, isAuthenticated }) => {
  const isRegistrationOpen = event.isActive && new Date(event.registrationDeadline || event.date) > new Date();
  const statusColor = event.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  const daysUntil = Math.ceil((new Date(event.date) - new Date()) / (1000 * 60 * 60 * 24)) + ' days to go';

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="card card-hover flex flex-col md:flex-row"
      >
        <div className="md:w-1/3">
          <img
            src={getImageUrl(event.image)}
            alt={event.title}
            className="w-full h-48 md:h-full object-cover"
            onError={(e) => {
              console.log('Image failed to load:', e.target.src);
              e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=250&fit=crop';
            }}
            onLoad={() => console.log('Image loaded successfully:', event.title)}
          />
        </div>
        
        <div className="md:w-2/3 p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className={`badge ${statusColor} mb-2`}>
                {event.isActive ? 'Active' : 'Inactive'}
              </span>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {event.title}
              </h3>
            </div>
            {event.registrationFee > 0 && (
              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                ₹{event.registrationFee}
              </div>
            )}
          </div>
          
          <p className="text-gray-600 mb-4 line-clamp-2">
            {event.description}
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              {new Date(event.date).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              {event.location}
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              {event.category}
            </div>
            <div className="text-primary-600 font-medium">
              {daysUntil}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {event.registrationCount || 0} registered
              {event.maxParticipants && ` / ${event.maxParticipants}`}
            </div>
            <Link
              to={`/events/${event._id}`}
              className="btn-primary"
            >
              View Details
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="event-card group"
    >
      <div className="relative overflow-hidden">
        <img
          src={getImageUrl(event.image)}
          alt={event.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            console.log('Image failed to load:', e.target.src);
            e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=250&fit=crop';
          }}
          onLoad={() => console.log('Image loaded successfully:', event.title)}
        />
        <div className="absolute top-4 left-4">
          <span className={`badge ${statusColor}`}>
            {event.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        {event.registrationFee > 0 && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded text-sm font-medium">
            ₹{event.registrationFee}
          </div>
        )}
        {event.userRegistered && (
          <div className="absolute bottom-4 left-4 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
            Registered
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-200">
          {event.title}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-2">
          {event.description}
        </p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-2" />
            {new Date(event.date).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="w-4 h-4 mr-2" />
            {event.location}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Users className="w-4 h-4 mr-2" />
            {event.category}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-primary-600 font-medium">
            {daysUntil}
          </div>
          <Link
            to={`/events/${event._id}`}
            className="btn-primary text-sm"
          >
            View Details
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default EventsPage;
