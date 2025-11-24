/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ReviewsView from "./Reply";
import Inventory from "./Inventory";
import Login from "../Auth/Login"
import OperatorNavData from "./OperatorNav";
import BookingView from "./ViewBookings";
import { useSlug } from "../Tenants/TenantOperator";
import { useEffect,useState } from "react";
import Add from "./Add";
import Staff from "./Staff";
import BookingAnalysis from "./BookingAnalysis";
const API_URL = import.meta.env.VITE_API_URL;
import ProtectedRoute from "../Shared/ProtectedRoute";

const Operator = () => {
    const slug = useSlug();
    const [Data, setMainData] = useState();
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const response = await fetch(`${API_URL}/dashboard/${slug}/items`);    
                const data = await response.json();
                setMainData(data)
            } catch (error) {
                setError('Failed to fetch products. Please try again later.',error);
            }
        };
        fetchAdminData();
    }, []);

    useEffect(() => {
        if(Data){
            setMainItems({
                parlor:Data.spa.spa_name,
                operator:Data.spa.owner.username,
                logo:Data.spa.logo,
                subscription:Data.spa.Subscription_status.Subscription_type,
                status:Data.spa.payment_status
            });
        }
    }, [Data]);

    const [mainItems, setMainItems] = useState({
        parlor:"undefined",
        operator:"undefined",
        logo:"undefined",
        subscription:"undefined",
        status:"undefined"
    });

    const clearStorage = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
    };

    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');
    const user = userData ? JSON.parse(userData) : null;

    if(!token && !userData){
        return(
            <div className="w-full min-h-screen">
                <Routes>
                    <Route path="/" element={<Login/>}/>
                </Routes>
            </div>
        );
    }
    else if(token && userData && user.role == 'CLIENT'){
        return(
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 w-full">
                {/* Footer Copyright */}
                <div className="text-center py-3 bg-white border-b border-gray-200">
                    <p className="text-xs text-gray-600">
                        &copy; {new Date().getFullYear()} syntelsafe
                    </p>
                </div>

                {/* Main Header */}
                <div className="bg-white shadow-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="text-center mb-4">
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                                Welcome, Nice To See You
                            </h1>
                            <h4 className="text-lg lg:text-xl text-purple-600 font-semibold">
                                {mainItems.parlor}
                            </h4>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 max-w-2xl mx-auto">
                                <p className="text-red-700 text-sm text-center">{error}</p>
                            </div>
                        )}

                        {/* Operator Info Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                <p className="text-sm text-gray-600 mb-1">Operator</p>
                                <p className="text-lg font-semibold text-gray-900 truncate">
                                    {mainItems.operator}
                                </p>
                            </div>
                            
                            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                <p className="text-sm text-gray-600 mb-1">Subscription</p>
                                <p className="text-lg font-semibold text-green-600">
                                    {mainItems.subscription}
                                </p>
                            </div>
                            
                            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                <p className="text-sm text-gray-600 mb-1">Status</p>
                                <p className={`text-lg font-semibold ${
                                    mainItems.status === 'active' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {mainItems.status}
                                </p>
                            </div>
                            
                            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                <p className="text-sm text-gray-600 mb-1">Platform</p>
                                <p className="text-lg font-semibold text-blue-600">ATriUM</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation and Content Area */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Navigation Sidebar */}
                        <div className="lg:w-64 flex-shrink-0">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-6">
                                <OperatorNavData />
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="flex-1 min-w-0">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[600px]">
                                <Routes>
                                    <Route path="/" element={
                                        <ProtectedRoute slug={slug}>
                                            <BookingView/>
                                        </ProtectedRoute>
                                    }/>
                                    <Route path="/bookings" element={
                                        <ProtectedRoute slug={slug}>
                                            <BookingView/>
                                        </ProtectedRoute>
                                    }/>
                                    <Route path="/add" element={
                                        <ProtectedRoute slug={slug}>
                                            <Add/>
                                        </ProtectedRoute>
                                    }/>
                                    <Route path="/Reviews" element={
                                        <ProtectedRoute slug={slug}>
                                            <ReviewsView/>
                                        </ProtectedRoute>
                                    }/>
                                    <Route path="/Analytics" element={
                                        <ProtectedRoute slug={slug}>
                                            <BookingAnalysis/>
                                        </ProtectedRoute>
                                    }/>
                                    <Route path="/inventory" element={
                                        <ProtectedRoute slug={slug}>
                                            <Inventory/>
                                        </ProtectedRoute>
                                    }/>
                                    <Route path="/staff" element={
                                        <ProtectedRoute slug={slug}>
                                            <Staff/>
                                        </ProtectedRoute>
                                    }/>
                                    <Route path="/:slug/operator/login" element={<Login/>}/>
                                </Routes>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    else{
        clearStorage();
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Redirecting to login...</p>
                </div>
            </div>
        );
    }
};

export default Operator;