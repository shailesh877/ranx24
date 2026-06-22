import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLocation as useUserLocation } from '../context/LocationContext';
import logo from '../assets/images/logo.png';
import userImg from '../assets/images/user.png';
import { LucideMapPin, LucideShoppingCart, LucideUser, LucideLogOut, LucideMenu, LucideX, LucideChevronDown } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems } = useCart();
  const { isAuthenticated, logout, user } = useAuth();
  const { location: userLocation, detectLocation, availableCities, updateCity } = useUserLocation();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobilePlansOpen, setMobilePlansOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setShowProfileDropdown(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/categories' },
    { name: 'Home Tips', path: '/home-tips' },
    { name: 'About Us', path: '/about' }, // Placeholder
    { name: 'Contact', path: '/contact' }, // Placeholder
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${isScrolled 
        ? 'bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] py-3' 
        : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group relative">
            <div className="bg-blue-600 p-1.5 rounded-xl shadow-lg shadow-blue-600/20 transition-transform group-hover:scale-110">
              <img src={logo} alt="RanX24" className="h-7 w-7 brightness-0 invert" />
            </div>
            <span className={`text-2xl font-extrabold tracking-tight ${isScrolled ? 'text-gray-900' : 'text-gray-900'} drop-shadow-sm`}>
              RanX<span className="text-blue-600">24</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-[15px] font-semibold tracking-wide transition-all duration-300 relative group/link ${
                  location.pathname === link.path ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {link.name}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-blue-600 transition-all duration-300 ${
                  location.pathname === link.path ? 'w-full' : 'w-0 group-hover/link:w-full'
                }`} />
              </Link>
            ))}

            {/* Our Plan Dropdown */}
            <div className="relative group">
              <button
                className={`text-[15px] font-semibold tracking-wide flex items-center gap-1.5 transition-all duration-300 ${
                  (location.pathname.includes('-plan') || location.pathname.includes('-package')) ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Plans & Packages
                <LucideChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
              </button>
              
              <div className="absolute top-full left-0 pt-3 w-64 hidden group-hover:block transition-all z-50 animate-in fade-in slide-in-from-top-1 duration-300">
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl py-3 border border-blue-50/50">
                  {[
                    { name: 'Membership Plan', path: '/membership-plan', desc: 'Unlock exclusive benefits & savings' },
                    { name: 'AMC', path: '/marriage-event-package', desc: 'Annual Maintenance Contract for home services' }
                  ].map((plan) => (
                    <Link
                      key={plan.name}
                      to={plan.path}
                      className="flex flex-col px-5 py-3 hover:bg-blue-50 transition-colors"
                    >
                      <span className="text-sm font-bold text-gray-900">{plan.name}</span>
                      <span className="text-[11px] font-medium text-gray-500 mt-0.5">{plan.desc}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Location Pill / City Selector */}
            <div className="relative group">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-gray-50/50 hover:bg-white border border-gray-100 hover:border-blue-200 rounded-2xl transition-all duration-300 text-sm font-semibold text-gray-700 shadow-sm hover:shadow-md"
              >
                <LucideMapPin size={16} className="text-blue-600" />
                <span className="max-w-[120px] truncate">
                  {userLocation.loading ? 'Locating...' : userLocation.city || 'Select City'}
                </span>
                <LucideChevronDown size={14} className="text-gray-400 group-hover:rotate-180 transition-transform duration-300" />
              </button>

              {/* City Dropdown */}
              <div className="absolute top-full left-0 mt-3 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl py-2 border border-blue-50/50 hidden group-hover:block transition-all z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Select Your City</span>
                  <button onClick={detectLocation} className="text-[11px] font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4">Detect</button>
                </div>
                <div className="max-h-60 overflow-y-auto px-1 py-1">
                  {availableCities?.length > 0 ? (
                    availableCities.map((city) => (
                      <button
                        key={city._id}
                        onClick={() => updateCity(city.name)}
                        className={`w-full text-left px-4 py-2.5 text-sm rounded-xl transition-all duration-200 flex justify-between items-center group/item ${
                          userLocation.city === city.name 
                            ? 'text-blue-600 font-bold bg-blue-50/80' 
                            : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'
                        }`}
                      >
                        {city.name}
                        {userLocation.city === city.name && (
                          <div className="w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]"></div>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-4 text-xs text-gray-400 text-center italic">Loading available cities...</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-8">
            {isAuthenticated ? (
              <>
                <Link to="/user_cart" className="relative group">
                  <div className="p-2.5 rounded-xl hover:bg-blue-50 transition-all duration-300">
                    <LucideShoppingCart size={22} className="text-gray-700 group-hover:text-blue-600" />
                  </div>
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full ring-2 ring-white shadow-lg animate-bounce">
                      {cartItems.length}
                    </span>
                  )}
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center gap-3 p-1 pr-3 bg-gray-50/50 border border-gray-100 rounded-2xl hover:bg-white hover:border-blue-100 transition-all group"
                  >
                    <div className="relative">
                      <img
                        src={userImg}
                        alt="User"
                        className="w-8 h-8 rounded-xl border-2 border-white shadow-md group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                    </div>
                    <div className="text-left hidden lg:block">
                      <p className="text-[13px] font-bold text-gray-900 leading-tight">{user?.name?.split(' ')[0]}</p>
                      <p className="text-[10px] font-bold text-blue-600/70 uppercase tracking-tighter">
                        {user?.membership?.planName || 'Registered User'}
                      </p>
                    </div>
                    <LucideChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${showProfileDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl py-2 border border-blue-50/50 transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/30">
                        <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                        <p className="text-xs font-medium text-gray-500 truncate mt-0.5">{user?.email || user?.phone}</p>
                      </div>

                      <div className="py-2 px-1">
                        {[
                          { icon: LucideUser, label: 'Profile Settings', path: user?.role === 'worker' ? '/worker-dashboard' : user?.role === 'admin' ? '/admin-dashboard' : '/profile' },
                          { icon: LucideMenu, label: 'Service History', path: '/my-bookings' },
                          { icon: LucideMapPin, label: 'Coin Center', path: '/user-wallet' },
                        ].map((item, idx) => (
                          <Link 
                            key={idx}
                            to={item.path} 
                            className="flex items-center px-4 py-2.5 text-[13px] font-semibold text-gray-600 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors mx-1"
                            onClick={() => setShowProfileDropdown(false)}
                          >
                            <item.icon size={16} className="mr-3 opacity-70" /> {item.label}
                          </Link>
                        ))}
                      </div>

                      <div className="border-t border-gray-50 mt-1 pt-2 px-2">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center px-4 py-3 text-[13px] font-bold text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                        >
                          <LucideLogOut size={16} className="mr-3" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-6">
                <Link to="/login" className="text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors tracking-wide">
                  Log in
                </Link>
                <Link
                  to="/categories"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-7 py-3 rounded-2xl text-[14px] font-bold transition-all shadow-xl shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0"
                >
                  Book Now
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600 bg-gray-100 rounded-xl"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <LucideX size={24} /> : <LucideMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`md:hidden fixed inset-0 top-[72px] bg-white/95 backdrop-blur-2xl z-40 transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex flex-col gap-1 p-6 h-full overflow-y-auto">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-lg font-bold text-gray-800 py-4 border-b border-gray-50 flex items-center justify-between group"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
              <LucideChevronDown size={18} className="text-gray-300 -rotate-90 group-hover:text-blue-600 transition-colors" />
            </Link>
          ))}

          {/* Mobile Our Plan */}
          <div className="border-b border-gray-50">
            <button
              className="w-full text-lg font-bold text-gray-800 py-4 flex items-center justify-between group"
              onClick={() => setMobilePlansOpen(!mobilePlansOpen)}
            >
              Plans & Packages
              <LucideChevronDown size={18} className={`text-gray-400 transition-transform duration-300 ${mobilePlansOpen ? 'rotate-180' : ''}`} />
            </button>
            {mobilePlansOpen && (
              <div className="bg-gray-50/50 rounded-2xl mb-4 overflow-hidden">
                {[
                  { name: 'Membership Plan', path: '/membership-plan' },
                  { name: 'AMC', path: '/marriage-event-package' }
                ].map((plan) => (
                  <Link
                    key={plan.name}
                    to={plan.path}
                    className="block px-6 py-4 text-base font-semibold text-gray-600 hover:text-blue-600 border-b border-gray-100 last:border-0"
                    onClick={() => { setMobileMenuOpen(false); setMobilePlansOpen(false); }}
                  >
                    {plan.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          {isAuthenticated ? (
            <div className="flex flex-col gap-4 mt-6">
              <div className="flex items-center gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                <img src={userImg} alt="User" className="w-12 h-12 rounded-xl shadow-sm border-2 border-white" />
                <div>
                  <p className="text-base font-bold text-gray-900">{user?.name}</p>
                  <p className="text-sm font-medium text-blue-600/80 capitalize">{user?.role} Account</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                {[
                  { icon: LucideShoppingCart, label: 'My Cart', path: '/user_cart' },
                  { icon: LucideUser, label: 'Settings', path: '/profile' },
                  { icon: LucideMenu, label: 'Bookings', path: '/my-bookings' },
                  { icon: LucideLogOut, label: 'Sign Out', action: handleLogout, color: 'text-red-600' },
                ].map((item, idx) => (
                  <button 
                    key={idx}
                    onClick={() => { if(item.action) item.action(); setMobileMenuOpen(false); if(item.path) navigate(item.path); }}
                    className={`flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-2xl hover:bg-white border border-transparent hover:border-blue-100 transition-all ${item.color || 'text-gray-700'}`}
                  >
                    <item.icon size={20} />
                    <span className="text-xs font-bold">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 mt-auto pb-10">
              <Link to="/login" className="w-full text-center py-4 rounded-2xl border-2 border-gray-100 text-gray-800 font-bold hover:bg-gray-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                Member Login
              </Link>
              <Link to="/categories" className="w-full text-center py-4 rounded-2xl bg-blue-600 text-white font-bold shadow-xl shadow-blue-600/20" onClick={() => setMobileMenuOpen(false)}>
                Book Professional Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
