import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  MapPin,
  Users,
  Clock,
  MoreVertical,
  UserCheck,
  Award,
  FileText
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching events from /admin/events...');
      
      const response = await api.get('/admin/events');
      console.log('📊 Events API Response:', response);
      
      if (response.success) {
        console.log('✅ Setting events:', response.data.events);
        setEvents(response.data.events || []);
      } else {
        console.log('❌ Events response failed:', response);
      }
    } catch (error) {
      console.error('❌ Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await api.delete(`/admin/events/${eventId}`);
      if (response.success) {
        setEvents(events.filter(event => event._id !== eventId));
        toast.success('Event deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const handleToggleStatus = async (eventId, currentStatus) => {
    try {
      const response = await api.patch(`/admin/events/${eventId}/status`, {
        isActive: !currentStatus
      });
      if (response.success) {
        setEvents(events.map(event => 
          event._id === eventId 
            ? { ...event, isActive: !currentStatus }
            : event
        ));
        toast.success(`Event ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      }
    } catch (error) {
      console.error('Error updating event status:', error);
      toast.error('Failed to update event status');
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || event.department === filterCategory;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && event.isActive) ||
                         (filterStatus === 'inactive' && !event.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const EventCard = ({ event }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md border hover:shadow-lg transition-shadow"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-semibold text-gray-900">{event.name}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                event.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {event.isActive ? 'Active' : 'Inactive'}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                event.status === 'ongoing' ? 'bg-yellow-100 text-yellow-800' :
                event.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                'bg-red-100 text-red-800'
              }`}>
                {event.status}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(event.startDate).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                {event.venue}
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                {event.totalRegistrations || 0}
                {event.maxParticipants ? `/${event.maxParticipants}` : ''}
              </div>
            </div>
          </div>
        </div>
        
        {/* New Feature Buttons */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Link
            to={`/admin/events/${event._id}/registrations/detailed`}
            className="flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
          >
            <FileText className="w-4 h-4 mr-1" />
            Registrations
          </Link>
          <Link
            to={`/admin/events/${event._id}/attendance`}
            className="flex items-center justify-center px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm"
          >
            <UserCheck className="w-4 h-4 mr-1" />
            Attendance
          </Link>
          <Link
            to={`/admin/events/${event._id}/prizes`}
            className="flex items-center justify-center px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm"
          >
            <Award className="w-4 h-4 mr-1" />
            Prizes
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <Link
              to={`/admin/events/edit/${event._id}`}
              className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
              title="Edit Event"
            >
              <Edit className="w-4 h-4" />
            </Link>
            <button
              onClick={() => handleDeleteEvent(event._id)}
              className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
              title="Delete Event"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
              event.department === 'technical' ? 'bg-blue-100 text-blue-800' :
              event.department === 'cultural' ? 'bg-purple-100 text-purple-800' :
              event.department === 'sports' ? 'bg-green-100 text-green-800' :
              event.department === 'workshop' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {event.department?.charAt(0).toUpperCase() + event.department?.slice(1)}
            </span>
            
            <div className="text-xs text-gray-500">
              Created {new Date(event.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events Management</h1>
          <p className="text-gray-600 mt-1">Create and manage events for students</p>
        </div>
        <Link
          to="/admin/events/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Departments</option>
              <option value="technical">Technical</option>
              <option value="cultural">Cultural</option>
              <option value="sports">Sports</option>
              <option value="workshop">Workshop</option>
              <option value="seminar">Seminar</option>
              <option value="competition">Competition</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {events.length === 0 ? 'No events created yet' : 'No events match your filters'}
          </h3>
          <p className="text-gray-600 mb-6">
            {events.length === 0 
              ? 'Create your first event to get started with event management.'
              : 'Try adjusting your search or filter criteria.'
            }
          </p>
          {events.length === 0 && (
            <Link
              to="/admin/events/new"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Event
            </Link>
          )}
        </div>
      )}

      {/* Stats */}
      {events.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{events.length}</div>
              <div className="text-sm text-gray-600">Total Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {events.filter(e => e.isActive).length}
              </div>
              <div className="text-sm text-gray-600">Active Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {events.reduce((sum, e) => sum + (e.totalRegistrations || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Registrations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {events.reduce((sum, e) => sum + (e.maxParticipants || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Capacity</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminEvents;


