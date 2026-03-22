import React, { useState, useEffect } from "react";
import { useAdmin } from "../../context/AdminContext";
import axios from 'axios';
import toast from 'react-hot-toast';

const ServiceManagement = () => {
    const {
        categories,
        subCategories,
        addService,
        updateService,
        deleteService
    } = useAdmin();

    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [form, setForm] = useState({
        name: "",
        category: "",
        subCategory: "",
        description: "",
        basePrice: "",
        priceUnit: "fixed",
        isActive: true
    });
    const [editingService, setEditingService] = useState(null);
    const [image, setImage] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'https://backend.ranx24.com/api';

    const fetchServices = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_URL}/services`);
            setServices(data);
        } catch (error) {
            console.error("Error fetching services:", error);
            toast.error("Failed to load services");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.category || !form.basePrice) {
            return toast.error("Please fill required fields");
        }

        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('category', form.category);
        if (form.subCategory) formData.append('subCategory', form.subCategory);
        formData.append('description', form.description);
        formData.append('basePrice', form.basePrice);
        formData.append('priceUnit', form.priceUnit);
        formData.append('isActive', form.isActive);
        if (image) formData.append('image', image);

        let success;
        if (editingService) {
            success = await updateService(editingService._id, formData);
        } else {
            success = await addService(formData);
        }

        if (success) {
            setForm({
                name: "",
                category: "",
                subCategory: "",
                description: "",
                basePrice: "",
                priceUnit: "fixed",
                isActive: true
            });
            setEditingService(null);
            setImage(null);
            fetchServices();
        }
    };

    const handleEdit = (service) => {
        setEditingService(service);
        setForm({
            name: service.name,
            category: service.category?._id || service.category,
            subCategory: service.subCategory?._id || service.subCategory || "",
            description: service.description || "",
            basePrice: service.basePrice,
            priceUnit: service.priceUnit || "fixed",
            isActive: service.isActive
        });
        setImage(null);
    };

    const handleDelete = async (id) => {
        if (await deleteService(id)) {
            fetchServices();
        }
    };

    // Filter subcategories based on selected category
    const filteredSubCategories = subCategories.filter(sub => sub.parentId === form.category);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
            {/* Form Section */}
            <div className="lg:col-span-1">
                <h2 className="text-2xl font-black text-blue-900 mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-briefcase text-indigo-600"></i> Manage Services
                </h2>
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 sticky top-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">{editingService ? 'Edit Service' : 'Add New Service'}</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Service Name *</label>
                            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-200" required />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value, subCategory: "" })} className="w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-200" required>
                                <option value="">Select Category</option>
                                {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Category</label>
                            <select value={form.subCategory} onChange={(e) => setForm({ ...form, subCategory: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-200">
                                <option value="">Select Sub-Category (Optional)</option>
                                {filteredSubCategories.map(sub => <option key={sub._id} value={sub._id}>{sub.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (₹) *</label>
                            <input type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-200" required min="0" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-200" rows="3"></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Service Image</label>
                            <input type="file" onChange={(e) => setImage(e.target.files[0])} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        </div>

                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded text-blue-600 focus:ring-blue-500" />
                            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
                        </div>
                    </div>

                    <div className="flex gap-2 mt-6">
                        <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold transition">{editingService ? 'Update Service' : 'Add Service'}</button>
                        {editingService && <button type="button" onClick={() => { setEditingService(null); setForm({ name: "", category: "", subCategory: "", description: "", basePrice: "", priceUnit: "fixed", isActive: true }); setImage(null); }} className="bg-gray-200 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition">Cancel</button>}
                    </div>
                </form>
            </div>

            {/* List Section */}
            <div className="lg:col-span-2">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Existing Services</h3>

                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading services...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-700 font-semibold">
                                    <tr>
                                        <th className="px-4 py-3 rounded-tl-lg">Service</th>
                                        <th className="px-4 py-3">Category</th>
                                        <th className="px-4 py-3">Price</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 rounded-tr-lg text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {services.length > 0 ? services.map(service => (
                                        <tr key={service._id} className="hover:bg-sky-50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-gray-900">{service.name}</td>
                                            <td className="px-4 py-3 text-gray-600">
                                                {service.category?.name}
                                                {service.subCategory && <span className="text-xs text-gray-400 block">{service.subCategory.name}</span>}
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-blue-600">₹{service.basePrice}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${service.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {service.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-3">
                                                    <button onClick={() => handleEdit(service)} className="text-blue-500 hover:text-blue-700 cursor-pointer"><i className="fa-solid fa-pen-to-square"></i></button>
                                                    <button onClick={() => handleDelete(service._id)} className="text-red-500 hover:text-red-700 cursor-pointer"><i className="fa-solid fa-trash"></i></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="text-center py-8 text-gray-500">No services found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ServiceManagement;
