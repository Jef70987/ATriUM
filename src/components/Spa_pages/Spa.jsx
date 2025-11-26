import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import Services from "./Services";
import Reviews from "./Reviews";
import ImageGallery from "./Gallery";
import SpaBooking from "./Booking";
import Home from "./Home";
import Shop from "../Shop/Main";
import { CartProvider } from "./CartContext";
import ClientView from "./ClientBookingView";
import NavData from "./NavData";

// Layout component for pages with navigation
const WithNavigation = ({ children }) => {
    return (
        <div className="w-full">
            <div className="w-full bg-transparent">
                <div className="w-full">
                    <NavData/>
                </div>
            </div>
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                {children}
            </div>
        </div>
    );
};

const Spa = () => {
    return(
        <div className="flex flex-col min-h-screen">
            <div className="main-display flex-1 w-full">
                <Routes>
                    <Route path="/" element={<Dashboard/>}/>
                    <Route path="/Home" element={<WithNavigation><Home/></WithNavigation>}/>
                    <Route path="/Services" element={<WithNavigation><Services/></WithNavigation>}/>
                    <Route path="/Gallery" element={<WithNavigation><CartProvider><ImageGallery/></CartProvider></WithNavigation>}/>
                    <Route path="/Booking" element={<WithNavigation><CartProvider><SpaBooking/></CartProvider></WithNavigation>}/>
                    <Route path="/ViewBooking" element={<WithNavigation><ClientView/></WithNavigation>}/>
                    <Route path="/Reviews" element={<WithNavigation><Reviews/></WithNavigation>}/>
                    <Route path="/Shop" element={<WithNavigation><Shop/></WithNavigation>}/>
                </Routes>
            </div>
        </div>
    );
};
export default Spa;