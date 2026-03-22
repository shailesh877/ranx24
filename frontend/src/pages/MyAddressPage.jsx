import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaPlus, FaMapMarkerAlt, FaEdit, FaTrash, FaCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend.ranx24.com/api';

export default function MyAddressPage() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const { data } = await axios.get(`${API_URL}/addresses`, config);
      setAddresses(data);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      await axios.put(`${API_URL}/addresses/${addressId}/default`, {}, config);
      toast.success('Default address updated');
      fetchAddresses();
    } catch (error) {
      console.error('Error setting default:', error);
      toast.error('Failed to update default address');
    }
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      await axios.delete(`${API_URL}/addresses/${addressId}`, config);
      toast.success('Address deleted successfully');
      fetchAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Failed to delete address');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Addresses</h1>
            <p className="text-gray-600 mt-1">Manage your saved addresses</p>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate('/add-address')}
            icon={<FaPlus />}
          >
            Add Address
          </Button>
        </div>

        {/* Addresses List */}
        {loading ? (
          <div className="space-y-4">
            <Skeleton height="150px" count={3} />
          </div>
        ) : addresses.length > 0 ? (
          <div className="grid gap-4">
            {addresses.map((address) => (
              <Card key={address._id} hover className="relative">
                {/* Default Badge */}
                {address.isDefault && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="success">
                      <FaCheck className="mr-1" /> Default
                    </Badge>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaMapMarkerAlt className="text-blue-600 text-xl" />
                  </div>

                  {/* Address Details */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {address.label || 'Address'}
                    </h3>
                    <p className="text-gray-700 mb-2">
                      {address.street}, {address.city}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {address.state} - {address.zipCode}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {!address.isDefault && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSetDefault(address._id)}
                      >
                        Set Default
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(`/edit-address/${address._id}`)}
                      icon={<FaEdit />}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(address._id)}
                      icon={<FaTrash />}
                      className="text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<FaMapMarkerAlt size={64} />}
            title="No Addresses Saved"
            description="Add your first address to make booking easier and faster."
            action={
              <Button
                variant="primary"
                onClick={() => navigate('/add-address')}
                icon={<FaPlus />}
              >
                Add Your First Address
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
}