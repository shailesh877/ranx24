import React, { useState, useMemo } from "react";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { useAdmin } from "../../context/AdminContext";

const AddCityManagement = () => {
  const { cities, categories, subCategories, fetchInitialData } = useAdmin();
  const [cityName, setCityName] = useState("");
  const [stateName, setStateName] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editCityModal, setEditCityModal] = useState(null);
  const [editAssignModal, setEditAssignModal] = useState(null);

  const handleAddCity = async (e) => {
    e.preventDefault();
    if (!cityName.trim() || !stateName.trim()) {
      toast.error("City and state name are required.");
      return;
    }
    try {
      setLoading(true);
      await api.post('/cities', { name: cityName, state: stateName });
      toast.success(`City "${cityName}" added successfully!`);
      setCityName("");
      setStateName("");
      fetchInitialData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add city.");
    } finally {
      setLoading(false);
    }
  };

  const deleteCity = async (id) => {
    if (!window.confirm("Are you sure you want to delete this city? This action cannot be undone.")) return;
    try {
      await api.delete(`/cities/${id}`);
      toast.success("City deleted successfully.");
      fetchInitialData();
    } catch (err) {
      toast.error("Failed to delete city.");
    }
  };

  const assignCategoriesToCity = async (cityId, assignedCategories) => {
    try {
      await api.put(`/cities/${cityId}/assign-categories`, { assignedCategories });
      toast.success("Categories assigned successfully!");
      fetchInitialData();
      return true;
    } catch (err) {
      console.error(err);
      toast.error("Failed to assign categories.");
      return false;
    }
  };

  const saveCityEdits = async (cityId, updates) => {
    try {
      await api.put(`/cities/${cityId}`, updates);
      setEditCityModal(null);
      toast.success("City updated successfully!");
      fetchInitialData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update city.");
    }
  };

  const filteredCities = useMemo(() => {
    return cities.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.state.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [cities, searchTerm]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <i className="fa-solid fa-map-location-dot text-indigo-600"></i>
            City & Service Management
          </h2>
          <p className="text-gray-500 mt-1">Manage cities and assign available services to them.</p>
        </div>
      </div>

      {/* Add City Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New City</h3>
        <form onSubmit={handleAddCity} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City Name</label>
            <input
              type="text"
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
              placeholder="e.g. New York"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State / Region</label>
            <input
              type="text"
              value={stateName}
              onChange={(e) => setStateName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
              placeholder="e.g. NY"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium transition-colors shadow-sm hover:shadow flex items-center justify-center gap-2 h-[42px]"
          >
            <i className="fa-solid fa-plus"></i> Add City
          </button>
        </form>
      </div>

      {/* Cities List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-800">Available Cities <span className="text-gray-400 text-sm font-normal">({filteredCities.length})</span></h3>
          <div className="relative w-full md:w-64">
            <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Search cities..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading cities...</div>
          ) : filteredCities.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No cities found. Add one above!</div>
          ) : (
            filteredCities.map(city => (
              <div key={city._id} className="p-6 hover:bg-gray-50 transition-colors group">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-bold text-lg text-gray-900">{city.name}</h4>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium border border-gray-200">{city.state}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {city.assignedCategories?.length > 0 ? city.assignedCategories.map((ac, i) => (
                        <div key={i} className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-xs border border-indigo-100 flex flex-col">
                          <span className="font-bold">{ac.category}</span>
                          <span className="text-indigo-500/80 mt-0.5">{ac.subCategories.length} services</span>
                        </div>
                      )) : (
                        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg text-xs border border-amber-100">
                          <i className="fa-solid fa-triangle-exclamation"></i>
                          <span>No services assigned yet</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditAssignModal(city)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                      title="Manage Services"
                    >
                      <i className="fa-solid fa-tags"></i> Services
                    </button>
                    <button
                      onClick={() => setEditCityModal(city)}
                      className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit Details"
                    >
                      <i className="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button
                      onClick={() => deleteCity(city._id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete City"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {editCityModal && <EditCityModal city={editCityModal} onClose={() => setEditCityModal(null)} onSave={saveCityEdits} />}
      {editAssignModal && <EditAssignModal city={editAssignModal} categories={categories} subCategories={subCategories} onClose={() => setEditAssignModal(null)} onSave={assignCategoriesToCity} />}
    </div>
  );
};

function EditCityModal({ city, onClose, onSave }) {
  const [name, setName] = useState(city.name);
  const [state, setState] = useState(city.state);

  const handleSave = () => {
    if (!name.trim() || !state.trim()) return toast.error("All fields are required");
    onSave(city._id, { name, state });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md transform transition-all scale-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Edit City Details</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input type="text" value={state} onChange={e => setState(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
        </div>
        <div className="mt-8 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSave} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm">Save Changes</button>
        </div>
      </div>
    </div>
  );
}

function EditAssignModal({ city, categories, subCategories, onClose, onSave }) {
  // Initialize state from existing assignments
  const [selectedCats, setSelectedCats] = useState(() => city.assignedCategories?.map(c => c.category) || []);
  const [selectedSubs, setSelectedSubs] = useState(() => city.assignedCategories?.flatMap(c => c.subCategories) || []);
  const [activeCategory, setActiveCategory] = useState(categories[0]?.name || "");

  const handleSave = () => {
    const assigned = selectedCats.map(catName => ({
      category: catName,
      subCategories: subCategories.filter(s => s.parentName === catName && selectedSubs.includes(s.name)).map(s => s.name)
    }));
    onSave(city._id, assigned).then(success => {
      if (success) onClose();
    });
  };

  const toggleCategory = (catName) => {
    if (selectedCats.includes(catName)) {
      setSelectedCats(prev => prev.filter(c => c !== catName));
      // Also remove all subcategories of this category
      const subsToRemove = subCategories.filter(s => s.parentName === catName).map(s => s.name);
      setSelectedSubs(prev => prev.filter(s => !subsToRemove.includes(s)));
    } else {
      setSelectedCats(prev => [...prev, catName]);
      // Auto-select all subcategories? No, let user choose.
    }
  };

  const toggleSubCategory = (subName, parentName) => {
    // Ensure parent is selected
    if (!selectedCats.includes(parentName)) {
      setSelectedCats(prev => [...prev, parentName]);
    }

    if (selectedSubs.includes(subName)) {
      setSelectedSubs(prev => prev.filter(s => s !== subName));
    } else {
      setSelectedSubs(prev => [...prev, subName]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Manage Services</h3>
            <p className="text-sm text-gray-500 mt-1">Assign services available in <span className="font-semibold text-indigo-600">{city.name}</span></p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Sidebar: Categories */}
          <div className="w-full md:w-1/3 border-r border-gray-100 bg-gray-50/30 overflow-y-auto p-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Categories</h4>
            <div className="space-y-1">
              {categories.map(cat => {
                const isSelected = selectedCats.includes(cat.name);
                const isActive = activeCategory === cat.name;
                const subCount = subCategories.filter(s => s.parentName === cat.name).length;
                const selectedSubCount = subCategories.filter(s => s.parentName === cat.name && selectedSubs.includes(s.name)).length;

                return (
                  <div
                    key={cat._id}
                    onClick={() => setActiveCategory(cat.name)}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${isActive ? 'bg-white shadow-sm ring-1 ring-gray-200' : 'hover:bg-gray-100'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        onClick={(e) => { e.stopPropagation(); toggleCategory(cat.name); }}
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white'}`}
                      >
                        {isSelected && <i className="fa-solid fa-check text-white text-xs"></i>}
                      </div>
                      <span className={`font-medium ${isActive ? 'text-indigo-700' : 'text-gray-700'}`}>{cat.name}</span>
                    </div>
                    {selectedSubCount > 0 && (
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                        {selectedSubCount}/{subCount}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Content: Subcategories */}
          <div className="w-full md:w-2/3 overflow-y-auto p-6 bg-white">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-bold text-gray-800">{activeCategory} Services</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const catSubs = subCategories.filter(s => s.parentName === activeCategory).map(s => s.name);
                    setSelectedSubs(prev => [...new Set([...prev, ...catSubs])]);
                    if (!selectedCats.includes(activeCategory)) setSelectedCats(prev => [...prev, activeCategory]);
                  }}
                  className="text-xs font-medium text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Select All
                </button>
                <button
                  onClick={() => {
                    const catSubs = subCategories.filter(s => s.parentName === activeCategory).map(s => s.name);
                    setSelectedSubs(prev => prev.filter(s => !catSubs.includes(s)));
                  }}
                  className="text-xs font-medium text-gray-500 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {subCategories.filter(s => s.parentName === activeCategory).map(sub => {
                const isSelected = selectedSubs.includes(sub.name);
                return (
                  <label
                    key={sub._id}
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}
                  >
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white'}`}>
                      {isSelected && <i className="fa-solid fa-check text-white text-xs"></i>}
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={isSelected}
                      onChange={() => toggleSubCategory(sub.name, sub.parentName)}
                    />
                    <span className={`font-medium ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>{sub.name}</span>
                  </label>
                );
              })}
              {subCategories.filter(s => s.parentName === activeCategory).length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-400">
                  <i className="fa-regular fa-folder-open text-3xl mb-3 opacity-50"></i>
                  <p>No sub-categories found for {activeCategory}.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center rounded-b-2xl">
          <div className="text-sm text-gray-500 px-2">
            <span className="font-bold text-indigo-600">{selectedCats.length}</span> categories, <span className="font-bold text-indigo-600">{selectedSubs.length}</span> services selected
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
            <button onClick={handleSave} className="bg-indigo-600 text-white px-8 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm hover:shadow">Save Assignments</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddCityManagement;