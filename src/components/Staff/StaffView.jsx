/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useSlug } from '../Tenants/TenantStaff';
import './StaffView.css';
const API_URL = import.meta.env.VITE_API_URL;

const StaffView = () => {
    const slug = useSlug();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [staffData, setStaffData] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [staffIdInput, setStaffIdInput] = useState('');
    const [loginError, setLoginError] = useState('');

    const clearStorage = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
    };

    useEffect(() => {
        clearStorage();
        // Check if staff is already logged in
        const savedStaffData = localStorage.getItem(`staff_${slug}_data`);
        if (savedStaffData) {
            const staff = JSON.parse(savedStaffData);
            setStaffData(staff);
            setIsAuthenticated(true);
            fetchAppointments(staff.id);
        }
    }, [slug]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/${slug}/staff/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ staff_id: staffIdInput })
            });

            if (response.ok) {
                const staff = await response.json();
                try {
                    // Verify slug with Django backend
                    const response = await fetch(`${API_URL}/validate/${slug}/`);
                    const spa_data = await response.json();
                    // Check if spa exists from Django response
                    if (spa_data.slug == slug && spa_data.payment_status == "active"  ){
                        setStaffData(staff);
                        setIsAuthenticated(true);
                        localStorage.setItem(`staff_${slug}_data`, JSON.stringify(staff));
                        fetchAppointments(staff.id);
                    }
                    else if(spa_data.slug == slug && spa_data.payment_status == "inactive" || spa_data.payment_status == "dormant"){
                        setLoginError("Access Error , Contact Manager")
                    }
                    else {
                        setLoginError('Bad Error:Not Found')
                    }
                    
                } catch (err) {
                    
                    setLoginError('Err100.1:Server error... ',err);
                }
                
            } else {
                setLoginError('Invalid username. Please check and try again.');
            }
        } catch (error) {
            setLoginError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchAppointments = async (staffId) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/${slug}/staff/${staffId}/appointments/`);
            const data = await response.json();
            setAppointments(data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            const csrfToken = await getCsrfToken();
            const response = await fetch(`${API_URL}/${slug}/staff/${staffData.id}/status/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
                body: JSON.stringify({ is_active: newStatus })
            });

            if (response.ok) {
                const updatedStaff = await response.json();
                setStaffData(prev => ({ ...prev, is_active: updatedStaff.is_active }));
                localStorage.setItem(`staff_${slug}_data`, JSON.stringify({
                    ...staffData,
                    is_active: updatedStaff.is_active
                }));
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem(`staff_${slug}_data`);
        setIsAuthenticated(false);
        setStaffData(null);
        setStaffIdInput('');
    };

    const getCsrfToken = async () => {
        const response = await fetch(`${API_URL}/csrf-token/`);
        const data = await response.json();
        return data.csrfToken;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    if (!isAuthenticated) {
        return (
            <div className="staff-login-container">
                <div className="staff-login-box">
                    <div className="login-header">
                        <h2>Staff Login</h2>
                        <p>Enter your Login credentials</p>
                    </div>
                    
                    <form onSubmit={handleLogin} className="login-form">
                        <div className="staff--view-form-group">
                            <label htmlFor="staffId"></label>
                            <input
                                type="text"
                                id="staffId"
                                value={staffIdInput}
                                onChange={(e) => setStaffIdInput(e.target.value)}
                                placeholder="username"
                                required
                            />
                        </div>
                        
                        {loginError && <div className="error-message">{loginError}</div>}
                        
                        <button type="submit" disabled={loading} className="staff--view-login-btn">
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                    
                    <div className="login-help">
                        <p>Forgot credentials? Contact your manager.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="staff-view-container">
            {/* Header */}
            <div className="staff-view-header">
                <div className="staff-info">
                    <h1>Welcome, {staffData.name}!</h1>
                    <p className="staff-specialization">Specialization: {staffData.specialization}</p>
                    <p className="staff-id">ID: {staffData.staff_id}</p>
                </div>
                
                <div className="header-actions">
                    <div className="status-toggle">
                        <span className="status-label">Availability:</span>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={staffData.is_active}
                                onChange={(e) => handleStatusChange(e.target.checked)}
                            />
                            <span className="slider round"></span>
                        </label>
                        <span className="status-text">
                            {staffData.is_active ? 'Available' : 'Unavailable'}
                        </span>
                    </div>
                    
                    <button onClick={handleLogout} className="logout-btn">
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="staff-stats">
                <div className="stat-card">
                    <div className="stat-icon">📅</div>
                    <div className="stat-content">
                        <h3>{appointments.length}</h3>
                        <p>Total Appointments</p>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <h3>{appointments.filter(apt => apt.status === 'confirmed').length}</h3>
                        <p>Confirmed</p>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-content">
                        <h3>{appointments.filter(apt => apt.status === 'pending').length}</h3>
                        <p>Pending</p>
                    </div>
                </div>
            </div>

            {/* Appointments Section */}
            <div className="appointments-section">
                <h2>Your Upcoming Appointments</h2>
                
                {loading ? (
                    <div className="loading">Loading appointments...</div>
                ) : appointments.length === 0 ? (
                    <div className="no-appointments">
                        <div className="empty-icon">📅</div>
                        <h3>No appointments scheduled</h3>
                        <p>You have no upcoming appointments.</p>
                    </div>
                ) : (
                    <div className="appointments-list">
                        {appointments.map((appointment) => (
                            <div key={appointment.id} className="appointment-item">
                                <div className="appointment-header">
                                    <h3>{appointment.customer_name}</h3>
                                    <span className={`status-badge ${appointment.status}`}>
                                        {appointment.status.toUpperCase()}
                                    </span>
                                </div>
                                
                                <div className="appointment-details">
                                    <div className="detail-item">
                                        <span className="detail-label">📅 Date:</span>
                                        <span>{formatDate(appointment.booking_date)}</span>
                                    </div>
                                    
                                    <div className="detail-item">
                                        <span className="detail-label">⏰ Time:</span>
                                        <span>{formatTime(appointment.booking_time)}</span>
                                    </div>
                                    
                                    <div className="detail-item">
                                        <span className="detail-label">📞 Phone:</span>
                                        <span>{appointment.customer_phone}</span>
                                    </div>
                                    
                                    <div className="detail-item">
                                        <span className="detail-label">🔖 Reference:</span>
                                        <span>#{appointment.booking_reference}</span>
                                    </div>
                                    
                                    <div className="services">
                                        <span className="detail-label">💆 Services:</span>
                                        <div className="services-list">
                                            {appointment.services.map((service, index) => (
                                                <span key={index} className="service-tag">
                                                    {service.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {appointment.notes && (
                                        <div className="notes">
                                            <span className="detail-label">📝 Notes:</span>
                                            <p>"{appointment.notes}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Availability Notice */}
            {!staffData.is_active && (
                <div className="availability-notice">
                    <div className="notice-icon">⚠️</div>
                    <div className="notice-content">
                        <h3>You are currently marked as unavailable</h3>
                        <p>Clients cannot book appointments with you while you're unavailable.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffView;