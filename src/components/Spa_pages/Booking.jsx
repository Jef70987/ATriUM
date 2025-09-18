/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import './SpaBooking.css';
import { useSlug } from '../Tenants/Tenant';
import { useNavigate } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;

const SpaBooking = () => {
    const slug = useSlug();
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [Booking, setBooking] = useState(null);
    const [staffMembers, setStaffMembers] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [step, setStep] = useState(1); // 1: services, 2: date/time, 3: staff, 4: details
    const [formData, setFormData] = useState({
        client_name: '',
        client_email: '',
        client_phone: '',
        client_address: '',
        booking_date: '',
        booking_time: '',
        notes: '',
        clients: 1
    });
    const [, setOperatingHours] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [availableStaff, setAvailableStaff] = useState([]);
    const [bookingStatus, setBookingStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error , setError] = useState('')
    const [bookingReference, setBookingReference] = useState('');


    const clearStorage = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
    };

    // Fetch initial data
    useEffect(() => {
        clearStorage();
        const fetchData = async () => {
            try {
                setIsLoading(true);
                
                // Fetch services
                const servicesResponse = await fetch(`${API_URL}/${slug}/services/`);
                if (!servicesResponse.ok) throw new Error('Failed to fetch services');
                const servicesData = await servicesResponse.json();
                setServices(servicesData);

                // Fetch operating hours
                const hoursResponse = await fetch(`${API_URL}/${slug}/operating-hours/`);
                if (!hoursResponse.ok) throw new Error('Failed to fetch operating hours');
                const hoursData = await hoursResponse.json();
                setOperatingHours(hoursData);

                // Fetch staff members
                const staffResponse = await fetch(`http://127.0.0.1:8000/api/${slug}/staff/`);
                if (!staffResponse.ok) throw new Error('Failed to fetch staff');
                const staffData = await staffResponse.json();
                setStaffMembers(staffData);

                setIsLoading(false);
            } catch (error) {
                setBookingStatus({ type: 'error', message: 'Failed to load data. Please try again later.' });
                setIsLoading(false);
                setError(error)
            }
        };

        const verifyBookingStatus = async () => {
            try {
                const response = await fetch(`${API_URL}/validate/${slug}/`);
                if (!response.ok) throw new Error('Failed to fetch booking page');
                const data = await response.json();
                if (data.slug === slug && data.payment_status === "active") {
                    setBooking(data);
                    fetchData();
                } else {
                    setError('Booking page Error');
                }
            } catch (err) {
                setError('Failed to fetch Booking page. Please try again later.');
            }
        };
        verifyBookingStatus();
    }, [slug]);

    const handleBookingView = () => {
        navigate(`/falkon-parlor/${slug}/ViewBooking`);
    };

    // Fetch available time slots when date is selected
    useEffect(() => {
        clearStorage();
        const fetchAvailableSlots = async () => {
            if (!formData.booking_date) return;
            
            try {
                const response = await fetch(
                    `${API_URL}/${slug}/available-slots/?date=${formData.booking_date}`
                );
                if (!response.ok) throw new Error('Failed to fetch available slots');
                
                const data = await response.json();
                setAvailableSlots(data.available_slots || []);
            } catch (error) {
                console.error('Error fetching available slots:', error);
                setBookingStatus({ type: 'error', message: 'Failed to load available time slots.' });
            }
        };

        if (step === 2) {
            fetchAvailableSlots();
        }
    }, [formData.booking_date, slug, step]);

    // Fetch available staff when time is selected
    useEffect(() => {
        clearStorage();
        const fetchAvailableStaff = async () => {
            if (!formData.booking_date || !formData.booking_time) return;
            
            try {
                const response = await fetch(
                    `${API_URL}/${slug}/available-staff/?date=${formData.booking_date}&time=${formData.booking_time}`
                );
                if (!response.ok) throw new Error('Failed to fetch available staff');
                
                const data = await response.json();
                setAvailableStaff(data.available_staff);
            } catch (error) {
                console.error('Error fetching available staff:', error);
                setBookingStatus({ type: 'error', message: 'Failed to load available staff.' });
            }
        };

        if (step === 3) {
            fetchAvailableStaff();
        }
    }, [formData.booking_date, formData.booking_time, slug, step]);

    const toggleServiceSelection = (serviceId) => {
        if (selectedServices.includes(serviceId)) {
            setSelectedServices(selectedServices.filter(id => id !== serviceId));
        } else {
            setSelectedServices([...selectedServices, serviceId]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const calculateTotal = () => {
        // return selectedServices.reduce((total, serviceId) => {
        //     const service = services.find(s => s.id === serviceId);
        //     return total + (service ? service.price : 0);
        // }, 0);

        const total = selectedServices.reduce((total, serviceId) => {
            const service = services.find(s => s.id === serviceId);
            if (service){
                const price = typeof service.price === 'string'
                    ? parseFloat(service.price)
                    : service.price;
                return total + price;
            }
            return total;
        }, 0);
        return total;
    };

    

    const handleNextStep = () => {
        if (step === 1 && selectedServices.length === 0) {
            setBookingStatus({ type: 'error', message: 'Please select at least one service' });
            return;
        }
        
        if (step === 2 && (!formData.booking_date || !formData.booking_time)) {
            setBookingStatus({ type: 'error', message: 'Please select a date and time' });
            return;
        }
        
        if (step === 3 && !selectedStaff) {
            setBookingStatus({ type: 'error', message: 'Please select a staff member' });
            return;
        }
        
        setStep(step + 1);
        setBookingStatus(null);
    };

    const handlePrevStep = () => {
        setStep(step - 1);
        setBookingStatus(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            // Get CSRF token
            const csrfResponse = await fetch(`${API_URL}/csrf-token/`);
            const csrfData = await csrfResponse.json();
            const csrfToken = csrfData.csrfToken;
            
            const response = await fetch(`${API_URL}/${slug}/bookings/create/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({
                    ...formData,
                    services: selectedServices,
                    staff: selectedStaff,
                    total_price: calculateTotal(),
                })
            });
            
            const data = await response.json();

            if (response.ok) {
                setBookingReference(data.booking_reference);
                setBookingStatus({ type: 'success', message: 'Booking confirmed successfully!' });
                setStep(5); // Success step
            } else {
                setBookingStatus({ 
                    type: 'error', 
                    message: data.error || Object.values(data).join(', ') || 'Booking failed. Please try again.' 
                });
            }
        } catch (error) {
            setBookingStatus({ type: 'error', message: 'Network error. Please try again.' ,error});
        }
    };

    const resetBooking = () => {
        setSelectedServices([]);
        setSelectedStaff(null);
        setFormData({
            client_name: '',
            client_email: '',
            client_phone: '',
            client_address: '',
            booking_date: '',
            booking_time: '',
            notes: '',
            clients: 1
        });
        setStep(1);
        setBookingStatus(null);
        setBookingReference('');
    };

    // if (isLoading) {
    //     return <div className="spa-booking---loading">Loading...</div>;
    // }

    if (!Booking) {
        return (
            <div className="Booking--loading">
                <p>Loading Booking page...</p>
                {error && <p className="error-message">{error}</p>}
            </div>
        );
    }

    if (Booking.payment_status !== "active") {
        return (
            <div className="Booking--unavailable">
                <h2>Service Booking Error</h2>
                <p>Service Booking is currently not active. Please check back later.</p>
            </div>
        );
    }

    else if(Booking.payment_status == "active"){

        return (
            <div className="spa-booking---container">
                <h2>Service Booking</h2>

                <div className='viewBooking'>
                        <p >
                            <b>Already made a booking? </b>
                            <a style={{color:'red',cursor:'pointer'}} onClick={handleBookingView}><i><b>click to view...</b></i></a>
                        </p>
                        
                </div>
                
                {/* Progress Indicator */}
                <div className="booking---progress">
                    <div className={`progress---step ${step >= 1 ? 'active' : ''}`}>
                        <span>1</span>
                        <p>Services</p>
                    </div>
                    <div className={`progress---step ${step >= 2 ? 'active' : ''}`}>
                        <span>2</span>
                        <p>Date & Time</p>
                    </div>
                    <div className={`progress---step ${step >= 3 ? 'active' : ''}`}>
                        <span>3</span>
                        <p>Staff</p>
                    </div>
                    <div className={`progress---step ${step >= 4 ? 'active' : ''}`}>
                        <span>4</span>
                        <p>Details</p>
                    </div>
                    <div className={`progress---step ${step >= 5 ? 'active' : ''}`}>
                        <span>5</span>
                        <p>Confirmation</p>
                    </div>
                </div>

                {bookingStatus && (
                    <div className={`booking---status ${bookingStatus.type}`}>
                        {bookingStatus.message}
                    </div>
                )}

                {/* Step 1: Services Selection */}
                {step === 1 && (
                    <div className="booking---step">
                        <h3>Select Services</h3>
                        <div className="services---grid">
                            {services.length > 0 ? (
                                services.map(service => (
                                    <div 
                                        key={service.id} 
                                        className={`service---card ${selectedServices.includes(service.id) ? 'selected' : ''}`}
                                        onClick={() => toggleServiceSelection(service.id)}
                                    >
                                        <h4>{service.name}</h4>
                                        <div className="service---details">
                                            <span className="service---price">Ksh {service.price}</span>
                                        </div>
                                        <p className="service---description">{service.description}</p>
                                    </div>
                                ))
                            ) : <p>No services available at the moment.</p>}
                        </div>

                        {selectedServices.length > 0 && (
                            <div className="booking---summary">
                                <h4>Selected Services</h4>
                                <ul>
                                    {selectedServices.map(serviceId => {
                                        const service = services.find(s => s.id === serviceId);
                                        return service ? (
                                            <li key={service.id}>
                                                {service.name} - Ksh {service.price} ({service.duration} min)
                                            </li>
                                        ) : null;
                                    })}
                                </ul>
                                <div className="summary---total">
                                    <strong>Total: Ksh {calculateTotal()}</strong>
                                </div>
                            </div>
                        )}

                        <div className="step-buttons">
                            <button className="btn-next" onClick={handleNextStep} disabled={selectedServices.length === 0}>
                                Next: Select Date & Time
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Date & Time Selection */}
                {step === 2 && (
                    <div className="booking-step">
                        <h3>Select Date & Time</h3>
                        
                        <div className="form-group">
                            <label htmlFor="booking_date">Date</label>
                            <input
                                type="date"
                                id="booking_date"
                                name="booking_date"
                                value={formData.booking_date}
                                onChange={handleInputChange}
                                min={new Date().toISOString().split('T')[0]}
                                required
                            />
                        </div>

                        {formData.booking_date && (
                            <div className="form-group">
                                <label htmlFor="booking_time">Available Time Slots</label>
                                {availableSlots.length > 0 ? (
                                    <div className="time-slots-grid">
                                        {availableSlots.map(slot => (
                                            <div 
                                                key={slot}
                                                className={`time-slot ${formData.booking_time === slot ? 'selected' : ''}`}
                                                onClick={() => setFormData({...formData, booking_time: slot})}
                                            >
                                                {slot}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p>No available time slots for this date. Please select another date.</p>
                                )}
                            </div>
                        )}

                        <div className="step-buttons">
                            <button className="btn-prev" onClick={handlePrevStep}>
                                Back: Services
                            </button>
                            <button className="btn-next" onClick={handleNextStep} disabled={!formData.booking_time}>
                                Next: Select Staff
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Staff Selection */}
                {step === 3 && (
                    <div className="booking-step">
                        <h3>Select Staff Member</h3>
                        
                        <div className="staff-selection">
                            {availableStaff.length > 0 ? (
                                <div className="staff-grid">
                                    {staffMembers.map(staff => {
                                        const isAvailable = availableStaff.includes(staff.staff_id);
                                        return (
                                            <div 
                                                key={staff.id}
                                                className={`staff-card ${selectedStaff === staff.staff_id ? 'selected' : ''} ${!isAvailable ? 'unavailable' : ''}`}
                                                onClick={() => isAvailable && setSelectedStaff(staff.staff_id)}
                                            >
                                                <div className="staff-image">
                                                    <img src={`${staff.profile_pic}`} />
                                                </div>
                                                <h4>{staff.name}</h4>
                                                <p>{staff.specialization}</p>
                                                {!isAvailable && <span className="unavailable-label">Booked 🚫!</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p>No available staff for the selected time slot. Please choose a different time.</p>
                            )}
                        </div>

                        <div className="step-buttons">
                            <button className="btn-prev" onClick={handlePrevStep}>
                                Back: Date & Time
                            </button>
                            <button className="btn-next" onClick={handleNextStep} disabled={!selectedStaff}>
                                Next: Your Details
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Client Details */}
                {step === 4 && (
                    <div className="booking-step">
                        <h3>Your Details</h3>
                        
                        <form className="booking-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="client_name">Full Name *</label>
                                <input
                                    type="text"
                                    id="client_name"
                                    name="client_name"
                                    value={formData.client_name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="client_email">Email *</label>
                                <input
                                    type="email"
                                    id="client_email"
                                    name="client_email"
                                    value={formData.client_email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="client_phone">Phone *</label>
                                <input
                                    type="tel"
                                    id="client_phone"
                                    name="client_phone"
                                    value={formData.client_phone}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="client_address">Address</label>
                                <input
                                    type="text"
                                    id="client_address"
                                    name="client_address"
                                    value={formData.client_address}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="number_of_clients">Number of Clients</label>
                                <input
                                    type="number"
                                    id="number_of_clients"
                                    name="number_of_clients"
                                    value={formData.clients}
                                    onChange={handleInputChange}
                                    min="1"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="notes">Special Requests</label>
                                <textarea
                                    id="notes"
                                    placeholder = "can include gallery image Number..."
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    rows="3"
                                />
                            </div>

                            <div className="booking-summary-final">
                                <h4>Booking Summary</h4>
                                <div className="summary-details">
                                    <p><strong>Date:</strong> {formData.booking_date}</p>
                                    <p><strong>Time:</strong> {formData.booking_time}</p>
                                    <p><strong>Staff:</strong> {staffMembers.find(s => s.staff_id === selectedStaff)?.name}</p>
                                    <p><strong>Services:</strong></p>
                                    <ul>
                                        {selectedServices.map(serviceId => {
                                            const service = services.find(s => s.id === serviceId);
                                            return service ? <li key={service.id}>{service.name}</li> : null;
                                        })}
                                    </ul>
                                    <p><strong>Total Price:</strong> Ksh {calculateTotal()}</p>
                                </div>
                            </div>

                            <div className="step-buttons">
                                <button className="btn-prev" onClick={handlePrevStep} type="button">
                                    Back: Staff Selection
                                </button>
                                <button className="btn-submit" type="submit">
                                    Complete Booking
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Step 5: Confirmation */}
                {step === 5 && bookingStatus?.type === 'success' && (
                    <div className="booking-step confirmation">
                        <div className="confirmation-icon">✓</div>
                        <h3>Booking Confirmed!</h3>
                        <p>Your booking has been successfully created.</p>
                        <div className="booking-reference">
                            <strong>Booking Reference:</strong> {bookingReference}
                        </div>
                        
                        <div className="booking-details">
                            <h4>Booking Details</h4>
                            <p><strong>Date:</strong> {formData.booking_date}</p>
                            <p><strong>Time:</strong> {formData.booking_time}</p>
                            <p><strong>Staff:</strong> {staffMembers.find(s => s.id === selectedStaff)?.name}</p>
                            <p><strong>Services:</strong></p>
                            <ul>
                                {selectedServices.map(serviceId => {
                                    const service = services.find(s => s.id === serviceId);
                                    return service ? <li key={service.id}>{service.name}</li> : null;
                                })}
                            </ul>
                        </div>
                        
                        <button className="btn-new-booking" onClick={resetBooking}>
                            Make Another Booking
                        </button>
                    </div>
                )}
            </div>
        );
    } else{
        return (
            <div className="Booking--unavailable">
                <h2>Service Booking Error</h2>
                <p>Service Booking is currently not active. Please check back later.</p>
            </div>
        );
    };
};

export default SpaBooking;