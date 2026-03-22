import React, { useState } from 'react';

export default function PersonalDetailsStep({ formData, updateFormData, handleNext, handlePrev }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    let newErrors = {};
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First Name is required.';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last Name is required.';
    }
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile Number is required.';
    } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Mobile Number must be 10 digits.';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format.';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextClick = () => {
    if (validate()) {
      handleNext();
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-medium leading-6 text-gray-900">Step 2: Personal Details</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
          <input
            type="text"
            id="firstName"
            value={formData.firstName}
            onChange={(e) => { updateFormData({ firstName: e.target.value }); setErrors(prev => ({ ...prev, firstName: '' })); }}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.firstName && <p className="text-red-500 text-xs italic mt-1">{errors.firstName}</p>}
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
          <input
            type="text"
            id="lastName"
            value={formData.lastName}
            onChange={(e) => { updateFormData({ lastName: e.target.value }); setErrors(prev => ({ ...prev, lastName: '' })); }}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.lastName && <p className="text-red-500 text-xs italic mt-1">{errors.lastName}</p>}
        </div>
      </div>

      <div className="mt-6">
        <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700">Mobile Number</label>
        <input
          type="text"
          id="mobileNumber"
          value={formData.mobileNumber}
          onChange={(e) => { updateFormData({ mobileNumber: e.target.value }); setErrors(prev => ({ ...prev, mobileNumber: '' })); }}
          placeholder="Enter your 10-digit mobile number"
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.mobileNumber && <p className="text-red-500 text-xs italic mt-1">{errors.mobileNumber}</p>}
      </div>

      <div className="mt-6">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
        <input
          type="email"
          id="email"
          value={formData.email || ''}
          onChange={(e) => { updateFormData({ email: e.target.value }); setErrors(prev => ({ ...prev, email: '' })); }}
          placeholder="Enter your email address"
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.email && <p className="text-red-500 text-xs italic mt-1">{errors.email}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            id="password"
            value={formData.password || ''}
            onChange={(e) => { updateFormData({ password: e.target.value }); setErrors(prev => ({ ...prev, password: '' })); }}
            placeholder="Create a password"
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.password && <p className="text-red-500 text-xs italic mt-1">{errors.password}</p>}
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={formData.confirmPassword || ''}
            onChange={(e) => { updateFormData({ confirmPassword: e.target.value }); setErrors(prev => ({ ...prev, confirmPassword: '' })); }}
            placeholder="Confirm your password"
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.confirmPassword && <p className="text-red-500 text-xs italic mt-1">{errors.confirmPassword}</p>}
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <button type="button" onClick={handlePrev} className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300">
          Previous
        </button>
        <button type="button" onClick={handleNextClick} className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
          Next
        </button>
      </div>
    </div>
  );
}
