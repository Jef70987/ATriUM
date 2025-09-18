import React from "react";
import  { Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import Services from "./Services";
import Reviews from "./Reviews";
import ImageGallery from "./Gallery";
import SpaBooking from "./Booking";
import Home from "./Home";
import Shop from "../Shop/Main";
import { CartProvider } from "./CartContext";
import ClientView from "./ClientBookingView";

const Spa = () => {
    return(
        <div >
            
            <Dashboard />
            <div className="main-display">
                <Routes>
                    <Route path="/Home" element={<Home/>}/>
                    <Route path="/Services" element={<Services/>}/>
                    <Route path="/Gallery" element={
                        <CartProvider>
                            <ImageGallery/>
                        </CartProvider>
                        }/>
                    <Route path="/Booking" element={
                        <CartProvider>
                            <SpaBooking/>
                        </CartProvider>
                        }/>
                    <Route path="/ViewBooking" element={<ClientView/>}/>
                    <Route path="/Reviews" element={<Reviews/>}/>
                    <Route path="/Shop" element={<Shop/>}/>
                </Routes>
            </div>
            
            
        </div>
    );
};
export default Spa;