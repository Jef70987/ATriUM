/* eslint-disable no-unused-vars */

import React, { useState } from 'react';
import './ClientView.css';
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

    // Verify client email
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

    // Fetch bookings for verified client
    const fetchBookings = async () => {
        setIsLoading(true);
        try {
        const response = await fetch(`${API_URL}/${slug}/client-bookings/?email=${encodeURIComponent(email)}`);
        const data = await response.json();
        setBookings(data);
        setFilteredBookings(data.slice(0, 15)); // Show only 15 most recent by default
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
        case 'confirmed': return 'status-confirmed';
        case 'completed': return 'status-completed';
        case 'cancelled': return 'status-cancelled';
        case 'no-show': return 'status-no-show';
        default: return 'status-pending';
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
        <div className="client-view-container">
        <div className="client-view-header">
            <h2>My Bookings</h2>
            <p>View your spa booking history</p>
        </div>

        {/* Email Verification Prompt */}
        {showEmailPrompt && (
            <div className="client--view-email-verification">
            <div className="client--view-verification-card">
                <h3>Verify Your Identity</h3>
                <p>Please enter the email address you used for your bookings to view your history</p>
                
                <div className="client--view-email-input-group">
                <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="client--view-email-input"
                />
                <button 
                    onClick={verifyEmail}
                    disabled={isLoading}
                    className="client--view-verify-btn"
                >
                    {isLoading ? 'Verifying...' : 'View My Bookings'}
                </button>
                </div>

                {error && <div className="client--view-error-message">{error}</div>}
            </div>
            </div>
        )}

        {/* Bookings History */}
        {isVerified && !showEmailPrompt && (
            <div className="client--view-bookings-history">
            <div className="client--view-history-header">
                <h3>Booking History for {email}</h3>
                <button onClick={handleSignOut} className="client--view-sign-out-btn">
                Sign Out
                </button>
            </div>

            {isLoading ? (
                <div className="client--view-loading">Loading your bookings...</div>
            ) : (
                <>
                {bookings.length === 0 ? (
                    <div className="client--view-no-bookings">
                    <p>No bookings found for this email address.</p>
                    <p>Please check your email or contact us if you believe this is an error.</p>
                    </div>
                ) : (
                    <>
                    <div className="client--view-bookings-count">
                        Showing {filteredBookings.length} of {bookings.length} bookings
                    </div>

                    <div className="client--view-bookings-list">
                        {filteredBookings.length > 0 ?(
                            filteredBookings.map((booking) => (
                                <div key={booking.id} className="client--view-booking-card">
                                    <div className="client--view-booking-header">
                                    <span className="client--view-booking-id">Reference :{booking.booking_reference}</span>
                                    <span className={`client--view-booking-status ${getStatusBadgeClass(booking.status)}`}>
                                        {booking.status}
                                    </span>
                                    </div>

                                    <div className="client--view-booking-details">
                                    <div className="client--view-detail-row">
                                        <span className="client--view-detail-label">Date:</span>
                                        <span className="client--view-detail-value">{formatDate(booking.booking_date)}</span>
                                    </div>
                                    <div className="client--view-detail-row">
                                        <span className="client--view-detail-label">Time:</span>
                                        <span className="client--view-detail-value">{formatTime(booking.booking_time)}</span>
                                    </div>
                                    <div className="client--view-detail-row">
                                        <span className="client--view-detail-label">Services:</span>
                                        <span className="client--view-detail-value">
                                        {filteredBookings.length > 0 ?(
                                            booking.services.map(service => (
                                                <li key={service.id} className="service-item">
                                                <span className="service-name">{service.name}</span>
                                                <span className="service-price">ksh{service.price}</span>
                                                </li>
                                            ))
                                        ):<p>Error...</p>}
                                        </span>
                                    </div>
                                    <div className="client--view-detail-row">
                                        <span className="client--view-detail-label">Total:</span>
                                        <span className="client--view-detail-value client--view-total-price">ksh{booking.total_price}</span>
                                    </div>
                                    </div>

                                    <button 
                                    className="client--view-view-details-btn"
                                    onClick={() => handleViewDetails(booking)}
                                    >
                                    View Details
                                    </button>
                                </div>
                                ))
                        ):<p>Oops No Records...</p>}
                    </div>

                    <div className="client--view-view-toggle">
                        {filteredBookings.length === 5 && bookings.length > 5 ? (
                        <button onClick={handleViewAll} className="client--view-toggle-btn">
                            View All Bookings ({bookings.length})
                        </button>
                        ) : bookings.length > 5 ? (
                        <button onClick={handleViewLess} className="client--view-toggle-btn">
                            View Less
                        </button>
                        ) : null}
                    </div>
                    </>
                )}
                </>
            )}
            </div>
        )}

        {/* Booking Details Modal */}
        {showModal && selectedBooking && (
            <div className="client--view-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="client--view-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="client--view-modal-header">
                <h3>Booking Details</h3>
                <button 
                    className="client--view-close-modal"
                    onClick={() => setShowModal(false)}
                >
                    &times;
                </button>
                </div>

                <div className="client--view-modal-body">
                <div className="client--view-detail-section">
                    <h4>Booking Information</h4>
                    <div className="client--view-detail-grid">
                    <div className="client--view-detail-item">
                        <span className="client--view-detail-label">Booking ID:</span>
                        <span className="client--view-detail-value">#{selectedBooking.id}</span>
                    </div>
                    <div className="client--view-detail-item">
                        <span className="client--view-detail-label">Date:</span>
                        <span className="client--view-detail-value">{formatDate(selectedBooking.booking_date)}</span>
                    </div>
                    <div className="client--view-detail-item">
                        <span className="client--view-detail-label">Time:</span>
                        <span className="client--view-detail-value">{formatTime(selectedBooking.booking_time)}</span>
                    </div>
                    <div className="client--view-detail-item">
                        <span className="client--view-detail-label">Duration:</span>
                        <span className="client--view-detail-value">{selectedBooking.total_duration} minutes</span>
                    </div>
                    <div className="client--view-detail-item">
                        <span className="client--view-detail-label">Status:</span>
                        <span className={`client--view-detail-value client--view-status-badge ${getStatusBadgeClass(selectedBooking.status)}`}>
                        {selectedBooking.status}
                        </span>
                    </div>
                    </div>
                </div>

                <div className="client--view-detail-section">
                    <h4>Services Booked</h4>
                    <ul className="client--view-services-list">
                    {selectedBooking.services.length > 0 ? (
                        selectedBooking.services.map(service => (
                            <li key={service.id} className="client--view-service-item">
                            <span className="client--view-service-name">{service.name}</span>
                            <span className="client--view-service-duration">{service.duration} min</span>
                            <span className="client--view-service-price">ksh {service.price}</span>
                            </li>
                        ))
                    ):<p>Error  fetching service...</p>}
                    </ul>
                    <div className="client--view-booking-total">
                    <span>Total: ksh{selectedBooking.total_price}</span>
                    </div>
                </div>

                {selectedBooking.notes && (
                    <div className="client--view-detail-section">
                    <h4>Special Requests</h4>
                    <p className="client--view-booking-notes">{selectedBooking.notes}</p>
                    </div>
                )}

                <div className="client--view-detail-section">
                    <h4>Booking History</h4>
                    <div className="client--view-detail-grid">
                    <div className="client--view-detail-item">
                        <span className="client--view-detail-label">Booked On:</span>
                        <span className="client--view-detail-value">
                        {new Date(selectedBooking.created_at).toLocaleString()}
                        </span>
                    </div>
                    <div className="client--view-detail-item">
                        <span className="client--view-detail-label">Last Updated:</span>
                        <span className="client--view-detail-value">
                        {new Date(selectedBooking.updated_at).toLocaleString()}
                        </span>
                    </div>
                    </div>
                </div>
                </div>

                <div className="client--view-modal-footer">
                <button 
                    className="client--view-close-btn"
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