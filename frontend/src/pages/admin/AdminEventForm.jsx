import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  FileText, 
  Image as ImageIcon,
  Save,
  ArrowLeft
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

function AdminEventForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      maxParticipants: '',
      category: 'technical',
      department: '',
      registrationDeadline: '',
      requirements: '',
      contactEmail: '',
      contactPhone: '',
      registrationFee: 0,
      isActive: true
    }
  });

  useEffect(() => {
    if (isEdit && id) {
      fetchEvent();
    }
  }, [id, isEdit]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/events/${id}`);
      if (response.success) {
        const event = response.data.event;
        // Format date and time for form inputs
        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toISOString().split('T')[0];
        const formattedTime = eventDate.toTimeString().split(' ')[0].slice(0, 5);
        
        reset({
          ...event,
          date: formattedDate,
          time: formattedTime,
          registrationDeadline: event.registrationDeadline ? 
            new Date(event.registrationDeadline).toISOString().split('T')[0] : ''
        });
        
        if (event.image) {
          setImagePreview(event.image);
        }
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Failed to load event data');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Combine date and time
      const eventStartDateTime = new Date(`${data.date}T${data.time}`);
      // Set end date to 3 hours after start date (default event duration)
      const eventEndDateTime = new Date(eventStartDateTime.getTime() + (3 * 60 * 60 * 1000));
      
      const formData = new FormData();
      // Map frontend field names to backend expected names
      formData.append('name', data.title);
      formData.append('description', data.description);
      formData.append('startDate', eventStartDateTime.toISOString());
      formData.append('endDate', eventEndDateTime.toISOString());
      formData.append('venue', data.location);
      formData.append('department', data.department);
      formData.append('maxParticipants', data.maxParticipants);
      formData.append('registrationFee', data.registrationFee || 0);
      formData.append('instructions', data.requirements || '');
      
      // Payment details
      const paymentDetails = {
        upiId: '',
        phoneNumber: data.contactPhone || ''
      };
      formData.append('paymentDetails', JSON.stringify(paymentDetails));
      
      if (data.registrationDeadline) {
        formData.append('registrationDeadline', new Date(data.registrationDeadline).toISOString());
      } else {
        // Set default registration deadline to 1 day before event
        const defaultDeadline = new Date(eventStartDateTime.getTime() - (24 * 60 * 60 * 1000));
        formData.append('registrationDeadline', defaultDeadline.toISOString());
      }
      
      // Handle image upload - backend expects 'poster' field
      if (data.image && data.image[0]) {
        formData.append('poster', data.image[0]);
      }

      const url = isEdit ? `/admin/events/${id}` : '/admin/events';
      const method = isEdit ? 'put' : 'post';
      
      const response = await api[method](url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.success) {
        toast.success(isEdit ? 'Event updated successfully!' : 'Event created successfully!');
        navigate('/admin/events');
      }
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error(error.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading && isEdit) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/admin/events')}
          className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Event' : 'Create New Event'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? 'Update event details' : 'Fill in the details to create a new event'}
          </p>
        </div>
      </div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-lg shadow-md p-6 space-y-6"
      >
        {/* Basic Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Title */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Title *
            </label>
            <input
              type="text"
              {...register('title', { required: 'Event title is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter event title"
            />
            {errors.title && (
              <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe your event"
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Event Date *
            </label>
            <input
              type="date"
              {...register('date', { required: 'Event date is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.date && (
              <p className="text-red-600 text-sm mt-1">{errors.date.message}</p>
            )}
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Event Time *
            </label>
            <input
              type="time"
              {...register('time', { required: 'Event time is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.time && (
              <p className="text-red-600 text-sm mt-1">{errors.time.message}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Location *
            </label>
            <input
              type="text"
              {...register('location', { required: 'Location is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Event location"
            />
            {errors.location && (
              <p className="text-red-600 text-sm mt-1">{errors.location.message}</p>
            )}
          </div>

          {/* Max Participants */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Max Participants *
            </label>
            <input
              type="number"
              {...register('maxParticipants', { 
                required: 'Max participants is required',
                min: { value: 1, message: 'Must be at least 1' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Maximum number of participants"
            />
            {errors.maxParticipants && (
              <p className="text-red-600 text-sm mt-1">{errors.maxParticipants.message}</p>
            )}
          </div>

          {/* Registration Fee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Registration Fee (₹)
            </label>
            <input
              type="number"
              {...register('registrationFee', { 
                min: { value: 0, message: 'Fee cannot be negative' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0 for free events, or enter amount"
            />
            {errors.registrationFee && (
              <p className="text-red-600 text-sm mt-1">{errors.registrationFee.message}</p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              Set to 0 for free events. Students will see payment QR code for paid events.
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              {...register('category')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="technical">Technical</option>
              <option value="cultural">Cultural</option>
              <option value="sports">Sports</option>
              <option value="workshop">Workshop</option>
              <option value="seminar">Seminar</option>
              <option value="competition">Competition</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department *
            </label>
            <select
              {...register('department', { required: 'Department is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Department</option>
              <option value="Computer Science and Engineering">Computer Science and Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics and Communication Engineering">Electronics and Communication Engineering</option>
              <option value="Electrical and Electronics Engineering">Electrical and Electronics Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
              <option value="Artificial Intelligence Department">Artificial Intelligence Department</option>
              <option value="General">General</option>
            </select>
            {errors.department && (
              <p className="text-red-600 text-sm mt-1">{errors.department.message}</p>
            )}
          </div>

          {/* Registration Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Registration Deadline
            </label>
            <input
              type="date"
              {...register('registrationDeadline')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Contact Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Email *
            </label>
            <input
              type="email"
              {...register('contactEmail', { 
                required: 'Contact email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email address'
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="contact@example.com"
            />
            {errors.contactEmail && (
              <p className="text-red-600 text-sm mt-1">{errors.contactEmail.message}</p>
            )}
          </div>

          {/* Contact Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Phone
            </label>
            <input
              type="tel"
              {...register('contactPhone')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Phone number"
            />
          </div>

          {/* Requirements */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Requirements/Prerequisites
            </label>
            <textarea
              {...register('requirements')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any requirements or prerequisites for participants"
            />
          </div>

          {/* Image Upload */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ImageIcon className="w-4 h-4 inline mr-1" />
              Event Image
            </label>
            <input
              type="file"
              accept="image/*"
              {...register('image')}
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {imagePreview && (
              <div className="mt-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-48 h-32 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          {/* Active Status */}
          <div className="lg:col-span-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('isActive')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Event is active and visible to students
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate('/admin/events')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isEdit ? 'Update Event' : 'Create Event'}
          </button>
        </div>
      </motion.form>
    </div>
  );
}

export default AdminEventForm;


