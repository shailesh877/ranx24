import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend.ranx24.com/api';

export default function CategoryDetailPage() {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/categories/${id}`);
        setCategory(data);
      } catch (err) {
        console.error("CategoryDetailPage: Error fetching data:", err);
        setError("Failed to load category.");
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [id]);

  const filteredSubCategories = category?.subCategories?.filter(sub =>
    sub.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-red-500">
        <div className="text-center">
          <i className="fa-solid fa-circle-exclamation text-4xl mb-4"></i>
          <p className="text-xl">{error}</p>
          <Link to="/categories" className="text-blue-600 hover:underline mt-4 block">Back to Categories</Link>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-500">
        <p>Category not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Hero Banner */}
      <div className="relative h-[300px] bg-gray-900 overflow-hidden">
        {category.image ? (
          <img
            src={`${API_URL.replace('/api', '')}/${category.image}`}
            alt={category.name}
            className="w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-900 to-indigo-900 opacity-90"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>

        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
          <div className="max-w-7xl mx-auto">
            <Link to="/categories" className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors">
              <i className="fa-solid fa-arrow-left mr-2"></i> Back to Categories
            </Link>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 drop-shadow-lg">
              {category.name}
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl">
              Select a sub-category to view services.
            </p>
          </div>
        </div>
      </div>

      {/* Subcategories Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Search Bar */}
        <div className="mb-8 relative max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search ${category.name} services...`}
            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <i className="fa-solid fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>

        {filteredSubCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubCategories.map((sub) => (
              <Link
                key={sub._id}
                to={`/subcategory/${sub._id}`}
                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full"
              >
                <div className="h-48 overflow-hidden bg-gray-100 relative">
                  {sub.image ? (
                    <img
                      src={`${API_URL.replace('/api', '')}/${sub.image}`}
                      alt={sub.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => { e.target.src = 'https://placehold.co/1500?text=' + sub.name; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <i className="fa-solid fa-tools text-4xl"></i>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                </div>
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">{sub.name}</h3>
                    <p className="text-gray-500 text-sm">Explore {sub.name} services</p>
                  </div>
                  <div className="mt-4 flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform">
                    View Services <i className="fa-solid fa-arrow-right ml-2"></i>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="text-gray-400 text-5xl mb-4"><i className="fa-solid fa-search"></i></div>
            <h3 className="text-xl font-semibold text-gray-800">No sub-categories found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}
