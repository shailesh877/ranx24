import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const AdminLoginPage = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleAdminLogin = async () => {
    try {
      const { data } = await api.post('/admin/login', { mobileNumber, password });

      if (data) {
        login(data.user, data.token);
        // localStorage.setItem('userType', 'admin'); // login function handles this if role is present

        alert(data.message);
        navigate('/admin-dashboard'); // Navigate to admin dashboard on successful login
      }
    } catch (error) {
      console.error('Error during admin login:', error);
      const errorMsg = error.response?.data?.message || 'Server error during login';
      alert(errorMsg);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Login</h1>
      <input
        type="number"
        placeholder="Enter Admin Mobile Number"
        value={mobileNumber}
        onChange={(e) => setMobileNumber(e.target.value)}
        className="mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />
      <input
        type="password"
        placeholder="Enter Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />
      <button
        onClick={handleAdminLogin}
        className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
      >
        Admin Login
      </button>
    </div>
  );
};

export default AdminLoginPage;
