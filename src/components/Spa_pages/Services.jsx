/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useSlug } from '../Tenants/Tenant';
const API_URL = import.meta.env.VITE_API_URL;

const Services = () => {
  const slug = useSlug();
  const [services, setServices] = useState([]);
  const [error, setError] = useState('');

  const clearStorage = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
  };

  useEffect(() => {
    clearStorage();
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/services/${slug}/service`);    
        const data = await response.json();
        setServices(data);
      } catch (error) {
        setError('Failed to fetch products. Please try again later.');
      }
    };
    fetchProducts();
  }, [slug]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
            Our Services
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-600 mx-auto rounded-full"></div>
          <p className="text-gray-600 mt-4 text-lg max-w-2xl mx-auto">
            Discover our luxurious treatments designed to pamper and rejuvenate you
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-center">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.length > 0 ? (
            services.map((service) => (
              <div 
                key={service.id} 
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:transform hover:-translate-y-2"
              >
                {/* Service Image */}
                <div className="relative overflow-hidden">
                  <img 
                    src={service.service_img} 
                    alt={service.name} 
                    className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                </div>

                {/* Service Content */}
                <div className="p-6">
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-800 mb-3 group-hover:text-pink-600 transition-colors duration-300">
                    {service.name}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">
                    {service.description}
                  </p>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <span className="text-2xl font-bold text-pink-600">
                      {service.price}
                    </span>
                    <button className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors duration-300 text-sm font-medium">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl text-gray-400">💆</span>
              </div>
              <p className="text-gray-500 text-lg">No services available at the moment...</p>
              <p className="text-gray-400 text-sm mt-2">Please check back later</p>
            </div>
          )}
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-pink-200 rounded-full opacity-20 blur-xl -z-10"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-200 rounded-full opacity-20 blur-xl -z-10"></div>
      </div>
    </div>
  );
};

export default Services;