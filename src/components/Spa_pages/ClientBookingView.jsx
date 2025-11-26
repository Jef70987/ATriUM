/* eslint-disable no-unused-vars */

import React, { useState } from 'react';
import { useSlug } from '../Tenants/Tenant';
const API_URL = import.meta.env.VITE_API_URL;

const ClientView = () => {
    const slug = useSlug();
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [showEmailPrompt, setShowEmailPrompt] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState();
    const [showModal, setShowModal] = useState(false);

    const clearStorage = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
    };

    const verifyEmail = async () => {
        clearStorage();
        if (!email) {
            setError('Please enter your email address');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/${slug}/client-bookings/verify/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                setIsVerified(true);
                setShowEmailPrompt(false);
                fetchBookings();
            } else {
                const data = await response.json();
                setError(data.error || 'Email not found. Please check your email address.');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchBookings = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/${slug}/client-bookings/?email=${encodeURIComponent(email)}`);
            const data = await response.json();
            setBookings(data);
            setFilteredBookings(data.slice(0, 5)); // Show only 5 most recent by default
        } catch (error) {
            setError('Error fetching bookings. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewAll = () => {
        setFilteredBookings(bookings);
    };

    const handleViewLess = () => {
        setFilteredBookings(bookings.slice(0, 5));
    };

    const handleViewDetails = (booking) => {
        setSelectedBooking(booking);
        setShowModal(true);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const formatTime = (timeString) => {
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
            case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            case 'no-show': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
    };

    const handleSignOut = () => {
        setIsVerified(false);
        setEmail('');
        setBookings([]);
        setFilteredBookings([]);
        setShowEmailPrompt(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                        My Bookings
                    </h2>
                    <p className="text-gray-600 text-lg">
                        View your spa booking history
                    </p>
                    <div className="w-20 h-1 bg-gradient-to-r from-pink-500 to-purple-600 mx-auto rounded-full mt-4"></div>
                </div>

                {/* Email Verification Prompt */}
                {showEmailPrompt && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl text-pink-600">🔐</span>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                Verify Your Identity
                            </h3>
                            <p className="text-gray-600">
                                Please enter the email address you used for your bookings to view your history
                            </p>
                        </div>
                        
                        <div className="space-y-4 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300"
                                onKeyPress={(e) => e.key === 'Enter' && verifyEmail()}
                            />
                            <button 
                                onClick={verifyEmail}
                                disabled={isLoading}
                                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                                    isLoading 
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-pink-500 hover:bg-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                                }`}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Verifying...
                                    </span>
                                ) : 'View My Bookings'}
                            </button>
                        </div>

                        {error && (
                            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                                <p className="text-red-700">{error}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Bookings History */}
                {isVerified && !showEmailPrompt && (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-4 text-white">
                            <div className="flex flex-col sm:flex-row justify-between items-center">
                                <h3 className="text-xl font-bold mb-2 sm:mb-0">
                                    Booking History for {email}
                                </h3>
                                <button 
                                    onClick={handleSignOut} 
                                    className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all duration-300"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {isLoading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
                                    <p className="text-gray-600 mt-4">Loading your bookings...</p>
                                </div>
                            ) : (
                                <>
                                    {bookings.length === 0 ? (
                                        <div className="text-center py-8">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <span className="text-2xl text-gray-400">📅</span>
                                            </div>
                                            <p className="text-gray-600 mb-2">No bookings found for this email address.</p>
                                            <p className="text-gray-500 text-sm">Please check your email or contact us if you believe this is an error.</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="text-sm text-gray-500 mb-4 text-center">
                                                Showing {filteredBookings.length} of {bookings.length} bookings
                                            </div>

                                            <div className="space-y-4">
                                                {filteredBookings.length > 0 ? (
                                                    filteredBookings.map((booking) => (
                                                        <div key={booking.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300">
                                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                                                                <span className="text-sm font-mono text-gray-600 mb-2 sm:mb-0">
                                                                    Reference: {booking.booking_reference}
                                                                </span>
                                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(booking.status)}`}>
                                                                    {booking.status}
                                                                </span>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                                <div>
                                                                    <p className="text-sm text-gray-600">
                                                                        <span className="font-medium">Date:</span> {formatDate(booking.booking_date)}
                                                                    </p>
                                                                    <p className="text-sm text-gray-600">
                                                                        <span className="font-medium">Time:</span> {formatTime(booking.booking_time)}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-gray-600">
                                                                        <span className="font-medium">Total:</span> 
                                                                        <span className="font-bold text-pink-600 ml-1">ksh {booking.total_price}</span>
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="mb-4">
                                                                <p className="text-sm font-medium text-gray-700 mb-2">Services:</p>
                                                                <ul className="space-y-1">
                                                                    {booking.services.map(service => (
                                                                        <li key={service.id} className="flex justify-between text-sm text-gray-600">
                                                                            <span>{service.name}</span>
                                                                            <span>ksh {service.price}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>

                                                            <button 
                                                                className="w-full sm:w-auto bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-300 text-sm font-medium"
                                                                onClick={() => handleViewDetails(booking)}
                                                            >
                                                                View Details
                                                            </button>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-8 text-gray-500">
                                                        No booking records found
                                                    </div>
                                                )}
                                            </div>

                                            {bookings.length > 5 && (
                                                <div className="text-center mt-6">
                                                    {filteredBookings.length === 5 ? (
                                                        <button 
                                                            onClick={handleViewAll} 
                                                            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg transition-colors duration-300"
                                                        >
                                                            View All Bookings ({bookings.length})
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={handleViewLess} 
                                                            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors duration-300"
                                                        >
                                                            View Less
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Booking Details Modal */}
            {showModal && selectedBooking && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                    onClick={() => setShowModal(false)}
                >
                    <div 
                        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-4 text-white flex justify-between items-center">
                            <h3 className="text-xl font-bold">Booking Details</h3>
                            <button 
                                className="text-2xl hover:text-gray-200 transition-colors duration-200"
                                onClick={() => setShowModal(false)}
                            >
                                &times;
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Booking Information */}
                            <div>
                                <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Booking Information</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600"><span className="font-medium">Booking ID:</span> #{selectedBooking.id}</p>
                                        <p className="text-sm text-gray-600"><span className="font-medium">Date:</span> {formatDate(selectedBooking.booking_date)}</p>
                                        <p className="text-sm text-gray-600"><span className="font-medium">Time:</span> {formatTime(selectedBooking.booking_time)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600"><span className="font-medium">Duration:</span> {selectedBooking.total_duration} minutes</p>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Status:</span> 
                                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(selectedBooking.status)}`}>
                                                {selectedBooking.status}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Services Booked */}
                            <div>
                                <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Services Booked</h4>
                                <ul className="space-y-2 mb-4">
                                    {selectedBooking.services.map(service => (
                                        <li key={service.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                                            <div>
                                                <span className="font-medium text-gray-800">{service.name}</span>
                                                <span className="text-sm text-gray-500 ml-2">({service.duration} min)</span>
                                            </div>
                                            <span className="font-semibold text-pink-600">ksh {service.price}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="border-t pt-3 text-right">
                                    <span className="text-lg font-bold text-gray-800">Total: ksh {selectedBooking.total_price}</span>
                                </div>
                            </div>

                            {/* Special Requests */}
                            {selectedBooking.notes && (
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Special Requests</h4>
                                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedBooking.notes}</p>
                                </div>
                            )}

                            {/* Booking History */}
                            <div>
                                <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Booking History</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Booked On:</span><br/>
                                            {new Date(selectedBooking.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Last Updated:</span><br/>
                                            {new Date(selectedBooking.updated_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
                            <button 
                                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors duration-300"
                                onClick={() => setShowModal(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientView;