import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, User, LogOut, Key, ChevronDown, Bell } from 'lucide-react';

const Topbar = ({ onToggle, admin }) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove all admin session data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('adminToken'); // Legacy cleanup

    // Redirect to login page
    navigate('/admin-login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">

        {/* Left Side: Toggle & Title (Mobile) */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggle}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition lg:hidden"
          >
            <Menu size={24} />
          </button>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight hidden sm:block">
            Dashboard
          </h2>
        </div>

        {/* Right Side: Actions & Profile */}
        <div className="flex items-center gap-4">

          {/* Notifications (Placeholder) */}
          <button className="p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-slate-50 transition border border-transparent hover:border-slate-200"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
                <span className="text-sm">{admin.name ? admin.name[0].toUpperCase() : 'A'}</span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-slate-700 leading-none">{admin.name || 'Admin'}</p>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Administrator</p>
              </div>
              <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-slate-50 mb-1">
                  <p className="text-sm font-semibold text-slate-800">{admin.name || 'Admin User'}</p>
                  <p className="text-xs text-slate-500 truncate">{admin.email || 'admin@example.com'}</p>
                </div>

                <div className="px-2 space-y-1">
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors">
                    <User size={16} /> Profile Settings
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors">
                    <Key size={16} /> Change Password
                  </button>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-50 px-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
