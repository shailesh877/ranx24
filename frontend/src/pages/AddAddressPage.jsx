import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaMapMarkerAlt, FaSave } from 'react-icons/fa';
import toast from 'react-hot-toast';
// Navbar removed to prevent double rendering
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend.ranx24.com/api';

// @desc    Add Address Page
// Ensure type matches backend enum: 'home', 'work', 'other'

// ... imports remain the same

export default function AddAddressPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        type: 'home', // Default to valid enum
        addressLine1: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation using backend field names
        if (!formData.addressLine1 || !formData.city || !formData.state || !formData.pincode) {
            toast.error('Please fill all required fields');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            await axios.post(`${API_URL}/addresses`, formData, config);
            toast.success('Address added successfully!');
            navigate('/my-address');
        } catch (error) {
            console.error('Error adding address:', error);
            toast.error(error.response?.data?.message || 'Failed to add address');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar removed */}

            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <FaMapMarkerAlt className="text-blue-600" />
                        Add New Address
                    </h1>
                    <p className="text-gray-600 mt-1">Fill in the details below</p>
                </div>

                {/* Form */}
                <Card>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Address Type (Select) */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Address Type
                            </label>
                            <div className="flex gap-4">
                                {['home', 'work', 'other'].map((type) => (
                                    <label key={type} className="flex-1 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="type"
                                            value={type}
                                            checked={formData.type === type}
                                            onChange={handleChange}
                                            className="sr-only peer"
                                        />
                                        <div className="flex items-center justify-center py-2 px-4 border rounded-lg peer-checked:bg-blue-50 peer-checked:border-blue-500 peer-checked:text-blue-600 capitalize hover:bg-gray-50 transition-colors">
                                            {type}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Street (Address Line 1) */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Street Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="addressLine1"
                                value={formData.addressLine1}
                                onChange={handleChange}
                                placeholder="House/Flat No., Building Name, Street"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* City & State */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    City <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="City"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    State <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    placeholder="State"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Pincode (ZipCode) */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Pincode <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="pincode"
                                value={formData.pincode}
                                onChange={handleChange}
                                placeholder="6-digit PIN code"
                                required
                                maxLength={6}
                                pattern="[0-9]{6}"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Default Checkbox */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="isDefault"
                                id="isDefault"
                                checked={formData.isDefault}
                                onChange={handleChange}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                                Set as default address
                            </label>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => navigate('/my-address')}
                                fullWidth
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                loading={loading}
                                icon={<FaSave />}
                                fullWidth
                            >
                                Save Address
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
}
