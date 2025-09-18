import React from 'react';
import  { useSlug } from '../../Tenants/Tenant';
import { Link } from 'react-router-dom';
import './SystemNav.css'

const NavData = () => {

    const slug = useSlug();

    
    const NavLink = [
    
        {
            title: "Home",
            link: `/falkon-parlor/${slug}/Home`
        },
        {
            title: "Services",
            link: `/falkon-parlor/${slug}/Services`
        },
        {
            title: "Gallery",
            link: `/falkon-parlor/${slug}/Gallery`
        },
        {
            title: "Booking",
            link: `/falkon-parlor/${slug}/Booking`
        },
        {
            title: "Shop",
            link: `/falkon-parlor/${slug}/Shop`
        },
        {
            title: "Reviews",
            link: `/falkon-parlor/${slug}/Reviews`
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