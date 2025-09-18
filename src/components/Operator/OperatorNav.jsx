import React from 'react';
import { useSlug } from "../Tenants/TenantOperator";
import { Link } from 'react-router-dom';
import './Nav.css';

const OperatorNavData = () => {

    const slug = useSlug();

    
    const NavLink = [
    
        {
            title: "Bookings",
            link: `/falkon-parlor/${slug}/operator/bookings`
        },
        {
            title: "Add+",
            link: `/falkon-parlor/${slug}/operator/add`
        },
        {
            title: "Staff",
            link: `/falkon-parlor/${slug}/operator/staff`
        },
        {
            title: "Analysis",
            link: `/falkon-parlor/${slug}/operator/Analytics`
        },
        {
            title: "Inventory",
            link: `/falkon-parlor/${slug}/operator/inventory`
        },
        {
            title: "Reviews",
            link: `/falkon-parlor/${slug}/operator/Reviews`
        },
        
    ];
    
    return (
        <>
            {NavLink.slice(0, 7).map((item, index) => (
                        
                        <Link key={index} to={item.link} className='Operator--navItem '>
                            <span>{item.title}</span>
                        </Link>
                        
                    ))}
        </>
    );
    
}


export default OperatorNavData;