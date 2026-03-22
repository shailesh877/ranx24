import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CouponManagement = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);

    const [formData, setFormData] = useState({
        code: '',
        description: '',
        type: 'percentage',
        value: '',
        minOrderValue: '',
        maxDiscount: '',
        usageLimit: '',
        userUsageLimit: '1',
        validFrom: '',
        validUntil: '',
        applicableOn: 'all'
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const { data } = await api.get('/coupons');
            setCoupons(data);
        } catch (error) {
            console.error('Error fetching coupons:', error);
            toast.error('Failed to load coupons');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingCoupon) {
                await api.put(
                    `/coupons/${editingCoupon._id}`,
                    formData
                );
                toast.success('Coupon updated successfully');
            } else {
                await api.post(
                    '/coupons',
                    formData
                );
                toast.success('Coupon created successfully');
            }

            resetForm();
            fetchCoupons();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save coupon');
        }
    };

    const handleEdit = (coupon) => {
        setEditingCoupon(coupon);
        setFormData({
            code: coupon.code,
            description: coupon.description,
            type: coupon.type,
            value: coupon.value,
            minOrderValue: coupon.minOrderValue,
            maxDiscount: coupon.maxDiscount || '',
            usageLimit: coupon.usageLimit || '',
            userUsageLimit: coupon.userUsageLimit,
            validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().slice(0, 16) : '',
            validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().slice(0, 16) : '',
            applicableOn: coupon.applicableOn
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this coupon?')) return;

        try {
            await api.delete(`/coupons/${id}`);
            toast.success('Coupon deleted successfully');
            fetchCoupons();
        } catch (error) {
            toast.error('Failed to delete coupon');
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await api.patch(`/coupons/${id}/toggle`);
            toast.success('Coupon status updated');
            fetchCoupons();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const resetForm = () => {
        setFormData({
            code: '',
            description: '',
            type: 'percentage',
            value: '',
            minOrderValue: '',
            maxDiscount: '',
            usageLimit: '',
            userUsageLimit: '1',
            validFrom: '',
            validUntil: '',
            applicableOn: 'all'
        });
        setEditingCoupon(null);
        setShowModal(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-blue-900">Coupon Management</h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition cursor-pointer"
                >
                    <i className="fa-solid fa-plus mr-2"></i>
                    Add Coupon
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <i className="fa-solid fa-spinner fa-spin text-4xl text-blue-600"></i>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                <tr>
                                    <th className="px-4 py-3 text-left">Code</th>
                                    <th className="px-4 py-3 text-left">Type</th>
                                    <th className="px-4 py-3 text-left">Value</th>
                                    <th className="px-4 py-3 text-left">Usage</th>
                                    <th className="px-4 py-3 text-left">Valid Until</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                    <th className="px-4 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {coupons.map((coupon) => (
                                    <tr key={coupon._id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3 font-mono font-bold text-blue-600">{coupon.code}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${coupon.type === 'percentage' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                {coupon.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                                        </td>
                                        <td className="px-4 py-3">
                                            {coupon.usageCount} / {coupon.usageLimit || '∞'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {new Date(coupon.validUntil).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => handleToggleStatus(coupon._id)}
                                                className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
                                            >
                                                {coupon.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => handleEdit(coupon)}
                                                className="text-blue-600 hover:text-blue-800 mx-1 cursor-pointer"
                                            >
                                                <i className="fa-solid fa-edit"></i>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(coupon._id)}
                                                className="text-red-600 hover:text-red-800 mx-1 cursor-pointer"
                                            >
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 cursor-pointer" onClick={resetForm}>
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6">
                            <h3 className="text-2xl font-bold text-blue-900 mb-6">
                                {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Coupon Code*</label>
                                        <input
                                            type="text"
                                            name="code"
                                            value={formData.code}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Type*</label>
                                        <select
                                            name="type"
                                            value={formData.type}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="percentage">Percentage</option>
                                            <option value="fixed">Fixed Amount</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description*</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        rows="2"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Value* {formData.type === 'percentage' ? '(%)' : '(₹)'}
                                        </label>
                                        <input
                                            type="number"
                                            name="value"
                                            value={formData.value}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            min="0"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Min Order Value (₹)</label>
                                        <input
                                            type="number"
                                            name="minOrderValue"
                                            value={formData.minOrderValue}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            min="0"
                                        />
                                    </div>
                                </div>

                                {formData.type === 'percentage' && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Max Discount (₹)</label>
                                        <input
                                            type="number"
                                            name="maxDiscount"
                                            value={formData.maxDiscount}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            min="0"
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Total Usage Limit</label>
                                        <input
                                            type="number"
                                            name="usageLimit"
                                            value={formData.usageLimit}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            min="1"
                                            placeholder="Unlimited"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Per User Limit*</label>
                                        <input
                                            type="number"
                                            name="userUsageLimit"
                                            value={formData.userUsageLimit}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            min="1"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Valid From</label>
                                        <input
                                            type="datetime-local"
                                            name="validFrom"
                                            value={formData.validFrom}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Valid Until*</label>
                                        <input
                                            type="datetime-local"
                                            name="validUntil"
                                            value={formData.validUntil}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Applicable On</label>
                                    <select
                                        name="applicableOn"
                                        value={formData.applicableOn}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="all">All Bookings</option>
                                        <option value="first-booking">First Booking Only</option>
                                        <option value="specific-service">Specific Service</option>
                                    </select>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition cursor-pointer"
                                    >
                                        {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CouponManagement;
