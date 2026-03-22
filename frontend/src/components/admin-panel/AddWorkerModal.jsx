import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_SERVER_URL || 'https://backend.ranx24.com/api';

function AddWorkerModal({ onSave, onClose }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    password: "", // Password field
    state: "",
    district: "",
    city: "",
    pincode: "",
    latitude: "",
    longitude: "",
    aadhaarNumber: "",
    panNumber: "",
    status: "pending",
    workerType: "",
    services: [], // Dynamic services structure: { serviceId, serviceName, categoryName, price, isActive }
    assignedCities: [],
  });

  const [availableServices, setAvailableServices] = useState([]);
  const [allCities, setAllCities] = useState([]);

  // Fetch Services and Cities on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Fetch Services
        const servicesRes = await axios.get(`${API_URL}/services`, config);
        setAvailableServices(servicesRes.data);

        // Fetch Cities
        const citiesRes = await axios.get(`${API_URL}/cities`, config);
        setAllCities(citiesRes.data);
      } catch (err) {
        console.error('Error fetching data', err);
        toast.error('Failed to load initial data');
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- Service Logic ---
  const addService = () => {
    setFormData((prev) => ({
      ...prev,
      services: [
        ...prev.services,
        { serviceId: '', serviceName: '', categoryName: '', price: 0, isActive: true },
      ],
    }));
  };

  const handleServiceSelect = (index, serviceId) => {
    const selectedService = availableServices.find(s => s._id === serviceId);
    if (!selectedService) return;

    const updated = [...formData.services];
    updated[index] = {
      ...updated[index],
      serviceId: selectedService._id,
      serviceName: selectedService.name,
      categoryName: selectedService.category?.name || '',
      price: selectedService.basePrice,
      isActive: true
    };
    setFormData((prev) => ({ ...prev, services: updated }));
  };

  const updateService = (index, field, value) => {
    const updated = [...formData.services];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, services: updated }));
  };

  const removeService = (index) => {
    const updated = formData.services.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, services: updated }));
  };

  // --- City Assignment Logic ---
  const toggleCity = (cityId) => {
    const exists = formData.assignedCities.includes(cityId);
    const updated = exists
      ? formData.assignedCities.filter((c) => c !== cityId)
      : [...formData.assignedCities, cityId];
    setFormData((prev) => ({ ...prev, assignedCities: updated }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Prepare payload
    // Backend expects 'servicePricing' for the dynamic services array
    const payload = {
      ...formData,
      servicePricing: formData.services.map(s => ({
        serviceName: s.serviceName,
        categoryName: s.categoryName,
        price: Number(s.price),
        isActive: s.isActive
      })),
      // Also map simplified arrays if needed for legacy compatibility, though backend creates from servicePricing mostly
      categories: [...new Set(formData.services.map(s => s.categoryName).filter(Boolean))],
      services: formData.services.map(s => s.serviceName).filter(Boolean)
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 px-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl animate-fadeIn border border-gray-200">

        {/* HEADER */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-blue-50 rounded-t-2xl">
          <h2 className="text-xl font-bold text-blue-900">Add New Worker</h2>
          <button
            onClick={onClose}
            className="text-red-500 text-2xl hover:text-red-700 font-bold"
          >
            &times;
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">

          {/* Basic Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
            <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />
            <Input label="Mobile Number" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} required />
            <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>

          {/* Worker Type & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Worker Type" name="workerType" value={formData.workerType} onChange={handleChange} placeholder="e.g. Electrician" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Location Info */}
          <h3 className="text-lg font-semibold text-blue-800 border-b pb-1">Location Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="State" name="state" value={formData.state} onChange={handleChange} />
            <Input label="District" name="district" value={formData.district} onChange={handleChange} />
            <Input label="City" name="city" value={formData.city} onChange={handleChange} />
            <Input label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} />
            <Input label="Latitude" name="latitude" value={formData.latitude} onChange={handleChange} />
            <Input label="Longitude" name="longitude" value={formData.longitude} onChange={handleChange} />
          </div>

          <h3 className="text-lg font-semibold text-blue-800 border-b pb-1">Identity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Aadhaar Number" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} />
            <Input label="PAN Number" name="panNumber" value={formData.panNumber} onChange={handleChange} />
          </div>

          {/* Services Section */}
          <h3 className="text-lg font-semibold text-blue-800 border-b pb-1 flex justify-between items-center">
            <span>Services & Pricing</span>
            <button type="button" onClick={addService} className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200">
              + Add Service
            </button>
          </h3>

          <div className="space-y-2">
            {formData.services.length === 0 && <p className="text-gray-500 text-sm italic">No services added yet.</p>}
            {formData.services.map((svc, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-2 items-end md:items-center border p-3 rounded-lg bg-gray-50">
                <div className="flex-1 w-full">
                  <label className="text-xs text-gray-500">Service</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={svc.serviceId || ''}
                    onChange={(e) => handleServiceSelect(idx, e.target.value)}
                  >
                    <option value="">Select Service</option>
                    {availableServices.map(s => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 w-full">
                  <label className="text-xs text-gray-500">Category</label>
                  <input
                    className="w-full p-2 border rounded bg-gray-100"
                    value={svc.categoryName}
                    readOnly
                  />
                </div>
                <div className="w-24">
                  <label className="text-xs text-gray-500">Price</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={svc.price}
                    onChange={(e) => updateService(idx, 'price', e.target.value)}
                  />
                </div>
                <div className="flex items-center pt-4">
                  <button type="button" onClick={() => removeService(idx)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded">
                    <i className="fa-solid fa-trash"></i> 🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* City Assignment */}
          <h3 className="text-lg font-semibold text-blue-800 border-b pb-1">Assign Cities</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border p-3 rounded bg-gray-50">
            {allCities.map((city) => (
              <label key={city._id} className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={formData.assignedCities.includes(city._id)}
                  onChange={() => toggleCity(city._id)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                {city.name}
              </label>
            ))}
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 shadow font-bold"
            >
              Add Worker
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* REUSABLE INPUT COMPONENT */
function Input({ label, name, value, onChange, type = "text", required, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

export default AddWorkerModal;
