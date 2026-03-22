import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast'; // Import toast for notifications

// const API_URL = 'http://localhost:5000/api'; // Base API URL

export default function WorkerLoginPage() {
  const [mobileNumber, setMobileNumber] = useState('');

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state
  const navigate = useNavigate();



  const handleLogin = async () => {
    if (!mobileNumber || !password) {
      toast.error('Please enter mobile number and password.');
      return;
    }

    setLoading(true); // Set loading true
    try {
      // Call the backend's login endpoint
      const { data } = await api.post('/auth/login', {
        identifier: mobileNumber,
        password,
        userType: 'worker'
      });

      toast.success('Login Successful!');
      localStorage.setItem('token', data.token);

      const userType = data.userType || 'worker';
      localStorage.setItem('userType', userType);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect based on userType
      if (userType === 'worker') {
        navigate('/worker-dashboard'); // Redirect worker to their dashboard
      } else {
        toast.error('Unauthorized access.');
      }
    } catch (err) {
      console.error('Error logging in:', err);
      toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false); // Set loading false
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-[Poppins]">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-blue-900 mb-6 text-center">
          Worker Login
        </h1>

        {/* Error messages are now handled by react-hot-toast */}

        <div className="space-y-6">
          <div>
            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
              Mobile Number
            </label>
            <input
              type="tel"
              id="mobile"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="Enter your 10-digit mobile number"
              className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              maxLength="10"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading} // Disable button when loading
            className="w-full py-3 px-4 bg-blue-900 text-white font-semibold rounded-lg shadow-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="/worker-register" className="text-blue-600 hover:underline">
                Register here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
