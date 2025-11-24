// FalkonAnalytics.jsx
import React, { useState, useEffect } from 'react';
const API_URL = import.meta.env.VITE_API_URL;

const FalkonParlour = () => {
    const [loading, setLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        business: '',
        plan: 'Professional — KSh 1,800 / month',
        message: ''
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);
        
        return () => clearTimeout(timer);
    }, []);

    const scrollToSection = (sectionId) => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
        setIsMobileMenuOpen(false);
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const messageDiv = document.getElementById('formMsg');
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';
        
        try {
            const csrfResponse = await fetch(`${API_URL}/csrf-token/`);
            const csrfData = await csrfResponse.json();
            const csrfToken = csrfData.csrfToken;
            
            const response = await fetch(`${API_URL}/submit-request/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                messageDiv.style.display = 'block';
                messageDiv.style.color = '#10B981';
                messageDiv.textContent = data.message || 'Thanks! We received your request. Check your email for next steps.';
                
                setFormData({
                    name: '',
                    email: '',
                    business: '',
                    plan: 'Professional — KSh 1,800 / month',
                    message: ''
                });
            } else {
                throw new Error(data.message || 'Failed to submit request');
            }
        } catch (error) {
            messageDiv.style.display = 'block';
            messageDiv.style.color = '#EF4444';
            messageDiv.textContent = error.message || 'An error occurred. Please try again.';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Start Free Trial';
            
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
                <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white w-full">
            {/* Navigation */}
            <nav className="bg-white shadow-sm sticky top-0 z-50 w-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                A
                            </div>
                            <div className="text-lg font-semibold text-gray-800">The ATriUM</div>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }} className="text-gray-600 hover:text-purple-600 transition-colors duration-200">Features</a>
                            <a href="#pricing" onClick={(e) => { e.preventDefault(); scrollToSection('pricing'); }} className="text-gray-600 hover:text-purple-600 transition-colors duration-200">Pricing</a>
                            <a href="#testimonials" onClick={(e) => { e.preventDefault(); scrollToSection('testimonials'); }} className="text-gray-600 hover:text-purple-600 transition-colors duration-200">Testimonials</a>
                            <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }} className="text-gray-600 hover:text-purple-600 transition-colors duration-200">Contact</a>
                            <button 
                                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-200 hover:scale-105"
                                onClick={() => scrollToSection('contact')}
                            >
                                Get Started
                            </button>
                        </div>

                        {/* Mobile menu button */}
                        <button 
                            className="md:hidden text-gray-600 p-2"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Mobile Navigation Menu */}
                    <div className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
                        isMobileMenuOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
                    }`}>
                        <div className="bg-white border border-gray-200 rounded-lg shadow-lg py-4 space-y-4">
                            <a 
                                href="#features" 
                                onClick={(e) => { e.preventDefault(); scrollToSection('features'); }} 
                                className="block px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors duration-200"
                            >
                                Features
                            </a>
                            <a 
                                href="#pricing" 
                                onClick={(e) => { e.preventDefault(); scrollToSection('pricing'); }} 
                                className="block px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors duration-200"
                            >
                                Pricing
                            </a>
                            <a 
                                href="#testimonials" 
                                onClick={(e) => { e.preventDefault(); scrollToSection('testimonials'); }} 
                                className="block px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors duration-200"
                            >
                                Testimonials
                            </a>
                            <a 
                                href="#contact" 
                                onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }} 
                                className="block px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors duration-200"
                            >
                                Contact
                            </a>
                            <button 
                                className="w-full mx-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full hover:shadow-lg transition-all duration-200 hover:scale-105"
                                onClick={() => scrollToSection('contact')}
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-purple-50 to-pink-50 py-20 w-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                        <div className="lg:w-1/2 space-y-6">
                            <div className="inline-flex items-center bg-white px-4 py-2 rounded-full text-sm font-medium text-purple-700 shadow-sm animate-pulse">
                                ⭐ Trusted by 10+ spas Countrywide
                            </div>
                            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight animate-fade-in-up">
                                Streamline your spa business with all-in-one management
                            </h1>
                            <p className="text-lg text-gray-600 leading-relaxed animate-fade-in-up animation-delay-200">
                                ATriUM combines appointment scheduling, e-commerce, and business analytics in one powerful platform designed specifically for spa and salon owners.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-400">
                                <button 
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 font-semibold hover:scale-105"
                                    onClick={() => scrollToSection('pricing')}
                                >
                                    Start Free Trial
                                </button>
                            </div>
                            
                            <div className="space-y-3 pt-4 animate-fade-in-up animation-delay-600">
                                <div className="flex items-center text-gray-700">
                                    <span className="text-green-500 mr-3">✅</span>
                                    <span>14-day free trial — no credit card required</span>
                                </div>
                                <div className="flex items-center text-gray-700">
                                    <span className="text-green-500 mr-3">✅</span>
                                    <span>Built-in online store & inventory management</span>
                                </div>
                                <div className="flex items-center text-gray-700">
                                    <span className="text-green-500 mr-3">✅</span>
                                    <span>Smart appointment scheduling</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="lg:w-1/2 animate-float">
                            <img 
                                src="/pic1.jpg" 
                                alt="ATriUM Dashboard" 
                                className="w-full max-w-2xl rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300" 
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white w-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { value: "90%", label: "Client Retention" },
                            { value: "50%", label: "Revenue Growth" },
                            { value: "3+", label: "Counties in Kenya" },
                            { value: "10+", label: "Active Spas" }
                        ].map((stat, index) => (
                            <div 
                                key={index} 
                                className="text-center transform hover:scale-110 transition-transform duration-300 animate-fade-in-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="text-3xl lg:text-4xl font-bold text-purple-600 mb-2">{stat.value}</div>
                                <div className="text-gray-600">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gray-50 w-full" id="features">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 animate-fade-in-up">
                            Everything you need to grow your spa business
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
                            From appointment scheduling to product sales and performance analytics
                        </p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: "📅",
                                title: "Smart Scheduling",
                                description: "Automated booking system with intelligent staff allocation and conflict prevention to maximize your resources."
                            },
                            {
                                icon: "🛒",
                                title: "E-commerce Integration",
                                description: "Sell products directly to your clients with inventory management, promotions, and secure payment processing."
                            },
                            {
                                icon: "📊",
                                title: "Business Analytics",
                                description: "Gain insights into your business performance with detailed reports on revenue, client trends, and product sales."
                            },
                            {
                                icon: "👥",
                                title: "Client Management",
                                description: "Maintain detailed client profiles, preferences, and history to deliver personalized service and build loyalty."
                            },
                            {
                                icon: "📱",
                                title: "Mobile Access",
                                description: "Manage your business from anywhere with our mobile-friendly interface and dedicated app for on-the-go access."
                            },
                            {
                                icon: "🔔",
                                title: "Staff Management",
                                description: "Staff have their own accounts to manage bookings, view daily appointments and set availability."
                            }
                        ].map((feature, index) => (
                            <div 
                                key={index} 
                                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group animate-fade-in-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="text-3xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors duration-300">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 bg-white w-full" id="testimonials">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 animate-fade-in-up">
                            What spa owners say about ATriUM
                        </h2>
                        <p className="text-lg text-gray-600 animate-fade-in-up animation-delay-200">
                            Hear from successful businesses that use our platform daily
                        </p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                content: "Since implementing ATriUM, we've reduced no-shows by 75% and increased product sales by 35%. The analytics helped us identify our most profitable services.",
                                author: "Kamau Mwangi",
                                role: "Owner, UrbanGlow Spa",
                                initials: "KM"
                            },
                            {
                                content: "The integrated e-commerce platform allowed us to launch our online store in days, not weeks. Our clients love the convenience of booking and shopping in one place.",
                                author: "Aisha Sule",
                                role: "Manager, Oasis Beauty",
                                initials: "AS"
                            },
                            {
                                content: "ATriUM's reporting features helped us understand our peak times and optimize staff scheduling. We've increased revenue while reducing labor costs.",
                                author: "Samuel Johnson",
                                role: "Director, Serenity Spa",
                                initials: "SJ"
                            }
                        ].map((testimonial, index) => (
                            <div 
                                key={index} 
                                className="bg-gray-50 p-8 rounded-2xl transform hover:-translate-y-2 transition-all duration-300 hover:shadow-lg animate-fade-in-up"
                                style={{ animationDelay: `${index * 150}ms` }}
                            >
                                <p className="text-gray-700 italic mb-6">"{testimonial.content}"</p>
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold mr-4 transform hover:scale-110 transition-transform duration-300">
                                        {testimonial.initials}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{testimonial.author}</h4>
                                        <p className="text-gray-600 text-sm">{testimonial.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-20 bg-gray-50 w-full" id="pricing">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 animate-fade-in-up">
                            Simple, transparent pricing
                        </h2>
                        <p className="text-lg text-gray-600 animate-fade-in-up animation-delay-200">
                            Start with a 14-day free trial. No credit card required.
                        </p>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Free Trial",
                                price: "KSh 0.00",
                                period: "First 14 days",
                                features: ["Limited features"],
                                popular: false
                            },
                            {
                                title: "Standard",
                                price: "KSh 1,500",
                                period: "per month",
                                features: ["Client management", "Staff management", "Custom theme", "Staff accounts", "Review management"],
                                popular: false
                            },
                            {
                                title: "Premium",
                                price: "KSh 1,800",
                                period: "per month",
                                features: ["Everything in Standard", "Unlimited staff accounts", "Advanced spa Analysis", "E-commerce integration", "E-commerce inventory & analytics"],
                                popular: true
                            }
                        ].map((plan, index) => (
                            <div 
                                key={index} 
                                className={`bg-white rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-all duration-300 ${
                                    plan.popular ? 'ring-2 ring-purple-600 scale-105' : ''
                                } animate-fade-in-up`}
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {plan.popular && (
                                    <div className="bg-purple-600 text-white text-center py-2 text-sm font-semibold">
                                        Most Popular
                                    </div>
                                )}
                                <div className="p-8">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{plan.title}</h3>
                                    <div className="text-3xl font-bold text-gray-900 mb-2">{plan.price}</div>
                                    <div className="text-gray-600 mb-6">{plan.period}</div>
                                    <ul className="space-y-3 mb-8">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center text-gray-700 transform hover:translate-x-2 transition-transform duration-200">
                                                <span className="text-green-500 mr-3">✓</span>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-20 bg-white w-full" id="contact">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 animate-fade-in-up">
                            Ready to transform your spa business?
                        </h2>
                        <p className="text-lg text-gray-600 animate-fade-in-up animation-delay-200">
                            Start your free trial or ask us anything
                        </p>
                    </div>
                    
                    <div className="grid lg:grid-cols-2 gap-12">
                        <div className="bg-white p-8 rounded-2xl shadow-lg transform hover:-translate-y-1 transition-all duration-300 animate-fade-in-up">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                                    <input 
                                        type="text" 
                                        id="name" 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-200"
                                        placeholder="Enter your name" 
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required 
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                    <input 
                                        type="email" 
                                        id="email" 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-200"
                                        placeholder="Enter your email" 
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required 
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="business" className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                                    <input 
                                        type="text" 
                                        id="business" 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-200"
                                        placeholder="Your spa or salon name"
                                        value={formData.business}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="plan" className="block text-sm font-medium text-gray-700 mb-2">Interested Plan</label>
                                    <select 
                                        id="plan" 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-200"
                                        value={formData.plan}
                                        onChange={handleInputChange}
                                    >
                                        <option>Free Trial - KSh 0.00-14days</option>
                                        <option>Standard - KSh 1,500/month</option>
                                        <option>Premium - KSh 1,800/month</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                    <textarea 
                                        id="message" 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-200"
                                        placeholder="Tell us about your business needs"
                                        rows="4"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                    ></textarea>
                                </div>
                                
                                <button 
                                    type="submit" 
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 font-semibold hover:scale-105"
                                >
                                    Start Free Trial
                                </button>
                                
                                <div id="formMsg" className="mt-4 text-center font-medium hidden"></div>
                            </form>
                        </div>
                        
                        <div className="space-y-8 animate-fade-in-up animation-delay-400">
                            <h3 className="text-2xl font-bold text-gray-900">We're here to help</h3>
                            <p className="text-gray-600 text-lg">
                                Our team is available to answer any questions you have about implementing ATriUM in your spa business. Get in touch with us through any of the channels below.
                            </p>
                            
                            <div className="space-y-6">
                                {[
                                    { icon: "✉️", title: "Email Us", content: "analyticsfalkon@gmail.com" },
                                    { icon: "📞", title: "Call Us", content: "+254 750405528" },
                                    { icon: "💬", title: "Chat on WhatsApp", content: "", link: "https://wa.me/254718364879" }
                                ].map((contact, index) => (
                                    <div 
                                        key={index} 
                                        className="flex items-center space-x-4 transform hover:translate-x-2 transition-transform duration-200"
                                    >
                                        <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white transform hover:scale-110 transition-transform duration-300">
                                            {contact.icon}
                                        </div>
                                        <div>
                                            <div className={`font-semibold ${contact.link ? 'text-blue-600 hover:text-blue-700' : 'text-gray-900'}`}>
                                                {contact.link ? (
                                                    <a href={contact.link} target='_blank' rel="noopener noreferrer" className="hover:underline">
                                                        {contact.title}
                                                    </a>
                                                ) : (
                                                    contact.title
                                                )}
                                            </div>
                                            {contact.content && <div className="text-gray-600">{contact.content}</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 w-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="text-xl font-bold mb-4">The ATriUM</div>
                            <p className="text-gray-400">
                                The all-in-one platform for spa and salon management, e-commerce, and business analytics.
                            </p>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold mb-4">Product</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#features" className="hover:text-white transition-colors duration-200">Features</a></li>
                                <li><a href="#pricing" className="hover:text-white transition-colors duration-200">Pricing</a></li>
                                <li><a href="#" className="hover:text-white transition-colors duration-200">Case Studies</a></li>
                                <li><a href="#" className="hover:text-white transition-colors duration-200">Updates</a></li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors duration-200">About</a></li>
                                <li><a href="#" className="hover:text-white transition-colors duration-200">Careers</a></li>
                                <li><a href="#" className="hover:text-white transition-colors duration-200">Contact</a></li>
                                <li><a href="#" className="hover:text-white transition-colors duration-200">Blog</a></li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold mb-4">Support</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors duration-200">Help Center</a></li>
                                <li><a href="#" className="hover:text-white transition-colors duration-200">Documentation</a></li>
                                <li><a href="#" className="hover:text-white transition-colors duration-200">Community</a></li>
                                <li><a href="#" className="hover:text-white transition-colors duration-200">Status</a></li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
                        <p>&copy; {new Date().getFullYear()} Syntelsafe. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default FalkonParlour;