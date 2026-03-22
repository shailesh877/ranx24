import React, { useState, useEffect } from "react";

function EditWorkerModal({ worker, categories, subCategories, onSave, onClose }) { // Added subCategories prop
  const [formData, setFormData] = useState({
    firstName: worker.firstName,
    lastName: worker.lastName,
    mobileNumber: worker.mobileNumber,
    state: worker.state,
    district: worker.district,
    city: worker.city,
    latitude: worker.latitude,
    longitude: worker.longitude,
    categories: worker.categories || [],
    services: worker.services || [], // Changed to array for subcategories
    status: worker.status,
    workerType: worker.workerType,
  });

  useEffect(() => {
    setFormData({
      firstName: worker.firstName,
      lastName: worker.lastName,
      mobileNumber: worker.mobileNumber,
      state: worker.state,
      district: worker.district,
      city: worker.city,
      latitude: worker.latitude,
      longitude: worker.longitude,
      categories: worker.categories || [],
      services: worker.services || [], // Ensure services is an array
      status: worker.status,
      workerType: worker.workerType,
    });
  }, [worker]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e) => {
    const selected = Array.from(e.target.options)
      .filter((o) => o.selected)
      .map((o) => o.value);
    setFormData((prev) => ({ ...prev, categories: selected, services: [] })); // Reset services when categories change
  };

  const handleServiceChange = (e) => {
    const selected = Array.from(e.target.options)
      .filter((o) => o.selected)
      .map((o) => o.value);
    setFormData((prev) => ({ ...prev, services: selected }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData); // formData now directly contains categories and services (subcategories)
  };

  // Filter subcategories based on selected categories
  const availableSubCategories = subCategories.filter(sub =>
    formData.categories.includes(sub.parentName)
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl animate-fadeIn overflow-hidden">

        {/* ---- Header Fixed ---- */}
        <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-blue-900">Edit Worker Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 cursor-pointer">
            <i className="fa-solid fa-times text-xl"></i>
          </button>
        </div>

        {/* ---- Scrollable Body ---- */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scroll">

          {[
            { label: "First Name", name: "firstName" },
            { label: "Last Name", name: "lastName" },
            { label: "Mobile Number", name: "mobileNumber" },
            { label: "State", name: "state" },
            { label: "District", name: "district" },
            { label: "City", name: "city" },
            { label: "Latitude", name: "latitude" },
            { label: "Longitude", name: "longitude" },
            { label: "Worker Type", name: "workerType" },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700">
                {field.label}
              </label>
              <input
                type="text"
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          ))}

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Categories
            </label>
            <select
              multiple
              value={formData.categories}
              onChange={handleCategoryChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2 h-24 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Services (Subcategories) */}
          {formData.categories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Services (Subcategories)
              </label>
              <select
                multiple
                name="services"
                value={formData.services}
                onChange={handleServiceChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg p-2 h-24 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {availableSubCategories.map((sub) => (
                  <option key={sub._id} value={sub.name}>
                    {sub.parentName} - {sub.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* ---- Footer Buttons ---- */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Smooth Fade */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn .2s ease-out; }

        /* Custom scroll */
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      `}</style>
    </div>
  );
}

export default EditWorkerModal;
