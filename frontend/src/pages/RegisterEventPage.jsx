import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../services/api';
import { useAuthStore } from '../context/authStore';
import toast from 'react-hot-toast';

function RegisterEventPage() {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    registrationType: 'individual',
    contactDetails: {
      email: user?.email || '',
      primaryPhone: user?.phone || '',
      alternatePhone: ''
    },
    academicDetails: {
      college: user?.college || '',
      department: user?.department || '',
      year: user?.year || '',
      rollNumber: ''
    },
    location: {
      city: user?.city || '',
      state: '',
      pincode: ''
    },
    paymentDetails: {
      amount: 0,
      transactionId: ''
    },
    specialRequirements: '',
    emergencyContact: {
      name: '',
      phone: '',
      relation: ''
    }
  });

 
  const { data: eventData, isLoading, error } = useQuery(
    ['event', eventId],
    () => api.get(`/events/${eventId}`),
    {
      enabled: !!eventId,
    }
  );

  const event = eventData?.data?.event;
  
  // Debug: Log event data to see registration fee
  console.log('Event data:', event);
  console.log('Registration fee:', event?.registrationFee);

  // Handle authentication after we have the event data
  useEffect(() => {
    if (event && !isAuthenticated) {
      toast.info('Please login to register for events');
      navigate('/login');
    }
  }, [event, isAuthenticated, navigate]);

  // Update form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        contactDetails: {
          ...prev.contactDetails,
          email: user.email || '',
          primaryPhone: user.phone || ''
        },
        academicDetails: {
          ...prev.academicDetails,
          college: user.college || '',
          department: user.department || '',
          year: user.year || ''
        },
        location: {
          ...prev.location,
          city: user.city || ''
        }
      }));
    }
  }, [user]);

  // Update payment amount when event data is available
  useEffect(() => {
    if (event) {
      setFormData(prev => ({
        ...prev,
        paymentDetails: {
          ...prev.paymentDetails,
          amount: event.registrationFee || 0
        }
      }));
    }
  }, [event]);

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setSubmitting(true);
      
      // Validate required fields
      if (!formData.contactDetails.email || !formData.contactDetails.primaryPhone) {
        toast.error('Email and phone number are required');
        return;
      }
      
      // Validate phone number format (Indian mobile number)
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(formData.contactDetails.primaryPhone.replace(/\s+/g, ''))) {
        toast.error('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9');
        return;
      }
      
      // Clean phone number (remove spaces)
      formData.contactDetails.primaryPhone = formData.contactDetails.primaryPhone.replace(/\s+/g, '');
      
      // Validate payment screenshot if registration fee exists
      if (event?.registrationFee > 0 && !formData.paymentScreenshot) {
        toast.error('Payment screenshot is required for paid events');
        return;
      }
      
      if (!formData.academicDetails.college || !formData.academicDetails.department || !formData.academicDetails.year) {
        toast.error('Academic details (college, department, year) are required');
        return;
      }
      
      if (!formData.location.city) {
        toast.error('City is required');
        return;
      }

      // Ensure payment amount is set and is a number
      formData.paymentDetails.amount = Number(event?.registrationFee || 0);

      // Clean up optional fields - remove empty strings to avoid validation errors
      const cleanedFormData = { ...formData };
      
      // Remove empty alternate phone
      if (!cleanedFormData.contactDetails.alternatePhone) {
        delete cleanedFormData.contactDetails.alternatePhone;
      }
      
      // Remove empty emergency contact fields
      if (!cleanedFormData.emergencyContact.name) {
        delete cleanedFormData.emergencyContact.name;
      }
      if (!cleanedFormData.emergencyContact.phone) {
        delete cleanedFormData.emergencyContact.phone;
      }
      if (!cleanedFormData.emergencyContact.relation) {
        delete cleanedFormData.emergencyContact.relation;
      }
      
      // Remove empty optional location fields
      if (!cleanedFormData.location.state) {
        delete cleanedFormData.location.state;
      }
      if (!cleanedFormData.location.pincode) {
        delete cleanedFormData.location.pincode;
      }
      
      // Remove empty optional academic fields
      if (!cleanedFormData.academicDetails.rollNumber) {
        delete cleanedFormData.academicDetails.rollNumber;
      }
      
      // Remove empty special requirements
      if (!cleanedFormData.specialRequirements) {
        delete cleanedFormData.specialRequirements;
      }
      
      // Remove empty transaction ID
      if (!cleanedFormData.paymentDetails.transactionId) {
        delete cleanedFormData.paymentDetails.transactionId;
      }

      // Prepare form data for submission (including file upload)
      const submitData = new FormData();
      
      // Add the payment screenshot file if it exists
      if (formData.paymentScreenshot) {
        submitData.append('paymentScreenshot', formData.paymentScreenshot);
      }
      
      // Add form data in the format expected by backend validation
      submitData.append('registrationType', cleanedFormData.registrationType);
      
      // Add contact details
      Object.keys(cleanedFormData.contactDetails).forEach(key => {
        submitData.append(`contactDetails.${key}`, cleanedFormData.contactDetails[key]);
      });
      
      // Add academic details
      Object.keys(cleanedFormData.academicDetails).forEach(key => {
        submitData.append(`academicDetails.${key}`, cleanedFormData.academicDetails[key]);
      });
      
      // Add location details
      Object.keys(cleanedFormData.location).forEach(key => {
        submitData.append(`location.${key}`, cleanedFormData.location[key]);
      });
      
      // Add payment details
      Object.keys(cleanedFormData.paymentDetails).forEach(key => {
        submitData.append(`paymentDetails.${key}`, cleanedFormData.paymentDetails[key]);
      });
      
      // Add other optional fields
      if (cleanedFormData.specialRequirements) {
        submitData.append('specialRequirements', cleanedFormData.specialRequirements);
      }
      
      if (cleanedFormData.emergencyContact) {
        Object.keys(cleanedFormData.emergencyContact).forEach(key => {
          submitData.append(`emergencyContact.${key}`, cleanedFormData.emergencyContact[key]);
        });
      }

      console.log('Sending registration data with file upload');
      const response = await api.post(`/registrations/event/${eventId}`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data && response.data.success) {
        toast.success('Successfully registered for the event!');
        navigate(`/events/${eventId}`);
      }
    } catch (err) {
      console.error('Registration error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Validation errors:', err.response?.data?.errors);
      
      // Show specific validation errors
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        err.response.data.errors.forEach((error, index) => {
          console.error(`Validation Error ${index + 1}:`, error);
        });
        const validationErrors = err.response.data.errors.map(error => `${error.path}: ${error.msg}`).join('; ');
        toast.error(`Validation errors: ${validationErrors}`);
      } else {
        const errorMessage = err.response?.data?.message || 'Registration failed';
        toast.error(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error loading event</h2>
          <p className="text-red-600 mb-4">
            {error.response?.data?.message || error.message || 'Failed to load event details'}
          </p>
          <button
            onClick={() => navigate('/events')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event not found</h2>
          <p className="text-gray-600 mb-4">The event you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/events')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Registration</h1>
          <p className="text-gray-600">Complete your registration for this event</p>
        </div>

        {/* Event Details Card */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">{event.title}</h2>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Active
            </span>
          </div>
          
          <p className="text-gray-700 mb-4">{event.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(event.date).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            {event.location && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {event.location}
              </div>
            )}
            {event.category && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {event.category}
              </div>
            )}
            {event.registrationCount !== undefined && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {event.registrationCount} registered
                {event.maxParticipants && ` / ${event.maxParticipants}`}
              </div>
            )}
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Registration Details</h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact Details */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Contact Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.contactDetails.email}
                    onChange={(e) => handleInputChange('contactDetails', 'email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.contactDetails.primaryPhone}
                    onChange={(e) => {
                      // Only allow numbers and limit to 10 digits
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      handleInputChange('contactDetails', 'primaryPhone', value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="9876543210"
                    pattern="[6-9][0-9]{9}"
                    maxLength="10"
                  />
                </div>
              </div>
            </div>

            {/* Academic Details */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Academic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    College *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.academicDetails.college}
                    onChange={(e) => handleInputChange('academicDetails', 'college', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your College Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.academicDetails.department}
                    onChange={(e) => handleInputChange('academicDetails', 'department', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Computer Science"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year of Study *
                  </label>
                  <select
                    required
                    value={formData.academicDetails.year}
                    onChange={(e) => handleInputChange('academicDetails', 'year', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    value={formData.academicDetails.rollNumber}
                    onChange={(e) => handleInputChange('academicDetails', 'rollNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Location</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location.city}
                    onChange={(e) => handleInputChange('location', 'city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.location.state}
                    onChange={(e) => handleInputChange('location', 'state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your State"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={formData.location.pincode}
                    onChange={(e) => handleInputChange('location', 'pincode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="123456"
                    pattern="[0-9]{6}"
                  />
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Payment Information</h4>
                
                {/* Payment Amount */}
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <p className="text-blue-800 font-medium text-lg">
                    Registration Fee: ₹{event.registrationFee}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    Please scan the QR code below to make the payment
                  </p>
                </div>

                {/* Payment QR Code Section */}
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-6">
                  <div className="mb-4">
                    <h5 className="text-lg font-semibold text-gray-900 mb-2">Scan QR Code to Pay</h5>
                    <p className="text-sm text-gray-600 mb-4">
                      Use any UPI app (Google Pay, PhonePe, Paytm, etc.) to scan and pay
                    </p>
                  </div>
                  
                  {/* Real UPI QR Code */}
                  <div className="inline-block bg-gray-100 p-4 rounded-lg">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=7598046382@superyes&pn=Kongu Engineering College&am=${event?.registrationFee || 0}&cu=INR&tn=Event Registration Fee`}
                      alt="UPI QR Code"
                      className="w-48 h-48 mx-auto border-2 border-gray-300 rounded-lg"
                    />
                  </div>
                  
                  {/* Payment Instructions */}
                  <div className="mt-4 text-sm text-gray-600">
                    <p className="font-medium mb-2">Payment Instructions:</p>
                    <ol className="text-left max-w-md mx-auto space-y-1">
                      <li>1. Open your UPI app (Google Pay, PhonePe, etc.)</li>
                      <li>2. Scan the QR code above</li>
                      <li>3. Enter amount: ₹{event.registrationFee}</li>
                      <li>4. Complete the payment</li>
                      <li>5. Take a screenshot of the success message</li>
                      <li>6. Upload the screenshot below</li>
                    </ol>
                  </div>
                  
                  {/* Alternative Payment Details */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Alternative Payment Details:</p>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-medium">UPI ID:</span> 7598046382@superyes</p>
                      <p><span className="font-medium">Account:</span> Kongu Engineering College</p>
                      <p><span className="font-medium">Amount:</span> ₹{event.registrationFee}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Screenshot Upload */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h6 className="font-medium text-yellow-800">Important:</h6>
                      <p className="text-sm text-yellow-700 mt-1">
                        Please complete the payment first, then upload the screenshot below to confirm your registration.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Screenshot *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    required={event?.registrationFee > 0}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      paymentScreenshot: e.target.files[0] 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload a screenshot of your payment confirmation (JPG, PNG, etc.)
                  </p>
                </div>
                
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.paymentDetails.transactionId}
                    onChange={(e) => handleInputChange('paymentDetails', 'transactionId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter transaction ID from your payment app"
                  />
                </div>
              </div>

            {/* Special Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Requirements (Optional)
              </label>
              <textarea
                value={formData.specialRequirements}
                onChange={(e) => setFormData(prev => ({ ...prev, specialRequirements: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Any dietary restrictions, accessibility needs, etc."
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <button
                type="button"
                onClick={() => navigate(`/events/${eventId}`)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registering...
                  </span>
                ) : (
                  'Complete Registration'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterEventPage;


