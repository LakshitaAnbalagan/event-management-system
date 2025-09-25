import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../services/api';
import toast from 'react-hot-toast';

function EventPrizes() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    position: 'all'
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPrize, setEditingPrize] = useState(null);

  // Fetch prizes data
  const { data: prizesData, isLoading, error } = useQuery(
    ['event-prizes', eventId, filters],
    () => api.get(`/admin/test-events/${eventId}/prizes`, { params: filters }),
    {
      enabled: !!eventId,
      keepPreviousData: true
    }
  );

  // Fetch registrations for winner selection
  const { data: registrationsData } = useQuery(
    ['event-registrations-for-prizes', eventId],
    () => api.get(`/admin/events/${eventId}/registrations`, { params: { limit: 1000, status: 'approved' } }),
    {
      enabled: !!eventId
    }
  );

  // Add prize mutation
  const addPrizeMutation = useMutation(
    (prizeData) => api.post(`/admin/events/${eventId}/prizes`, prizeData),
    {
      onSuccess: () => {
        toast.success('Prize added successfully');
        queryClient.invalidateQueries(['event-prizes', eventId]);
        setShowAddModal(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to add prize');
      }
    }
  );

  // Update prize mutation
  const updatePrizeMutation = useMutation(
    ({ prizeId, prizeData }) => api.put(`/admin/prizes/${prizeId}`, prizeData),
    {
      onSuccess: () => {
        toast.success('Prize updated successfully');
        queryClient.invalidateQueries(['event-prizes', eventId]);
        setEditingPrize(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update prize');
      }
    }
  );

  // Delete prize mutation
  const deletePrizeMutation = useMutation(
    (prizeId) => api.delete(`/admin/prizes/${prizeId}`),
    {
      onSuccess: () => {
        toast.success('Prize deleted successfully');
        queryClient.invalidateQueries(['event-prizes', eventId]);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete prize');
      }
    }
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handleAddPrize = () => {
    setShowAddModal(true);
  };

  const handleEditPrize = (prize) => {
    setEditingPrize(prize);
  };

  const handleDeletePrize = (prizeId) => {
    if (window.confirm('Are you sure you want to delete this prize?')) {
      deletePrizeMutation.mutate(prizeId);
    }
  };

  const submitPrize = (prizeData) => {
    const formData = new FormData();
    Object.keys(prizeData).forEach(key => {
      if (key === 'prizeImage' && prizeData[key]) {
        formData.append('prizeImage', prizeData[key]);
      } else if (key === 'teamMembers' && Array.isArray(prizeData[key])) {
        formData.append(key, JSON.stringify(prizeData[key]));
      } else if (prizeData[key] !== null && prizeData[key] !== undefined) {
        formData.append(key, prizeData[key]);
      }
    });

    if (editingPrize) {
      updatePrizeMutation.mutate({ prizeId: editingPrize._id, prizeData: formData });
    } else {
      addPrizeMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading prizes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('EventPrizes error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-red-600 mb-4">
            {error.message || 'Failed to fetch event prizes'}
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

  const { event, prizes, statistics, pagination } = prizesData?.data || {};
  const registrations = registrationsData?.data?.registrations || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Event Prizes</h1>
              <p className="text-gray-600 mt-2">{event?.name}</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleAddPrize}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Add Prize
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Prizes</h3>
            <p className="text-3xl font-bold text-purple-600">{statistics?.totalPrizes || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">1st Place</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {statistics?.prizeStats?.find(s => s._id === '1st')?.count || 0}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">2nd Place</h3>
            <p className="text-3xl font-bold text-gray-600">
              {statistics?.prizeStats?.find(s => s._id === '2nd')?.count || 0}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">3rd Place</h3>
            <p className="text-3xl font-bold text-orange-600">
              {statistics?.prizeStats?.find(s => s._id === '3rd')?.count || 0}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
              <select
                value={filters.position}
                onChange={(e) => handleFilterChange('position', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Positions</option>
                <option value="1st">1st Place</option>
                <option value="2nd">2nd Place</option>
                <option value="3rd">3rd Place</option>
                <option value="participation">Participation</option>
                <option value="special">Special Prize</option>
                <option value="consolation">Consolation Prize</option>
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
              </select>
            </div>
          </div>
        </div>

        {/* Prizes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {prizes?.map((prize) => (
            <div key={prize._id} className="bg-white rounded-lg shadow overflow-hidden">
              {prize.prizeImage?.url && (
                <img
                  src={prize.prizeImage.url}
                  alt={prize.prizeName}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{prize.prizeName}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    prize.position === '1st' ? 'bg-yellow-100 text-yellow-800' :
                    prize.position === '2nd' ? 'bg-gray-100 text-gray-800' :
                    prize.position === '3rd' ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {prize.position}
                  </span>
                </div>
                
                {prize.prizeDescription && (
                  <p className="text-gray-600 text-sm mb-3">{prize.prizeDescription}</p>
                )}
                
                {prize.prizeValue > 0 && (
                  <div className="text-lg font-bold text-green-600 mb-3">
                    ₹{prize.prizeValue.toLocaleString()}
                  </div>
                )}

                {/* Winner Information */}
                <div className="border-t pt-3 mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Winner:</h4>
                  {prize.winner.type === 'individual' ? (
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {prize.winner.user?.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {prize.winner.user?.email}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Team: {prize.winner.teamName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {prize.winner.teamMembers?.length} members
                      </div>
                    </div>
                  )}
                  {prize.winner.registration && (
                    <div className="text-xs text-blue-600 mt-1">
                      Reg: {prize.winner.registration.registrationNumber}
                    </div>
                  )}
                </div>

                {/* Certificate Status */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600">Certificate:</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    prize.certificateIssued
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {prize.certificateIssued ? 'Issued' : 'Pending'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditPrize(prize)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePrize(prize._id)}
                    className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>

                {/* Award Details */}
                <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                  <div>Awarded by: {prize.awardedBy?.name}</div>
                  <div>Date: {new Date(prize.awardedAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {prizes?.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-400 text-lg mb-2">No prizes found</div>
            <p className="text-gray-600 mb-4">
              {filters.position !== 'all' 
                ? 'Try adjusting your filters to see more results.'
                : 'No prizes have been added for this event yet.'
              }
            </p>
            <button
              onClick={handleAddPrize}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Add First Prize
            </button>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 rounded-lg shadow">
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
                          ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
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

      {/* Add/Edit Prize Modal */}
      {(showAddModal || editingPrize) && (
        <PrizeModal
          prize={editingPrize}
          registrations={registrations}
          onClose={() => {
            setShowAddModal(false);
            setEditingPrize(null);
          }}
          onSubmit={submitPrize}
          isLoading={addPrizeMutation.isLoading || updatePrizeMutation.isLoading}
        />
      )}
    </div>
  );
}

// Prize Modal Component
function PrizeModal({ prize, registrations, onClose, onSubmit, isLoading }) {
  const [prizeData, setPrizeData] = useState({
    prizeName: prize?.prizeName || '',
    prizeDescription: prize?.prizeDescription || '',
    position: prize?.position || '1st',
    prizeValue: prize?.prizeValue || 0,
    currency: prize?.currency || 'INR',
    winnerType: prize?.winner?.type || 'individual',
    registrationId: prize?.winner?.registration?._id || '',
    certificateIssued: prize?.certificateIssued || false,
    certificateNumber: prize?.certificateNumber || '',
    notes: prize?.notes || '',
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

  const selectedRegistration = registrations.find(r => r._id === prizeData.registrationId);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {prize ? 'Edit Prize' : 'Add Prize'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prize Name *
                </label>
                <input
                  type="text"
                  value={prizeData.prizeName}
                  onChange={(e) => setPrizeData(prev => ({ ...prev, prizeName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                  placeholder="e.g., First Prize, Best Performance"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position *
                </label>
                <select
                  value={prizeData.position}
                  onChange={(e) => setPrizeData(prev => ({ ...prev, position: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={prizeData.prizeDescription}
                onChange={(e) => setPrizeData(prev => ({ ...prev, prizeDescription: e.target.value }))}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Prize description..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prize Value
                </label>
                <input
                  type="number"
                  value={prizeData.prizeValue}
                  onChange={(e) => setPrizeData(prev => ({ ...prev, prizeValue: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  min="0"
                  step="0.01"
                  placeholder="Prize value in INR"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Winner Type *
                </label>
                <select
                  value={prizeData.winnerType}
                  onChange={(e) => setPrizeData(prev => ({ ...prev, winnerType: e.target.value, registrationId: '' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                >
                  <option value="individual">Individual</option>
                  <option value="team">Team</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Winner *
              </label>
              <select
                value={prizeData.registrationId}
                onChange={(e) => setPrizeData(prev => ({ ...prev, registrationId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              >
                <option value="">Select a registration...</option>
                {registrations
                  .filter(r => r.registrationType === prizeData.winnerType)
                  .map(registration => (
                    <option key={registration._id} value={registration._id}>
                      {registration.registrationType === 'individual' 
                        ? `${registration.user?.name} (${registration.registrationNumber})`
                        : `${registration.teamName} (${registration.registrationNumber})`
                      }
                    </option>
                  ))
                }
              </select>
            </div>

            {selectedRegistration && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Winner Details:</h4>
                {selectedRegistration.registrationType === 'individual' ? (
                  <div className="text-sm text-gray-600">
                    <div>Name: {selectedRegistration.user?.name}</div>
                    <div>Email: {selectedRegistration.user?.email}</div>
                    <div>College: {selectedRegistration.academicDetails?.college}</div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">
                    <div>Team: {selectedRegistration.teamName}</div>
                    <div>Members: {selectedRegistration.teamMembers?.length}</div>
                    <div>Leader: {selectedRegistration.user?.name}</div>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prize Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="certificateIssued"
                  checked={prizeData.certificateIssued}
                  onChange={(e) => setPrizeData(prev => ({ ...prev, certificateIssued: e.target.checked }))}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="certificateIssued" className="ml-2 block text-sm text-gray-900">
                  Certificate Issued
                </label>
              </div>
              {prizeData.certificateIssued && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certificate Number
                  </label>
                  <input
                    type="text"
                    value={prizeData.certificateNumber}
                    onChange={(e) => setPrizeData(prev => ({ ...prev, certificateNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Certificate number"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={prizeData.notes}
                onChange={(e) => setPrizeData(prev => ({ ...prev, notes: e.target.value }))}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
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
                {isLoading ? 'Saving...' : (prize ? 'Update Prize' : 'Add Prize')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EventPrizes;
