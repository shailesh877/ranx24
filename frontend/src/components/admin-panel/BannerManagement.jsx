import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'https://backend.ranx24.com';

export default function BannerManagement() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [activePlatform, setActivePlatform] = useState('all'); // New: Platform filter

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        link: '',
        type: 'slider',
        platform: 'all', // New: Platform field
        displayPages: [],
        displayOrder: 0,
        startDate: '',
        endDate: '',
        image: null
    });

    useEffect(() => {
        fetchBanners();
    }, [activePlatform]); // Re-fetch when platform changes

    const fetchBanners = async () => {
        try {
            const { data } = await api.get(`/banners?platform=${activePlatform}`);
            setBanners(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching banners:', error);
            toast.error('Failed to load banners');
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handlePageToggle = (page) => {
        const newPages = formData.displayPages.includes(page)
            ? formData.displayPages.filter(p => p !== page)
            : [...formData.displayPages, page];
        setFormData({ ...formData, displayPages: newPages });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('link', formData.link);
        data.append('type', formData.type);
        data.append('platform', formData.platform); // New: Include platform
        data.append('displayPages', JSON.stringify(formData.displayPages));
        data.append('displayOrder', formData.displayOrder);
        if (formData.startDate) data.append('startDate', formData.startDate);
        if (formData.endDate) data.append('endDate', formData.endDate);
        if (formData.image) data.append('image', formData.image);

        try {
            if (editingBanner) {
                await api.put(`/banners/${editingBanner._id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Banner updated successfully!');
            } else {
                await api.post('/banners', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Banner created successfully!');
            }
            closeModal();
            fetchBanners();
        } catch (error) {
            console.error('Error saving banner:', error);
            toast.error(error.response?.data?.message || 'Failed to save banner');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this banner?')) return;

        try {
            await api.delete(`/banners/${id}`);
            toast.success('Banner deleted successfully!');
            fetchBanners();
        } catch (error) {
            console.error('Error deleting banner:', error);
            toast.error('Failed to delete banner');
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await api.patch(`/banners/${id}/toggle`);
            toast.success('Banner status updated!');
            fetchBanners();
        } catch (error) {
            console.error('Error toggling status:', error);
            toast.error('Failed to update status');
        }
    };

    const openEditModal = (banner) => {
        setEditingBanner(banner);
        setFormData({
            title: banner.title,
            description: banner.description || '',
            link: banner.link || '',
            type: banner.type,
            platform: banner.platform || 'all', // New: Set platform
            displayPages: banner.displayPages || [],
            displayOrder: banner.displayOrder,
            startDate: banner.startDate ? banner.startDate.split('T')[0] : '',
            endDate: banner.endDate ? banner.endDate.split('T')[0] : '',
            image: null
        });
        setImagePreview(`${SERVER_URL}/${banner.image}`);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingBanner(null);
        setFormData({
            title: '',
            description: '',
            link: '',
            type: 'slider',
            platform: 'all', // Reset to all
            displayPages: [],
            displayOrder: 0,
            startDate: '',
            endDate: '',
            image: null
        });
        setImagePreview('');
    };

    const getPlatformBadgeColor = (platform) => {
        switch (platform) {
            case 'user-app': return 'bg-blue-100 text-blue-800';
            case 'worker-app': return 'bg-green-100 text-green-800';
            case 'website': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPlatformIcon = (platform) => {
        switch (platform) {
            case 'user-app': return 'fa-mobile-alt';
            case 'worker-app': return 'fa-briefcase';
            case 'website': return 'fa-globe';
            default: return 'fa-layer-group';
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-blue-900">Banner Management</h1>
                    <p className="text-gray-600">Manage platform-specific banners</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
                >
                    <i className="fa-solid fa-plus"></i>
                    Add Banner
                </button>
            </div>

            {/* Platform Tabs */}
            <div className="mb-6 flex gap-3 flex-wrap">
                {[
                    { value: 'all', label: 'All Platforms', icon: 'fa-layer-group', color: 'gray' },
                    { value: 'user-app', label: 'User App', icon: 'fa-mobile-alt', color: 'blue' },
                    { value: 'worker-app', label: 'Worker App', icon: 'fa-briefcase', color: 'green' },
                    { value: 'website', label: 'Website', icon: 'fa-globe', color: 'purple' }
                ].map((platform) => (
                    <button
                        key={platform.value}
                        onClick={() => setActivePlatform(platform.value)}
                        className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 cursor-pointer ${activePlatform === platform.value
                            ? `bg-${platform.color}-600 text-white shadow-lg`
                            : `bg-white border-2 border-${platform.color}-200 text-${platform.color}-700 hover:border-${platform.color}-400`
                            }`}
                    >
                        <i className={`fa-solid ${platform.icon}`}></i>
                        {platform.label}
                    </button>
                ))}
            </div>

            {/* Banners Table */}
            {loading ? (
                <div className="text-center py-10">
                    <i className="fa-solid fa-spinner fa-spin text-4xl text-blue-600"></i>
                    <p className="mt-4">Loading banners...</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preview</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platform</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Display Pages</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {banners.map((banner) => (
                                <tr key={banner._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <img
                                            src={`${SERVER_URL}/${banner.image}`}
                                            alt={banner.title}
                                            className="w-24 h-16 object-cover rounded"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{banner.title}</div>
                                        {banner.description && (
                                            <div className="text-sm text-gray-500">{banner.description.substring(0, 50)}...</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${banner.type === 'slider' ? 'bg-blue-100 text-blue-800' :
                                            banner.type === 'sponsor' ? 'bg-green-100 text-green-800' :
                                                'bg-purple-100 text-purple-800'
                                            }`}>
                                            {banner.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1 w-fit ${getPlatformBadgeColor(banner.platform)}`}>
                                            <i className={`fa-solid ${getPlatformIcon(banner.platform)}`}></i>
                                            {banner.platform === 'user-app' ? 'User App' :
                                                banner.platform === 'worker-app' ? 'Worker App' :
                                                    banner.platform === 'website' ? 'Website' : 'All'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {banner.displayPages.map((page, idx) => (
                                                <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                                    {page}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{banner.displayOrder}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleToggleStatus(banner._id)}
                                            className={`px-3 py-1 text-xs font-semibold rounded-full cursor-pointer ${banner.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {banner.isActive ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openEditModal(banner)}
                                                className="text-blue-600 hover:text-blue-800 cursor-pointer"
                                                title="Edit"
                                            >
                                                <i className="fa-solid fa-edit"></i>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(banner._id)}
                                                className="text-red-600 hover:text-red-800 cursor-pointer"
                                                title="Delete"
                                            >
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold text-blue-900">
                                    {editingBanner ? 'Edit Banner' : 'Add New Banner'}
                                </h2>
                                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 cursor-pointer">
                                    <i className="fa-solid fa-times text-2xl"></i>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Banner Image *</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="w-full border rounded px-3 py-2"
                                        required={!editingBanner}
                                    />
                                    {imagePreview && (
                                        <img src={imagePreview} alt="Preview" className="mt-2 w-full h-48 object-cover rounded" />
                                    )}
                                </div>

                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full border rounded px-3 py-2"
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full border rounded px-3 py-2"
                                        rows="3"
                                    ></textarea>
                                </div>

                                {/* Link */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Link (Optional)</label>
                                    <input
                                        type="url"
                                        value={formData.link}
                                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                        className="w-full border rounded px-3 py-2"
                                        placeholder="https://example.com"
                                    />
                                </div>

                                {/* Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full border rounded px-3 py-2"
                                    >
                                        <option value="slider">Slider</option>
                                        <option value="sponsor">Sponsor</option>
                                        <option value="advertisement">Advertisement</option>
                                    </select>
                                </div>

                                {/* Platform Selector - NEW */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Platform *</label>
                                    <select
                                        value={formData.platform}
                                        onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                                        className="w-full border rounded px-3 py-2"
                                    >
                                        <option value="all">All Platforms</option>
                                        <option value="user-app">User App (Mobile)</option>
                                        <option value="worker-app">Worker App (Mobile)</option>
                                        <option value="website">Website</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Select which platform should display this banner
                                    </p>
                                </div>

                                {/* Display Pages */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Display On Pages *</label>
                                    <div className="space-y-2">
                                        {['landing', 'worker-dashboard', 'user-dashboard', 'all'].map((page) => (
                                            <label key={page} className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.displayPages.includes(page)}
                                                    onChange={() => handlePageToggle(page)}
                                                    className="rounded"
                                                />
                                                <span className="capitalize">{page.replace('-', ' ')}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Display Order */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
                                    <input
                                        type="number"
                                        value={formData.displayOrder}
                                        onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                                        className="w-full border rounded px-3 py-2"
                                        min="0"
                                    />
                                </div>

                                {/* Schedule */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                        <input
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            className="w-full border rounded px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                        <input
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                            className="w-full border rounded px-3 py-2"
                                        />
                                    </div>
                                </div>

                                {/* Submit Buttons */}
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                                    >
                                        {editingBanner ? 'Update Banner' : 'Create Banner'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
