/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
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
                const staffResponse = await fetch(`${API_URL}/${slug}/staff/`);
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
        navigate(`/${slug}/ViewBooking`);
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

    if (!Booking) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <p className="text-lg text-gray-600">Loading Booking page...</p>
                    {error && <p className="text-red-500 mt-2">{error}</p>}
                </div>
            </div>
        );
    }

    if (Booking.payment_status !== "active") {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Service Booking Error</h2>
                    <p className="text-gray-600">Service Booking is currently not active. Please check back later.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-8 text-white">
                    <h2 className="text-3xl font-bold text-center mb-2">Service Booking</h2>
                    <div className="text-center">
                        <p className="text-pink-100">
                            <b>Already made a booking? </b>
                            <span 
                                className="text-white cursor-pointer underline hover:text-pink-200 transition-colors"
                                onClick={handleBookingView}
                            >
                                <i><b>click to view...</b></i>
                            </span>
                        </p>
                    </div>
                </div>

                {/* Progress Indicator */}
                <div className="flex justify-between items-center px-6 py-4 bg-white border-b">
                    {[1, 2, 3, 4, 5].map((stepNumber) => (
                        <div key={stepNumber} className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                step >= stepNumber 
                                    ? 'bg-pink-500 border-pink-500 text-white' 
                                    : 'border-gray-300 text-gray-400'
                            }`}>
                                <span className="font-semibold">{stepNumber}</span>
                            </div>
                            <p className={`text-xs mt-2 font-medium ${
                                step >= stepNumber ? 'text-pink-600' : 'text-gray-400'
                            }`}>
                                {stepNumber === 1 && 'Services'}
                                {stepNumber === 2 && 'Date & Time'}
                                {stepNumber === 3 && 'Staff'}
                                {stepNumber === 4 && 'Details'}
                                {stepNumber === 5 && 'Confirmation'}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Status Message */}
                {bookingStatus && (
                    <div className={`mx-6 mt-4 p-4 rounded-lg ${
                        bookingStatus.type === 'success' 
                            ? 'bg-green-50 border border-green-200 text-green-700'
                            : 'bg-red-50 border border-red-200 text-red-700'
                    }`}>
                        {bookingStatus.message}
                    </div>
                )}

                {/* Step Content */}
                <div className="p-6">
                    {/* Step 1: Services Selection */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-gray-800 mb-6">Select Services</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {services.length > 0 ? (
                                    services.map(service => (
                                        <div 
                                            key={service.id} 
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                                                selectedServices.includes(service.id) 
                                                    ? 'border-pink-500 bg-pink-50 shadow-md' 
                                                    : 'border-gray-200 bg-white hover:border-pink-300'
                                            }`}
                                            onClick={() => toggleServiceSelection(service.id)}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-semibold text-gray-800 text-lg">{service.name}</h4>
                                                <span className="font-bold text-pink-600">Ksh {service.price}</span>
                                            </div>
                                            <p className="text-gray-600 text-sm">{service.description}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center col-span-2 py-8">No services available at the moment.</p>
                                )}
                            </div>

                            {selectedServices.length > 0 && (
                                <div className="bg-gray-50 rounded-xl p-6 mt-6">
                                    <h4 className="font-bold text-lg text-gray-800 mb-4">Selected Services</h4>
                                    <ul className="space-y-2 mb-4">
                                        {selectedServices.map(serviceId => {
                                            const service = services.find(s => s.id === serviceId);
                                            return service ? (
                                                <li key={service.id} className="flex justify-between items-center text-gray-700">
                                                    <span>{service.name}</span>
                                                    <span className="font-semibold">Ksh {service.price}</span>
                                                </li>
                                            ) : null;
                                        })}
                                    </ul>
                                    <div className="border-t pt-3">
                                        <strong className="text-lg text-gray-800">Total: Ksh {calculateTotal()}</strong>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end pt-6">
                                <button 
                                    className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
                                        selectedServices.length === 0
                                            ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                                            : 'bg-pink-500 hover:bg-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                                    }`}
                                    onClick={handleNextStep}
                                    disabled={selectedServices.length === 0}
                                >
                                    Next: Select Date & Time
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Date & Time Selection */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-gray-800 mb-6">Select Date & Time</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="booking_date" className="block text-sm font-medium text-gray-700 mb-2">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        id="booking_date"
                                        name="booking_date"
                                        value={formData.booking_date}
                                        onChange={handleInputChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300"
                                        required
                                    />
                                </div>

                                {formData.booking_date && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Available Time Slots
                                        </label>
                                        {availableSlots.length > 0 ? (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                {availableSlots.map(slot => (
                                                    <div 
                                                        key={slot}
                                                        className={`p-3 text-center rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                                                            formData.booking_time === slot 
                                                                ? 'bg-pink-500 text-white border-pink-500 shadow-lg' 
                                                                : 'bg-white text-gray-700 border-gray-300 hover:border-pink-300 hover:shadow-md'
                                                        }`}
                                                        onClick={() => setFormData({...formData, booking_time: slot})}
                                                    >
                                                        {slot}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-center py-4">No available time slots for this date. Please select another date.</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between pt-6">
                                <button 
                                    className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all duration-300"
                                    onClick={handlePrevStep}
                                >
                                    Back: Services
                                </button>
                                <button 
                                    className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
                                        !formData.booking_time
                                            ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                                            : 'bg-pink-500 hover:bg-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                                    }`}
                                    onClick={handleNextStep}
                                    disabled={!formData.booking_time}
                                >
                                    Next: Select Staff
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Staff Selection */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-gray-800 mb-6">Select Staff Member</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {staffMembers.map(staff => {
                                    const isAvailable = availableStaff.includes(staff.staff_id);
                                    return (
                                        <div 
                                            key={staff.id}
                                            className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                                                selectedStaff === staff.staff_id 
                                                    ? 'border-pink-500 bg-pink-50 shadow-lg' 
                                                    : isAvailable 
                                                        ? 'border-gray-200 bg-white hover:border-pink-300 hover:shadow-md cursor-pointer'
                                                        : 'border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed'
                                            }`}
                                            onClick={() => isAvailable && setSelectedStaff(staff.staff_id)}
                                        >
                                            <div className="flex items-center space-x-4 mb-3">
                                                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                                                    <img 
                                                        src={staff.profile_pic} 
                                                        alt={staff.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-800">{staff.name}</h4>
                                                    <p className="text-sm text-gray-600">{staff.specialization}</p>
                                                </div>
                                            </div>
                                            {!isAvailable && (
                                                <span className="text-xs text-red-500 font-medium">Booked 🚫!</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {availableStaff.length === 0 && (
                                <p className="text-gray-500 text-center py-8">No available staff for the selected time slot. Please choose a different time.</p>
                            )}

                            <div className="flex justify-between pt-6">
                                <button 
                                    className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all duration-300"
                                    onClick={handlePrevStep}
                                >
                                    Back: Date & Time
                                </button>
                                <button 
                                    className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
                                        !selectedStaff
                                            ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                                            : 'bg-pink-500 hover:bg-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                                    }`}
                                    onClick={handleNextStep}
                                    disabled={!selectedStaff}
                                >
                                    Next: Your Details
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Client Details */}
                    {step === 4 && (
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-gray-800 mb-6">Your Details</h3>
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="client_name" className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="client_name"
                                            name="client_name"
                                            value={formData.client_name}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="client_email" className="block text-sm font-medium text-gray-700 mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            id="client_email"
                                            name="client_email"
                                            value={formData.client_email}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="client_phone" className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone *
                                        </label>
                                        <input
                                            type="tel"
                                            id="client_phone"
                                            name="client_phone"
                                            value={formData.client_phone}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="number_of_clients" className="block text-sm font-medium text-gray-700 mb-2">
                                            Number of Clients
                                        </label>
                                        <input
                                            type="number"
                                            id="number_of_clients"
                                            name="number_of_clients"
                                            value={formData.clients}
                                            onChange={handleInputChange}
                                            min="1"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="client_address" className="block text-sm font-medium text-gray-700 mb-2">
                                        Address
                                    </label>
                                    <input
                                        type="text"
                                        id="client_address"
                                        name="client_address"
                                        value={formData.client_address}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                                        Special Requests
                                    </label>
                                    <textarea
                                        id="notes"
                                        placeholder="Can include gallery image Number..."
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300"
                                    />
                                </div>

                                <div className="bg-gray-50 rounded-xl p-6">
                                    <h4 className="font-bold text-lg text-gray-800 mb-4">Booking Summary</h4>
                                    <div className="space-y-2 text-gray-700">
                                        <p><strong>Date:</strong> {formData.booking_date}</p>
                                        <p><strong>Time:</strong> {formData.booking_time}</p>
                                        <p><strong>Staff:</strong> {staffMembers.find(s => s.staff_id === selectedStaff)?.name}</p>
                                        <p><strong>Services:</strong></p>
                                        <ul className="list-disc list-inside ml-4">
                                            {selectedServices.map(serviceId => {
                                                const service = services.find(s => s.id === serviceId);
                                                return service ? <li key={service.id}>{service.name}</li> : null;
                                            })}
                                        </ul>
                                        <p className="font-bold text-lg mt-3">Total Price: Ksh {calculateTotal()}</p>
                                    </div>
                                </div>

                                <div className="flex justify-between pt-6">
                                    <button 
                                        className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all duration-300"
                                        onClick={handlePrevStep}
                                        type="button"
                                    >
                                        Back: Staff Selection
                                    </button>
                                    <button 
                                        className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                                        type="submit"
                                    >
                                        Complete Booking
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Step 5: Confirmation */}
                    {step === 5 && bookingStatus?.type === 'success' && (
                        <div className="text-center space-y-6">
                            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                                <span className="text-3xl text-white font-bold">✓</span>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-800">Booking Confirmed!</h3>
                            <p className="text-gray-600 text-lg">Your booking has been successfully created.</p>
                            
                            <div className="bg-green-50 border border-green-200 rounded-xl p-6 max-w-md mx-auto">
                                <strong className="text-green-800">Booking Reference:</strong>
                                <div className="text-2xl font-mono font-bold text-green-700 mt-2">{bookingReference}</div>
                            </div>
                            
                            <div className="bg-gray-50 rounded-xl p-6 max-w-2xl mx-auto text-left">
                                <h4 className="font-bold text-xl text-gray-800 mb-4">Booking Details</h4>
                                <div className="space-y-2 text-gray-700">
                                    <p><strong>Date:</strong> {formData.booking_date}</p>
                                    <p><strong>Time:</strong> {formData.booking_time}</p>
                                    <p><strong>Staff:</strong> {staffMembers.find(s => s.staff_id === selectedStaff)?.name}</p>
                                    <p><strong>Services:</strong></p>
                                    <ul className="list-disc list-inside ml-4">
                                        {selectedServices.map(serviceId => {
                                            const service = services.find(s => s.id === serviceId);
                                            return service ? <li key={service.id}>{service.name}</li> : null;
                                        })}
                                    </ul>
                                </div>
                            </div>
                            
                            <button 
                                className="px-8 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                                onClick={resetBooking}
                            >
                                Make Another Booking
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SpaBooking;