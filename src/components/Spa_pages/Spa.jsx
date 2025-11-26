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
import NavData from "../Navbar/NavData/Navigation";

const Spa = () => {
    return(
        <div className="flex flex-col min-h-screen">
            {/* Main content area */}
            {/* Navigation Section */}
            <div className="w-full bg-transparent">
                <div className="w-full">
                    <NavData/>
                </div>
            </div>
            <div className="main-display flex-1 w-full">
                <Routes>
                    <Route path="/" element={
                        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                            <Dashboard/>
                        </div>
                    }/>
                    <Route path="/Home" element={
                        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                            <Home/>
                        </div>
                    }/>
                    <Route path="/Services" element={
                        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                            <Services/>
                        </div>
                    }/>
                    <Route path="/Gallery" element={
                        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                            <CartProvider>
                                <ImageGallery/>
                            </CartProvider>
                        </div>
                    }/>
                    <Route path="/Booking" element={
                        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                            <CartProvider>
                                <SpaBooking/>
                            </CartProvider>
                        </div>
                    }/>
                    <Route path="/ViewBooking" element={
                        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                            <ClientView/>
                        </div>
                    }/>
                    <Route path="/Reviews" element={
                        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                            <Reviews/>
                        </div>
                    }/>
                    <Route path="/Shop" element={
                        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                            <Shop/>
                        </div>
                    }/>
                </Routes>
            </div>
        </div>
    );
};
export default Spa;