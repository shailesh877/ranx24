import React, { useState } from "react";
import { useAdmin } from "../../context/AdminContext";

const TestimonialsManagement = () => {
    const { testimonials, addTestimonial, updateTestimonial, deleteTestimonial } = useAdmin();

    // Form State
    const [form, setForm] = useState({ clientName: "", videoUrl: "", comment: "", rating: 5, active: true });
    const [editingTestimonial, setEditingTestimonial] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.clientName.trim() || !form.videoUrl.trim()) return alert("Client Name and Video URL are required.");

        let success;
        if (editingTestimonial) {
            success = await updateTestimonial(editingTestimonial._id, form);
        } else {
            success = await addTestimonial(form);
        }

        if (success) {
            handleCancel();
        }
    };

    const handleEdit = (item) => {
        setEditingTestimonial(item);
        setForm({ clientName: item.clientName, videoUrl: item.videoUrl, comment: item.comment || "", rating: item.rating, active: item.active });
    };

    const handleCancel = () => {
        setEditingTestimonial(null);
        setForm({ clientName: "", videoUrl: "", comment: "", rating: 5, active: true });
    };

    // Helper to extract YouTube ID (simple version)
    const getYouTubeId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
            {/* Form Section */}
            <div className="lg:col-span-1">
                <h2 className="text-2xl font-black text-blue-900 mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-video text-red-500"></i> Manage Testimonials
                </h2>
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-6 sticky top-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">{editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}</h3>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                        <input type="text" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-200" required />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Video URL (YouTube/Vimeo)</label>
                        <input type="text" value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-200" placeholder="https://youtube.com/..." required />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Comment (Optional)</label>
                        <textarea rows="3" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-200" />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button type="button" key={star} onClick={() => setForm({ ...form, rating: star })} className={`text-xl focus:outline-none ${star <= form.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                                    <i className="fa-solid fa-star"></i>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                            <span className="text-sm font-medium text-gray-700">Active</span>
                        </label>
                    </div>

                    <div className="flex gap-2">
                        <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold transition">{editingTestimonial ? 'Update' : 'Add'}</button>
                        {editingTestimonial && <button type="button" onClick={handleCancel} className="bg-gray-200 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition">Cancel</button>}
                    </div>
                </form>
            </div>

            {/* List Section */}
            <div className="lg:col-span-2">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Existing Testimonials</h3>
                    <div className="space-y-4">
                        {testimonials.map(item => {
                            const videoId = getYouTubeId(item.videoUrl);
                            const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;

                            return (
                                <div key={item._id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100 hover:shadow-md transition-shadow">
                                    {/* Video Thumbnail */}
                                    <div className="w-full sm:w-32 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 relative group">
                                        {thumbnailUrl ? (
                                            <img src={thumbnailUrl} alt={item.clientName} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <i className="fa-solid fa-video text-2xl"></i>
                                            </div>
                                        )}
                                        <a href={item.videoUrl} target="_blank" rel="noopener noreferrer" className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <i className="fa-solid fa-play text-white text-2xl"></i>
                                        </a>
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-gray-800">{item.clientName}</h4>
                                            <span className={`px-2 py-0.5 text-xs rounded-full ${item.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {item.active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div className="text-yellow-400 text-sm my-1">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <i key={i} className={`fa-solid fa-star ${i < item.rating ? '' : 'text-gray-300'}`}></i>
                                            ))}
                                        </div>
                                        {item.comment && <p className="text-gray-600 text-sm line-clamp-2">"{item.comment}"</p>}
                                    </div>

                                    <div className="flex flex-row sm:flex-col gap-2 justify-center">
                                        <button onClick={() => handleEdit(item)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors" title="Edit">
                                            <i className="fa-solid fa-pen-to-square"></i>
                                        </button>
                                        <button onClick={() => deleteTestimonial(item._id)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors" title="Delete">
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                        {testimonials.length === 0 && <p className="text-center text-gray-500 py-8">No testimonials found.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestimonialsManagement;
