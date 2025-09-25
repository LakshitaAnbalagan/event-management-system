import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../services/api';
import toast from 'react-hot-toast';

function EventRegistrationsDetailed() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: 'all',
    registrationType: 'all',
    search: ''
  });

  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showPrizeModal, setShowPrizeModal] = useState(false);

  // Fetch detailed registrations
  const { data: registrationsData, isLoading, error } = useQuery(
    ['detailed-registrations', eventId, filters],
    () => api.get(`/admin/test-events/${eventId}/registrations/detailed`, { params: filters }),
    {
      enabled: !!eventId,
      keepPreviousData: true
    }
  );

  // Mark attendance mutation
  const markAttendanceMutation = useMutation(
    ({ registrationId, attendanceData }) =>
      api.post(`/admin/test-events/${eventId}/registrations/${registrationId}/attendance`, attendanceData),
    {
      onSuccess: () => {
        toast.success('Attendance marked successfully');
        queryClient.invalidateQueries(['detailed-registrations', eventId]);
        setShowAttendanceModal(false);
        setSelectedRegistration(null);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to mark attendance');
      }
    }
  );

  // Add prize mutation
  const addPrizeMutation = useMutation(
    (prizeData) => api.post(`/admin/test-events/${eventId}/prizes`, prizeData),
    {
      onSuccess: () => {
        toast.success('Prize added successfully');
        queryClient.invalidateQueries(['detailed-registrations', eventId]);
        setShowPrizeModal(false);
        setSelectedRegistration(null);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to add prize');
      }
    }
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handleMarkAttendance = (registration) => {
    setSelectedRegistration(registration);
    setShowAttendanceModal(true);
  };

  const handleAddPrize = (registration) => {
    setSelectedRegistration(registration);
    setShowPrizeModal(true);
  };

  const submitAttendance = (attendanceData) => {
    markAttendanceMutation.mutate({
      registrationId: selectedRegistration._id,
      attendanceData
    });
  };

  const submitPrize = (prizeData) => {
    const payload = {
      ...prizeData,
      registrationId: selectedRegistration._id,
      winnerType: selectedRegistration.registrationType,
    };
    
    if (selectedRegistration.registrationType === 'individual') {
      payload.userId = selectedRegistration.user._id;
    } else {
      payload.teamName = selectedRegistration.teamName;
      payload.teamMembers = selectedRegistration.teamMembers;
    }

    addPrizeMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading registrations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('EventRegistrationsDetailed error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-red-600 mb-4">
            {error.message || 'Failed to load registrations'}
          </p>
          <div className="text-sm text-gray-600 mb-4">
            Event ID: {eventId}
          </div>
          <button
            onClick={() => navigate('/admin/events')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  const { event, registrations, statistics, pagination } = registrationsData?.data || {};

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Event Registrations</h1>
              <p className="text-gray-600 mt-2">{event?.name}</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate(`/admin/events/${eventId}/attendance`)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                View Attendance
              </button>
              <button
                onClick={() => navigate(`/admin/events/${eventId}/prizes`)}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Manage Prizes
              </button>
              <button
                onClick={() => navigate('/admin/events')}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Back to Events
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Registrations</h3>
            <p className="text-3xl font-bold text-blue-600">{statistics?.totalRegistrations || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Present</h3>
            <p className="text-3xl font-bold text-green-600">
              {statistics?.attendanceStats?.find(s => s._id === 'present')?.count || 0}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Absent</h3>
            <p className="text-3xl font-bold text-red-600">
              {statistics?.attendanceStats?.find(s => s._id === 'absent')?.count || 0}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Late</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {statistics?.attendanceStats?.find(s => s._id === 'late')?.count || 0}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search by name, email, phone..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filters.registrationType}
                onChange={(e) => handleFilterChange('registrationType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="individual">Individual</option>
                <option value="team">Team</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Per Page</label>
              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Registrations Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prize
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registrations?.map((registration) => (
                  <tr key={registration._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {registration.user?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {registration.registrationNumber}
                        </div>
                        {registration.registrationType === 'team' && (
                          <div className="text-sm text-blue-600">
                            Team: {registration.teamName}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {registration.contactDetails?.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        {registration.contactDetails?.primaryPhone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        registration.registrationType === 'individual'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {registration.registrationType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        registration.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : registration.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {registration.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {registration.attendance ? (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          registration.attendance.attendanceStatus === 'present'
                            ? 'bg-green-100 text-green-800'
                            : registration.attendance.attendanceStatus === 'late'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {registration.attendance.attendanceStatus}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">Not marked</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {registration.prize ? (
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {registration.prize.prizeName}
                          </div>
                          <div className="text-gray-500">
                            {registration.prize.position}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">No prize</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleMarkAttendance(registration)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Attendance
                        </button>
                        <button
                          onClick={() => handleAddPrize(registration)}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          Prize
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{pagination.currentPage}</span> of{' '}
                    <span className="font-medium">{pagination.totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handleFilterChange('page', page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === pagination.currentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Attendance Modal */}
      {showAttendanceModal && (
        <AttendanceModal
          registration={selectedRegistration}
          onClose={() => {
            setShowAttendanceModal(false);
            setSelectedRegistration(null);
          }}
          onSubmit={submitAttendance}
          isLoading={markAttendanceMutation.isLoading}
        />
      )}

      {/* Prize Modal */}
      {showPrizeModal && (
        <PrizeModal
          registration={selectedRegistration}
          onClose={() => {
            setShowPrizeModal(false);
            setSelectedRegistration(null);
          }}
          onSubmit={submitPrize}
          isLoading={addPrizeMutation.isLoading}
        />
      )}
    </div>
  );
}

// Attendance Modal Component
function AttendanceModal({ registration, onClose, onSubmit, isLoading }) {
  const [attendanceData, setAttendanceData] = useState({
    attendanceStatus: registration.attendance?.attendanceStatus || 'present',
    notes: registration.attendance?.notes || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(attendanceData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Mark Attendance - {registration.user?.name}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attendance Status
              </label>
              <select
                value={attendanceData.attendanceStatus}
                onChange={(e) => setAttendanceData(prev => ({ ...prev, attendanceStatus: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={attendanceData.notes}
                onChange={(e) => setAttendanceData(prev => ({ ...prev, notes: e.target.value }))}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any additional notes..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Prize Modal Component
function PrizeModal({ registration, onClose, onSubmit, isLoading }) {
  const [prizeData, setPrizeData] = useState({
    prizeName: '',
    prizeDescription: '',
    position: '1st',
    prizeValue: 0,
    currency: 'INR',
    notes: '',
    prizeImage: null
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(prizeData);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setPrizeData(prev => ({ ...prev, prizeImage: file }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Add Prize - {registration.user?.name}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prize Name *
              </label>
              <input
                type="text"
                value={prizeData.prizeName}
                onChange={(e) => setPrizeData(prev => ({ ...prev, prizeName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="e.g., First Prize, Best Performance"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position *
              </label>
              <select
                value={prizeData.position}
                onChange={(e) => setPrizeData(prev => ({ ...prev, position: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="1st">1st Place</option>
                <option value="2nd">2nd Place</option>
                <option value="3rd">3rd Place</option>
                <option value="participation">Participation</option>
                <option value="special">Special Prize</option>
                <option value="consolation">Consolation Prize</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prize Value
              </label>
              <input
                type="number"
                value={prizeData.prizeValue}
                onChange={(e) => setPrizeData(prev => ({ ...prev, prizeValue: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="0.01"
                placeholder="Prize value in INR"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={prizeData.prizeDescription}
                onChange={(e) => setPrizeData(prev => ({ ...prev, prizeDescription: e.target.value }))}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Prize description..."
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prize Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={prizeData.notes}
                onChange={(e) => setPrizeData(prev => ({ ...prev, notes: e.target.value }))}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Additional notes..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
              >
                {isLoading ? 'Adding...' : 'Add Prize'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EventRegistrationsDetailed;
