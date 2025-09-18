/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
import { useState, useEffect } from 'react';
import { useSlug } from "../Tenants/TenantOperator";
import './Inventory.css';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    } from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { useParams } from 'react-router-dom';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
    );

const Inventory = () => {
    const { slug } = useParams();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [products, setProducts] = useState([]);
    const [bookingCode, setBookingCode] = useState('');
    const [customerBookings, setCustomerBookings] = useState([]);
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({
        totalSales: 0,
        totalOrders: 0,
        totalProducts: 0,
        lowStock: 0
    });
    const [loading, setLoading] = useState(true);
    // Form states
    const [showProductForm, setShowProductForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        stock: '',
        discount: '',
        image: null,
        imagePreview: ''
    });

    // Chart data
    const [salesData, setSalesData] = useState(null);
    const [topProductsData, setTopProductsData] = useState(null);
    const [demographicsData, setDemographicsData] = useState(null);
    const [error, setError] = useState('');
    const [shop, setShop] = useState(null);

    // Fetch shop data
    useEffect(() => {
        const verifyShopStatus = async () => {
            try {
                const response = await fetch(`${API_URL}/validate/${slug}/`);
                if (!response.ok) throw new Error('Failed to verify inventory');
                const data = await response.json();
                if (data.slug === slug && data.payment_status === "active") {
                    setShop(data);
                    fetchShopData();
                } else {
                    setError('Inventory not available');
                }
            } catch (err) {
                setError('Failed to verify shop. Please try again later.');
            }
        };
        verifyShopStatus();
        
    }, [slug]);

    const fetchShopData = async () => {
        try {
            setLoading(true);
            const [productsRes, ordersRes] = await Promise.all([
                fetch(`${API_URL}/shop/${slug}/products/`),
                fetch(`${API_URL}/shop/${slug}/orders/`)
            ]);

            if (!productsRes.ok) throw new Error('Failed to fetch products');
            if (!ordersRes.ok) throw new Error('Failed to fetch orders');

            const productsData = await productsRes.json();
            const ordersData = await ordersRes.json();

            setProducts(productsData);
            setOrders(ordersData);

            const deliveredStatus= ordersData.filter((item)=> item.status==='delivered')
            const totalSales = deliveredStatus.reduce((sum, order) => sum + parseFloat(order.total_price), 0);
            const lowStock = productsData.filter(product => product.stock < 5).length;

            setStats({
                totalSales,
                totalOrders: ordersData.length,
                totalProducts: productsData.length,
                lowStock
            });

            // Generate chart data
            generateChartData(ordersData, productsData);

        } catch (err) {
            setError('Failed to load shop data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    
    // Generate chart data from orders and products
    const generateChartData = (ordersData, productsData) => {
        // Sales data - last 7 days
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return date.toISOString().split('T')[0];
        });

        const deliveredSales= ordersData.filter((item)=> item.status==='delivered')
        const dailySales = last7Days.map(date => {
            const dayOrders = deliveredSales.filter(order => 
                order.created_at && order.created_at.startsWith(date)
            );
            const total = dayOrders.reduce((sum, order) => sum + parseFloat(order.total_price || 0), 0);
            
            return {
                date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
                sales: total
            };
        });

        // Sales chart data
        setSalesData({
            labels: dailySales.map(item => item.date),
            datasets: [
                {
                    label: 'Daily Sales (KSh)',
                    data: dailySales.map(item => item.sales),
                    backgroundColor: 'rgba(102, 126, 234, 0.6)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 2,
                },
            ],
        });

        // Top products data
        const productSales = {};
        const soldUnits = ordersData.filter((item)=> item.status==='delivered')
        soldUnits.forEach(order => {
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach(item => {
                    const productId = item.product?.id || item.product;
                    if (productId) {
                        productSales[productId] = (productSales[productId] || 0) + (item.quantity || 0);
                    }
                });
            }
        });

        const topProducts = productsData
            .map(product => ({
                name: product.name,
                sales: productSales[product.id]
            }))
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 5);

        setTopProductsData({
            labels: topProducts.map(item => item.name),
            datasets: [
                {
                    label: 'Units Sold',
                    data: topProducts.map(item => item.sales),
                    backgroundColor: [
                        'rgba(136, 132, 216, 0.6)',
                        'rgba(131, 166, 237, 0.6)',
                        'rgba(141, 209, 225, 0.6)',
                        'rgba(130, 202, 157, 0.6)',
                        'rgba(164, 222, 108, 0.6)',
                    ],
                    borderColor: [
                        'rgba(136, 132, 216, 1)',
                        'rgba(131, 166, 237, 1)',
                        'rgba(141, 209, 225, 1)',
                        'rgba(130, 202, 157, 1)',
                        'rgba(164, 222, 108, 1)',
                    ],
                    borderWidth: 1,
                },
            ],
        });

        // Demographics data
        setDemographicsData({
            labels: ['Women 18-30', 'Women 30-45', 'Men 18-30', 'Men 30-45'],
            datasets: [
                {
                    data: [40, 25, 20, 15],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                    ],
                    borderWidth: 1,
                },
            ],
        });
    };

    // Chart options
    const barChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Sales Performance',
            },
        },
    };

    const pieChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
        },
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle image upload
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    image: file,
                    imagePreview: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };


    const fetchCustomerBookings = async () => {
        setCustomerBookings([]);
        setError('');
        if (!bookingCode.trim()) {
            throw new Error ('Please enter your order code');
        }

        try {
            setLoading(true);
            setError('');
            
            const response = await fetch(`${API_URL}/shop/${slug}/customer-bookings/?order_code=${encodeURIComponent(bookingCode)}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    setCustomerBookings([]);
                    return;
                }
                setError('Failed to fetch your bookings. Please check your order code and try again.');
                throw new Error('Failed to fetch bookings');
            }
            
            const data = await response.json();
            
            if (data.length === 0) {
                setCustomerBookings([]);
                setError('Failed to fetch your bookings. Please check your order code and try again.');
            } else {
                setCustomerBookings(data);
            }
        } catch (error) {
            setCustomerBookings([]);
            setError('Failed to fetch your bookings. Please check your order code and try again.');
            
        } finally {
            setLoading(false);
        }
    };

    // Submit product form
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('price', formData.price);
            formDataToSend.append('stock', formData.stock);
            formDataToSend.append('discount', formData.discount || 0);
            if (formData.image) {
                formDataToSend.append('image', formData.image);
            }

            let url, method;
            
            if (editingProduct) {
                url = `${API_URL}/shop/${slug}/products/${editingProduct.id}/`;
                method = 'PUT';
            } else {
                url = `${API_URL}/shop/${slug}/addproducts/`;
                method = 'POST';
            }

            const response = await fetch(url, {
                method,
                body: formDataToSend
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || errorData.error || 'Failed to save product');
            }

            // Refresh all data
            await fetchShopData();

            // Reset form
            setShowProductForm(false);
            setEditingProduct(null);
            setFormData({
                name: '',
                price: '',
                stock: '',
                discount: '',
                image: null,
                imagePreview: ''
            });

        } catch (err) {
            setError(err.message || 'Failed to save product. Please try again.');
            console.error('Error:', err);
        }
    };

    // Edit product
    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            price: product.price,
            stock: product.stock,
            discount: product.discount || 0,
            image: null,
            imagePreview: product.image
        });
        setShowProductForm(true);
    };

    // Delete product
    const handleDelete = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            const response = await fetch(`${API_URL}/shop/${slug}/products/${productId}/`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete product');
            }

            // Refresh products
            await fetchShopData();

        } catch (err) {
            setError('Failed to delete product. Please try again.');
        }
    };

    // Update order status
    const handleStatusUpdate = async (order_code, newStatus) => {
        try {
            const response = await fetch(`${API_URL}/shop/${slug}/orders/${order_code}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                throw new Error('Failed to update order status');
            } 
            

            // Refresh orders
            await fetchShopData();

        } catch (err) {
            setError('Failed to update order status. Please try again.');
        }
    };

    // Close form
    const handleCloseForm = () => {
        setShowProductForm(false);
        setEditingProduct(null);
        setFormData({
            name: '',
            price: '',
            stock: '',
            discount: '',
            image: null,
            imagePreview: ''
        });
    };

    if (loading) {
        return (
            <div className="management-container">
                <div className="loading-spinner">Loading management dashboard...</div>
            </div>
        );
    }
    if (shop.Subscription_status.Subscription_type == "standard") {
        return (
            <div className="unavailable">
                <h2>Inventory Unavailable</h2>
                <p>This page is available for premium subscriptions only, consider upgrading your subscription...</p>
            </div>
        );
    }
    if (shop.Subscription_status.Subscription_type == "premium" || shop.Subscription_status.Subscription_type == "trial"){

        return (
            <div className="management-container">
                <header className="management-header">
                    <p>Manage your shop products and track performance</p>
                </header>

                {error && (
                    <div className="error-message">
                        {error}
                        <button onClick={() => setError('')} className="error-close">×</button>
                    </div>
                )}

                {/* Navigation Tabs */}
                <nav className="management-tabs">
                    <button 
                        className={activeTab === 'dashboard' ? 'active' : ''}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        Dashboard
                    </button>
                    <button 
                        className={activeTab === 'inventory' ? 'active' : ''}
                        onClick={() => setActiveTab('inventory')}
                    >
                        Inventory
                    </button>
                    <button 
                        className={activeTab === 'orders' ? 'active' : ''}
                        onClick={() => setActiveTab('orders')}
                    >
                        Orders
                    </button>
                    <button 
                        className={activeTab === 'analytics' ? 'active' : ''}
                        onClick={() => setActiveTab('analytics')}
                    >
                        Analytics
                    </button>
                </nav>

                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && (
                    <div className="dashboard-content">
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon">💰</div>
                                <div className="stat-info">
                                    <h3>KSh {stats.totalSales.toLocaleString()}</h3>
                                    <p>Total Sales</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">📦</div>
                                <div className="stat-info">
                                    <h3>{stats.totalOrders}</h3>
                                    <p>Total Orders</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">✨</div>
                                <div className="stat-info">
                                    <h3>{stats.totalProducts}</h3>
                                    <p>Products</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">⚠️</div>
                                <div className="stat-info">
                                    <h3>{stats.lowStock}</h3>
                                    <p>Low Stock Items</p>
                                </div>
                            </div>
                        </div>

                        <div className="dashboard-charts">
                            <div className="chart-card">
                                <h3>Weekly Sales Performance</h3>
                                {salesData ? (
                                    <Bar data={salesData} options={barChartOptions} />
                                ) : (
                                    <div className="chart-placeholder">Loading chart...</div>
                                )}
                            </div>
                            <div className="chart-card">
                                <h3>Top Products</h3>
                                {topProductsData ? (
                                    <Bar data={topProductsData} options={{
                                        ...barChartOptions,
                                        indexAxis: 'y',
                                    }} />
                                ) : (
                                    <div className="chart-placeholder">Loading chart...</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Inventory Tab */}
                {activeTab === 'inventory' && (
                    <div className="inventory-content">
                        <div className="inventory-header">
                            <h2>Product Inventory</h2>
                            {/* <button 
                                className="add-product-btn"
                                onClick={() => setShowProductForm(true)}
                            >
                                + Add Product
                            </button> */}
                        </div>

                        <div className="products-table-container">
                            <table className="products-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Price</th>
                                        <th>Stock</th>
                                        <th>Discount</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(product => (
                                        <tr key={product.id}>
                                            <td className="product-cell">
                                                <img 
                                                    src={`http://localhost:8000${product.image}`} 
                                                    alt={product.name} 
                                                    className="product-thumb"
                                                    onError={(e) => {
                                                        e.target.src = '/placeholder-product.jpg';
                                                    }}
                                                />
                                                <span>{product.name}</span>
                                            </td>
                                            <td>KSh {parseFloat(product.price || 0).toLocaleString()}</td>
                                            <td>
                                                <span className={`stock-badge ${product.stock < 5 ? 'low' : product.stock < 10 ? 'medium' : 'good'}`}>
                                                    {product.stock}
                                                </span>
                                            </td>
                                            <td>{product.discount || 0}%</td>
                                            <td className="action-buttons">
                                                <button 
                                                    className="edit-btn"
                                                    onClick={() => handleEdit(product)}
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    className="delete-btn"
                                                    onClick={() => handleDelete(product.id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div className="orders-content">
                        <h2>Recent Orders</h2>
                        <div className="bookings-search">
                            <p>Enter order code to view your order history</p>
                            <div className="search-fields">
                                <div className="form-group">
                                    <label>Order Code *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., ORD######ABCD"
                                        value={bookingCode}
                                        onChange={(e) => setBookingCode(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div >
                                <button 
                                    className="search-bookings-btn"
                                    onClick={fetchCustomerBookings}
                                    disabled={loading }
                                >
                                    {loading ? 'Searching...' : 'Find My Order'}
                                </button>
                            </div>
                        </div>

                        {customerBookings.length > 0 ? (
                            <div className="bookings-list">
                                <h3> Order History</h3>
                                {customerBookings.map(booking => (
                                    <div key={booking.id} className="booking-item">
                                        <div className="booking-header">
                                            <span className="order-code">{booking.order_code}</span>
                                            <span className="order-date">{new Date(booking.created_at).toLocaleDateString()}</span>
                                            <span className={`order-status ${booking.status}`}>
                                                {booking.status}
                                            </span>
                                        </div>
                                        <div className="booking-details">
                                            <div className="detail-row">
                                                <span className="detail-label">Customer:</span>
                                                <span className="detail-value">{booking.client_name}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Phone:</span>
                                                <span className="detail-value">{booking.client_phone}</span>
                                            </div>
                                            {booking.client_email && (
                                                <div className="detail-row">
                                                    <span className="detail-label">Email:</span>
                                                    <span className="detail-value">{booking.client_email}</span>
                                                </div>
                                            )}
                                            <div className="detail-row">
                                                <span className="detail-label">Delivery:</span>
                                                <span className="detail-value">{booking.delivery_option}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Total Amount:</span>
                                                <span className="detail-value">KSh {parseFloat(booking.total_price).toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className="booking-items">
                                            <h4>Order Items:</h4>
                                            {booking.items && booking.items.map(item => (
                                                <div key={item.id} className="booking-item-product">
                                                    <span className="item-name">{item.product_name}</span>
                                                    <span className="item-quantity">x {item.quantity}</span>
                                                    <span className="item-price">KSh {parseFloat(item.price).toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (<p style={{color:'red'}}>{error}</p>)}
                            
                        <div className="orders-table-container">
                            <table className="orders-table">
                                <thead>
                                    <tr>
                                        <th>Order Code</th>
                                        <th>Customer</th>
                                        <th>Date</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.slice(0, 15).map(order => (
                                        <tr key={order.id}>
                                            <td className="order-code">{order.order_code}</td>
                                            <td>
                                                <div>{order.client_name}</div>
                                                <div className="customer-phone">{order.client_phone}</div>
                                            </td>
                                            <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                            <td>KSh {parseFloat(order.total_price || 0).toLocaleString()}</td>
                                            <td>
                                                <span className={`status-badge ${order.status}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="action-buttons">
                                                <select 
                                                    defaultValue={order.status || 'processing'}
                                                    onChange={(e) => handleStatusUpdate(order.order_code, e.target.value)}
                                                    className="status-select"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="confirmed">Confirmed</option>
                                                    <option value="processing">Processing</option>
                                                    <option value="shipped">Shipped</option>
                                                    <option value="delivered">Delivered</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                    <div className="analytics-content">
                        <h2>Business Analytics</h2>
                        <div className="analytics-grid">
                            <div className="analytics-card">
                                <h3>Revenue Trends</h3>
                                {salesData ? (
                                    <Line data={salesData} options={barChartOptions} />
                                ) : (
                                    <div className="chart-placeholder">Loading chart...</div>
                                )}
                            </div>
                            <div className="analytics-card">
                                <h3>Customer Demographics</h3>
                                {demographicsData ? (
                                    <Pie data={demographicsData} options={pieChartOptions} />
                                ) : (
                                    <div className="chart-placeholder">Loading chart...</div>
                                )}
                            </div>
                            <div className="analytics-card">
                                <h3>Inventory Health</h3>
                                <div className="inventory-health">
                                    <div className="health-metric">
                                        <span className="label">Well Stocked (20)</span>
                                        <span className="value">{products.filter(p => p.stock > 20).length}</span>
                                    </div>
                                    <div className="health-metric">
                                        <span className="label">Moderate Stock (5-20)</span>
                                        <span className="value">{products.filter(p => p.stock >= 5 && p.stock <= 20).length}</span>
                                    </div>
                                    <div className="health-metric">
                                        <span className="label">Low Stock (5)</span>
                                        <span className="value">{products.filter(p => p.stock < 5).length}</span>
                                    </div>
                                    <div className="health-metric">
                                        <span className="label">Out of Stock</span>
                                        <span className="value">{products.filter(p => p.stock === 0).length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Product Form Modal */}
                {showProductForm && (
                    <div className="modal-overlay">
                        <div className="modal-content product-form-modal">
                            <div className="modal-header">
                                <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                                <button className="close-button" onClick={handleCloseForm}>
                                    &times;
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="product-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Product Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Price (KSh) *</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Stock Quantity *</label>
                                        <input
                                            type="number"
                                            name="stock"
                                            value={formData.stock}
                                            onChange={handleInputChange}
                                            min="0"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Discount (%)</label>
                                        <input
                                            type="number"
                                            name="discount"
                                            value={formData.discount}
                                            onChange={handleInputChange}
                                            min="0"
                                            max="100"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Product Image</label>
                                    <div className="image-upload">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                        {formData.imagePreview && (
                                            <img 
                                                src={formData.imagePreview} 
                                                alt="Preview" 
                                                className="image-preview"
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button type="button" onClick={handleCloseForm}>
                                        Cancel
                                    </button>
                                    <button type="submit">
                                        {editingProduct ? 'Update Product' : 'Add Product'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    }else{
        return (
            <div className="unavailable">
                <h2>Inventory Unavailable</h2>
                <p>This page is available for premium subscriptions only, consider upgrading your subscription...</p>
            </div>
        );
    }
};

export default Inventory;