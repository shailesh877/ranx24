import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaCamera, FaUserEdit } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || "https://backend.ranx24.com/api";

export default function WorkerProfile() {
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    city: "",
    services: "",
  });

  useEffect(() => {
    fetchWorker();
  }, []);

  const fetchWorker = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const mobile = user?.mobileNumber;

      if (!mobile) {
        navigate("/worker-login");
        return;
      }
      const { data } = await axios.get(`${API_URL}/workers/mobile/${mobile}`);
      setWorker(data);

      setFormData({
        firstName: data.firstName,
        lastName: data.lastName,
        city: data.city,
        services: data.services.join(", "),
      });

      setLoading(false);
    } catch (error) {
      console.error("Profile Load Error:", error);
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setPreviewImage(URL.createObjectURL(file));
      setFormData({ ...formData, livePhoto: file });
    }
  };

  const handleUpdate = async () => {
    try {
      const fd = new FormData();
      fd.append("firstName", formData.firstName);
      fd.append("lastName", formData.lastName);
      fd.append("city", formData.city);
      fd.append("services", formData.services);

      if (formData.livePhoto) {
        fd.append("livePhoto", formData.livePhoto);
      }

      await axios.put(`${API_URL}/workers/${worker._id}/update`, fd);

      alert("Profile updated successfully!");
      setEditMode(false);
      fetchWorker();
    } catch (error) {
      console.error("Update error:", error);
      alert("Update failed!");
    }
  };

  if (loading)
    return <div className="min-h-screen flex justify-center items-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 font-[Poppins] py-10 px-4">
      <div className="max-w-4xl mx-auto">

        {/* PAGE TITLE */}
        <h1 className="text-3xl font-extrabold text-blue-900 mb-8 border-b-4 border-yellow-400 w-max pb-1">
          Profile
        </h1>

        {/* PROFILE CARD */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border">

          {/* IMAGE + NAME */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <img
                src={previewImage || `/uploads/${worker.livePhoto}`}
                alt="Profile"
                className="w-28 h-28 rounded-full border-4 border-yellow-400 object-cover"
              />

              {editMode && (
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-blue-700 transition">
                  <FaCamera />
                  <input type="file" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-blue-900">
                {worker.firstName} {worker.lastName}
              </h2>
              <p className="text-gray-600">{worker.mobileNumber}</p>
              <p className="text-gray-600">{worker.city}</p>
            </div>

            <button
              onClick={() => setEditMode(!editMode)}
              className="ml-auto px-5 py-2 bg-blue-600 text-white rounded-xl flex items-center gap-2 hover:bg-blue-700 transition"
            >
              <FaUserEdit /> {editMode ? "Cancel" : "Edit"}
            </button>
          </div>

          {/* EDIT FIELDS */}
          {editMode && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">

              <div>
                <label className="block text-gray-700 font-medium">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium">Services</label>
                <textarea
                  value={formData.services}
                  onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border rounded-lg h-20"
                />
              </div>

              <div className="md:col-span-2 flex justify-end mt-3">
                <button
                  onClick={handleUpdate}
                  className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 transition"
                >
                  Save Changes
                </button>
              </div>

            </div>
          )}

          {/* NON-EDIT DETAILS */}
          {!editMode && (
            <div className="mt-6 text-gray-700 space-y-3">
              <p><b>Full Name:</b> {worker.firstName} {worker.lastName}</p>
              <p><b>Mobile:</b> {worker.mobileNumber}</p>
              <p><b>Location:</b> {worker.city}</p>
              <p><b>Services:</b> {worker.services.join(", ")}</p>
              <p><b>Professional ID:</b> {worker._id}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
