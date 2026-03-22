import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminRegisterPage = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleAdminRegister = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://backend.ranx24.com/api';
      const response = await fetch(`${API_URL}/admin/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobileNumber, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userType', 'admin');

        alert(data.message);
        navigate('/admin-dashboard'); // Navigate to admin dashboard on successful registration
      } else {
        alert(data.message || 'Admin registration failed');
      }
    } catch (error) {
      console.error('Error during admin registration:', error);
      alert('Server error during registration');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Register</h1>
      <input
        type="number" // Corrected type to number
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
        onClick={handleAdminRegister}
        className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
      >
        Admin Register
      </button>
    </div>
  );
};

export default AdminRegisterPage;
