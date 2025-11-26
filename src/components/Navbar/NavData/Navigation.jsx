import React from 'react';
import { useSlug } from '../../Tenants/Tenant';
import { Link } from 'react-router-dom';

const NavData = () => {
    const slug = useSlug();

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
        <>
            {NavLink.slice(0, 6).map((item, index) => (
                <Link 
                    key={index} 
                    to={item.link} 
                    className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors duration-200 font-medium"
                >
                    <span>{item.title}</span>
                </Link>
            ))}
        </>
    );
}

export default NavData;