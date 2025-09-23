/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from 'react';
import './Shop.css';
import { useParams } from 'react-router-dom';
const API_URL = import.meta.env.VITE_API_URL;


const Shop = () => {
    const { slug } = useParams();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [shop, setShop] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem(`cart_${slug}`);
        return savedCart ? JSON.parse(savedCart) : [];
    });
    const [showCart, setShowCart] = useState(false);
    const [showBooking, setShowBooking] = useState(false);
    const [showStatus, setShowStatus] = useState(false);
    const [showMyBookings, setShowMyBookings] = useState(false);
    const [bookingEmail, setBookingEmail] = useState('');
    const [bookingCode, setBookingCode] = useState('');
    const [customerBookings, setCustomerBookings] = useState([]);
    const [statusMessage, setStatusMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [customerDetails, setCustomerDetails] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        date: '',
        time: '',
        delivery: 'delivery',
        terms: false
    });

    // Save cart to localStorage
    useEffect(() => {
        localStorage.setItem(`cart_${slug}`, JSON.stringify(cart));
    }, [cart, slug]);

    const clearStorage = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
    };

    // Fetch products from Django backend
    useEffect(() => {
        clearStorage();
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/shop/${slug}/products/`);
                if (!response.ok) throw new Error('Failed to fetch products');
                const data = await response.json();
                setProducts(data);
                setFilteredProducts(data);
            } catch (error) {
                setError('Failed to fetch products. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        
        const verifyShopStatus = async () => {
            try {
                const response = await fetch(`${API_URL}/validate/${slug}/`);
                if (!response.ok) throw new Error('Failed to verify shop');
                const data = await response.json();
                if (data.slug === slug && data.payment_status === "active") {
                    setShop(data);
                    fetchProducts();
                } else {
                    setError('Shop not available');
                }
            } catch (err) {
                setError('Failed to verify shop. Please try again later.');
            }
        };

        verifyShopStatus();
    }, [slug]);

    // Search functionality
    useEffect(() => {
        if (searchTerm === '') {
            setFilteredProducts(products);
        } else {
            const filtered = products.filter(product => 
                product.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredProducts(filtered);
        }
    }, [searchTerm, products]);

    const ProductsEndRef = useRef(null);
    
    useEffect(() => {
        ProductsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [filteredProducts]);

    const addToCart = (productId) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === productId);
            
            if (existingItem) {
                if (existingItem.quantity < product.stock) {
                    return prevCart.map(item => 
                        item.id === productId 
                        ? { ...item, quantity: item.quantity + 1 } 
                        : item
                    );
                } else {
                    alert(`Only ${product.stock} ${product.name} available in stock.`);
                    return prevCart;
                }
            } else {
                if (product.stock > 0) {
                    return [...prevCart, { 
                        id: product.id, 
                        name: product.name, 
                        price: product.price, 
                        quantity: 1, 
                        image: product.image 
                    }];
                } else {
                    alert(`${product.name} is out of stock.`);
                    return prevCart;
                }
            }
        });
    };

    const increaseQuantity = (productId) => {
        const product = products.find(p => p.id === productId);
        const item = cart.find(item => item.id === productId);
        
        if (item && product) {
            if (item.quantity < product.stock) {
                setCart(prevCart => 
                    prevCart.map(item => 
                        item.id === productId 
                        ? { ...item, quantity: item.quantity + 1 } 
                        : item
                    )
                );
            } else {
                alert(`Only ${product.stock} ${product.name} available in stock.`);
            }
        }
    };

    const decreaseQuantity = (productId) => {
        setCart(prevCart => {
            const item = prevCart.find(item => item.id === productId);
            
            if (item.quantity > 1) {
                return prevCart.map(item => 
                    item.id === productId 
                    ? { ...item, quantity: item.quantity - 1 } 
                    : item
                );
            } else {
                return prevCart.filter(item => item.id !== productId);
            }
        });
    };

    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
    };

    const getCartCount = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCustomerDetails(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const confirmBooking = async () => {
        const { name, phone, email, address, date, time, terms } = customerDetails;
        const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value;

        // Basic validation
        if (!name || !phone || !address || !date || !time || !terms || !paymentMethod) {
            setError('Please fill in all required fields and agree to the terms.');
            return;
        }

        // Simple phone validation
        if (!/^\+?\d{7,15}$/.test(phone.replace(/\s+/g, ''))) {
            setError('Please enter a valid phone number.');
            return;
        }

        setShowBooking(false);

        // Prepare booking data for API
        const bookingData = {
            client_name: name,
            client_phone: phone,
            client_email: email,
            client_address: address,
            preferred_date: date,
            preferred_time: time,
            delivery_option: customerDetails.delivery,
            payment_method: paymentMethod,
            total_price: getCartTotal(),
            items: cart.map(item => ({
                product_id: item.id,
                quantity: item.quantity,
                price: item.price
            }))
        };

        try {
            const response = await fetch(`${API_URL}/shop/${slug}/bookings/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingData)
            });

            const responseData = await response.json();

            if (response.ok) {
                // Build confirmation message
                const itemsHtml = cart.map(i => `${i.name} x ${i.quantity}`).join(', ');
                const total = getCartTotal();
                const deliveryOption = customerDetails.delivery === 'pickup' ? 'Pick-up' : 'Delivery';
                const orderCode = responseData.order_code;

                setStatusMessage(`
                    <p><strong>Booking confirmed!</strong></p>
                    <p><strong>Order Code:</strong> ${orderCode} <b>send to your email</b></p>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Phone:</strong> ${phone}${email ? ` | <strong>Email:</strong> ${email}` : ''}</p>
                    <p><strong>Address:</strong> ${deliveryOption === 'Pick-up' ? 'Pick-up at spa' : address}</p>
                    <p><strong>Date & Time:</strong> ${date} ${time}</p>
                    <p><strong>Delivery Option:</strong> ${deliveryOption}</p>
                    <p><strong>Payment:</strong> ${paymentMethod.toUpperCase()}</p>
                    <p><strong>Items:</strong> ${itemsHtml}</p>
                    <p><strong>Total:</strong> KSh ${total.toLocaleString()}</p>
                    <p>Thank you for shopping with us!</p>
                `);
                
                setShowStatus(true);
                
                // Clear cart and reset form
                setCart([]);
                localStorage.removeItem(`cart_${slug}`);
                setCustomerDetails({
                    name: '',
                    phone: '',
                    email: '',
                    address: '',
                    date: '',
                    time: '',
                    delivery: 'delivery',
                    terms: false
                });

                // Refresh products to get updated stock
                const productsResponse = await fetch(`${API_URL}/shop/${slug}/products/`);
                if (productsResponse.ok) {
                    const productsData = await productsResponse.json();
                    setProducts(productsData);
                    setFilteredProducts(productsData);
                }

            } else {
                throw new Error(responseData.detail || responseData.error || 'Booking failed');
            }

        } catch (error) {

            setError('An error occurred while processing your booking. Please try again.');
            return error;
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

    const renderRating = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        
        for (let i = 0; i < fullStars; i++) {
            stars.push(<span key={i} className="star full">★</span>);
        }
        
        if (hasHalfStar) {
            stars.push(<span key="half" className="star half">★</span>);
        }
        
        const emptyStars = 5 - stars.length;
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<span key={`empty-${i}`} className="star empty">☆</span>);
        }
        
        return stars;
    };

    const getDiscountedPrice = (price, discount) => {
        return price - (price * discount / 100);
    };

    if (!shop) {
        return (
            <div className="shop-loading">
                <p>Loading shop...</p>
                {error && <p className="error-message">{error}</p>}
            </div>
        );
    }

    if (shop.payment_status !== "active") {
        return (
            <div className="shop-unavailable">
                <h2>Shop Unavailable</h2>
                <p>This shop is currently not active. Please check back later.</p>
            </div>
        );
    }

    if (shop.Subscription_status.Subscription_type == "standard") {
        return (
            <div className="shop-unavailable">
                <h2>Shop Unavailable</h2>
                <p>This shop is currently not available...</p>
            </div>
        );
    }
    if( shop.Subscription_status.Subscription_type !== "premium" || shop.Subscription_status.Subscription_type !== "trial") {
        return (
            <div className="shop-container">
                <div ref={ProductsEndRef} />
                <div className='shop-header'>
                    <p>Shop with us</p>
                </div>
                {/* Navbar */}
                <div className="shop-navbar">
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <div className="nav-buttons">
                        <button 
                            className="nav-button"
                            onClick={() => setShowMyBookings(true)}
                        >
                            My Orders
                        </button>
                        <button 
                            className="cart-button" 
                            onClick={() => setShowCart(true)}
                        >
                            🛒 Cart ({getCartCount()})
                        </button>
                    </div>
                </div>

                {error && <p className="error-message">{error}</p>}

                {/* Product Grid */}
                {loading ? (
                    <div className="loading-spinner">Loading products...</div>
                ) : (
                    <div className="products-grid">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map(product => (
                                <div key={product.id} className="product-card">
                                    <div className="product-image-container">
                                        <img src={`${product.image}`} alt={product.name} />
                                        {product.discount > 0 && (
                                            <span className="discount-badge">-{product.discount}%</span>
                                        )}
                                    </div>
                                    <h3>{product.name}</h3>
                                    {product.rating > 0 && (
                                        <div className="product-rating">
                                            {renderRating(product.rating)}
                                            <span className="rating-count">({product.rating_count})</span>
                                        </div>
                                    )}
                                    <div className="product-price">
                                        {product.discount > 0 ? (
                                            <>
                                                <span className="original-price">KSh {parseFloat(product.price).toLocaleString()}</span>
                                                <span className="discounted-price">
                                                    KSh {getDiscountedPrice(parseFloat(product.price), product.discount).toLocaleString()}
                                                </span>
                                            </>
                                        ) : (
                                            <span>KSh {parseFloat(product.price).toLocaleString()}</span>
                                        )}
                                    </div>
                                    <p className="stock-status">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>
                                    <button 
                                        className={`add-to-cart-btn ${product.stock === 0 ? 'out-of-stock' : ''}`}
                                        onClick={() => addToCart(product.id)}
                                        disabled={product.stock === 0}
                                    >
                                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="no-products">
                                <p>No products available{searchTerm ? ` for "${searchTerm}"` : ''}.</p>
                                {searchTerm && (
                                    <button onClick={() => setSearchTerm('')}>Clear search</button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Cart Modal */}
                {showCart && (
                    <div className="shop--modal-overlay">
                        <div className="shop--modal-content">
                            <div className="shop--modal-header">
                                <h2>Your Cart</h2>
                                <button className="shop--close-button" onClick={() => setShowCart(false)}>
                                    &times;
                                </button>
                            </div>
                            
                            <div className="shop--cart-items">
                                {cart.length === 0 ? (
                                    <p className="shop--empty-cart">Your cart is empty</p>
                                ) : (
                                    cart.map(item => (
                                        <div key={item.id} className="shop--cart-item">
                                            <img src={`${item.image}`} alt={item.name} />
                                            <div className="shop--item-details">
                                                <h4>{item.name}</h4>
                                                <p>KSh {parseFloat(item.price).toLocaleString()} each</p>
                                            </div>
                                            <div className="shop--quantity-controls">
                                                <button 
                                                    className="shop--quantity-btn"
                                                    onClick={() => decreaseQuantity(item.id)}
                                                >
                                                    -
                                                </button>
                                                <span>{item.quantity}</span>
                                                <button 
                                                    className="shop--quantity-btn"
                                                    onClick={() => increaseQuantity(item.id)}
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <div className="shop--item-total">
                                                KSh {(parseFloat(item.price) * item.quantity).toLocaleString()}
                                            </div>
                                            <button 
                                                className="shop--remove-btn"
                                                onClick={() => removeFromCart(item.id)}
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                            
                            {cart.length > 0 && (
                                <div className="shop--cart-footer">
                                    <div className="shop--cart-total">
                                        <strong>Total: KSh {getCartTotal().toLocaleString()}</strong>
                                    </div>
                                    <button 
                                        className="shop--proceed-btn"
                                        onClick={() => {
                                            setShowCart(false);
                                            setShowBooking(true);
                                        }}
                                    >
                                        Proceed to Checkout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Booking Modal */}
                {showBooking && (
                    <div className="shop--modal-overlay">
                        <div className="shop--modal-content">
                            <div className="shop--modal-header">
                                <h2>Complete Your Order</h2>
                                <button className="shop--close-button" onClick={() => setShowBooking(false)}>
                                    &times;
                                </button>
                            </div>
                            {error && <p className="error-message">{error}</p>}
                            <div className="shop--booking-sections">
                                <div className="shop--booking-section">
                                    <h3>Order Summary</h3>
                                    <div className="shop--booking-summary">
                                        {cart.map(item => (
                                            <div key={item.id} className="shop--summary-item">
                                                <span>{item.name} x {item.quantity}</span>
                                                <span>KSh {(parseFloat(item.price) * item.quantity).toLocaleString()}</span>
                                            </div>
                                        ))}
                                        <div className="shop--summary-total">
                                            <span>Total:</span>
                                            <span>KSh {getCartTotal().toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="shop--bookings-section">
                                    <h3>Your Details</h3>
                                    <form className="shop--booking-form">
                                        <div className="shop--form-row">
                                            <div className="shop--form-group">
                                                <label htmlFor="bf-name">Full Name *</label>
                                                <input
                                                    id="bf-name"
                                                    name="name"
                                                    type="text"
                                                    required
                                                    placeholder="Jane Doe"
                                                    value={customerDetails.name}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="shop--form-group">
                                                <label htmlFor="bf-phone">Phone Number *</label>
                                                <input
                                                    id="bf-phone"
                                                    name="phone"
                                                    type="tel"
                                                    required
                                                    placeholder="07xx xxx xxx"
                                                    value={customerDetails.phone}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="shop--form-group">
                                            <label htmlFor="bf-email">Email </label>
                                            <input
                                                id="bf-email"
                                                name="email"
                                                type="email"
                                                placeholder="you@example.com"
                                                value={customerDetails.email}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="shop--form-group">
                                            <label htmlFor="bf-address">Delivery Address *</label>
                                            <textarea
                                                id="bf-address"
                                                name="address"
                                                required
                                                placeholder="House/Street, Estate, Town"
                                                value={customerDetails.address}
                                                onChange={handleInputChange}
                                                rows="3"
                                            />
                                        </div>
                                        <div className="shop--form-row">
                                            <div className="shop--form-group">
                                                <label htmlFor="bf-date">Preferred Date *</label>
                                                <input
                                                    id="bf-date"
                                                    name="date"
                                                    type="date"
                                                    required
                                                    value={customerDetails.date}
                                                    onChange={handleInputChange}
                                                    min={new Date().toISOString().split('T')[0]}
                                                />
                                            </div>
                                            <div className="shop--form-group">
                                                <label htmlFor="bf-time">Preferred Time *</label>
                                                <input
                                                    id="bf-time"
                                                    name="time"
                                                    type="time"
                                                    required
                                                    value={customerDetails.time}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="shop--form-group">
                                            <label>Delivery Option *</label>
                                            <div className="shop--radio-group">
                                                <label className="shop--radio-option">
                                                    <input
                                                        type="radio"
                                                        name="delivery"
                                                        value="delivery"
                                                        checked={customerDetails.delivery === 'delivery'}
                                                        onChange={handleInputChange}
                                                    />
                                                    <span>Delivery</span>
                                                </label>
                                                <label className="shop--radio-option">
                                                    <input
                                                        type="radio"
                                                        name="delivery"
                                                        value="pickup"
                                                        checked={customerDetails.delivery === 'pickup'}
                                                        onChange={handleInputChange}
                                                    />
                                                    <span>Pick-up</span>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="shop--form-group">
                                            <label className="shop--checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    name="terms"
                                                    checked={customerDetails.terms}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                                <span>I agree to the terms & conditions *</span>
                                            </label>
                                        </div>
                                    </form>
                                </div>
                                
                                <div className="shop--booking-section">
                                    <h3>Payment Method</h3>
                                    <div className="shop--payment-options">
                                        <label className="shop--payment-option">
                                            <input type="radio" name="payment" value="mpesa" defaultChecked />
                                            <span>M-Pesa</span>
                                        </label>
                                        <label className="shop--payment-option">
                                            <input type="radio" name="payment" value="card" />
                                            <span>Credit Card</span>
                                        </label>
                                        <label className="shop--payment-option">
                                            <input type="radio" name="payment" value="cash" />
                                            <span>Cash on Delivery</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            
                            <button className="shop--confirm-btn" onClick={confirmBooking}>
                                Confirm Order
                            </button>
                        </div>
                    </div>
                )}

                {/* Status Modal */}
                {showStatus && (
                    <div className="shop--modal-overlay">
                        <div className="shop--modal-content shop--status-modal">
                            <div className="shop--status-header">
                                <h2>Order Confirmed!</h2>
                            </div>
                            <div 
                                className="shop--status-message" 
                                dangerouslySetInnerHTML={{ __html: statusMessage }} 
                            />
                            <button 
                                className="shop--continue-shopping"
                                onClick={() => setShowStatus(false)}
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                )}

                {/* My Bookings Modal */}
                {showMyBookings && (
                    <div className="shop--modal-overlay">
                        <div className="shop--modal-content shop--bookings-modal">
                            <div className="shop--modal-header">
                                <h2>My Orders</h2>
                                <button className="shop--close-button" onClick={() => {
                                    setShowMyBookings(false);
                                    setCustomerBookings([]);
                                    setBookingEmail('');
                                    setBookingCode('');
                                }}>
                                    &times;
                                </button>
                            </div>
                            
                            <div className="shop--bookings-search">
                                <p>Enter your order code to view your order history</p>
                                <div className="shop--search-fields">
                                    <div className="shop--form-group">
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
                                        className="shop--search-bookings-btn"
                                        onClick={fetchCustomerBookings}
                                        disabled={loading }
                                    >
                                        {loading ? 'Searching...' : 'Find My Order'}
                                    </button>
                                </div>
                            </div>
                            
                            {customerBookings.length > 0 ? (
                                <div className="shop--bookings-list">
                                    <h3>Your Order History</h3>
                                    {customerBookings.map(booking => (
                                        <div key={booking.id} className="shop--booking-item">
                                            <div className="shop--booking-header">
                                                <span className="shop--order-code">{booking.order_code}</span>
                                                <span className="shop--order-date">{new Date(booking.created_at).toLocaleDateString()}</span>
                                                <span className={`shop--order-status ${booking.status}`}>
                                                    {booking.status}
                                                </span>
                                            </div>
                                            <div className="shop--booking-details">
                                                <div className="shop--detail-row">
                                                    <span className="shop--detail-label">Customer:</span>
                                                    <span className="shop--detail-value">{booking.client_name}</span>
                                                </div>
                                                <div className="shop--detail-row">
                                                    <span className="shop--detail-label">Phone:</span>
                                                    <span className="shop--detail-value">{booking.client_phone}</span>
                                                </div>
                                                {booking.client_email && (
                                                    <div className="shop--detail-row">
                                                        <span className="shop--detail-label">Email:</span>
                                                        <span className="shop--detail-value">{booking.client_email}</span>
                                                    </div>
                                                )}
                                                <div className="shop--detail-row">
                                                    <span className="shop--detail-label">Delivery:</span>
                                                    <span className="shop--detail-value">{booking.delivery_option}</span>
                                                </div>
                                                <div className="shop--detail-row">
                                                    <span className="shop--detail-label">Total Amount:</span>
                                                    <span className="shop--detail-value">KSh {parseFloat(booking.total_price).toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <div className="shop--booking-items">
                                                <h4>Order Items:</h4>
                                                {booking.items && booking.items.map(item => (
                                                    <div key={item.id} className="shop--booking-item-product">
                                                        <span className="shop--item-name">{item.product_name}</span>
                                                        <span className="shop--item-quantity">x {item.quantity}</span>
                                                        <span className="shop--item-price">KSh {parseFloat(item.price).toLocaleString()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (<p style={{color:'red'}}>{error}</p>)}
                            
                            {loading && (
                                <div className="loading-bookings">
                                    <p>Searching for your Order...</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }else {
        return (
            <div className="shop-unavailable">
                <h2>Shop Unavailable</h2>
                <p>This shop is currently not available...</p>
            </div>
        );
    };
};

export default Shop;