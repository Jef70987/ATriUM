import React from 'react';
import { useSlug } from "../Tenants/TenantOperator";
import { Link, useLocation } from 'react-router-dom';

const OperatorNavData = () => {
    const slug = useSlug();
    const location = useLocation();

    const NavLink = [
        {
            title: "Bookings",
            link: `/${slug}/operator/bookings`,
            icon: "📅"
        },
        {
            title: "Add+",
            link: `/${slug}/operator/add`,
            icon: "➕"
        },
        {
            title: "Staff",
            link: `/${slug}/operator/staff`,
            icon: "👥"
        },
        {
            title: "Analysis",
            link: `/${slug}/operator/Analytics`,
            icon: "📊"
        },
        {
            title: "Inventory",
            link: `/${slug}/operator/inventory`,
            icon: "📦"
        },
        {
            title: "Reviews",
            link: `/${slug}/operator/Reviews`,
            icon: "⭐"
        },
    ];

    const isActiveLink = (link) => {
        return location.pathname === link;
    };

    return (
        <div className="w-full">
            {/* Desktop Navigation - Horizontal */}
            <div className="hidden lg:flex flex-col space-y-2 w-full">
                {NavLink.map((item, index) => (
                    <Link 
                        key={index} 
                        to={item.link} 
                        className={`
                            w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
                            ${isActiveLink(item.link) 
                                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg transform scale-105' 
                                : 'bg-white text-gray-700 hover:bg-pink-50 hover:text-pink-600 border border-gray-200 hover:border-pink-200 hover:shadow-md'
                            }
                        `}
                    >
                        <span className="text-lg">{item.icon}</span>
                        <span className="flex-1">{item.title}</span>
                        {isActiveLink(item.link) && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                    </Link>
                ))}
            </div>

            {/* Mobile Navigation - Grid */}
            <div className="lg:hidden grid grid-cols-2 gap-3 w-full">
                {NavLink.map((item, index) => (
                    <Link 
                        key={index} 
                        to={item.link} 
                        className={`
                            flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 font-medium
                            ${isActiveLink(item.link) 
                                ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-lg transform scale-105' 
                                : 'bg-white text-gray-700 hover:bg-pink-50 hover:text-pink-600 border border-gray-200 hover:border-pink-200 hover:shadow-md'
                            }
                        `}
                    >
                        <span className="text-2xl mb-2">{item.icon}</span>
                        <span className="text-sm font-semibold text-center">{item.title}</span>
                        {isActiveLink(item.link) && (
                            <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full"></div>
                        )}
                    </Link>
                ))}
            </div>

            {/* Beauty Parlour Branding */}
            <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-2">
                        A
                    </div>
                    <p className="text-xs text-gray-500 font-semibold">ATriUM</p>
                    <p className="text-xs text-gray-400 mt-1">Beauty Management</p>
                </div>
            </div>
        </div>
    );
}

export default OperatorNavData;