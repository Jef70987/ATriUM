// FalkonAnalytics.jsx
import React, { useState, useEffect } from 'react';
import './FalkonParlour.css';
const API_URL = import.meta.env.VITE_API_URL;

const FalkonParlour = () => {
    const [loading, setLoading] = useState(true);
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
            // Get CSRF token
            const csrfResponse = await fetch(`${API_URL}/csrf-token/`);
            const csrfData = await csrfResponse.json();
            const csrfToken = csrfData.csrfToken;
            // Send data to Django backend
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
            
            // Reset form
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
            
            // Hide message after 5 seconds
            setTimeout(() => {
            messageDiv.style.display = 'none';
            }, 5000);
        }
        };

    if (loading) {
        return (
        <div id="preloader">
            <div className="loader"></div>
        </div>
        );
    }

    return (
        <div className="falkon-app">
        {/* Navigation */}
        <nav>
            <div className="container nav-container">
            <div className="brand">
                <div className="logo">A</div>
                <div className="brand-text">The ATriUM - Spa management system</div>
            </div>

            <div className="nav-links">
                <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Features</a>
                <a href="#pricing" onClick={(e) => { e.preventDefault(); scrollToSection('pricing'); }}>Pricing</a>
                <a href="#testimonials" onClick={(e) => { e.preventDefault(); scrollToSection('testimonials'); }}>Testimonials</a>
                <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>Contact</a>
                <button className="btn btn-primary" onClick={() => scrollToSection('contact')}>Get Started</button>
            </div>
            </div>
        </nav>

        {/* Hero Section */}
        <section className="hero">
            <div className="container hero-content">
            <div className="hero-text fade-in">
                <div className="badge">
                <i className="fas fa-star"></i>
                Trusted by 10+ spas Countrywide
                </div>
                <h1 className="hero-title">Streamline your spa business with all-in-one management</h1>
                <p className="hero-description">ATriUM combines appointment scheduling, e-commerce, and business analytics in one powerful platform designed specifically for spa and salon owners.</p>
                
                <div className="hero-actions">
                <button className="btn btn-primary" onClick={() => scrollToSection('pricing')}>
                    Start Free Trial
                </button>
                {/* <button className="btn btn-secondary" onClick={openDemo}>
                    <i className="fas fa-play-circle"></i> Watch Demo
                </button> */}
                </div>
                
                <div className="hero-features">
                <div className="feature-item">
                    <i className="fas fa-check-circle"></i>
                    <span>✅14-day free trial — no credit card required</span>
                </div>
                <div className="feature-item">
                    <i className="fas fa-check-circle"></i>
                    <span>✅Built-in online store & inventory management</span>
                </div>
                <div className="feature-item">
                    <i className="fas fa-check-circle"></i>
                    <span>✅Smart appointment scheduling</span>
                </div>
                </div>
            </div>
            
            <div className="hero-visual fade-in">
                <img src="/pic1.jpg" alt="" className="dashboard-mockup" />
            </div>
            </div>
        </section>

        {/* Stats Section */}
        <section className="stats">
            <div className="container">
            <div className="stats-grid">
                <div className="stat-card fade-in">
                <div className="stat-number">90%</div>
                <div className="stat-label">Client Retention</div>
                </div>
                <div className="stat-card fade-in">
                <div className="stat-number">50%</div>
                <div className="stat-label">Revenue Growth</div>
                </div>
                <div className="stat-card fade-in">
                <div className="stat-number">3+</div>
                <div className="stat-label">Counties in Kenya</div>
                </div>
                <div className="stat-card fade-in">
                <div className="stat-number">10+</div>
                <div className="stat-label">Active Spas</div>
                </div>
            </div>
            </div>
        </section>

        {/* Features Section */}
        <section className="section" id="features">
            <div className="container">
            <div className="section-header fade-in">
                <h2 className="section-title">Everything you need to grow your spa business</h2>
                <p className="section-subtitle">From appointment scheduling to product sales and performance analytics</p>
            </div>
            
            <div className="features-grid">
                <div className="feature-card fade-in">
                <div className="feature-icon">
                    <i className="fas fa-calendar-alt"></i>
                </div>
                <h3 className="feature-title">Smart Scheduling</h3>
                <p className="feature-description">Automated booking system with intelligent staff allocation and conflict prevention to maximize your resources.</p>
                </div>
                
                <div className="feature-card fade-in">
                <div className="feature-icon">
                    <i className="fas fa-shopping-cart"></i>
                </div>
                <h3 className="feature-title">E-commerce Integration</h3>
                <p className="feature-description">Sell products directly to your clients with inventory management, promotions, and secure payment processing.</p>
                </div>
                
                <div className="feature-card fade-in">
                <div className="feature-icon">
                    <i className="fas fa-chart-line"></i>
                </div>
                <h3 className="feature-title">Business Analytics</h3>
                <p className="feature-description">Gain insights into your business performance with detailed reports on revenue, client trends, and product sales.</p>
                </div>
                
                <div className="feature-card fade-in">
                <div className="feature-icon">
                    <i className="fas fa-users"></i>
                </div>
                <h3 className="feature-title">Client Management</h3>
                <p className="feature-description">Maintain detailed client profiles, preferences, and history to deliver personalized service and build loyalty.</p>
                </div>
                
                <div className="feature-card fade-in">
                <div className="feature-icon">
                    <i className="fas fa-mobile-alt"></i>
                </div>
                <h3 className="feature-title">Mobile Access</h3>
                <p className="feature-description">Manage your business from anywhere with our mobile-friendly interface and dedicated app for on-the-go access.</p>
                </div>
                
                <div className="feature-card fade-in">
                <div className="feature-icon">
                    <i className="fas fa-bell"></i>
                </div>
                <h3 className="feature-title">Staff management</h3>
                <p className="feature-description">With ATriUM, staff have their own accounts to manage bookings. They can view daily appointments and set availability, ensuring no double-booking and only smooth operations</p>
                </div>
            </div>
            </div>
        </section>

        {/* Testimonials Section */}
        <section className="section testimonials" id="testimonials">
            <div className="container">
            <div className="section-header fade-in">
                <h2 className="section-title">What spa owners say about ATriUM</h2>
                <p className="section-subtitle">Hear from successful businesses that use our platform daily</p>
            </div>
            
            <div className="testimonials-grid">
                <div className="testimonial-card fade-in">
                <div className="testimonial-content">
                    "Since implementing ATriUM, we've reduced no-shows by 75% and increased product sales by 35%. The analytics helped us identify our most profitable services."
                </div>
                <div className="testimonial-author">
                    <div className="author-avatar">KM</div>
                    <div className="author-info">
                    <h4>Kamau Mwangi</h4>
                    <p>Owner, UrbanGlow Spa</p>
                    </div>
                </div>
                </div>
                
                <div className="testimonial-card fade-in">
                <div className="testimonial-content">
                    "The integrated e-commerce platform allowed us to launch our online store in days, not weeks. Our clients love the convenience of booking and shopping in one place."
                </div>
                <div className="testimonial-author">
                    <div className="author-avatar">AS</div>
                    <div className="author-info">
                    <h4>Aisha Sule</h4>
                    <p>Manager, Oasis Beauty</p>
                    </div>
                </div>
                </div>
                
                <div className="testimonial-card fade-in">
                <div className="testimonial-content">
                    "ATriUM's reporting features helped us understand our peak times and optimize staff scheduling. We've increased revenue while reducing labor costs."
                </div>
                <div className="testimonial-author">
                    <div className="author-avatar">SJ</div>
                    <div className="author-info">
                    <h4>Samuel Johnson</h4>
                    <p>Director, Serenity Spa</p>
                    </div>
                </div>
                </div>
            </div>
            </div>
        </section>

        {/* Pricing Section */}
        <section className="section" id="pricing">
            <div className="container">
            <div className="section-header fade-in">
                <h2 className="section-title">Simple, transparent pricing</h2>
                <p className="section-subtitle">Start with a 7-day free trial. No credit card required.</p>
            </div>
            
            <div className="pricing-grid">
                <div className="pricing-card fade-in">
                <div className="pricing-header">
                    <h3 className="pricing-title">Free Trial</h3>
                    <div className="pricing-price">KSh 0.00</div>
                    <div className="pricing-period">First 14 days</div>
                </div>
                <ul className="pricing-features">
                    <li>limited features</li>
                </ul>
                
                </div>
                
                <div className="pricing-card fade-in">
                <div className="pricing-header">
                    <h3 className="pricing-title">Standard</h3>
                    <div className="pricing-price">KSh 1,500</div>
                    <div className="pricing-period">per month</div>
                </div>
                <ul className="pricing-features">
                    <li>Client management</li>
                    <li>Staff management</li>
                    <li>custom theme</li>
                    <li>staff accounts</li>
                    <li>Review management</li>
                </ul>
                
                </div>
                
                <div className="pricing-card popular fade-in">
                <div className="pricing-header">
                    <h3 className="pricing-title">Premium</h3>
                    <div className="pricing-price">KSh 1,800</div>
                    <div className="pricing-period">per month</div>
                </div>
                <ul className="pricing-features">
                    <li>Everything in standard</li>
                    <li>Unlimited staff accounts</li>
                    <li>Advanced spa Analysis</li>
                    <li>E-commerce integration</li>
                    <li>E-commerce inventory & analytics</li>
                </ul>
                
                </div>
            </div>
            </div>
        </section>

        {/* Contact Section */}
        <section className="section contact" id="contact">
            <div className="container">
            <div className="section-header fade-in">
                <h2 className="section-title">Ready to transform your spa business?</h2>
                <p className="section-subtitle">Start your free trial or ask us anything</p>
            </div>
            
            <div className="contact-grid">
                <div className="contact-form fade-in">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                    <label htmlFor="name" className="form-label">Your Name</label>
                    <input 
                        type="text" 
                        id="name" 
                        className="form-control" 
                        placeholder="Enter your name" 
                        value={formData.name}
                        onChange={handleInputChange}
                        required 
                    />
                    </div>
                    
                    <div className="form-group">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <input 
                        type="email" 
                        id="email" 
                        className="form-control" 
                        placeholder="Enter your email" 
                        value={formData.email}
                        onChange={handleInputChange}
                        required 
                    />
                    </div>
                    
                    <div className="form-group">
                    <label htmlFor="business" className="form-label">Business Name</label>
                    <input 
                        type="text" 
                        id="business" 
                        className="form-control" 
                        placeholder="Your spa or salon name"
                        value={formData.business}
                        onChange={handleInputChange}
                    />
                    </div>
                    <div className="form-group">
                    <label htmlFor="plan" className="form-label">Interested Plan</label>
                    <select 
                        id="plan" 
                        className="form-control"
                        value={formData.plan}
                        onChange={handleInputChange}
                    >
                        <option>free trier - KSh 0.00-14days</option>
                        <option>Standard - KSh 1,500/month</option>
                        <option>Premium - KSh 1,800/month</option>
                    </select>
                    </div>
                    
                    <div className="form-group">
                    <label htmlFor="message" className="form-label">Message</label>
                    <textarea 
                        id="message" 
                        className="form-control" 
                        placeholder="Tell us about your business needs"
                        value={formData.message}
                        onChange={handleInputChange}
                    ></textarea>
                    </div>
                    
                    <button type="submit" className="btn btn-primary" style={{width: '100%'}}>Start Free Trial</button>
                    
                    <div id="formMsg" style={{marginTop: '16px', display: 'none', color: '#10B981', fontWeight: '500'}}></div>
                </form>
                </div>
                
                <div className="contact-info fade-in">
                <h3 style={{marginBottom: '20px', fontWeight: '700'}}>We're here to help</h3>
                <p style={{color: '#6B7280', marginBottom: '30px'}}>Our team is available to answer any questions you have about implementing ATriUM in your spa business. Get in touch with us through any of the channels below.</p>
                
                <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                    <div style={{width: '50px', height: '50px', borderRadius: '50%', background: '#A855F7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'}}>
                        <i className="fas fa-envelope"></i>
                    </div>
                    <div>
                        <div style={{fontWeight: '600'}}>Email Us</div>
                        <div style={{color: '#6B7280'}}>analyticsfalkon@gmail.com</div>
                    </div>
                    </div>
                    
                    <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                    <div style={{width: '50px', height: '50px', borderRadius: '50%', background: '#A855F7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'}}>
                        <i className="fas fa-phone"></i>
                    </div>
                    <div>
                        <div style={{fontWeight: '600'}}>Call Us</div>
                        <div style={{color: '#6B7280'}}>+254 718364879</div>
                    </div>
                    </div>
                    
                    <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                    <div style={{width: '50px', height: '50px', borderRadius: '50%', background: '#A855F7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'}}>
                        <i className="fas fa-comment"></i>
                    </div>
                    <div>
                        <div style={{fontWeight: '600',color:'blue'}}><a href="https://wa.me/254718364879" target='_blank'> Chat on WhatsApp</a> </div>
                        <div style={{color: '#6B7280'}}></div>
                    </div>
                    </div>
                </div>
                </div>
            </div>
            </div>
        </section>

        {/* Footer */}
        <footer>
            <div className="container">
            <div className="footer-grid">
                <div>
                <div className="footer-brand">The ATriUM</div>
                <p className="footer-description">The all-in-one platform for spa and salon management, e-commerce, and business analytics.</p>
                </div>
                
                <div>
                <h4 className="footer-heading">Product</h4>
                <ul className="footer-links">
                    <li><a href="#features">Features</a></li>
                    <li><a href="#pricing">Pricing</a></li>
                    <li><a href="#">Case Studies</a></li>
                    <li><a href="#">Updates</a></li>
                </ul>
                </div>
                
                <div>
                <h4 className="footer-heading">Company</h4>
                <ul className="footer-links">
                    <li><a href="#">About</a></li>
                    <li><a href="#">Careers</a></li>
                    <li><a href="#">Contact</a></li>
                    <li><a href="#">Blog</a></li>
                </ul>
                </div>
                
                <div>
                <h4 className="footer-heading">Support</h4>
                <ul className="footer-links">
                    <li><a href="#">Help Center</a></li>
                    <li><a href="#">Documentation</a></li>
                    <li><a href="#">Community</a></li>
                    <li><a href="#">Status</a></li>
                </ul>
                </div>
            </div>
            
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} SyNapTik. All rights reserved.</p>
            </div>
            </div>
        </footer>
        </div>
    );
};

export default FalkonParlour;