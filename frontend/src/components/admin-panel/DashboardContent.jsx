import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  Wallet,
  Users,
  Briefcase,
  MapPin,
  UserCheck,
  Clock,
  Star,
  MessageSquare,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

const DashboardContent = () => {
  const { stats: totals } = useAdmin();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.role;

  // Data for Bar Chart
  const bookingData = [
    { name: 'Total', value: totals.bookings, color: '#3b82f6' },
    { name: 'Completed', value: totals.completedBookings, color: '#10b981' },
    { name: 'Today', value: totals.bookingsToday, color: '#f59e0b' },
    { name: 'Monthly', value: totals.bookingsMonth, color: '#8b5cf6' },
  ];

  // Data for Pie Chart
  const walletData = [
    { name: 'Total In', value: totals.wallet?.totalIn || 0 },
    { name: 'Total Out', value: totals.wallet?.totalOut || 0 },
    { name: 'Available', value: totals.wallet?.available || 0 },
  ];
  const walletColors = ['#10b981', '#ef4444', '#3b82f6'];

  const StatCard = ({ title, value, icon: Icon, color, trend, link }) => (
    <button
      onClick={() => link && navigate(link)}
      className={`bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all group relative overflow-hidden ${link ? 'cursor-pointer' : ''} duration-300 group text-left w-full`}
    >
      <div className={`absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full opacity-5 transition-transform group-hover:scale-110 ${color.bg}`}></div>

      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-xl ${color.bg} ${color.text} flex items-center justify-center shadow-sm`}>
          <Icon size={24} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <h3 className="text-3xl font-bold text-slate-800 mb-1">{value}</h3>
      <p className="text-sm font-medium text-slate-500">{title}</p>
    </button>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500">Welcome back, here's what's happening today.</p>
      </div>

      {/* Top Stats Row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Earnings Card - Only for Super Admin */}
        {userRole !== 'employee' && (
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/10">
                  <Wallet size={24} />
                </div>
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Revenue</p>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500/20 text-emerald-100 px-2 py-0.5 rounded text-xs font-medium border border-emerald-500/30 flex items-center gap-1">
                      <TrendingUp size={12} /> +12.5%
                    </span>
                  </div>
                </div>
              </div>
              <h2 className="text-4xl font-bold mb-2 tracking-tight">₹{(totals.earnings || 0).toLocaleString('en-IN')}</h2>
              <p className="text-sm text-blue-200/80">Total earnings from all services</p>
            </div>
          </div>
        )}

        {/* Rating Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 font-medium mb-1">Average Rating</p>
              <h2 className="text-4xl font-bold text-slate-800">{totals.reviews?.average || 0}</h2>
            </div>
            <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-500">
              <Star size={24} fill="currentColor" />
            </div>
          </div>
          <div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
              <div className="bg-yellow-400 h-full rounded-full transition-all duration-1000" style={{ width: `${(totals.reviews?.average / 5) * 100}%` }}></div>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">Based on {totals.reviews?.total || 0} reviews</p>
          </div>
        </div>

        {/* Reviews Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 font-medium mb-1">Total Reviews</p>
              <h2 className="text-4xl font-bold text-slate-800">{totals.reviews?.total || 0}</h2>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
              <MessageSquare size={24} />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <span className="text-xs text-slate-500 font-medium">+{totals.reviews?.week || 0} this week</span>
          </div>
        </div>
      </section>

      {/* Quick Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Verified Pros"
          value={totals.verifiedWorkers}
          icon={UserCheck}
          color={{ bg: 'bg-emerald-500', text: 'text-emerald-500' }}
          trend={5.2}
          link="worker-app"
        />
        <StatCard
          title="Pending Pros"
          value={totals.workersPending}
          icon={Clock}
          color={{ bg: 'bg-amber-500', text: 'text-amber-500' }}
          trend={-2.1}
          link="worker-app"
        />
        <StatCard
          title="Active Services"
          value={totals.activeServices}
          icon={Briefcase}
          color={{ bg: 'bg-violet-500', text: 'text-violet-500' }}
          link="user-app"
        />
        <StatCard
          title="Cities"
          value={totals.availableCities}
          icon={MapPin}
          color={{ bg: 'bg-indigo-500', text: 'text-indigo-500' }}
          link="cities"
        />
        <StatCard
          title="Total Users"
          value={totals.users}
          icon={Users}
          color={{ bg: 'bg-sky-500', text: 'text-sky-500' }}
          trend={12.5}
          link="users"
        />
      </section>

      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Activity Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Booking Activity</h3>
              <p className="text-sm text-slate-500">Overview of booking performance</p>
            </div>
            <select className="text-sm border-slate-200 rounded-lg text-slate-600 focus:ring-blue-500">
              <option>This Week</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                  {bookingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Wallet Chart - Only for Super Admin */}
        {userRole !== 'employee' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Wallet Distribution</h3>
            <p className="text-sm text-slate-500 mb-6">Financial breakdown</p>

            <div className="h-56 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={walletData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {walletData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={walletColors[index % walletColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                <span className="text-2xl font-bold text-slate-800">
                  {(totals.wallet?.available || 0).toLocaleString('en-IN', { maximumSignificantDigits: 3, notation: 'compact' })}
                </span>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Available</span>
              </div>
            </div>

            <div className="space-y-3 mt-2">
              <div className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-slate-600 font-medium">Total In</span>
                </div>
                <span className="font-bold text-slate-800">₹{(totals.wallet?.totalIn || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-slate-600 font-medium">Total Out</span>
                </div>
                <span className="font-bold text-slate-800">₹{(totals.wallet?.totalOut || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default DashboardContent;
