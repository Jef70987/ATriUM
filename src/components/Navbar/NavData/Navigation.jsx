import React, { useState } from 'react';
import { useSlug } from '../../Tenants/Tenant';
import { Link, useLocation } from 'react-router-dom';

const NavData = () => {
    const { slug } = useSlug();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const NavLink = [
        {
            title: "Home",
            link: `/${slug}/Home`
        },
        {
            title: "Services",
            link: `/${slug}/Services`
        },
        {
            title: "Gallery",
            link: `/${slug}/Gallery`
        },
        {
            title: "Booking",
            link: `/${slug}/Booking`
        },
        {
            title: "Shop",
            link: `/${slug}/Shop`
        },
        {
            title: "Reviews",
            link: `/${slug}/Reviews`
        },
    ];

    const isActiveLink = (link) => {
        return location.pathname === link;
    };

    return (
        <nav className="bg-white shadow-lg border-b border-gray-200 w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Brand */}
                    <div className="flex-shrink-0">
                        <span className="text-xl font-bold text-gray-800">Spa Menu</span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex space-x-1">
                        {NavLink.map((item, index) => (
                            <Link 
                                key={index} 
                                to={item.link}
                                className={`px-4 py-2 rounded-md transition-all duration-200 font-medium ${
                                    isActiveLink(item.link)
                                        ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
                                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                                }`}
                            >
                                {item.title}
                            </Link>
                        ))}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
                            aria-expanded="false"
                        >
                            <svg 
                                className="h-6 w-6" 
                                stroke="currentColor" 
                                fill="none" 
                                viewBox="0 0 24 24"
                            >
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-200">
                        <div className="px-2 pt-2 pb-3 space-y-1 bg-white">
                            {NavLink.map((item, index) => (
                                <Link 
                                    key={index} 
                                    to={item.link}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                                        isActiveLink(item.link)
                                            ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
                                            : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                                    }`}
                                >
                                    {item.title}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default NavData;