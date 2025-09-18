/* eslint-disable no-unused-vars */
// BookingView.jsx
import React, { useState, useEffect } from 'react';
import './BookingView.css';
import { useSlug } from "../Tenants/TenantOperator";
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';


const BookingView = () => {
    const slug = useSlug();
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [clientServices, setClientServices] = useState(null);
    const [showServicesModal, setShowServicesModal] = useState(false);
    const [message, setMessage] = useState('');
    const [filters, setFilters] = useState({
        date: '',
        status: 'all',
        search: ''
    });

    // Fetch bookings from Django API
    useEffect(() => {
        const fetchBookings = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${API_URL}/${slug}/bookings/`);
            const data = await response.json();
            setBookings(data);
            setFilteredBookings(data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setIsLoading(false);
        }
        };

        fetchBookings();
    }, [slug]);

    // Apply filters when they change
    useEffect(() => {
        let result = bookings;
        
        // Filter by date
        if (filters.date) {
        result = result.filter(booking => booking.booking_date === filters.date);
        }
        
        // Filter by status
        if (filters.status !== 'all') {
        result = result.filter(booking => booking.status === filters.status);
        }
        
        // Filter by search term
        if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        result = result.filter(booking => 
            booking.client_name.includes(searchTerm) ||
            booking.client_email.includes(searchTerm) ||
            booking.client_phone.includes(searchTerm)
        );
        }
        
        setFilteredBookings(result);
    }, [filters, bookings]);

    const handleStatusChange = async (bookingId, newStatus) => {
        try {
        const response = await fetch(`${API_URL}/${slug}/bookings/${bookingId}/`, {
            method: 'PATCH',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            // Update the booking in state
            setBookings(bookings.map(booking => 
            booking.id === bookingId ? { ...booking, status: newStatus } : booking
            ));
        } else {
            console.error('Failed to update booking status');
        }
        } catch (error) {
        console.error('Error updating booking status:', error);
        }
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

    const handleSearchService = async () => {
        if (!searchTerm.trim()) return;
        
        try {
            const SearchWithoutHash = searchTerm.replace('#','');
            const response = await fetch(
                `${API_URL}/${slug}/bookings/services/?reference=${SearchWithoutHash}`
            );
            
            if (!response.ok) throw new Error('Booking not found');
            
            const data = await response.json();
            setClientServices(data);
            setShowServicesModal(true);
        } catch (error) {
            setMessage("Invalid Reference/Booking not found");
            setClientServices(null);
        }
    };

    if (isLoading) {
        return <div className="booking-view-loading">Loading bookings...</div>;
    }

    return (
        <div className="booking-view-container">
        <div className="booking-view-header">
            <h2>Service Booking Management</h2>
            <p>View and manage all spa bookings</p>
        </div>

        {/* Filters */}
        <div className="filters-section">
            <h3>Filters</h3>
            <div className="filters-grid">
            <div className="filter-group">
                <label htmlFor="date-filter">Date</label>
                <input
                type="date"
                id="date-filter"
                value={filters.date}
                onChange={(e) => setFilters({...filters, date: e.target.value})}
                />
            </div>

            <div className="filter-group">
                <label htmlFor="status-filter">Status</label>
                <select
                id="status-filter"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No Show</option>
                </select>
            </div>

            <div className="filter-group">
                <label htmlFor="search-filter">Search</label>
                <input
                type="text"
                id="search-filter"
                placeholder="Search by name, email, or phone"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                />
            </div>

            <div className="filter-group">
                <button 
                className="clear-filters"
                onClick={() => setFilters({ date: '', status: 'all', search: '' })}
                >
                Clear Filters
                </button>
            </div>
            </div>
        </div>

        {/* Bookings Summary */}
        <div className="bookings-summary">
            <div className="summary-card">
            <h3>Total Bookings</h3>
            <span className="summary-count">{bookings.length}</span>
            </div>
            <div className="summary-card">
            <h3>Today's Bookings</h3>
            <span className="summary-count">
                {bookings.filter(b => b.booking_date === new Date().toISOString().split('T')[0]).length}
            </span>
            </div>
            <div className="summary-card">
            <h3>Pending Confirmation</h3>
            <span className="summary-count">
                {bookings.filter(b => b.status === 'pending').length}
            </span>
            </div>
        </div>

        {/* Bookings Table */}
        <div className="bookings-table-container">
            <h3>Recent Bookings</h3>
            <div className="services-ref">
                <p><i>View Client Services</i></p>
                <p style={{color:'red',backgroundColor:"rgba(67, 197, 197, 0.93)"}}>{message}</p>
                <div className="search-box">
                    <input
                        style={{borderRadius:'50px'}}
                        type="text"
                        placeholder="Enter booking ref. (e.g. #BK1001)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        // onKeyPress={(e) => e.key === 'Enter' && handleSearchService()}
                    />-
                    <button onClick={handleSearchService} style={{borderRadius:'50px',backgroundColor:"#8a735b",width:'fit-content',color:"white"}}>Search..</button>
                </div>
            </div>
            {filteredBookings.length === 0 ? (
            <div className="no-bookings">
                <p>No bookings found matching your criteria</p>
            </div>
            ) : (
            <table className="bookings-table">
                <thead>
                <tr>
                    <th>Booking ID</th>
                    <th>Client</th>
                    <th>Date & Time</th>
                    <th>Services</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {filteredBookings.map(booking => (
                    <tr key={booking.id}>
                    <td className="booking-id">{booking.booking_reference}</td>
                    <td className="client-info">
                        <div className="client-name">{booking.customer_name}</div>
                        <div className="client-contact">
                        {booking.customer_email} • {booking.phone}
                        </div>
                    </td>
                    <td className="booking-datetime">
                        <div className="booking-date">{formatDate(booking.booking_date)}</div>
                        <div className="booking-time">{formatTime(booking.booking_time)}</div>
                    </td>
                    <td>
                        ########
                    </td>
                    <td className="booking-total">Ksh{booking.total_price}</td>
                    <td className="booking-status">
                        <select
                        value={booking.status}
                        onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                        className={`status-select ${getStatusBadgeClass(booking.status)}`}
                        >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="no-show">No Show</option>
                        </select>
                    </td>
                    <td className="booking-actions">
                        <button 
                        className="view-details-btn"
                        onClick={() => handleViewDetails(booking)}
                        >
                        View Details
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            )}
        </div>

        {/* Booking Details Modal */}
        {showModal && selectedBooking && (
            <div className="view--modal-overlay" onClick={() => setShowModal(false)}>
            <div className="view--modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="view--modal-header">
                <h3>Booking Details</h3>
                <button 
                    className="view--close-modal"
                    onClick={() => setShowModal(false)}
                >
                    &times;
                </button>
                </div>

                <div className="view--modal-body">
                <div className="view--detail-section">
                    <h4>Client Information</h4>
                    <div className="view--detail-grid">
                    <div className="view--detail-item">
                        <span className="view--detail-label">Name:</span>
                        <span className="view--detail-value">{selectedBooking.customer_name}</span>
                    </div>
                    <div className="view--detail-item">
                        <span className="view--detail-label">Email:</span>
                        <span className="view--detail-value">{selectedBooking.customer_email}</span>
                    </div>
                    <div className="view--detail-item">
                        <span className="view--detail-label">Phone:</span>
                        <span className="view--detail-value">{selectedBooking.customer_phone}</span>
                    </div>
                    </div>
                </div>

                <div className="view--detail-section">
                    <h4>Booking Information</h4>
                    <div className="view--detail-grid">
                    <div className="view--detail-item">
                        <span className="view--detail-label">Date:</span>
                        <span className="view--detail-value">{formatDate(selectedBooking.booking_date)}</span>
                    </div>
                    <div className="view--detail-item">
                        <span className="view--detail-label">Time:</span>
                        <span className="view--detail-value">{formatTime(selectedBooking.booking_time)}</span>
                    </div>
                    <div className="view--detail-item">
                        <span className="view--detail-label">Duration:</span>
                        <span className="view--detail-value">{selectedBooking.total_duration} minutes</span>
                    </div>
                    <div className="view--detail-item">
                        <span className="view--detail-label">Total:</span>
                        <span className="view--detail-value"> ksh {selectedBooking.total_price}</span>
                    </div>
                    <div className="view--detail-item">
                        <span className="view--detail-label">Status:</span>
                        <span className={`view--detail-value status-badge ${getStatusBadgeClass(selectedBooking.status)}`}>
                        {selectedBooking.status}
                        </span>
                    </div>
                    </div>
                </div>

                <div className="view--detail-section">
                    <h4>Services</h4>
                    <ul className="services-list">
                    {selectedBooking.services.map(service => (
                        <li key={service.id} className="service-item">
                        <span className="service-name">{service.name}</span>
                        <span className="service-price"> @ ksh{service.price}</span>
                        </li>
                    ))}
                    </ul>
                </div>

                {selectedBooking.notes && (
                    <div className="view--detail-section">
                    <h4>Special Requests</h4>
                    <p className="booking-notes">{selectedBooking.notes}</p>
                    </div>
                )}

                <div className="view--detail-section">
                    <h4>Booking History</h4>
                    <div className="view--detail-grid">
                    <div className="view--detail-item">
                        <span className="view--detail-label">Created:</span>
                        <span className="view--detail-value">
                        {new Date(selectedBooking.created_at).toLocaleString()}
                        </span>
                    </div>
                    <div className="view--detail-item">
                        <span className="view--detail-label">Last Updated:</span>
                        <span className="view--detail-value">
                        {new Date(selectedBooking.updated_at).toLocaleString()}
                        </span>
                    </div>
                    </div>
                </div>
                </div>

                <div className="view--modal-footer">
                <button 
                    className="close-btn"
                    onClick={() => setShowModal(false)}
                >
                    Close
                </button>
                </div>
            </div>
            </div>
        )}

        {/* Services Modal */}
        {showServicesModal && clientServices && (
            <div className="view--modal-overlay" onClick={() => setShowServicesModal(false)} >
                <div className="view--modal-content" onClick={(e) => e.stopPropagation()} style={{justifyContent:'center',textAlign:'center',width:'300px'}}>
                    <button className="close-btn" onClick={() => setShowServicesModal(false)}>×</button>
                    
                    <h3>Services for {clientServices.client_name}</h3>
                    <p className="booking-ref">Reference: {clientServices.booking_reference}</p>
                    
                    <div className="view--services-list">
                        <h4>Booked Services:</h4>
                        {clientServices.services.map(service => (
                            <div key={service.id} className="view--service-item" style={{textAlign:'left',margin:'10px'}}>
                                <span className="service-name">{service.name}</span>
                                <span className="service-price">Ksh {service.price}</span>
                            </div>
                        ))}
                    </div>
                    
                    <div className="services-total">
                        <strong>Total: Ksh {clientServices.total_price}</strong>
                    </div>
                </div>
            </div>
        )}
        </div>
    );
};

export default BookingView;