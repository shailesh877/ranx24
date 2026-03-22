import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Smartphone,
  HardHat,
  CalendarCheck,
  Users,
  MapPin,
  LifeBuoy,
  X,
  ChevronRight,
  Wallet,
  Tag,
  Image as ImageIcon,
  Percent,
  Coins,
  CreditCard,
  Bell,
  Megaphone,
  Briefcase,
  Key,
  History
} from 'lucide-react';
import logo from '../../assets/images/logo.png';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.role;

  const NavItem = ({ to, label, icon: Icon, end = false }) => (
    <NavLink
      to={to}
      end={end}
      onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
      className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
    >
      {({ isActive }) => (
        <>
          <Icon size={20} className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
          <span className="font-medium tracking-wide">{label}</span>
          {isActive && (
            <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white shadow-sm"></div>
          )}
        </>
      )}
    </NavLink>
  );

  const SectionLabel = ({ label }) => (
    <div className="px-4 mb-2 mt-6">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
    </div>
  );

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-out shadow-2xl ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 border-r border-slate-800`}
      >
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <img src={logo} className="h-6 w-6 object-contain brightness-0 invert" alt="Logo" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-white leading-tight">RanX24</h1>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="h-[calc(100vh-80px)] overflow-y-auto py-6 px-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">

          <NavItem to="/admin-dashboard" label="Dashboard" icon={LayoutDashboard} end={true} />

          <SectionLabel label="Applications" />
          <NavItem to="/admin-dashboard/user-app" label="User App" icon={Smartphone} />
          <NavItem to="/admin-dashboard/worker-app" label="Worker App" icon={HardHat} />

          <SectionLabel label="Push Notifications" />
          <NavItem to="/admin-dashboard/notifications/user" label="User Notifications" icon={Megaphone} />
          <NavItem to="/admin-dashboard/notifications/worker" label="Worker Notifications" icon={Bell} />

          <SectionLabel label="Operations" />
          <NavItem to="/admin-dashboard/bookings" label="Bookings" icon={CalendarCheck} />
          <NavItem to="/admin-dashboard/users" label="Users" icon={Users} />
          <NavItem to="/admin-dashboard/workers" label="Workers" icon={Users} />
          <NavItem to="/admin-dashboard/categories" label="Categories" icon={Tag} />
          <NavItem to="/admin-dashboard/services" label="Services" icon={Briefcase} />
          <NavItem to="/admin-dashboard/cities" label="Cities" icon={MapPin} />

          {userRole !== 'employee' && (
            <NavItem to="/admin-dashboard/withdrawals" label="Withdrawals" icon={Wallet} />
          )}

          {userRole !== 'employee' && (
            <NavItem to="/admin-dashboard/payout-history" label="Payout History" icon={History} />
          )}

          {userRole !== 'employee' && (
            <>
              <SectionLabel label="Marketing & Finance" />
              <NavItem to="/admin-dashboard/finance" label="Finance" icon={Wallet} />
              <NavItem to="/admin-dashboard/banners" label="Banners" icon={ImageIcon} />
              <NavItem to="/admin-dashboard/coupons" label="Coupons" icon={Percent} />
              <NavItem to="/admin-dashboard/coins" label="Coins Config" icon={Coins} />
              <NavItem to="/admin-dashboard/fees" label="Fees Config" icon={CreditCard} />

              <SectionLabel label="Content Management" />
              <NavItem to="/admin-dashboard/home-tips" label="Home Tips" icon={Megaphone} />
              <NavItem to="/admin-dashboard/testimonials" label="Testimonials" icon={Megaphone} />

              <SectionLabel label="Staff" />
              <NavItem to="/admin-dashboard/employees" label="Employees" icon={Users} />
            </>
          )}


          <SectionLabel label="Settings" />
          <NavItem to="/admin-dashboard/change-password" label="Change Password" icon={Key} />

          <SectionLabel label="Support" />
          <NavItem to="/admin-dashboard/help" label="Help & Support" icon={LifeBuoy} />
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
