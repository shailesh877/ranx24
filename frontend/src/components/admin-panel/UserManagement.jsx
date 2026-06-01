import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (userData) => {
    try {
      await api.post('/admin/users', userData);
      toast.success("User created successfully");
      fetchUsers();
    } catch (err) {
      toast.error("Failed to create user");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await api.delete(`/admin/users/${userId}`);
        toast.success("User deleted successfully");
        fetchUsers();
      } catch (err) {
        toast.error("Failed to delete user");
      }
    }
  };

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(user =>
      (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleCreateUser({ name, email, phone });
    setName('');
    setEmail('');
    setPhone('');
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading users...</div>;

  return (
    <>
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-blue-900 mb-2 flex items-center gap-2 tracking-tight">
            <i className="fa-solid fa-users text-cyan-600"></i> All Users
          </h2>
        </div>
        <div className="relative">
          <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 pl-10 border border-gray-200 rounded-lg shadow-sm text-[15px] w-full md:w-[300px] focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>

      <div className="mb-4">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg shadow-sm text-[15px] w-full focus:ring-2 focus:ring-blue-200"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg shadow-sm text-[15px] w-full focus:ring-2 focus:ring-blue-200"
          />
          <input
            type="text"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg shadow-sm text-[15px] w-full focus:ring-2 focus:ring-blue-200"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-sm hover:bg-blue-600 transition"
          >
            Add User
          </button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-2xl shadow-lg border border-gray-100 slim-scrollbar max-h-[650px]">
        <table className="min-w-full w-full text-[15px] leading-relaxed">
          <thead className="sticky top-0 z-10 bg-blue-50 shadow">
            <tr>
              <th className="px-4 py-3 font-bold text-blue-700 text-left">Sr. No.</th>
              <th className="px-4 py-3 font-bold text-blue-700 text-left">Name</th>
              <th className="px-4 py-3 font-bold text-blue-700 text-left">Email</th>
               <th className="px-4 py-3 font-bold text-blue-700 text-left">Phone</th>
               <th className="px-4 py-3 font-bold text-blue-700 text-left">Membership</th>
               <th className="px-4 py-3 font-bold text-blue-700 text-left">Marriage & Event</th>
               <th className="px-4 py-3 font-bold text-blue-700 text-left">Joined On</th>
              <th className="px-4 py-3 font-bold text-blue-700 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? filteredUsers.map((user, index) => (
              <tr key={user._id} className="border-b border-gray-100 hover:bg-sky-50">
                <td className="px-4 py-3 font-mono">{index + 1}</td>
                <td className="px-4 py-3">{user.name}</td>
                <td className="px-4 py-3">{user.email}</td>
                 <td className="px-4 py-3">{user.phone}</td>
                 <td className="px-4 py-3">
                   {user.membership ? (
                     <div className="flex flex-col text-xs text-blue-800">
                       <span className="font-bold">{user.membership.planName}</span>
                       <span className="text-gray-500">Exp: {user.membership.expiry}</span>
                     </div>
                   ) : (
                     <span className="text-xs text-gray-400 italic">No Plan</span>
                   )}
                 </td>
                 <td className="px-4 py-3">
                   {user.amc ? (
                     <div className="flex flex-col text-xs text-teal-800">
                       <span className="font-bold">{user.amc.planName}</span>
                       <span className="text-gray-600 text-[10px]">#{user.amc.contractNumber}</span>
                       <span className="text-gray-500">Exp: {user.amc.expiry}</span>
                     </div>
                   ) : (
                     <span className="text-xs text-gray-400 italic">No Package</span>
                   )}
                 </td>
                 <td className="px-4 py-3">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    className="text-red-500 hover:text-red-700 cursor-pointer"
                    title="Delete User"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-500">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default UserManagement;
