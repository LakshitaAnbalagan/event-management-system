import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  Building, 
  Lock,
  Camera,
  Save,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuthStore } from '../context/authStore';
import LoadingSpinner from '../components/LoadingSpinner';

const ProfilePage = () => {
  const { user, updateProfile, changePassword } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile form
  const {
    register: profileRegister,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    setError: setProfileError
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      college: user?.college || 'Kongu Engineering College',
      department: user?.department || '',
      year: user?.year || '',
      city: user?.city || ''
    }
  });

  // Password form
  const {
    register: passwordRegister,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    setError: setPasswordError,
    reset: resetPasswordForm,
    watch
  } = useForm();

  const newPassword = watch('newPassword');

  const departmentOptions = [
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

  const yearOptions = [
    '1st Year',
    '2nd Year',
    '3rd Year',
    '4th Year',
    'Graduate',
    'Post Graduate'
  ];

  // Handle profile update
  const onProfileSubmit = async (data) => {
    setIsUpdating(true);
    try {
      const result = await updateProfile(data);
      if (result.success) {
        // Success toast is shown by the store
      } else {
        setProfileError('root', {
          type: 'manual',
          message: result.message || 'Profile update failed'
        });
      }
    } catch (error) {
      setProfileError('root', {
        type: 'manual',
        message: error.message || 'An unexpected error occurred'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle password change
  const onPasswordSubmit = async (data) => {
    setIsChangingPassword(true);
    try {
      const result = await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      if (result.success) {
        resetPasswordForm();
      } else {
        setPasswordError('root', {
          type: 'manual',
          message: result.message || 'Password change failed'
        });
      }
    } catch (error) {
      setPasswordError('root', {
        type: 'manual',
        message: error.message || 'An unexpected error occurred'
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: User },
    { id: 'security', label: 'Security', icon: Lock }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-gray-600 mt-1">
                Manage your personal information and account security
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{user?.name}</p>
                <p className="text-sm text-gray-500">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Profile Photo Section */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Photo</h2>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center">
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-2xl">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200">
                    <Camera className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{user?.name}</h3>
                  <p className="text-gray-600">{user?.email}</p>
                  <button className="mt-2 text-sm text-primary-600 hover:text-primary-700">
                    Change photo
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Information Form */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
              
              <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="name" className="label">
                      Full Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="name"
                        type="text"
                        className={`input-field pl-10 ${profileErrors.name ? 'input-error' : ''}`}
                        placeholder="Enter your full name"
                        {...profileRegister('name', {
                          required: 'Full name is required',
                          minLength: {
                            value: 2,
                            message: 'Name must be at least 2 characters'
                          }
                        })}
                      />
                    </div>
                    {profileErrors.name && (
                      <p className="error-text">{profileErrors.name.message}</p>
                    )}
                  </div>

                  {/* Email (read-only) */}
                  <div>
                    <label htmlFor="email" className="label">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="input-field pl-10 bg-gray-50 cursor-not-allowed"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="label">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="phone"
                        type="tel"
                        className={`input-field pl-10 ${profileErrors.phone ? 'input-error' : ''}`}
                        placeholder="Enter your phone number"
                        {...profileRegister('phone', {
                          pattern: {
                            value: /^[6-9]\d{9}$/,
                            message: 'Please enter a valid Indian phone number'
                          }
                        })}
                      />
                    </div>
                    {profileErrors.phone && (
                      <p className="error-text">{profileErrors.phone.message}</p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label htmlFor="city" className="label">
                      City
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="city"
                        type="text"
                        className={`input-field pl-10 ${profileErrors.city ? 'input-error' : ''}`}
                        placeholder="Enter your city"
                        {...profileRegister('city')}
                      />
                    </div>
                    {profileErrors.city && (
                      <p className="error-text">{profileErrors.city.message}</p>
                    )}
                  </div>

                  {/* College */}
                  <div>
                    <label htmlFor="college" className="label">
                      College
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="college"
                        type="text"
                        className={`input-field pl-10 ${profileErrors.college ? 'input-error' : ''}`}
                        placeholder="Enter your college name"
                        {...profileRegister('college')}
                      />
                    </div>
                    {profileErrors.college && (
                      <p className="error-text">{profileErrors.college.message}</p>
                    )}
                  </div>

                  {/* Department */}
                  <div>
                    <label htmlFor="department" className="label">
                      Department
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <GraduationCap className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        id="department"
                        className={`input-field pl-10 ${profileErrors.department ? 'input-error' : ''}`}
                        {...profileRegister('department')}
                      >
                        <option value="">Select Department</option>
                        {departmentOptions.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>
                    {profileErrors.department && (
                      <p className="error-text">{profileErrors.department.message}</p>
                    )}
                  </div>

                  {/* Year */}
                  <div>
                    <label htmlFor="year" className="label">
                      Academic Year
                    </label>
                    <select
                      id="year"
                      className={`input-field ${profileErrors.year ? 'input-error' : ''}`}
                      {...profileRegister('year')}
                    >
                      <option value="">Select Year</option>
                      {yearOptions.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                    {profileErrors.year && (
                      <p className="error-text">{profileErrors.year.message}</p>
                    )}
                  </div>
                </div>

                {/* Error Message */}
                {profileErrors.root && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-md p-3"
                  >
                    <div className="flex">
                      <AlertCircle className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
                      <p className="text-sm text-red-600">{profileErrors.root.message}</p>
                    </div>
                  </motion.div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="btn-kongu flex items-center"
                  >
                    {isUpdating ? (
                      <LoadingSpinner size="sm" color="white" />
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Update Profile
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {activeTab === 'security' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Account Info */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">Account Type</p>
                    <p className="text-sm text-gray-600">Your current account role</p>
                  </div>
                  <span className={`badge ${user?.role === 'admin' ? 'badge-info' : 'badge-success'}`}>
                    {user?.role === 'admin' ? 'Administrator' : 'Student'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">Last Login</p>
                    <p className="text-sm text-gray-600">When you last signed in</p>
                  </div>
                  <p className="text-sm text-gray-900">
                    {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </p>
                </div>

                <div className="flex justify-between items-center py-3">
                  <div>
                    <p className="font-medium text-gray-900">Account Status</p>
                    <p className="text-sm text-gray-600">Your account status</p>
                  </div>
                  <span className="badge badge-success flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Change Password */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Change Password</h2>
              <p className="text-gray-600 mb-6">
                Ensure your account is using a long, random password to stay secure.
              </p>
              
              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
                {/* Current Password */}
                <div>
                  <label htmlFor="currentPassword" className="label">
                    Current Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      className={`input-field pl-10 pr-10 ${passwordErrors.currentPassword ? 'input-error' : ''}`}
                      placeholder="Enter your current password"
                      {...passwordRegister('currentPassword', {
                        required: 'Current password is required'
                      })}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="error-text">{passwordErrors.currentPassword.message}</p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label htmlFor="newPassword" className="label">
                    New Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      className={`input-field pl-10 pr-10 ${passwordErrors.newPassword ? 'input-error' : ''}`}
                      placeholder="Enter your new password"
                      {...passwordRegister('newPassword', {
                        required: 'New password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters'
                        },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                          message: 'Password must contain at least one lowercase letter, one uppercase letter, and one number'
                        }
                      })}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="error-text">{passwordErrors.newPassword.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="label">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className={`input-field pl-10 pr-10 ${passwordErrors.confirmPassword ? 'input-error' : ''}`}
                      placeholder="Confirm your new password"
                      {...passwordRegister('confirmPassword', {
                        required: 'Please confirm your new password',
                        validate: (value) =>
                          value === newPassword || 'Passwords do not match'
                      })}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="error-text">{passwordErrors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Error Message */}
                {passwordErrors.root && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-md p-3"
                  >
                    <div className="flex">
                      <AlertCircle className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
                      <p className="text-sm text-red-600">{passwordErrors.root.message}</p>
                    </div>
                  </motion.div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="btn-kongu flex items-center"
                  >
                    {isChangingPassword ? (
                      <LoadingSpinner size="sm" color="white" />
                    ) : (
                      <>
                        <Lock className="w-5 h-5 mr-2" />
                        Update Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
