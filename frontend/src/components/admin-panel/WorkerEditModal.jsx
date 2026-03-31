// WorkerEditModal.jsx – Admin UI to edit a worker's details, services (pricing) and assigned cities
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend.ranx24.com/api';

const WorkerEditModal = ({ worker, onClose, onRefresh }) => {
    const [formData, setFormData] = useState({
        firstName: worker.firstName || '',
        lastName: worker.lastName || '',
        mobileNumber: worker.mobileNumber || '',
        status: worker.status || 'pending',
        workerType: worker.workerType || '',
        state: worker.state || worker.location?.state || '',
        district: worker.district || '',
        city: worker.city || worker.location?.city || '',
        pincode: worker.pincode || worker.location?.pincode || '',
        latitude: worker.latitude || '',
        longitude: worker.longitude || '',
        aadhaarNumber: worker.aadhaarNumber || '',
        panNumber: worker.panNumber || '',
        services: worker.servicePricing ? [...worker.servicePricing] : [],
        assignedCities: worker.assignedCities ? [...worker.assignedCities] : [],
    });
    const [allCities, setAllCities] = useState([]);
    const [availableServices, setAvailableServices] = useState([]);

    // Get unique category names from available services
    const uniqueCategories = React.useMemo(() => {
        const cats = availableServices.map(s => s.category?.name).filter(Boolean);
        return [...new Set(cats)].sort();
    }, [availableServices]);

    // Fetch list of all cities and services
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };

                // Fetch Cities
                const citiesRes = await axios.get(`${API_URL}/cities`, config);
                setAllCities(citiesRes.data);

                // Fetch Services
                const servicesRes = await axios.get(`${API_URL}/services`, config);
                setAvailableServices(servicesRes.data);

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

    // Service handling
    const addService = () => {
        setFormData((prev) => ({
            ...prev,
            services: [
                ...prev.services,
                { serviceId: '', serviceName: '', categoryName: '', price: 0, isActive: true },
            ],
        }));
    };

    const handleCategoryChange = (index, categoryName) => {
        const updated = [...formData.services];
        updated[index] = {
            ...updated[index],
            categoryName: categoryName,
            serviceId: '',
            serviceName: '',
            price: 0
        };
        setFormData((prev) => ({ ...prev, services: updated }));
    };

    const handleServiceSelect = (index, serviceId) => {
        const selectedService = availableServices.find(s => s._id === serviceId);
        if (!selectedService) return;

        const updated = [...formData.services];
        updated[index] = {
            ...updated[index],
            serviceId: selectedService._id,
            serviceName: selectedService.name,
            categoryName: selectedService.category?.name || updated[index].categoryName,
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

    // City assignment handling (checkbox list)
    const toggleCity = (cityId) => {
        const exists = formData.assignedCities.includes(cityId);
        const updated = exists
            ? formData.assignedCities.filter((c) => c !== cityId)
            : [...formData.assignedCities, cityId];
        setFormData((prev) => ({ ...prev, assignedCities: updated }));
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // 1. Update basic details
            await axios.put(
                `${API_URL}/admin/workers/${worker._id}`,
                {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    mobileNumber: formData.mobileNumber,
                    status: formData.status,
                    workerType: formData.workerType,
                    state: formData.state,
                    district: formData.district,
                    city: formData.city,
                    pincode: formData.pincode,
                    latitude: formData.latitude,
                    longitude: formData.longitude,
                    aadhaarNumber: formData.aadhaarNumber,
                    panNumber: formData.panNumber
                },
                config
            );

            // 2. Sync services – naive approach: clear all then re‑add
            // First, remove any services not present in new list
            const existingIds = worker.servicePricing?.map((s) => s._id) || [];
            const newIds = formData.services.map((s) => s._id).filter(Boolean);

            // Delete removed services
            for (const id of existingIds) {
                if (!newIds.includes(id)) {
                    await axios.delete(
                        `${API_URL}/admin/workers/${worker._id}/services/${id}`,
                        config
                    );
                }
            }
            // Add / update services
            for (const svc of formData.services) {
                if (svc._id) {
                    // existing – update
                    await axios.put(
                        `${API_URL}/admin/workers/${worker._id}/services/${svc._id}`,
                        {
                            serviceName: svc.serviceName,
                            categoryName: svc.categoryName,
                            price: svc.price,
                            isActive: svc.isActive,
                        },
                        config
                    );
                } else {
                    // new – add
                    await axios.post(
                        `${API_URL}/admin/workers/${worker._id}/services`,
                        {
                            serviceName: svc.serviceName,
                            categoryName: svc.categoryName,
                            price: svc.price,
                        },
                        config
                    );
                }
            }

            // 3. Sync assigned cities – simple replace strategy
            // Remove all existing then add selected
            const currentCities = worker.assignedCities?.map((c) => c.toString()) || [];
            for (const cid of currentCities) {
                if (!formData.assignedCities.includes(cid)) {
                    await axios.delete(
                        `${API_URL}/admin/workers/${worker._id}/cities/${cid}`,
                        config
                    );
                }
            }
            for (const cid of formData.assignedCities) {
                if (!currentCities.includes(cid)) {
                    await axios.post(
                        `${API_URL}/admin/workers/${worker._id}/cities`,
                        { cityId: cid },
                        config
                    );
                }
            }

            toast.success('Worker updated successfully');
            onClose();
            onRefresh();
        } catch (err) {
            console.error(err);
            toast.error('Failed to update worker');
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
            <div className="bg-white glass rounded-2xl shadow-2xl p-6 w-full max-w-3xl mx-auto relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-blue-900 hover:text-red-600 text-xl font-bold"
                >
                    &times;
                </button>
                <h2 className="text-2xl font-bold text-blue-900 mb-4">Edit Worker</h2>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <input
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="First Name"
                            className="w-full border p-2 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <input
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="Last Name"
                            className="w-full border p-2 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                        <input
                            name="mobileNumber"
                            value={formData.mobileNumber}
                            onChange={handleChange}
                            placeholder="Mobile Number"
                            className="w-full border p-2 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Worker Type</label>
                        <input
                            name="workerType"
                            value={formData.workerType}
                            onChange={handleChange}
                            placeholder="Worker Type (e.g. Electrician)"
                            className="w-full border p-2 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                        >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                {/* Location Info */}
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Location Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <input
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            placeholder="State"
                            className="w-full border p-2 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                        <input
                            name="district"
                            value={formData.district}
                            onChange={handleChange}
                            placeholder="District"
                            className="w-full border p-2 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="City"
                            className="w-full border p-2 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                        <input
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleChange}
                            placeholder="Pincode"
                            className="w-full border p-2 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                        <input
                            name="latitude"
                            value={formData.latitude}
                            onChange={handleChange}
                            placeholder="Latitude"
                            className="w-full border p-2 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                        <input
                            name="longitude"
                            value={formData.longitude}
                            onChange={handleChange}
                            placeholder="Longitude"
                            className="w-full border p-2 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number</label>
                        <input
                            name="aadhaarNumber"
                            value={formData.aadhaarNumber}
                            onChange={handleChange}
                            placeholder="Aadhaar Number"
                            className="w-full border p-2 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
                        <input
                            name="panNumber"
                            value={formData.panNumber}
                            onChange={handleChange}
                            placeholder="PAN Number"
                            className="w-full border p-2 rounded"
                        />
                    </div>
                </div>


                {/* Payment Details (Read-Only) */}
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Payment Details (Read-Only)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                        <div className="bg-white px-3 py-2 rounded border text-gray-800">
                            {worker.bankDetails?.bankName || '-'}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                        <div className="bg-white px-3 py-2 rounded border text-gray-800 font-mono">
                            {worker.bankDetails?.accountNumber || '-'}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                        <div className="bg-white px-3 py-2 rounded border text-gray-800 font-mono">
                            {worker.bankDetails?.ifscCode || '-'}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder</label>
                        <div className="bg-white px-3 py-2 rounded border text-gray-800">
                            {worker.bankDetails?.accountHolderName || '-'}
                        </div>
                    </div>
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                        <div className="bg-white px-3 py-2 rounded border text-blue-600 font-semibold font-mono">
                            {worker.upiId || '-'}
                        </div>
                    </div>
                </div>

                {/* Services */}
                <h3 className="text-xl font-semibold text-blue-800 mb-2">Services & Pricing</h3>
                {formData.services.map((svc, idx) => {
                    // Filter services based on chosen category for this row
                    const filteredServices = availableServices.filter(s => s.category?.name === svc.categoryName);

                    return (
                        <div key={idx} className="flex flex-wrap items-center gap-2 mb-2 border p-3 rounded bg-gray-50 border-gray-200">
                            {/* Category Dropdown first */}
                            <div className="flex-1 min-w-[150px]">
                                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Category</label>
                                <select
                                    className="w-full border p-1 rounded bg-white"
                                    value={svc.categoryName}
                                    onChange={(e) => handleCategoryChange(idx, e.target.value)}
                                >
                                    <option value="">Select Category</option>
                                    {uniqueCategories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Service Dropdown (Filtered) */}
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Service</label>
                                <select
                                    className="w-full border p-1 rounded bg-white disabled:bg-gray-100"
                                    value={svc.serviceId || availableServices.find(s => s.name === svc.serviceName)?._id || ''}
                                    onChange={(e) => handleServiceSelect(idx, e.target.value)}
                                    disabled={!svc.categoryName}
                                >
                                    <option value="">Select Service</option>
                                    {filteredServices.map(s => (
                                        <option key={s._id} value={s._id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="w-20">
                                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Price</label>
                                <input
                                    type="number"
                                    placeholder="Price"
                                    value={svc.price}
                                    onChange={(e) => updateService(idx, 'price', e.target.value)}
                                    className="w-full border p-1 rounded bg-white"
                                />
                            </div>

                            <div className="flex items-center gap-1 mt-4">
                                <input
                                    type="checkbox"
                                    checked={svc.isActive}
                                    onChange={(e) => updateService(idx, 'isActive', e.target.checked)}
                                    className="w-4 h-4 cursor-pointer"
                                />
                                <span className="text-xs font-semibold text-gray-600">Active</span>
                            </div>

                            <button
                                onClick={() => removeService(idx)}
                                className="mt-4 text-red-500 hover:text-red-700 p-1"
                                title="Remove Service"
                            >
                                <i className="fa-solid fa-trash-can" />
                            </button>
                        </div>
                    );
                })}
                <button
                    onClick={addService}
                    className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    + Add Service
                </button>

                {/* City Assignment */}
                <h3 className="text-xl font-semibold text-blue-800 mt-6 mb-2">Assign Cities</h3>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border p-2 rounded bg-gray-50">
                    {allCities.map((city) => (
                        <label key={city._id} className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.assignedCities.includes(city._id)}
                                onChange={() => toggleCity(city._id)}
                                className="mr-2"
                            />
                            {city.name}
                        </label>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WorkerEditModal;
