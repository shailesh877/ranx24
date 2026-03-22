import React, { useState } from "react";
import { useAdmin } from "../../context/AdminContext";

const HomeTipsManagement = () => {
    const { homeTips, addHomeTip, updateHomeTip, deleteHomeTip } = useAdmin();

    // Form State
    const [form, setForm] = useState({ title: "", content: "", active: true });
    const [editingTip, setEditingTip] = useState(null);
    const [image, setImage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.content.trim()) return alert("Title and Content are required.");

        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('content', form.content);
        formData.append('active', form.active);
        if (image) formData.append('image', image);

        let success;
        if (editingTip) {
            success = await updateHomeTip(editingTip._id, formData);
        } else {
            success = await addHomeTip(formData);
        }

        if (success) {
            setForm({ title: "", content: "", active: true });
            setEditingTip(null);
            setImage(null);
        }
    };

    const handleEdit = (tip) => {
        setEditingTip(tip);
        setForm({ title: tip.title, content: tip.content, active: tip.active });
        setImage(null);
    };

    const handleCancel = () => {
        setEditingTip(null);
        setForm({ title: "", content: "", active: true });
        setImage(null);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
            {/* Form Section */}
            <div className="lg:col-span-1">
                <h2 className="text-2xl font-black text-blue-900 mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-lightbulb text-yellow-500"></i> Manage Home Tips
                </h2>
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-6 sticky top-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">{editingTip ? 'Edit Tip' : 'Add New Tip'}</h3>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-200" required />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                        <textarea rows="5" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-200" required />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                        <input type="file" onChange={(e) => setImage(e.target.files[0])} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        {editingTip && editingTip.image && !image && (
                            <p className="text-xs text-gray-500 mt-1">Current: {editingTip.image}</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                            <span className="text-sm font-medium text-gray-700">Active</span>
                        </label>
                    </div>

                    <div className="flex gap-2">
                        <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold transition">{editingTip ? 'Update' : 'Add'}</button>
                        {editingTip && <button type="button" onClick={handleCancel} className="bg-gray-200 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition">Cancel</button>}
                    </div>
                </form>
            </div>

            {/* List Section */}
            <div className="lg:col-span-2">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Existing Tips</h3>
                    <div className="space-y-4">
                        {homeTips.map(tip => (
                            <div key={tip._id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100 hover:shadow-md transition-shadow">
                                {/* Image Thumbnail */}
                                {tip.image && (
                                    <div className="w-full sm:w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                                        <img src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/${tip.image}`} alt={tip.title} className="w-full h-full object-cover"
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/150' }}
                                        />
                                    </div>
                                )}

                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-gray-800 text-lg">{tip.title}</h4>
                                        <span className={`px-2 py-1 text-xs rounded-full ${tip.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {tip.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{tip.content}</p>
                                    <p className="text-gray-400 text-xs mt-2">{new Date(tip.createdAt).toLocaleDateString()}</p>
                                </div>

                                <div className="flex flex-row sm:flex-col gap-2 justify-center">
                                    <button onClick={() => handleEdit(tip)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors" title="Edit">
                                        <i className="fa-solid fa-pen-to-square"></i>
                                    </button>
                                    <button onClick={() => deleteHomeTip(tip._id)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors" title="Delete">
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                        {homeTips.length === 0 && <p className="text-center text-gray-500 py-8">No tips found. Add one to get started!</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeTipsManagement;
