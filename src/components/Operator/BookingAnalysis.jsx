/* eslint-disable no-unused-vars */
// BookingAnalysis.jsx
const API_URL = import.meta.env.VITE_API_URL;
import React, { useState, useEffect, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line,
    AreaChart, Area
    } from 'recharts';
import './BookingAnalysis.css';
import { useSlug } from "../Tenants/TenantOperator";
    const BookingAnalysis = () => {
    const slug = useSlug();
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [timeFrame, setTimeFrame] = useState('daily');
    const [error, setError] = useState('');
    const [BookingAnalysis, setBokingAnalysis] = useState(null);
    // Fetch bookings from Django API
    useEffect(() => {
        const fetchBookings = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${API_URL}/${slug}/bookings/`);
            const data = await response.json();
            setBookings(data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setIsLoading(false);
        }
        };
        const verifyShopStatus = async () => {
            try {
                const response = await fetch(`${API_URL}/validate/${slug}/`);
                if (!response.ok) throw new Error('Failed to verify shop');
                const data = await response.json();
                if (data.slug === slug && data.payment_status === "active") {
                    setBokingAnalysis(data);
                    fetchBookings();
                } else {
                    setError('Shop not available');
                }
            } catch (err) {
                setError('Failed to verify shop. Please try again later.');
            }
        };
        verifyShopStatus();
        
    }, [slug]);


    // Process data for visualizations - FIXED SUMMATION LOGIC
    const {
        serviceStats,
        dailyStats,
        weeklyStats,
        monthlyStats,
        statusStats,
        peakDays,
        revenueData,
        totalRevenue,
        completedBookingsCount,
        averageBookingValue
    } = useMemo(() => {
        if (!bookings.length || !Array.isArray(bookings)) return {};

        // Initialize stats objects
        const serviceMap = {};
        const dailyStats = {};
        const weeklyStats = {};
        const monthlyStats = {};
        const statusStats = {
        'pending': 0, 'confirmed': 0, 'completed': 0, 'cancelled': 0, 'no-show': 0
        };
        const peakDays = {};
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        // Helper function to safely convert to number
        const toNumber = (value) => {
        if (typeof value === 'number') return value;
        const num = parseFloat(value);
        return isNaN(num) ? 0 : num;
        };

        // Process each booking
        bookings.forEach(booking => {
        // Update status counts
        statusStats[booking.status] += 1;

        // Parse booking date
        const date = new Date(booking.booking_date);
        const dayKey = booking.booking_date;
        const weekKey = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        const dayName = daysOfWeek[date.getDay()];

        // Initialize daily stats if needed
        if (!dailyStats[dayKey]) {
            dailyStats[dayKey] = { date: dayKey, bookings: 0, revenue: 0 };
        }
        dailyStats[dayKey].bookings += 1;

        // Initialize weekly stats if needed
        if (!weeklyStats[weekKey]) {
            weeklyStats[weekKey] = { week: weekKey, bookings: 0, revenue: 0 };
        }
        weeklyStats[weekKey].bookings += 1;

        // Initialize monthly stats if needed
        if (!monthlyStats[monthKey]) {
            monthlyStats[monthKey] = { month: monthKey, bookings: 0, revenue: 0 };
        }
        monthlyStats[monthKey].bookings += 1;

        // Initialize peak days if needed
        if (!peakDays[dayName]) {
            peakDays[dayName] = { day: dayName, bookings: 0, revenue: 0 };
        }
        peakDays[dayName].bookings += 1;

        // Only count revenue for completed/confirmed bookings
        if (['completed', 'confirmed'].includes(booking.status)) {
            const revenue = toNumber(booking.total_price);
            
            dailyStats[dayKey].revenue += revenue;
            weeklyStats[weekKey].revenue += revenue;
            monthlyStats[monthKey].revenue += revenue;
            peakDays[dayName].revenue += revenue;

            // Process services for this booking
            const serviceCount = booking.services.length;
            const revenuePerService = serviceCount > 0 ? revenue / serviceCount : 0;

            booking.services.forEach(service => {
            if (!serviceMap[service.id]) {
                serviceMap[service.id] = {
                id: service.id,
                name: service.name,
                count: 0,
                revenue: 0,
                color: `#${Math.floor(Math.random()*16777215).toString(16)}`
                };
            }
            serviceMap[service.id].count += 1;
            serviceMap[service.id].revenue += revenuePerService;
            });
        }
        });

        // Calculate totals
        const completedBookings = bookings.filter(b => 
        ['completed', 'confirmed'].includes(b.status)
        );
        
        const totalRevenue = completedBookings.reduce((sum, booking) => 
        sum + toNumber(booking.total_price), 0
        );
        
        const completedBookingsCount = completedBookings.length;
        const averageBookingValue = completedBookingsCount > 0 
        ? totalRevenue / completedBookingsCount 
        : 0;

        // Prepare revenue data for charts (last 30 days)
        const revenueData = Object.values(dailyStats)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-30);

        return {
        serviceStats: Object.values(serviceMap).sort((a, b) => b.count - a.count),
        dailyStats: Object.values(dailyStats),
        weeklyStats: Object.values(weeklyStats),
        monthlyStats: Object.values(monthlyStats),
        statusStats,
        peakDays: Object.values(peakDays).sort((a, b) => b.bookings - a.bookings),
        revenueData,
        totalRevenue,
        completedBookingsCount,
        averageBookingValue
        };
    }, [bookings]);

    if (isLoading) {
        return <div className="ba-loading">Loading analysis...</div>;
    }

    if (!bookings.length) {
        return <div className="ba-no-data">No booking data available for analysis</div>;
    }

    // Get current time frame data
    const getTimeFrameData = () => {
        switch (timeFrame) {
        case 'daily': return dailyStats;
        case 'weekly': return weeklyStats;
        case 'monthly': return monthlyStats;
        default: return dailyStats;
        }
    };

    const timeFrameData = getTimeFrameData();

    // Custom tooltip formatter
    const formatTooltip = (value, name) => {
        if (name === 'revenue') return [`ksh ${value.toLocaleString()}`, 'Revenue'];
        if (name === 'bookings') return [value, 'Bookings'];
        return [value, name];
    };

    // Colors for charts
    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28'];

    if (BookingAnalysis.Subscription_status.Subscription_type == "standard") {
        return (
            <div className="unavailable">
                <h2>Analysis Unavailable</h2>
                <p>This page is available for premium subscriptions only, consider upgrading your subscription...</p>
            </div>
        );
    }
    if (BookingAnalysis.Subscription_status.Subscription_type == "premium" || BookingAnalysis.Subscription_status.Subscription_type == "trial"){
        return (
            <div className="ba-container">
            <div className="ba-header">
                <h2>Booking Analytics Dashboard</h2>
                <p>Comprehensive analysis of spa bookings and revenue</p>
            </div>

            {/* Filters */}
            <div className="ba-filters">
                <div className="ba-filter-group">
                <label>Time Frame:</label>
                <select 
                    value={timeFrame} 
                    onChange={(e) => setTimeFrame(e.target.value)}
                    className="ba-time-frame-select"
                >
                    <option value="monthly">Monthly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    
                </select>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="ba-metrics-grid">
                <div className="ba-metric-card">
                <h3>Total Bookings</h3>
                <span className="ba-metric-value">{bookings.length}</span>
                </div>
                <div className="ba-metric-card">
                <h3>Total Revenue</h3>
                <span className="ba-metric-value">
                    Ksh {totalRevenue ? totalRevenue.toLocaleString() : '0'}
                </span>
                </div>
                <div className="ba-metric-card">
                <h3>Completed Bookings</h3>
                <span className="ba-metric-value">{completedBookingsCount}</span>
                </div>
                <div className="ba-metric-card">
                <h3>Avg. Booking Value</h3>
                <span className="ba-metric-value">
                    Ksh {averageBookingValue ? averageBookingValue.toFixed(2) : '0.00'}
                </span>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="ba-charts-grid">
                {/* Revenue Trend Chart */}
                <div className="ba-chart-card">
                <h3>Revenue Trend ({timeFrame})</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={timeFrameData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={timeFrame === 'daily' ? 'date' : timeFrame} />
                    <YAxis />
                    <Tooltip formatter={formatTooltip} />
                    <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" />
                    </AreaChart>
                </ResponsiveContainer>
                </div>

                {/* Service Popularity */}
                <div className="ba-chart-card">
                <h3>Service Popularity</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={serviceStats.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={formatTooltip} />
                    <Bar dataKey="count" fill="green" />
                    </BarChart>
                </ResponsiveContainer>
                </div>

                {/* Booking Status Distribution */}
                <div className="ba-chart-card">
                <h3>Booking Status</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                    <Pie
                        data={Object.entries(statusStats).map(([name, value]) => ({ name, value }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label
                    >
                        {Object.entries(statusStats).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                    </PieChart>
                </ResponsiveContainer>
                </div>

                {/* Peak Days Analysis */}
                <div className="ba-chart-card">
                <h3>Peak Booking Days</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={peakDays}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip formatter={formatTooltip} />
                    <Bar dataKey="bookings" fill="#ffc658" />
                    </BarChart>
                </ResponsiveContainer>
                </div>

                {/* Revenue by Service */}
                <div className="ba-chart-card">
                <h3>Revenue by Service</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={serviceStats.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={formatTooltip} />
                    <Bar dataKey="revenue" fill="#ff8042" />
                    </BarChart>
                </ResponsiveContainer>
                </div>

                {/* Daily Bookings Trend */}
                <div className="ba-chart-card">
                <h3>Daily Bookings Trend (Last 30 days)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={formatTooltip} />
                    <Line type="monotone" dataKey="bookings" stroke="#0088FE" />
                    </LineChart>
                </ResponsiveContainer>
                </div>
            </div>

            {/* Detailed Service Analysis */}
            <div className="ba-detailed-analysis">
                <h3>Service Performance Analysis</h3>
                <div className="ba-service-table">
                <div className="ba-table-header">
                    <span>Service</span>
                    <span>Bookings</span>
                    <span>Revenue</span>
                    <span>Avg. Value</span>
                </div>
                {serviceStats.map(service => (
                    <div key={service.id} className="ba-table-row">
                    <span className="ba-service-name">{service.name}</span>
                    <span>{service.count}</span>
                    <span>Ksh {service.revenue.toLocaleString()}</span>
                    <span>Ksh {service.count > 0 ? (service.revenue / service.count).toFixed(2) : '0.00'}</span>
                    </div>
                ))}
                </div>
            </div>
            </div>
        );
    }else{
        return (
            <div className="unavailable">
                <h2>Analysis Unavailable</h2>
                <p>This page is available for premium subscriptions only, consider upgrading your subscription...</p>
            </div>
        );
    }
};

export default BookingAnalysis;