/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from 'react';
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
                    <p><strong>**Order Code:</strong> ${orderCode} <b> Keep it safe** </b></p>
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
            stars.push(<span key={i} className="text-yellow-400">★</span>);
        }
        
        if (hasHalfStar) {
            stars.push(<span key="half" className="text-yellow-400">★</span>);
        }
        
        const emptyStars = 5 - stars.length;
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<span key={`empty-${i}`} className="text-gray-300">☆</span>);
        }
        
        return stars;
    };

    const getDiscountedPrice = (price, discount) => {
        return price - (price * discount / 100);
    };

    if (!shop) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading shop...</p>
                    {error && <p className="text-red-500 mt-2">{error}</p>}
                </div>
            </div>
        );
    }

    if (shop.payment_status !== "active") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md mx-4">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Shop Unavailable</h2>
                    <p className="text-gray-600">This shop is currently not active. Please check back later.</p>
                </div>
            </div>
        );
    }

    if (shop.Subscription_status.Subscription_type == "standard") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md mx-4">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Shop Unavailable</h2>
                    <p className="text-gray-600">This shop is currently not available...</p>
                </div>
            </div>
        );
    }

    if( shop.Subscription_status.Subscription_type !== "premium" || shop.Subscription_status.Subscription_type !== "trial") {
        return (
            <div className="min-h-screen bg-gray-50 w-full">
                <div ref={ProductsEndRef} />
                
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 py-4">
                        <h1 className="text-2xl font-bold text-gray-800 text-center">Shop with us</h1>
                    </div>
                </div>

                {/* Navbar */}
                <div className="bg-white shadow-sm sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-4 py-3">
                        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                            {/* Search */}
                            <div className="flex-1 max-w-2xl">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                />
                            </div>
                            
                            {/* Buttons */}
                            <div className="flex gap-2">
                                <button 
                                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                                    onClick={() => setShowMyBookings(true)}
                                >
                                    My Orders
                                </button>
                                <button 
                                    className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm font-medium flex items-center gap-2"
                                    onClick={() => setShowCart(true)}
                                >
                                    <span>🛒</span>
                                    <span>Cart ({getCartCount()})</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="max-w-7xl mx-auto px-4 py-4">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                            <p className="text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                {/* Product Grid */}
                <div className="max-w-7xl mx-auto px-4 py-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                            <span className="ml-3 text-gray-600">Loading products...</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map(product => (
                                    <div key={product.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group">
                                        {/* Image Container */}
                                        <div className="relative overflow-hidden bg-transparent">
                                            <img 
                                                src={`${product.image}`} 
                                                alt={product.name} 
                                                className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110 bg-transparent"
                                                loading="lazy"
                                            />
                                            {product.discount > 0 && (
                                                <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                                    -{product.discount}%
                                                </span>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div className="p-4">
                                            <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
                                            
                                            {product.rating > 0 && (
                                                <div className="flex items-center gap-1 mb-2">
                                                    <div className="flex">
                                                        {renderRating(product.rating)}
                                                    </div>
                                                    <span className="text-gray-500 text-sm">({product.rating_count})</span>
                                                </div>
                                            )}
                                            
                                            <div className="flex items-center gap-2 mb-2">
                                                {product.discount > 0 ? (
                                                    <>
                                                        <span className="text-lg font-bold text-gray-800">
                                                            KSh {getDiscountedPrice(parseFloat(product.price), product.discount).toLocaleString()}
                                                        </span>
                                                        <span className="text-sm text-gray-500 line-through">
                                                            KSh {parseFloat(product.price).toLocaleString()}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-lg font-bold text-gray-800">
                                                        KSh {parseFloat(product.price).toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <p className={`text-sm mb-3 ${
                                                product.stock > 0 ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                            </p>
                                            
                                            <button 
                                                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                                                    product.stock === 0 
                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                                        : 'bg-gray-800 text-white hover:bg-gray-700'
                                                }`}
                                                onClick={() => addToCart(product.id)}
                                                disabled={product.stock === 0}
                                            >
                                                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-12">
                                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl text-gray-400">📦</span>
                                    </div>
                                    <p className="text-gray-500 text-lg mb-2">
                                        No products available{searchTerm ? ` for "${searchTerm}"` : ''}
                                    </p>
                                    {searchTerm && (
                                        <button 
                                            onClick={() => setSearchTerm('')}
                                            className="text-pink-500 hover:text-pink-600 font-medium"
                                        >
                                            Clear search
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Cart Modal */}
                {showCart && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                            <div className="flex justify-between items-center p-6 border-b">
                                <h2 className="text-xl font-bold text-gray-800">Your Cart</h2>
                                <button 
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                    onClick={() => setShowCart(false)}
                                >
                                    &times;
                                </button>
                            </div>
                            
                            <div className="overflow-y-auto max-h-96 p-6">
                                {cart.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">Your cart is empty</p>
                                ) : (
                                    <div className="space-y-4">
                                        {cart.map(item => (
                                            <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                                <img 
                                                    src={`${item.image}`} 
                                                    alt={item.name} 
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-800">{item.name}</h4>
                                                    <p className="text-gray-600 text-sm">KSh {parseFloat(item.price).toLocaleString()} each</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                                                        onClick={() => decreaseQuantity(item.id)}
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                    <button 
                                                        className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                                                        onClick={() => increaseQuantity(item.id)}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <div className="font-medium text-gray-800 w-20 text-right">
                                                    KSh {(parseFloat(item.price) * item.quantity).toLocaleString()}
                                                </div>
                                                <button 
                                                    className="text-red-500 hover:text-red-700 ml-2"
                                                    onClick={() => removeFromCart(item.id)}
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            {cart.length > 0 && (
                                <div className="p-6 border-t bg-gray-50">
                                    <div className="flex justify-between items-center mb-4">
                                        <strong className="text-lg">Total: KSh {getCartTotal().toLocaleString()}</strong>
                                    </div>
                                    <button 
                                        className="w-full bg-pink-500 text-white py-3 rounded-lg hover:bg-pink-600 transition-colors font-medium"
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
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
                                <h2 className="text-xl font-bold text-gray-800">Complete Your Order</h2>
                                <button 
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                    onClick={() => setShowBooking(false)}
                                >
                                    &times;
                                </button>
                            </div>
                            
                            {error && (
                                <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-red-700">{error}</p>
                                </div>
                            )}
                            
                            <div className="p-6 space-y-6">
                                {/* Order Summary */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Order Summary</h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        {cart.map(item => (
                                            <div key={item.id} className="flex justify-between py-2 border-b last:border-b-0">
                                                <span>{item.name} x {item.quantity}</span>
                                                <span>KSh {(parseFloat(item.price) * item.quantity).toLocaleString()}</span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between font-bold pt-2">
                                            <span>Total:</span>
                                            <span>KSh {getCartTotal().toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Customer Details */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Your Details</h3>
                                    <form className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                                <input
                                                    name="name"
                                                    type="text"
                                                    required
                                                    placeholder="Jane Doe"
                                                    value={customerDetails.name}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                                                <input
                                                    name="phone"
                                                    type="tel"
                                                    required
                                                    placeholder="07xx xxx xxx"
                                                    value={customerDetails.phone}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                            <input
                                                name="email"
                                                type="email"
                                                placeholder="you@example.com"
                                                value={customerDetails.email}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address *</label>
                                            <textarea
                                                name="address"
                                                required
                                                placeholder="House/Street, Estate, Town"
                                                value={customerDetails.address}
                                                onChange={handleInputChange}
                                                rows="3"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                            />
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date *</label>
                                                <input
                                                    name="date"
                                                    type="date"
                                                    required
                                                    value={customerDetails.date}
                                                    onChange={handleInputChange}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time *</label>
                                                <input
                                                    name="time"
                                                    type="time"
                                                    required
                                                    value={customerDetails.time}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Option *</label>
                                            <div className="flex gap-4">
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="delivery"
                                                        value="delivery"
                                                        checked={customerDetails.delivery === 'delivery'}
                                                        onChange={handleInputChange}
                                                        className="mr-2"
                                                    />
                                                    <span>Delivery</span>
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="delivery"
                                                        value="pickup"
                                                        checked={customerDetails.delivery === 'pickup'}
                                                        onChange={handleInputChange}
                                                        className="mr-2"
                                                    />
                                                    <span>Pick-up</span>
                                                </label>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="terms"
                                                    checked={customerDetails.terms}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="mr-2"
                                                />
                                                <span>I agree to the terms & conditions *</span>
                                            </label>
                                        </div>
                                    </form>
                                </div>
                                
                                {/* Payment Method */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Payment Method</h3>
                                    <div className="space-y-2">
                                        <label className="flex items-center">
                                            <input type="radio" name="payment" value="mpesa" defaultChecked className="mr-2" />
                                            <span>M-Pesa</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input type="radio" name="payment" value="card" className="mr-2" />
                                            <span>Credit Card</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input type="radio" name="payment" value="cash" className="mr-2" />
                                            <span>Cash on Delivery</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-6 border-t bg-gray-50">
                                <button 
                                    className="w-full bg-pink-500 text-white py-3 rounded-lg hover:bg-pink-600 transition-colors font-medium"
                                    onClick={confirmBooking}
                                >
                                    Confirm Order
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Status Modal */}
                {showStatus && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
                            <div className="p-6 border-b">
                                <h2 className="text-xl font-bold text-green-600 text-center">Order Confirmed!</h2>
                            </div>
                            <div 
                                className="p-6 prose max-w-none"
                                dangerouslySetInnerHTML={{ __html: statusMessage }} 
                            />
                            <div className="p-6 border-t bg-gray-50">
                                <button 
                                    className="w-full bg-pink-500 text-white py-3 rounded-lg hover:bg-pink-600 transition-colors font-medium"
                                    onClick={() => setShowStatus(false)}
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* My Bookings Modal */}
                {showMyBookings && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
                                <h2 className="text-xl font-bold text-gray-800">My Orders</h2>
                                <button 
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                    onClick={() => {
                                        setShowMyBookings(false);
                                        setCustomerBookings([]);
                                        setBookingEmail('');
                                        setBookingCode('');
                                    }}
                                >
                                    &times;
                                </button>
                            </div>
                            
                            <div className="p-6 space-y-6">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-gray-700 mb-3">Enter your order code to view your order history</p>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Order Code *</label>
                                            <input
                                                type="text"
                                                placeholder="e.g., ORD######ABCD"
                                                value={bookingCode}
                                                onChange={(e) => setBookingCode(e.target.value)}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                            />
                                        </div>
                                        <button 
                                            className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors font-medium disabled:bg-pink-300"
                                            onClick={fetchCustomerBookings}
                                            disabled={loading}
                                        >
                                            {loading ? 'Searching...' : 'Find My Order'}
                                        </button>
                                    </div>
                                </div>
                                
                                {customerBookings.length > 0 ? (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Order History</h3>
                                        <div className="space-y-4">
                                            {customerBookings.map(booking => (
                                                <div key={booking.id} className="border rounded-lg p-4 bg-white">
                                                    <div className="flex flex-wrap items-center gap-3 mb-3 pb-3 border-b">
                                                        <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">{booking.order_code}</span>
                                                        <span className="text-gray-600 text-sm">{new Date(booking.created_at).toLocaleDateString()}</span>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                            'bg-blue-100 text-blue-800'
                                                        }`}>
                                                            {booking.status}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-3">
                                                        <div><span className="font-medium">Customer:</span> {booking.client_name}</div>
                                                        <div><span className="font-medium">Phone:</span> {booking.client_phone}</div>
                                                        {booking.client_email && (
                                                            <div><span className="font-medium">Email:</span> {booking.client_email}</div>
                                                        )}
                                                        <div><span className="font-medium">Delivery:</span> {booking.delivery_option}</div>
                                                        <div><span className="font-medium">Total Amount:</span> KSh {parseFloat(booking.total_price).toLocaleString()}</div>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium mb-2">Order Items:</h4>
                                                        <div className="space-y-1">
                                                            {booking.items && booking.items.map(item => (
                                                                <div key={item.id} className="flex justify-between text-sm">
                                                                    <span>{item.product_name}</span>
                                                                    <span>x {item.quantity}</span>
                                                                    <span>KSh {parseFloat(item.price).toLocaleString()}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-red-500 text-center">{error}</p>
                                )}
                                
                                {loading && (
                                    <div className="text-center py-4">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500 mx-auto mb-2"></div>
                                        <p className="text-gray-600">Searching for your Order...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    } else {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md mx-4">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Shop Unavailable</h2>
                    <p className="text-gray-600">This shop is currently not available...</p>
                </div>
            </div>
        );
    }
};

export default Shop;