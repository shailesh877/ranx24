import React, { useState, useMemo, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import WorkerEditModal from './WorkerEditModal.jsx';
import AddWorkerModal from './AddWorkerModal.jsx';
import { useAdmin } from '../../context/AdminContext';
import { QRCodeCanvas } from 'qrcode.react';

const API_URL_BASE = import.meta.env.VITE_SERVER_URL || 'https://backend.ranx24.com';

const WorkerManagement = () => {
  const { categories, subCategories } = useAdmin();
  // Core data
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('pending'); // pending | approved | all
  const [filters, setFilters] = useState({
    name: '',
    state: '',
    city: '',
    pincode: '',
    category: '',
    subcategory: '',
  });

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
  const [selectedWorkerForEdit, setSelectedWorkerForEdit] = useState(null);
  const [qrModalWorker, setQrModalWorker] = useState(null);

  // ---------------------------------------------------------------------
  // Data fetching
  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/workers?status=all&limit=1000');
      // Handle paginated response or direct array
      if (data.data && Array.isArray(data.data)) {
        setWorkers(data.data);
      } else if (Array.isArray(data)) {
        setWorkers(data);
      } else {
        setWorkers([]);
        console.error("Unexpected response format:", data);
      }
    } catch (error) {
      console.error('Error fetching workers:', error);
      toast.error('Failed to load workers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  // ---------------------------------------------------------------------
  // Admin actions
  const approveWorker = async (id) => {
    try {
      await api.put(`/workers/${id}/approve`);
      toast.success('Worker approved successfully');
      fetchWorkers();
    } catch (err) {
      toast.error('Failed to approve worker.');
    }
  };

  const rejectWorker = async (id) => {
    try {
      await api.put(`/workers/${id}/reject`);
      toast.success('Worker rejected successfully');
      fetchWorkers();
    } catch (err) {
      toast.error('Failed to reject worker.');
    }
  };

  const handleAddWorker = async (workerData) => {
    try {
      // Ensure services are formatted correctly if needed by backend
      // Backend expects "services" as array of strings (names) or "servicePricing"
      // AddWorkerModal sends { services: ["Sub1", "Sub2"], categories: ["Cat1"] }

      await api.post('/workers/register', workerData);

      toast.success('Worker added successfully');
      setShowAddWorkerModal(false);
      fetchWorkers();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to add worker');
    }
  };

  const handleEditWorker = (worker) => {
    setSelectedWorkerForEdit(worker);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedWorkerForEdit(null);
  };

  const refreshWorkers = () => {
    fetchWorkers();
  };

  const handleDownloadQR = () => {
    const canvas = document.getElementById('worker-qr-canvas');
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `RanX24_Verified_${qrModalWorker?.firstName}_${qrModalWorker?.lastName}_QR.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  // ---------------------------------------------------------------------
  // Filtering
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const filteredWorkers = useMemo(() => {
    let filtered = Array.isArray(workers) ? workers : [];
    if (view === 'pending') filtered = filtered.filter((w) => w.status === 'pending');
    else if (view === 'verified') filtered = filtered.filter((w) => w.status === 'approved');
    // else view === 'all' -> no status filter

    return filtered.filter((worker) => {
      const fullName = `${worker.firstName} ${worker.lastName}`;
      const nameMatch = filters.name
        ? fullName.toLowerCase().includes(filters.name.toLowerCase())
        : true;
      const stateMatch = filters.state
        ? worker.state?.toLowerCase() === filters.state.toLowerCase()
        : true;
      const cityMatch = filters.city
        ? worker.city?.toLowerCase() === filters.city.toLowerCase()
        : true;
      const pincodeMatch = filters.pincode ? worker.pincode === filters.pincode : true;

      // Check services (array of strings) or servicePricing
      const serviceNames = worker.services || [];
      const categoryMatch = filters.category
        ? serviceNames.some(s => s.toLowerCase().includes(filters.category.toLowerCase())) // Simplified check as we might not have full category objects in list view
        : true;

      return (
        nameMatch &&
        stateMatch &&
        cityMatch &&
        pincodeMatch &&
        categoryMatch
      );
    });
  }, [workers, view, filters]);

  const filterOptions = useMemo(() => {
    const allWorkers = Array.isArray(workers) ? workers : [];
    const states = [...new Set(allWorkers.map((w) => w.state).filter(Boolean))];
    const cities = [...new Set(allWorkers.map((w) => w.city).filter(Boolean))];
    const pincodes = [...new Set(allWorkers.map((w) => w.pincode).filter(Boolean))];
    // Simplified categories for filter options based on available data
    const categories = [...new Set(allWorkers.flatMap(w => w.services || []))];
    return { states, cities, pincodes, categories };
  }, [workers]);

  // ---------------------------------------------------------------------
  // Render
  if (loading) return <div className="p-8 text-center text-gray-500">Loading workers...</div>;

  return (
    <>
      {/* Header & view toggles */}
      <div className="mb-4">
        <h2 className="text-2xl font-black text-blue-900 mb-2 flex items-center gap-2 tracking-tight">
          <i className="fa-solid fa-user-tie text-blue-600" /> Professionals Management
        </h2>
        <div className="flex items-center justify-between">
          <div className="flex border-b border-gray-200">
            <div
              onClick={() => setView('pending')}
              className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors cursor-pointer ${view === 'pending' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Pending ({workers.filter((w) => w.status === 'pending').length})
            </div>
            <div
              onClick={() => setView('verified')}
              className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors cursor-pointer ${view === 'verified' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Verified ({workers.filter((w) => w.status === 'approved').length})
            </div>
            <div
              onClick={() => setView('all')}
              className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors cursor-pointer ${view === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              All ({workers.length})
            </div>
          </div>
          <button
            onClick={() => setShowAddWorkerModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition text-sm font-semibold"
          >
            + Add Worker
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end mb-4">
        <input
          name="name"
          value={filters.name}
          onChange={handleFilterChange}
          type="text"
          placeholder="Search Name..."
          className="px-3 py-2 border border-gray-200 rounded shadow text-sm w-full sm:w-auto flex-grow sm:flex-grow-0 sm:w-[170px] focus:ring-2 focus:ring-blue-200"
        />
        <select name="state" value={filters.state} onChange={handleFilterChange} className="px-3 py-2 border border-gray-200 shadow rounded text-sm w-full sm:w-auto flex-grow sm:flex-grow-0 sm:w-[140px]">
          <option value="">All States</option>
          {filterOptions.states.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <select name="city" value={filters.city} onChange={handleFilterChange} className="px-3 py-2 border border-gray-200 shadow rounded text-sm w-full sm:w-auto flex-grow sm:flex-grow-0 sm:w-[140px]">
          <option value="">All Cities</option>
          {filterOptions.cities.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <input
          name="pincode"
          value={filters.pincode}
          onChange={handleFilterChange}
          type="text"
          placeholder="Pincode"
          className="px-3 py-2 border border-gray-200 rounded shadow text-sm w-full sm:w-auto flex-grow sm:flex-grow-0 sm:w-[120px]"
        />
      </div>

      {/* Workers table */}
      <div className="overflow-x-auto rounded-2xl shadow-lg border border-gray-100 slim-scrollbar max-h-[550px]">
        <table className="min-w-[1300px] w-full text-sm leading-relaxed">
          <thead className="sticky top-0 z-10 bg-blue-50 shadow">
            <tr>
              <th className="px-3 py-3 font-bold text-blue-700 text-left">Worker ID</th>
              <th className="px-3 py-3 font-bold text-blue-700 text-left">Name</th>
              <th className="px-3 py-3 font-bold text-blue-700 text-left">Number</th>
              <th className="px-3 py-3 font-bold text-blue-700 text-left">Services</th>
              <th className="px-3 py-3 font-bold text-blue-700 text-center">Documents</th>
              <th className="px-3 py-3 font-bold text-blue-700 text-left">Job Location</th>
              <th className="px-3 py-3 font-bold text-blue-700 text-center">Status</th>
              <th className="px-3 py-3 font-bold text-blue-700 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredWorkers.map((worker, index) => (
              <tr key={worker._id} className="border-b border-gray-100 hover:bg-sky-50">
                <td className="px-3 py-3 font-mono font-bold text-blue-600">#{worker._id?.slice(-6).toUpperCase()}</td>
                <td className="px-3 py-3 font-semibold text-gray-700">{worker.firstName} {worker.lastName}</td>
                <td className="px-3 py-3">{worker.mobileNumber}</td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {/* Prioritize servicePricing for display, fallback to legacy services array */}
                    {(worker.servicePricing && worker.servicePricing.length > 0
                      ? worker.servicePricing.filter(sp => sp.isActive).map(sp => sp.serviceName)
                      : worker.services || []
                    ).map((s, i) => (
                      <span key={i} className="inline-block bg-cyan-100 text-cyan-800 px-2 py-1 rounded font-bold text-xs">
                        {s}
                      </span>
                    ))}
                    {(!worker.services || worker.services.length === 0) && (!worker.servicePricing || worker.servicePricing.length === 0) && (
                      <span className="text-gray-400 italic">No services</span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-3 text-center">
                  {worker.aadhaarFront || worker.aadhaarCard ? (
                    <a
                      href={`${API_URL_BASE}/uploads/${worker.aadhaarFront || worker.aadhaarCard}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs hover:bg-blue-200 font-semibold transition shadow"
                    >
                      <i className="fa-regular fa-id-card mr-1" /> Aadhar
                    </a>
                  ) : (
                    <span className="text-gray-400 text-xs">N/A</span>
                  )}
                </td>
                <td className="px-3 py-3 jobloc-cell font-semibold text-blue-800">
                  <div className="flex flex-col">
                    <span>{worker.city}, {worker.state}</span>
                    <span className="text-xs text-gray-500">{worker.pincode}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-center">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${worker.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : worker.status === 'approved' ? 'bg-green-100 text-green-800' : worker.status === 'inactive' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'}`}>
                    {worker.status}
                  </span>
                </td>
                <td className="px-3 py-3 text-center flex flex-wrap justify-center gap-2">
                  {worker.status === 'pending' && (
                    <>
                      <button onClick={() => approveWorker(worker._id)} className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs hover:bg-green-200 transition font-semibold shadow">
                        <i className="fa-solid fa-check" /> Accept
                      </button>
                      <button onClick={() => rejectWorker(worker._id)} className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs hover:bg-red-200 transition font-semibold shadow">
                        <i className="fa-solid fa-xmark" /> Reject
                      </button>
                    </>
                  )}
                  {worker.status === 'approved' && (
                    <button onClick={() => setQrModalWorker(worker)} className="px-2 py-1 rounded bg-indigo-100 text-indigo-700 text-xs hover:bg-indigo-200 transition font-semibold shadow">
                      <i className="fa-solid fa-qrcode" /> QR
                    </button>
                  )}
                  <button onClick={() => handleEditWorker(worker)} className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs hover:bg-gray-200 transition font-semibold shadow">
                    <i className="fa-solid fa-pen-to-square" /> Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedWorkerForEdit && (
        <WorkerEditModal
          worker={selectedWorkerForEdit}
          onClose={closeEditModal}
          onRefresh={refreshWorkers}
        />
      )}

      {/* Add Worker Modal */}
      {showAddWorkerModal && (
        <AddWorkerModal
          categories={categories}
          subCategories={subCategories}
          onSave={handleAddWorker}
          onClose={() => setShowAddWorkerModal(false)}
        />
      )}

      {/* QR Code Modal for Download */}
      {qrModalWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Worker Verification QR</h3>
            <p className="text-sm text-gray-500 mb-6 text-center">{qrModalWorker.firstName} {qrModalWorker.lastName}</p>
            
            <div className="bg-white p-4 border-4 border-indigo-50 rounded-2xl shadow-sm mb-6 flex justify-center w-full">
              <QRCodeCanvas 
                id="worker-qr-canvas"
                value={`https://ranx24.com/verify-worker/${qrModalWorker._id}`}
                size={220}
                level={"H"}
                includeMargin={true}
              />
            </div>
            
            <div className="flex gap-4 w-full">
              <button onClick={() => setQrModalWorker(null)} className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition cursor-pointer">Cancel</button>
              <button onClick={handleDownloadQR} className="flex-1 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition shadow-md flex items-center justify-center cursor-pointer">
                 <i className="fa-solid fa-download mr-2"></i> Download Image
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WorkerManagement;
