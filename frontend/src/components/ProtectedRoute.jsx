import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import toast from 'react-hot-toast';

const ProtectedRoute = ({ allowedRoles, redirectPath = '/login' }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user')); // Assuming user data (including role) is stored here

  if (!token) {
    toast.error('Please log in to access this page.');
    return <Navigate to={redirectPath} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Fallback: Check if userType in localStorage matches
    const storedUserType = localStorage.getItem('userType');
    if (storedUserType && allowedRoles.includes(storedUserType)) {
      // Allow if userType matches
      return <Outlet />;
    }

    toast.error('You do not have permission to access this page.');
    return <Navigate to="/" replace />; // Redirect to home or a forbidden page
  }

  return <Outlet />;
};

export default ProtectedRoute;
