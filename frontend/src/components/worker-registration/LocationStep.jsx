import React, { useState } from 'react';

export default function LocationStep({ formData, updateFormData, handleNext }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    let newErrors = {};
    if (!formData.state) newErrors.state = 'State is required.';
    if (!formData.district) newErrors.district = 'District is required.';
    if (!formData.city) newErrors.city = 'City is required.';
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
      <h3 className="text-lg font-medium leading-6 text-gray-900">Step 1: Your Location</h3>
      <p className="mt-1 text-sm text-gray-600">Please provide your location details.</p>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">State</label>
          <input
            type="text"
            value={formData.state}
            onChange={(e) => updateFormData({ state: e.target.value })}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.state && <p className="text-red-500 text-xs italic mt-1">{errors.state}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">District</label>
          <input
            type="text"
            value={formData.district}
            onChange={(e) => updateFormData({ district: e.target.value })}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.district && <p className="text-red-500 text-xs italic mt-1">{errors.district}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">City</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => updateFormData({ city: e.target.value })}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.city && <p className="text-red-500 text-xs italic mt-1">{errors.city}</p>}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button type="button" onClick={handleNextClick} className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
          Next
        </button>
      </div>
    </div>
  );
}
