import React from 'react';
import { useSlug } from '../../Tenants/Tenant';
import { Link } from 'react-router-dom';

const NavData = () => {
    const { slug } = useSlug();

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
    
    return (
        <nav className="bg-white shadow-lg border-b border-gray-200 w-full">
            <div className="max-w-7xl mx-auto px-4">
                {/* Desktop Navigation */}
                <div className="hidden md:flex space-x-1 py-4">
                    {NavLink.map((item, index) => (
                        <Link 
                            key={index} 
                            to={item.link} 
                            className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors duration-200 font-medium"
                        >
                            <span>{item.title}</span>
                        </Link>
                    ))}
                </div>

                {/* Mobile Navigation */}
                <div className="md:hidden flex overflow-x-auto py-3 space-x-2">
                    {NavLink.map((item, index) => (
                        <Link 
                            key={index} 
                            to={item.link} 
                            className="flex-shrink-0 px-3 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors duration-200 font-medium whitespace-nowrap"
                        >
                            <span>{item.title}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
}

export default NavData;