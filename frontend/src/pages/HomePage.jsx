import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';
import { Link } from 'react-router-dom';
import { useLocation } from '../context/LocationContext';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend.ranx24.com/api';
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'https://backend.ranx24.com';

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % (banners.length || 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { location, detectLocation } = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Banners
        try {
          const bannersRes = await axiosInstance.get('/banners/active/landing');
          setBanners(bannersRes.data);
        } catch (bannerErr) {
          console.log('Banner fetch error:', bannerErr);
        }

        let url = '/categories';

        // If city is detected, fetch city-specific categories
        if (location.city) {
          // First get city details to find assigned categories
          try {
            const cityRes = await axiosInstance.get(`/cities/name/${location.city}`);
            const cityData = cityRes.data;

            if (cityData && cityData.assignedCategories?.length > 0) {
              // Filter categories based on assignment
              // Ideally backend should do this, but for now we can filter client side or request specific IDs
              // Let's fetch all and filter for now
              const { data: allCategories } = await axiosInstance.get('/categories');
              const assignedNames = cityData.assignedCategories.map(c => c.category);
              const filtered = allCategories.filter(c => assignedNames.includes(c.name));
              setCategories(filtered);
              setLoading(false);
              return;
            }
          } catch (cityErr) {
            console.log('City not found or error fetching city, showing all categories');
          }
        }

        const { data } = await axiosInstance.get(url);
        setCategories(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data.');
        setLoading(false);
      }
    };
    fetchData();
  }, [location.city]);

  if (loading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Our Services</h1>
        <div className="flex items-center gap-2">
          {location.city ? (
            <span className="text-green-600 font-semibold">
              <i className="fa-solid fa-location-dot mr-1"></i> {location.city}
            </span>
          ) : (
            <button
              onClick={detectLocation}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <i className="fa-solid fa-location-crosshairs"></i> Detect Location
            </button>
          )}
        </div>
      </div>

      {/* Banners Section */}
      {banners.length > 0 && (
        <div className="mb-12">
          <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-xl">
            {/* Simple Slider Implementation */}
            <div className="flex transition-transform duration-500 h-full" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
              {banners.map((banner) => (
                <div key={banner._id} className="min-w-full h-full relative">
                  <img
                    src={`${SERVER_URL}/${banner.image}`}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-8">
                    <h2 className="text-3xl font-bold text-white mb-2">{banner.title}</h2>
                    {banner.description && <p className="text-white/90 text-lg">{banner.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {categories.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 text-lg">No services available in your area yet.</p>
          <button onClick={() => window.location.reload()} className="mt-4 text-blue-600 hover:underline">Show all services</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {categories.map((category) => (
            <Link key={category._id} to={`/category/${category._id}`} className="group">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 group-hover:scale-105">
                <img
                  src={`${SERVER_URL}/${category.image}`}
                  alt={category.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h2 className="text-xl font-semibold text-center">{category.name}</h2>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
