import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';
import { Link } from 'react-router-dom';
import { useLocation } from '../context/LocationContext';
import { LucideSearch, LucideMapPin, LucideShieldCheck, LucideClock, LucideStar, LucideArrowRight, LucideX, LucideChevronDown, LucideDownload, LucidePlay, LucideQuote } from 'lucide-react';
import heroBg from '../assets/images/hero-bg.png';
import googlePlayBadge from '../assets/images/google-play-badge.png';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'https://www.ranx24.com';

const UserPage = () => {
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const { location, detectLocation, updateCity } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [testimonials, setTestimonials] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [currentBanner, setCurrentBanner] = useState(0);
  const bannerRef = React.useRef(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const testimonialRef = React.useRef(null);

  // Auto-scroll banners
  useEffect(() => {
    if (banners.length > 0) {
      const timer = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [banners.length]);

  // Auto-scroll testimonials
  useEffect(() => {
    if (testimonials.length > 0) {
      const timer = setInterval(() => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [testimonials.length]);

  useEffect(() => {
    if (bannerRef.current) {
      const scrollAmount = bannerRef.current.offsetWidth * currentBanner;
      bannerRef.current.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  }, [currentBanner]);

  useEffect(() => {
    if (testimonialRef.current) {
      const children = testimonialRef.current.children;
      if (children.length > 0) {
        const itemWidth = children[0].offsetWidth + 32; // item width + gap
        testimonialRef.current.scrollTo({
          left: itemWidth * currentTestimonial,
          behavior: 'smooth'
        });
      }
    }
  }, [currentTestimonial]);

  // Manual Location State
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [availableCities, setAvailableCities] = useState([]);
  const [citySearch, setCitySearch] = useState('');

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

        // Fetch Testimonials
        try {
          const testRes = await axiosInstance.get('/testimonials');
          setTestimonials(testRes.data);
        } catch (testErr) {
          console.log('Testimonials fetch error:', testErr);
        }

        let url = '/categories';

        // If city is detected, fetch city-specific categories
        if (location.city) {
          try {
            const cityRes = await axiosInstance.get(`/cities/name/${location.city}`);
            const cityData = cityRes.data;

            if (cityData && cityData.assignedCategories?.length > 0) {
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
        setLoading(false);
      }
    };
    fetchData();
  }, [location.city]);

  const fetchCities = async () => {
    try {
      const { data } = await axiosInstance.get('/cities');
      setAvailableCities(data);
    } catch (error) {
      console.error("Error fetching cities", error);
    }
  };

  const openLocationModal = () => {
    fetchCities();
    setIsLocationModalOpen(true);
  };

  const handleCitySelect = (city) => {
    updateCity(city.name);
    setIsLocationModalOpen(false);
  };

  const filteredCities = availableCities.filter(city =>
    city.name.toLowerCase().includes(citySearch.toLowerCase())
  );

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-24 pb-20 lg:pt-32 lg:pb-32 overflow-hidden">
        {/* Background Layer */}
        <div className="absolute inset-0 bg-gray-950">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-70 mix-blend-luminosity"
            style={{ backgroundImage: `url(${heroBg})` }}
          ></div>
          {/* Subtle Blue Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/60 via-blue-800/20 to-transparent"></div>
          <div className="absolute inset-0 bg-black/20"></div>

          {/* Animated Blobs - Reduced Intensity */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/5 blur-[120px] rounded-full animate-pulse delay-700"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-[1.1] tracking-tight text-white drop-shadow-[0_5px_15px_rgba(0,0,0,0.3)]">
              Professional Home Services,<br />
              <span className="bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">Simpler Than Ever</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-md">
              Experience excellence with India's most trusted home service platform. Verified experts, guaranteed quality, and unmatched speed.
            </p>

            {/* Search Bar Wrapper */}
            <div className="relative max-w-3xl mx-auto group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-500"></div>

              <div className="relative bg-white rounded-[2rem] p-2 flex flex-col md:flex-row shadow-[0_20px_50px_rgba(0,0,0,0.3)] ring-1 ring-black/5 transition-all duration-300">
                {/* Search Input */}
                <div className="flex-grow flex items-center px-6 py-2 border-b md:border-b-0 md:border-r border-gray-100">
                  <LucideSearch className="text-blue-600 w-5 h-5 mr-4" />
                  <input
                    type="text"
                    placeholder="Search for repair, cleaning, painting..."
                    className="w-full py-2 bg-transparent outline-none text-gray-800 font-semibold placeholder-gray-400 text-[15px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Location Picker */}
                <button
                  onClick={openLocationModal}
                  className="flex items-center px-6 py-2 hover:bg-gray-50/80 transition-all group/loc"
                >
                  <LucideMapPin className="text-blue-500 w-5 h-5 mr-3 group-hover/loc:scale-110 transition-transform" />
                  <div className="flex flex-col items-start truncate overflow-hidden">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Your Location</span>
                    <span className="text-gray-900 text-sm font-bold flex items-center gap-1.5">
                      {location.city || 'Choose City'}
                      <LucideChevronDown size={14} className="text-blue-600 transition-transform group-hover/loc:translate-y-0.5" />
                    </span>
                  </div>
                </button>

                {/* Search Button */}
                <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-10 py-4 rounded-[1.6rem] font-bold text-[15px] shadow-lg shadow-blue-600/30 transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 m-1 md:m-0">
                  Search
                </button>
              </div>
            </div>

            {/* App Download Badge - Improved Sizing */}
            <div className="mt-14 flex flex-col items-center gap-4">
              <p className="text-white/60 text-xs font-bold uppercase tracking-[0.2em]">Trusted by 50,000+ Customers</p>
              <a
                href="https://play.google.com/store/apps/details?id=com.RanX24.user"
                target="_blank"
                rel="noopener noreferrer"
                className="group transition-all hover:scale-105 active:scale-95 duration-300 inline-block"
              >
                <div className="relative">
                  <div className="absolute -inset-2 bg-white/5 blur-lg rounded-xl group-hover:bg-white/10 transition-colors"></div>
                  <img
                    src={googlePlayBadge}
                    alt="Get it on Google Play"
                    className="h-[52px] md:h-[64px] w-auto relative z-10 rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/10"
                  />
                </div>
              </a>
            </div>

            {/* Stats Overlay */}
            <div className="mt-12 flex items-center justify-center gap-10 py-2 opacity-80">
              {[
                { label: 'Verified Experts', value: '500+' },
                { label: 'Job Completed', value: '10k+' },
                { label: 'Customer Rating', value: '4.8★' }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className="text-xl md:text-2xl font-black text-white">{stat.value}</span>
                  <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest text-blue-300 whitespace-nowrap">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* Location Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-900">Select your City</h3>
              <button onClick={() => setIsLocationModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <LucideX size={20} />
              </button>
            </div>

            <div className="p-4">
              <div className="relative mb-4">
                <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search for your city..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <button
                  onClick={() => {
                    detectLocation();
                    setIsLocationModalOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 text-blue-600 font-medium hover:bg-blue-50 rounded-xl transition-colors border border-dashed border-blue-200"
                >
                  <LucideMapPin size={18} />
                  Use Current Location
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {filteredCities.length > 0 ? (
                  filteredCities.map(city => (
                    <button
                      key={city._id}
                      onClick={() => handleCitySelect(city)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all flex justify-between items-center ${location.city === city.name ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-gray-50 text-gray-700'}`}
                    >
                      {city.name}
                      {location.city === city.name && <LucideArrowRight size={16} />}
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    No cities found
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Banners Section */}
      {banners.length > 0 && (
        <section className="py-12 container mx-auto px-4 overflow-hidden">
          <div
            ref={bannerRef}
            className="flex overflow-x-hidden gap-8 pb-10 scrollbar-hide snap-x snap-mandatory px-2"
          >
            {banners.map((banner) => (
              <div
                key={banner._id}
                className="min-w-full md:min-w-[700px] h-[220px] md:h-[380px] rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.12)] flex-shrink-0 snap-center relative group cursor-pointer border border-white/20"
              >
                <a href={banner.link || '#'} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                  <div className="absolute inset-0 bg-gray-100 animate-pulse group-hover:hidden"></div>
                  <img
                    src={`${SERVER_URL}/${banner.image}`}
                    alt={banner.title}
                    className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/1200x600?text=' + banner.title; }}
                  />

                  {/* Premium Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-95 transition-all duration-500"></div>

                  <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white transform transition-all duration-500 group-hover:-translate-y-3">
                    {banner.title && (
                      <h3 className="font-black text-3xl md:text-5xl mb-4 tracking-tight drop-shadow-2xl">
                        {banner.title}
                      </h3>
                    )}
                    {banner.description && (
                      <p className="text-white/80 text-base md:text-lg max-w-2xl opacity-90 font-medium leading-relaxed mb-6 line-clamp-2">
                        {banner.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 bg-white/20 backdrop-blur-md w-fit px-6 py-2.5 rounded-full border border-white/30 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300">
                      <span>Explore Service</span>
                      <LucideArrowRight size={16} />
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>

          {/* Interactive Navigation Dots */}
          <div className="flex justify-center gap-3 mt-[-1rem]">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentBanner(i)}
                className={`h-2.5 rounded-full transition-all duration-500 border border-blue-600/20 ${i === currentBanner ? 'w-10 bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'w-2.5 bg-gray-200 hover:bg-blue-200'}`}
                aria-label={`Go to banner ${i + 1}`}
              ></button>
            ))}
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Our Services</h2>
            <p className="text-gray-500">Explore our wide range of professional services in {location.city || 'your area'}</p>
          </div>
          <Link to="/categories" className="hidden md:flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors">
            View All <LucideArrowRight size={18} className="ml-2" />
          </Link>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-lg">No services found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCategories.map((category) => (
              <Link key={category._id} to={`/category/${category._id}`} className="group">
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden h-full flex flex-col">
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={`${SERVER_URL}/${category.image}`}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => { e.target.src = 'https://placehold.co/300?text=' + category.name; }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                  </div>
                  <div className="p-5 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{category.name}</h3>
                      <p className="text-sm text-gray-500">Professional {category.name} services</p>
                    </div>
                    <div className="mt-4 flex items-center text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                      Book Now <LucideArrowRight size={14} className="ml-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose RanX24?</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">We are committed to providing the best home service experience with verified professionals and transparent pricing.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <FeatureCard
              icon={<LucideShieldCheck size={40} className="text-blue-600" />}
              title="Verified Professionals"
              description="All our workers are background checked and trained to deliver high-quality service."
            />
            <FeatureCard
              icon={<LucideClock size={40} className="text-blue-600" />}
              title="On-Time Service"
              description="We value your time. Our professionals arrive on schedule and complete the job efficiently."
            />
            <FeatureCard
              icon={<LucideStar size={40} className="text-blue-600" />}
              title="Top Rated Quality"
              description="Our services are rated 4.8/5 by thousands of satisfied customers across the city."
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="py-24 bg-gray-50/50 border-t border-gray-100 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight italic">
                Real Stories, <span className="text-blue-600">Real Impact</span>
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto text-lg font-medium">Hear directly from the thousands of happy customers who trust RanX24 every day.</p>
            </div>

            <div 
              ref={testimonialRef}
              className="flex overflow-x-hidden gap-8 pb-12 scrollbar-hide snap-x px-4"
            >
              {testimonials.map((item) => {
                const getYouTubeId = (url) => {
                  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                  const match = url.match(regExp);
                  return (match && match[2].length === 11) ? match[2] : null;
                };
                const videoId = getYouTubeId(item.videoUrl);
                const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;

                return (
                  <div key={item._id} className="min-w-[320px] md:min-w-[450px] bg-white rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 snap-center flex flex-col group hover:shadow-[0_30px_70px_rgba(0,0,0,0.1)] transition-all duration-500">
                    {/* Video Thumbnail / Player */}
                    <div className="w-full h-64 rounded-2xl overflow-hidden bg-gray-900 relative group mb-8 flex-shrink-0 shadow-inner">
                      {activeVideo === item._id && videoId ? (
                        <iframe
                          width="100%"
                          height="100%"
                          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                          title={item.clientName}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      ) : (
                        <>
                          {thumbnailUrl ? (
                            <img src={thumbnailUrl} alt={item.clientName} className="w-full h-full object-cover opacity-90 group-hover:opacity-70 transition-all duration-500 scale-105 group-hover:scale-100" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
                              <LucidePlay size={48} />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                          <button
                            onClick={() => setActiveVideo(item._id)}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-white/30 shadow-2xl">
                              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center pl-1 shadow-[0_0_30px_rgba(255,255,255,0.5)] group-hover:bg-blue-600 transition-colors group-hover:shadow-blue-500/50">
                                <LucidePlay size={28} className="text-blue-600 fill-current group-hover:text-white" />
                              </div>
                            </div>
                          </button>
                        </>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col">
                      <div className="flex text-yellow-500 mb-4 gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <LucideStar key={i} size={18} className={`${i < item.rating ? 'fill-current' : 'text-gray-200'}`} />
                        ))}
                      </div>

                      <div className="relative mb-6">
                        <LucideQuote size={60} className="absolute -top-4 -left-4 text-blue-50/80 -z-0" />
                        <p className="text-gray-700 font-semibold text-lg leading-relaxed relative z-10 line-clamp-3 italic">"{item.comment}"</p>
                      </div>

                      <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                        <div className="flex flex-col">
                          <h4 className="font-black text-gray-900 text-lg uppercase tracking-tight">{item.clientName}</h4>
                          <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-0.5">Verified Customer</span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-bold">{new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Testimonials Navigation Dots */}
            <div className="flex justify-center gap-3 mt-4">
              {testimonials.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentTestimonial(i)}
                  className={`h-2 rounded-full transition-all duration-500 ${i === currentTestimonial ? 'w-8 bg-blue-600' : 'w-2 bg-gray-200'}`}
                  aria-label={`Go to testimonial ${i + 1}`}
                ></button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of happy customers who trust RanX24 for their home service needs.
          </p>
          <Link to="/categories" className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg">
            Book a Service Now
          </Link>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="text-center p-8 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100">
    <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-500 leading-relaxed">{description}</p>
  </div>
);

export default UserPage;
