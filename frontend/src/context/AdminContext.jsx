import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminContext = createContext();

export const useAdmin = () => useContext(AdminContext);

const API_URL = import.meta.env.VITE_API_URL || 'https://backend.ranx24.com/api';

export const AdminProvider = ({ children }) => {
    const [stats, setStats] = useState({
        users: 0,
        workersPending: 0,
        verifiedWorkers: 0,
        bookings: 0,
        earnings: 0,
        activeServices: 0,
        availableCities: 0,
        completedBookings: 0,
        bookingsToday: 0,
        bookingsMonth: 0,
        wallet: { totalIn: 0, totalOut: 0, available: 0 },
        reviews: { average: 0, total: 0, week: 0 }
    });

    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [homeTips, setHomeTips] = useState([]);
    const [testimonials, setTestimonials] = useState([]);

    const getAuthHeader = () => {
        const token = localStorage.getItem('token');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    const fetchStats = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/admin/stats`, getAuthHeader());
            setStats(prev => ({ ...prev, ...data }));
        } catch (err) {
            console.error("Error fetching stats:", err);
        }
    };

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [catRes, cityRes, tipsRes, testRes] = await Promise.all([
                axios.get(`${API_URL}/categories`, getAuthHeader()),
                axios.get(`${API_URL}/cities`, getAuthHeader()),
                axios.get(`${API_URL}/home-tips/admin`, getAuthHeader()),
                axios.get(`${API_URL}/testimonials/admin`, getAuthHeader()),
            ]);

            setCategories(catRes.data);
            const allSubCategories = catRes.data.flatMap(cat =>
                cat.subCategories.map(sub => ({ ...sub, parentId: cat._id, parentName: cat.name }))
            );
            setSubCategories(allSubCategories);
            setCities(cityRes.data);
            setHomeTips(tipsRes.data);
            setTestimonials(testRes.data);

            setStats(prev => ({
                ...prev,
                activeServices: catRes.data.length,
                availableCities: cityRes.data.length
            }));

            setError(null);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Failed to fetch initial dashboard data.");
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchInitialData();
    }, []);

    // Category Actions
    const addCategory = async (formData) => {
        try {
            await axios.post(`${API_URL}/categories`, formData, {
                headers: { ...getAuthHeader().headers, 'Content-Type': 'multipart/form-data' }
            });
            await fetchInitialData();
            toast.success("Category added successfully");
            return true;
        } catch (err) {
            toast.error("Failed to add category");
            return false;
        }
    };

    const updateCategory = async (id, formData) => {
        try {
            await axios.put(`${API_URL}/categories/${id}`, formData, {
                headers: { ...getAuthHeader().headers, 'Content-Type': 'multipart/form-data' }
            });
            await fetchInitialData();
            toast.success("Category updated successfully");
            return true;
        } catch (err) {
            toast.error("Failed to update category");
            return false;
        }
    };

    const deleteCategory = async (id) => {
        if (!window.confirm("Are you sure? This will delete all sub-categories within it.")) return;
        try {
            await axios.delete(`${API_URL}/categories/${id}`, getAuthHeader());
            await fetchInitialData();
            toast.success("Category deleted successfully");
            return true;
        } catch (err) {
            console.error("Delete Category Error:", err);
            toast.error(err.response?.data?.message || "Failed to delete category");
            return false;
        }
    };

    // SubCategory Actions
    const addSubCategory = async (parentId, formData) => {
        try {
            await axios.post(`${API_URL}/categories/${parentId}/subcategories`, formData, {
                headers: { ...getAuthHeader().headers, 'Content-Type': 'multipart/form-data' }
            });
            await fetchInitialData();
            toast.success("Sub-category added successfully");
            return true;
        } catch (err) {
            toast.error("Failed to add sub-category");
            return false;
        }
    };

    const updateSubCategory = async (parentId, subId, formData) => {
        try {
            await axios.put(`${API_URL}/categories/${parentId}/subcategories/${subId}`, formData, {
                headers: { ...getAuthHeader().headers, 'Content-Type': 'multipart/form-data' }
            });
            await fetchInitialData();
            toast.success("Sub-category updated successfully");
            return true;
        } catch (err) {
            toast.error("Failed to update sub-category");
            return false;
        }
    };

    const deleteSubCategory = async (parentId, subId) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await axios.delete(`${API_URL}/categories/${parentId}/subcategories/${subId}`, getAuthHeader());
            await fetchInitialData();
            toast.success("Sub-category deleted successfully");
            return true;
        } catch (err) {
            toast.error("Failed to delete sub-category");
            return false;
        }
    };
    // Service Actions
    const addService = async (formData) => {
        try {
            await axios.post(`${API_URL}/services`, formData, {
                headers: { ...getAuthHeader().headers, 'Content-Type': 'multipart/form-data' }
            });
            await fetchInitialData(); // Or fetch services separately
            toast.success("Service added successfully");
            return true;
        } catch (err) {
            toast.error("Failed to add service");
            return false;
        }
    };

    const updateService = async (id, formData) => {
        try {
            await axios.put(`${API_URL}/services/${id}`, formData, {
                headers: { ...getAuthHeader().headers, 'Content-Type': 'multipart/form-data' }
            });
            await fetchInitialData();
            toast.success("Service updated successfully");
            return true;
        } catch (err) {
            toast.error("Failed to update service");
            return false;
        }
    };

    const deleteService = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await axios.delete(`${API_URL}/services/${id}`, getAuthHeader());
            await fetchInitialData();
            toast.success("Service deleted successfully");
            return true;
        } catch (err) {
            toast.error("Failed to delete service");
            return false;
        }
    };

    // Home Tip Actions
    const addHomeTip = async (formData) => {
        try {
            await axios.post(`${API_URL}/home-tips`, formData, {
                headers: { ...getAuthHeader().headers, 'Content-Type': 'multipart/form-data' }
            });
            await fetchInitialData();
            toast.success("Home Tip added successfully");
            return true;
        } catch (err) {
            toast.error("Failed to add home tip");
            return false;
        }
    };

    const updateHomeTip = async (id, formData) => {
        try {
            await axios.put(`${API_URL}/home-tips/${id}`, formData, {
                headers: { ...getAuthHeader().headers, 'Content-Type': 'multipart/form-data' }
            });
            await fetchInitialData();
            toast.success("Home Tip updated successfully");
            return true;
        } catch (err) {
            toast.error("Failed to update home tip");
            return false;
        }
    };

    const deleteHomeTip = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await axios.delete(`${API_URL}/home-tips/${id}`, getAuthHeader());
            await fetchInitialData();
            toast.success("Home Tip deleted successfully");
            return true;
        } catch (err) {
            toast.error("Failed to delete home tip");
            return false;
        }
    };

    // Testimonial Actions
    const addTestimonial = async (data) => {
        try {
            await axios.post(`${API_URL}/testimonials`, data, getAuthHeader());
            await fetchInitialData();
            toast.success("Testimonial added successfully");
            return true;
        } catch (err) {
            toast.error("Failed to add testimonial");
            return false;
        }
    };

    const updateTestimonial = async (id, data) => {
        try {
            await axios.put(`${API_URL}/testimonials/${id}`, data, getAuthHeader());
            await fetchInitialData();
            toast.success("Testimonial updated successfully");
            return true;
        } catch (err) {
            toast.error("Failed to update testimonial");
            return false;
        }
    };

    const deleteTestimonial = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await axios.delete(`${API_URL}/testimonials/${id}`, getAuthHeader());
            await fetchInitialData();
            toast.success("Testimonial deleted successfully");
            return true;
        } catch (err) {
            toast.error("Failed to delete testimonial");
            return false;
        }
    };


    const value = {
        stats,
        categories,
        subCategories,
        cities,
        homeTips,
        testimonials,
        loading,
        error,
        fetchStats,
        fetchInitialData,
        addCategory,
        updateCategory,
        deleteCategory,
        addSubCategory,
        updateSubCategory,
        deleteSubCategory,
        addService,
        updateService,
        deleteService,
        addHomeTip,
        updateHomeTip,
        deleteHomeTip,
        addTestimonial,
        updateTestimonial,
        deleteTestimonial
    };

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    );
};
