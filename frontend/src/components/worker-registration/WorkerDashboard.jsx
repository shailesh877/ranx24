import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  FiHome, FiCalendar, FiDollarSign, FiUser, FiStar, FiLogOut,
  FiBell, FiMenu, FiX, FiCheckCircle, FiClock, FiMapPin
} from "react-icons/fi";
import toast from "react-hot-toast";
import { useSocket } from "../../context/SocketContext";

const API_URL = import.meta.env.VITE_API_URL || "https://backend.ranx24.com/api";
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "https://backend.ranx24.com";

export default function WorkerDashboard() {
  const [worker, setWorker] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const socket = useSocket();

  // Fetch Worker Data
  useEffect(() => {
    const fetchWorker = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      const mobile = user?.mobileNumber;

      if (!mobile) {
        console.log("No mobile number found in user data, redirecting...");
        return navigate("/worker-login");
      }

      try {
        const { data } = await axios.get(`${API_URL}/workers/mobile/${mobile}`);
        console.log("Worker Data Loaded:", data);
        setWorker(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load profile");
        if (err.response?.status === 404) navigate("/worker-login");
      } finally {
        setLoading(false);
      }
    };
    fetchWorker();
  }, [navigate]);

  // Fetch Worker Bookings
  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem("token");
      if (!token || !worker) return;

      try {
        const { data } = await axios.get(`${API_URL}/bookings/worker/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(data);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      }
    };

    if (worker) {
      fetchBookings();
    }
  }, [worker]);

  // Socket.IO Real-time Listener
  useEffect(() => {
    if (!socket || !worker) return;

    // Listen for new booking requests
    socket.on('booking_created', (data) => {
      console.log("New booking received:", data);
      toast.success("🔔 New booking request received!");

      // Add new booking to list
      setBookings(prev => [data.booking, ...prev]);

      // Play notification sound (optional)
      const audio = new Audio('/notification.mp3');
      audio.play().catch(e => console.log("Audio play failed:", e));
    });

    return () => {
      socket.off('booking_created');
    };
  }, [socket, worker]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-900">Loading Dashboard...</div>;
  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-red-600 gap-4">
      <p>{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800"
      >
        Retry
      </button>
    </div>
  );
  if (!worker) return null;

  // Show pending verification screen if worker is not approved
  if (worker.status !== 'approved') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="mb-6">
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiClock className="w-12 h-12 text-yellow-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Pending Verification</h1>
            <p className="text-gray-600 mb-6">
              Thank you for registering! Your profile is currently under review by our admin team.
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-blue-900 mb-3">What happens next?</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Our team will verify your documents and details</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>You'll receive a notification once approved</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>After approval, you can access your full dashboard</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <p className="text-sm text-gray-600 mb-1">Current Status</p>
              <div className="flex items-center gap-2">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${worker.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
                  }`}>
                  {worker.status === 'pending' ? '⏳ Pending Review' : '❌ Rejected'}
                </span>
              </div>
            </div>

            {worker.status === 'rejected' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                <p className="text-sm text-red-800">
                  <strong>Note:</strong> Your application was not approved. Please contact support for more information.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              navigate('/worker-login');
            }}
            className="mt-6 w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold flex items-center justify-center gap-2"
          >
            <FiLogOut />
            Logout
          </button>
        </div>
      </div>
    );
  }

  // Accept Booking Handler
  const handleAcceptBooking = async (bookingId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const { data } = await axios.put(
        `${API_URL}/bookings/${bookingId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Booking accepted!");

      // Update booking in state
      setBookings(prev => prev.map(b =>
        b._id === bookingId ? { ...b, status: 'accepted' } : b
      ));
    } catch (err) {
      console.error("Error accepting booking:", err);
      toast.error(err.response?.data?.message || "Failed to accept booking");
    }
  };

  // Reject Booking Handler
  const handleRejectBooking = async (bookingId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const { data } = await axios.put(
        `${API_URL}/bookings/${bookingId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Booking rejected");

      // Update booking in state
      setBookings(prev => prev.map(b =>
        b._id === bookingId ? { ...b, status: 'rejected' } : b
      ));
    } catch (err) {
      console.error("Error rejecting booking:", err);
      toast.error(err.response?.data?.message || "Failed to reject booking");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        worker={worker}
        navigate={navigate}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          worker={worker}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Welcome & Status */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Welcome back, {worker.firstName}! 👋
                </h1>
                <p className="text-gray-500 text-sm">Here's what's happening with your jobs today.</p>
              </div>
              <StatusToggle active={true} /> {/* Placeholder for active status */}
            </div>

            {/* Stats Grid */}
            <StatsGrid workerId={worker._id} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Recent Requests */}
              <div className="lg:col-span-2 space-y-6">
                <RecentRequests
                  bookings={bookings}
                  onAccept={handleAcceptBooking}
                  onReject={handleRejectBooking}
                />
              </div>

              {/* Right Column: Notifications & Feedback */}
              <div className="space-y-6">
                <Notifications workerId={worker._id} />
                <FeedbackSummary workerId={worker._id} />
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

/* ================= SUB-COMPONENTS ================= */

function Sidebar({ open, setOpen, worker, navigate }) {
  const location = useLocation();

  const links = [
    { name: "Dashboard", path: "/worker-dashboard", icon: <FiHome /> },
    { name: "My Bookings", path: "/worker/my-bookings", icon: <FiCalendar /> },
    { name: "Wallet", path: "/worker/wallet", icon: <FiDollarSign /> },
    { name: "Profile", path: "/worker/profile", icon: <FiUser /> },
    { name: "Reviews", path: "/worker/reviews", icon: <FiStar /> },
  ];

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("workerMobileNumber"); // Keep for cleanup
      localStorage.removeItem("token");
      localStorage.removeItem("userType");
      localStorage.removeItem("user"); // Clear user object
      navigate("/worker-login");
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden cursor-pointer"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-blue-900 text-white transform transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center text-blue-900 font-bold">Y</div>
            <span className="text-xl font-bold tracking-wide">RanX24</span>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden text-white">
            <FiX size={24} />
          </button>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive
                  ? "bg-blue-800 text-yellow-400 font-semibold shadow-lg"
                  : "text-blue-100 hover:bg-blue-800 hover:text-white"
                  }`}
              >
                <span className="text-xl">{link.icon}</span>
                <span>{link.name}</span>
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-blue-800 hover:text-red-200 transition-colors mt-10"
          >
            <span className="text-xl"><FiLogOut /></span>
            <span>Logout</span>
          </button>
        </nav>

        <div className="absolute bottom-0 left-0 w-full p-6">
          <div className="flex items-center gap-3 bg-blue-800 p-3 rounded-xl">
            <img
              src={worker.livePhoto ? `${SERVER_URL}/uploads/${worker.livePhoto}` : "https://via.placeholder.com/40"}
              onError={(e) => e.target.src = "https://via.placeholder.com/40"}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-yellow-400"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{worker.firstName}</p>
              <p className="text-xs text-blue-300 truncate">{worker.categories[0]}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function Header({ worker, setSidebarOpen }) {
  const [imgSrc, setImgSrc] = useState(worker.livePhoto ? `${SERVER_URL}/uploads/${worker.livePhoto}` : "https://via.placeholder.com/40");

  const handleError = () => {
    if (imgSrc !== "https://via.placeholder.com/40") {
      setImgSrc("https://via.placeholder.com/40");
    }
  };

  return (
    <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden text-gray-600 hover:text-blue-900"
        >
          <FiMenu size={24} />
        </button>
        <h2 className="text-lg font-semibold text-gray-700 lg:hidden">Dashboard</h2>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative text-gray-500 hover:text-blue-900 transition">
          <FiBell size={24} />
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-gray-800">{worker.firstName} {worker.lastName}</p>
            <p className="text-xs text-gray-500">{worker.workerType || 'Worker'}</p>
          </div>
          <img
            src={imgSrc}
            onError={handleError}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border-2 border-gray-100 shadow-sm"
          />
        </div>
      </div>
    </header>
  );
}

function StatusToggle({ active }) {
  const [isOnline, setIsOnline] = useState(active);

  return (
    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
      <span className={`text-sm font-medium ${isOnline ? "text-green-600" : "text-gray-500"}`}>
        {isOnline ? "You are Online" : "You are Offline"}
      </span>
      <button
        onClick={() => setIsOnline(!isOnline)}
        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isOnline ? "bg-green-500" : "bg-gray-300"
          }`}
      >
        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isOnline ? "translate-x-6" : "translate-x-0"
          }`} />
      </button>
    </div>
  );
}

function StatsGrid({ workerId }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/workers/${workerId}/stats`)
      .then(res => setStats(res.data))
      .catch(err => console.error(err));
  }, [workerId]);

  const items = [
    { title: "Total Earnings", value: stats ? `₹${stats.walletBalance}` : "...", icon: <FiDollarSign />, color: "bg-green-100 text-green-600" },
    { title: "Active Jobs", value: stats ? stats.activeBookings : "...", icon: <FiClock />, color: "bg-blue-100 text-blue-600" },
    { title: "Pending Requests", value: stats ? stats.pendingBookings : "...", icon: <FiBell />, color: "bg-yellow-100 text-yellow-600" },
    { title: "Completed Jobs", value: stats ? stats.completedBookings : "...", icon: <FiCheckCircle />, color: "bg-purple-100 text-purple-600" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, idx) => (
        <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${item.color}`}>
            {item.icon}
          </div>
          <div>
            <p className="text-gray-500 text-sm">{item.title}</p>
            <p className="text-2xl font-bold text-gray-800">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function RecentRequests({ bookings, onAccept, onReject }) {
  const navigate = useNavigate();

  // Filter for pending bookings and take top 5
  const requests = bookings.filter(b => b.status === 'pending').slice(0, 5);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-800">New Job Requests</h3>
        <Link to="/worker/my-bookings" className="text-blue-600 text-sm font-medium hover:underline">View All</Link>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-gray-500">No new job requests at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => (
            <div key={req._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 rounded-xl border border-gray-100 gap-4 transition-all hover:shadow-md">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold shrink-0">
                  {req.user?.name?.[0] || 'U'}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{req.service}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <FiUser size={14} /> <span>{req.user?.name}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <FiMapPin size={14} /> <span>{req.address?.city || 'Location'}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(req.bookingDate).toLocaleDateString()} • {req.bookingTime}
                  </p>
                  <p className="text-xs font-semibold text-green-600 mt-1">
                    ₹{req.price}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                <button
                  onClick={() => onReject(req._id)}
                  className="flex-1 sm:flex-none px-3 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => onAccept(req._id)}
                  className="flex-1 sm:flex-none px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 shadow-sm hover:shadow transition-all"
                >
                  Accept
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Notifications({ workerId }) {
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/workers/${workerId}/notifications`)
      .then(res => setNotifs(res.data.slice(0, 3)))
      .catch(err => console.error(err));
  }, [workerId]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Notifications</h3>
      <div className="space-y-4">
        {notifs.length === 0 ? (
          <p className="text-gray-500 text-sm">No notifications.</p>
        ) : (
          notifs.map((n, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className={`mt-1 w-2 h-2 rounded-full ${n.color?.replace('text-', 'bg-') || 'bg-blue-500'}`}></div>
              <div>
                <p className="text-sm font-medium text-gray-800">{n.title}</p>
                <p className="text-xs text-gray-500">{n.time}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function FeedbackSummary({ workerId }) {
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/workers/${workerId}/feedback`)
      .then(res => setFeedback(res.data.slice(0, 2)))
      .catch(err => console.error(err));
  }, [workerId]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Feedback</h3>
      <div className="space-y-4">
        {feedback.length === 0 ? (
          <p className="text-gray-500 text-sm">No feedback yet.</p>
        ) : (
          feedback.map((f, i) => (
            <div key={i} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-sm text-gray-800">{f.name}</span>
                <div className="flex text-yellow-400 text-xs">
                  {"⭐".repeat(f.rating)}
                </div>
              </div>
              <p className="text-xs text-gray-500 italic">"{f.text}"</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
