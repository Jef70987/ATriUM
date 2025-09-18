/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useEffect} from 'react';
import { useSlug } from '../Tenants/Tenant';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const Reviews = () => {
    const slug = useSlug();
  // State for reviews and form data
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const clearStorage = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
    };

    // Form states
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        rating: 5,
        comment: '',
        replyingTo: null,
        replyComment: ''
    });

    const [showEmailPrompt, setShowEmailPrompt] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [error, setError] = useState('');
    const [activeReply, setActiveReply] = useState(null);

    // Fetch reviews from backend
    const fetchReviews = async () => {
        clearStorage();
        try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/reviews/${slug}/`);
        if (response.ok) {
            const data = await response.json();
            setReviews(data);
        } else {
            setError('Failed to fetch reviews');
        }
        } catch (error) {
        console.error('Error fetching reviews:', error);
        } finally {
        setIsLoading(false);
        }
    };

    // Get CSRF token
    const getCsrfToken = () => {
        const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
        return cookieValue || '';
    };

    // Verify email
    const verifyEmail = async () => {
        try {
            const response = await fetch(`${API_URL}/reviews/${slug}/verify/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken(),
            },
            body: JSON.stringify({ email: formData.email })
            });


            if (response.ok) {
                const data = await response.json();
                if (data.is_verified) {
                    setIsVerified(true);
                    setError('');
                    // Use the name from the backend if available
                    setFormData(prev => ({ 
                    ...prev, 
                    name: data.name || 'Verified Client' 
                    }));
                } else {
                    setError('Not permitted - Email not found in our client records');
                    setIsVerified(false);
                }
                } else {
                setError('Verification failed. Please try again.');
            }
        } catch (error) {
            setError('Verification Error...');
        }
    };

    // Submit review
    const submitReview = async () => {
        if (!formData.comment.trim()) return;

        try {
        const response = await fetch(`${API_URL}/reviews/${slug}/submit/`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken(),
            },
            body: JSON.stringify({
            email: formData.email,
            name: formData.name,
            rating: formData.rating,
            comment: formData.comment
            })
        });

        if (response.ok) {
            const data = await response.json();
            // Refresh reviews after submission
            fetchReviews();
            setFormData({
            ...formData,
            comment: '',
            rating: 5
            });
            setIsVerified(false);
            setError('');
        } else {
            const errorData = await response.json();
            setError(errorData.error || 'Failed to submit review');
        }
        } catch (error) {
        setError('Network error. Please try again.');
        }
    };

    // Submit reply
    const submitReply = async (reviewId) => {
        if (!formData.replyComment.trim()) return;

        try {
        const response = await fetch(`${API_URL}/reviews/${slug}/reply/${reviewId}/`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken(),
            },
            body: JSON.stringify({
            email: formData.email,
            name: formData.name,
            comment: formData.replyComment
            })
        });

        if (response.ok) {
            // Refresh reviews after reply submission
            fetchReviews();
            setFormData({
            ...formData,
            replyingTo: null,
            replyComment: ''
            });
            setActiveReply(null);
            setError('');
        } else {
            const errorData = await response.json();
            setError(errorData.error || 'Failed to submit reply');
        }
        } catch (error) {
        setError('Network error. Please try again.');
        }
    };


    // Fetch reviews on component mount
    useEffect(() => {
        fetchReviews();
    }, [slug]);

    // Inline styles (unchanged from your original code)
    const styles = {
        // ... (all your existing styles remain exactly the same)
        container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: "'Poppins', sans-serif",
        backgroundColor: '#fff',
        color: '#333'
        },
        header: {
        textAlign: 'center',
        marginBottom: '40px',
        color: '#5a3921',
        fontSize: '2rem',
        fontWeight: 'bold',
        textShadow: '0 5px 12px #0f0e0e'
        },
        twoColumnLayout: {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '30px',
        '@media (minWidth: 768px)': {
            gridTemplateColumns: '1fr 1fr'
        }
        },
        reviewFormContainer: {
        backgroundColor: '#f9f5f0',
        borderRadius: '10px',
        padding: '25px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        },
        reviewsContainer: {
        backgroundColor: '#f9f5f0',
        borderRadius: '10px',
        padding: '25px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        maxHeight: '600px',
        overflowY: 'auto'
        },
        sectionTitle: {
        fontSize: '1.3rem',
        fontWeight: '600',
        marginBottom: '20px',
        color: '#5a3921'
        },
        formGroup: {
        marginBottom: '20px'
        },
        formLabel: {
        display: 'block',
        marginBottom: '8px',
        fontWeight: '500'
        },
        formInput: {
        width: '100%',
        padding: '12px',
        border: '1px solid #d4b996',
        borderRadius: '6px',
        fontSize: '1rem',
        boxSizing: 'border-box',
        ':focus': {
            outline: 'none',
            borderColor: '#b78d65'
        }
        },
        textArea: {
        minHeight: '120px',
        resize: 'vertical'
        },
        ratingContainer: {
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        marginBottom: '15px'
        },
        star: {
        fontSize: '1.5rem',
        color: '#ffc107',
        cursor: 'pointer'
        },
        submitButton: {
        backgroundColor: '#b78d65',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        padding: '12px 20px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        ':hover': {
            backgroundColor: '#a57a50'
        }
        },
        reviewItem: {
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
        },
        reviewHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '10px'
        },
        reviewerName: {
        fontWeight: '600',
        color: '#5a3921'
        },
        reviewDate: {
        color: '#888',
        fontSize: '0.8rem'
        },
        reviewRating: {
        color: '#ffc107',
        margin: '5px 0'
        },
        reviewComment: {
        margin: '15px 0',
        lineHeight: '1.5'
        },
        replyButton: {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#b78d65',
        cursor: 'pointer',
        fontSize: '0.9rem',
        padding: '5px 0',
        textAlign: 'left'
        },
        repliesContainer: {
        marginTop: '15px',
        paddingLeft: '20px',
        borderLeft: '2px solid #e0d5c3'
        },
        replyItem: {
        backgroundColor: '#f5f5f5',
        borderRadius: '6px',
        padding: '15px',
        marginBottom: '10px'
        },
        replyForm: {
        marginTop: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
        },
        replyTextArea: {
        width: '100%',
        padding: '10px',
        border: '1px solid #d4b996',
        borderRadius: '4px',
        minHeight: '60px'
        },
        modalOverlay: {
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '1000'
        },
        modalContent: {
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '30px',
        maxWidth: '400px',
        width: '90%',
        textAlign: 'center'
        },
        modalTitle: {
        fontSize: '1.3rem',
        fontWeight: '600',
        marginBottom: '20px',
        color: error ? '#e74c3c' : '#5a3921'
        },
        modalButton: {
        backgroundColor: '#b78d65',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        padding: '10px 20px',
        fontSize: '1rem',
        fontWeight: '500',
        cursor: 'pointer',
        marginTop: '20px'
        }
    };

    // Helper function for responsive styles
    const getStyle = (baseStyle) => {
        const isDesktop = window.innerWidth >= 768;
        return {
        ...baseStyle,
        ...(isDesktop && baseStyle['@media (min-width: 768px)'])
        };
    };

    if (isLoading) {
        return <div style={styles.container}>Loading reviews...</div>;
    }

    return (
        <div style={styles.container}>
        <h2 style={styles.header}>Client Reviews</h2>
        
        {error && (
            <div style={{ 
            backgroundColor: '#ffe6e6', 
            color: '#d8000c', 
            padding: '10px', 
            borderRadius: '5px', 
            marginBottom: '20px' 
            }}>
            {error}
            </div>
        )}
        
        <div style={getStyle(styles.twoColumnLayout)}>
            {/* Review Form Column */}
            <div style={styles.reviewFormContainer}>
            <h3 style={styles.sectionTitle}>Share Your Experience</h3>
            
            {!isVerified ? (
                <div style={styles.formGroup}>
                <button 
                    style={styles.submitButton}
                    onClick={() => setShowEmailPrompt(true)}
                >
                    Write a Review
                </button>
                </div>
            ) : (
                <>
                <div style={styles.ratingContainer}>
                    <span>Rating: </span>
                    {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        style={styles.star}
                        onClick={() => setFormData({ ...formData, rating: star })}
                    >
                        {star <= formData.rating ? '★' : '☆'}
                    </span>
                    ))}
                </div>
                
                <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Your Review</label>
                    <textarea
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    style={{ ...styles.formInput, ...styles.textArea }}
                    placeholder="Share your experience..."
                    />
                </div>
                
                <button
                    style={styles.submitButton}
                    onClick={submitReview}
                >
                    Submit Review
                </button>
                </>
            )}
            </div>

            {/* Reviews Display Column */}
            <div style={styles.reviewsContainer}>
            <h3 style={styles.sectionTitle}>What Clients Say</h3>
            
            {reviews.length == 0 ? (
                <p>No reviews yet. Be the first to review!</p>
            ) : (
                reviews.map((review) => (
                <div key={review.id} style={styles.reviewItem}>
                    <div style={styles.reviewHeader}>
                    <span style={styles.reviewerName}>{review.name}</span>
                    <span style={styles.reviewDate}>{review.date}</span>
                    </div>
                    <div style={styles.reviewRating}>
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </div>
                    <p style={styles.reviewComment}>{review.comment}</p>
                    
                    {/* Reply button */}
                    {isVerified && (
                    <button
                        style={styles.replyButton}
                        onClick={() => setActiveReply(activeReply === review.id ? null : review.id)}
                    >
                        {activeReply === review.id ? 'Cancel Reply' : 'Reply'}
                    </button>
                    )}
                    
                    {/* Reply form */}
                    {activeReply === review.id && (
                    <div style={styles.replyForm}>
                        <textarea
                        value={formData.replyComment}
                        onChange={(e) => setFormData({ ...formData, replyComment: e.target.value })}
                        style={styles.replyTextArea}
                        placeholder="Write your reply..."
                        />
                        <button
                        style={{ ...styles.submitButton, padding: '8px 15px' }}
                        onClick={() => submitReply(review.id)}
                        >
                        Post Reply
                        </button>
                    </div>
                    )}
                    
                    {/* Replies list */}
                    {review.replies && review.replies.length > 0 && (
                    <div style={styles.repliesContainer}>
                        {review.replies.map((reply) => (
                        <div key={reply.id} style={styles.replyItem}>
                            <div style={styles.reviewHeader}>
                            <span style={styles.reviewerName}>{reply.name}</span>
                            <span style={styles.reviewDate}>{reply.date}</span>
                            </div>
                            <p style={styles.reviewComment}>{reply.comment}</p>
                        </div>
                        ))}
                    </div>
                    )}
                </div>
                ))
            )}
            </div>
        </div>

        {/* Email Verification Modal */}
        {showEmailPrompt && (
            <div style={styles.modalOverlay} onClick={() => {
            setShowEmailPrompt(false);
            setError('');
            }}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h3 style={styles.modalTitle}>
                {error ? 'Verification Failed' : 'Verify Your Email'}
                </h3>
                {error ? (
                <p style={{ color: '#e74c3c' }}>{error}</p>
                ) : (
                <>
                    <p>Please enter your email to verify you're a client</p>
                    <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ ...styles.formInput, width: '100%', margin: '15px 0' }}
                    placeholder="Your email address"
                    />
                </>
                )}
                <button
                style={styles.modalButton}
                onClick={() => {
                    if (error) {
                    setShowEmailPrompt(false);
                    setError('');
                    } else {
                    verifyEmail();
                    if (!error) setShowEmailPrompt(false);
                    }
                }}
                >
                {error ? 'Close' : 'Verify'}
                </button>
            </div>
            </div>
        )}
        </div>
    );
};

export default Reviews;