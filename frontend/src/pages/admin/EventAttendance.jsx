import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../../services/api';

function EventAttendance() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: 'all',
    search: ''
  });

  // Fetch attendance data
  const { data: attendanceData, isLoading, error } = useQuery(
    ['event-attendance', eventId, filters],
    () => api.get(`/admin/test-events/${eventId}/attendance`, { params: filters }),
    {
      enabled: !!eventId,
      keepPreviousData: true
    }
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const exportAttendance = async () => {
    const toastId = toast.loading('Exporting attendance data...');
    try {
      const response = await api.get(`/admin/test-events/${eventId}/attendance/export`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance-${eventId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Export successful!', { id: toastId });
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed. Please try again.', { id: toastId });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('EventAttendance error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-red-600 mb-4">
            {error.message || 'Failed to load attendance data'}
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

  const { event, attendance, statistics, pagination } = attendanceData?.data || {};

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Event Attendance</h1>
              <p className="text-gray-600 mt-2">{event?.name}</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={exportAttendance}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Export Attendance
              </button>
              <button
                onClick={() => navigate(`/admin/events/${eventId}/registrations/detailed`)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Back to Registrations
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Registered</h3>
            <p className="text-3xl font-bold text-blue-600">{statistics?.totalRegistrations || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Attendance Marked</h3>
            <p className="text-3xl font-bold text-gray-600">{statistics?.attendanceMarked || 0}</p>
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

        {/* Attendance Rate */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {statistics?.totalRegistrations > 0 
                  ? Math.round(((statistics?.attendanceStats?.find(s => s._id === 'present')?.count || 0) / statistics.totalRegistrations) * 100)
                  : 0}%
              </div>
              <div className="text-sm text-gray-600">Present Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {statistics?.totalRegistrations > 0 
                  ? Math.round((statistics.attendanceMarked / statistics.totalRegistrations) * 100)
                  : 0}%
              </div>
              <div className="text-sm text-gray-600">Attendance Marked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {statistics?.totalRegistrations > 0 
                  ? Math.round(((statistics?.attendanceStats?.find(s => s._id === 'absent')?.count || 0) / statistics.totalRegistrations) * 100)
                  : 0}%
              </div>
              <div className="text-sm text-gray-600">Absent Rate</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Attendance Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
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

        {/* Attendance Table */}
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
                    Registration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-in Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marked By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendance?.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {record.user?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {record.user?.college}
                        </div>
                        <div className="text-sm text-gray-500">
                          {record.user?.department} - {record.user?.year}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {record.user?.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        {record.user?.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {record.registration?.registrationNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          {record.registration?.registrationType}
                        </div>
                        {record.registration?.teamName && (
                          <div className="text-sm text-blue-600">
                            Team: {record.registration.teamName}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        record.attendanceStatus === 'present'
                          ? 'bg-green-100 text-green-800'
                          : record.attendanceStatus === 'late'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {record.attendanceStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.checkInTime ? (
                        new Date(record.checkInTime).toLocaleString()
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {record.markedBy?.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(record.markedAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.notes || <span className="text-gray-400">-</span>}
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
                    {Array.from({ length: Math.min(pagination.totalPages, 10) }, (_, i) => i + 1).map((page) => (
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

        {/* Empty State */}
        {attendance?.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-400 text-lg mb-2">No attendance records found</div>
            <p className="text-gray-600">
              {filters.search || filters.status !== 'all' 
                ? 'Try adjusting your filters to see more results.'
                : 'Attendance has not been marked for any participants yet.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventAttendance;
