import React from 'react';
import  { useSlug } from '../../Tenants/Tenant';
import { Link } from 'react-router-dom';
import './SystemNav.css'

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
                
                <Link key={index} to={item.link} className='Navigation--navItem'>
                    <span>{item.title}</span>
                </Link>
                
            ))}
        </>
    );
    
}


export default NavData;