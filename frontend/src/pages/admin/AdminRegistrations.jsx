import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Users, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  GraduationCap,
  Calendar,
  MapPin,
  User,
  Download,
  Eye
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

function AdminRegistrations() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (id) {
      fetchEventRegistrations();
    }
  }, [id]);

  const fetchEventRegistrations = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/events/${id}/registrations`);
      if (response.success) {
        setEvent(response.data.event);
        setRegistrations(response.data.registrations || []);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast.error('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  const filteredRegistrations = registrations.filter(registration => {
    if (!registration.user) return false;
    const matchesSearch = registration.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         registration.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const RegistrationCard = ({ registration }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md border hover:shadow-lg transition-shadow p-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-lg">
              {registration.user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{registration.user.name}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm text-gray-600">#{registration._id.slice(-6)}</span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                registration.status === 'confirmed' 
                  ? 'bg-green-100 text-green-800' 
                  : registration.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {registration.status || 'Pending'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
        <div className="flex items-center">
          <Mail className="w-4 h-4 mr-2" />
          {registration.user.email}
        </div>
        {registration.user.phone && (
          <div className="flex items-center">
            <Phone className="w-4 h-4 mr-2" />
            {registration.user.phone}
          </div>
        )}
        {registration.user.college && (
          <div className="flex items-center">
            <GraduationCap className="w-4 h-4 mr-2" />
            {registration.user.college}
          </div>
        )}
        {registration.user.department && (
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            {registration.user.department}
          </div>
        )}
        {registration.user.year && (
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            {registration.user.year}
          </div>
        )}
        {registration.user.city && (
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            {registration.user.city}
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          Registered {new Date(registration.createdAt).toLocaleDateString()}
        </div>
        <div className="text-xs text-gray-500">
          {new Date(registration.createdAt).toLocaleTimeString()}
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

  if (!event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Event not found</h2>
        <p className="text-gray-600 mb-4">The event you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/admin/events')}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/events')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Event Registrations</h1>
            <p className="text-gray-600 mt-1">{event.title}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Event Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Event Details</h3>
            <p className="text-lg font-semibold text-gray-900 mt-1">{event.title}</p>
            <div className="flex items-center mt-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(event.date).toLocaleDateString()}
            </div>
            <div className="flex items-center mt-1 text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-1" />
              {event.location}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Registration Stats</h3>
            <p className="text-2xl font-bold text-blue-600 mt-1">{registrations.length}</p>
            <p className="text-sm text-gray-600">Total Registrations</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Status Breakdown</h3>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Confirmed:</span>
                <span className="font-medium text-green-600">
                  {registrations.filter(r => r.status === 'confirmed').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pending:</span>
                <span className="font-medium text-yellow-600">
                  {registrations.filter(r => !r.status || r.status === 'pending').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search registrations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Registrations Grid */}
      {filteredRegistrations.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRegistrations.map((registration) => (
            <RegistrationCard key={registration._id} registration={registration} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {registrations.length === 0 ? 'No registrations yet' : 'No registrations match your search'}
          </h3>
          <p className="text-gray-600">
            {registrations.length === 0 
              ? 'No one has registered for this event yet.'
              : 'Try adjusting your search criteria.'
            }
          </p>
        </div>
      )}
    </div>
  );
}

export default AdminRegistrations;


