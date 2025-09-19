/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { useSlug } from "../Tenants/TenantOperator";
const API_URL = import.meta.env.VITE_API_URL;


const ReviewsView = () => {
    const slug = useSlug();
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'approved', 'pending'
    const [activeReply, setActiveReply] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch reviews from backend
    const fetchReviews = async () => {
        try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/admin/reviews/${slug}/`);
        if (response.ok) {
            const data = await response.json();
            setReviews(data);
        } else {
            setError('Failed to fetch reviews');
        }
        } catch (error) {
        setError('Error fetching reviews: ' + error.message);
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

    // Submit reply as admin
    const submitReply = async (review_id) => {
        if (!replyText.trim()) {
        setError('Reply cannot be empty');
        return;
        }

        try {
        const response = await fetch(`${API_URL}/admin/reviews/${slug}/reply/${review_id}/`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken(),
            },
            body: JSON.stringify({
            comment: replyText
            })
        });

        if (response.ok) {
            setSuccess('Reply posted successfully');
            setReplyText('');
            setActiveReply(null);
            fetchReviews(); // Refresh the list
            setTimeout(() => setSuccess(''), 3000);
        } else {
            const errorData = await response.json();
            setError(errorData.error || 'Failed to submit reply');
        }
        } catch (error) {
        setError('Network error. Please try again.',error);
        }
    };

    // Approve a review
    const approveReview = async (reviewId) => {
        try {
        const response = await fetch(`${API_URL}/admin/reviews/${slug}/approve/${reviewId}/`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken(),
            }
        });

        if (response.ok) {
            setSuccess('Review approved successfully');
            fetchReviews(); // Refresh the list
            setTimeout(() => setSuccess(''), 3000);
        } else {
            const errorData = await response.json();
            setError(errorData.error || 'Failed to approve review');
        }
        } catch (error) {
        setError('Network error. Please try again.',error);
        }
    };

    // Delete a review
    const deleteReview = async (reviewId) => {

        try {
        const response = await fetch(`${API_URL}/admin/reviews/${slug}/delete/${reviewId}/`, {
            method: 'DELETE',
            headers: {
            'X-CSRFToken': getCsrfToken(),
            }
        });

        if (response.ok) {
            setSuccess('Review deleted successfully');
            fetchReviews(); // Refresh the list
            setTimeout(() => setSuccess(''), 3000);
        } else {
            const errorData = await response.json();
            setError(errorData.error || 'Failed to delete review');
        }
        } catch (error) {
        setError('Network error. Please try again.',error);
        }
    };

    // Fetch reviews on component mount
    useEffect(() => {
        fetchReviews();
    }, [slug]);

    // Filter reviews based on selection
    const filteredReviews = reviews.filter(review => {
        if (filter === 'all') return true;
        if (filter === 'approved') return review.is_approved;
        if (filter === 'pending') return !review.is_approved;
        return true;
    });

    // Inline styles
    const styles = {
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
        fontSize: 'clamp(1.5rem, 4vw, 2rem)',
        fontWeight: '600'
        },
        filterContainer: {
        display: 'flex',
        gap: '15px',
        marginBottom: '20px',
        flexWrap: 'wrap'
        },
        filterButton: {
        padding: '10px 20px',
        border: '1px solid #d4b996',
        borderRadius: '6px',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        transition: 'all 0.2s'
        },
        filterButtonActive: {
        backgroundColor: '#b78d65',
        color: 'white',
        borderColor: '#b78d65'
        },
        reviewItem: {
        backgroundColor: '#f9f5f0',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
        borderLeft: '4px solid #b78d65'
        },
        pendingReview: {
        borderLeft: '4px solid #e74c3c'
        },
        reviewHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '10px',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '10px'
        },
        reviewerName: {
        fontWeight: '600',
        color: '#5a3921',
        fontSize: '1.1rem'
        },
        reviewDate: {
        color: '#888',
        fontSize: '0.9rem'
        },
        reviewRating: {
        color: '#ffc107',
        margin: '5px 0',
        fontSize: '1.2rem'
        },
        reviewComment: {
        margin: '15px 0',
        lineHeight: '1.5',
        fontSize: '1rem'
        },
        statusBadge: {
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '0.8rem',
        fontWeight: '500'
        },
        statusApproved: {
        backgroundColor: '#d4edda',
        color: '#155724'
        },
        statusPending: {
        backgroundColor: '#fff3cd',
        color: '#856404'
        },
        actionButtons: {
        display: 'flex',
        gap: '10px',
        marginTop: '15px',
        flexWrap: 'wrap'
        },
        button: {
        padding: '8px 15px',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '500',
        transition: 'background-color 0.2s'
        },
        approveButton: {
        backgroundColor: '#28a745',
        color: 'white'
        },
        replyButton: {
        backgroundColor: '#b78d65',
        color: 'white'
        },
        deleteButton: {
        backgroundColor: '#dc3545',
        color: 'white'
        },
        replyForm: {
        marginTop: '15px',
        padding: '15px',
        backgroundColor: '#f0e6d6',
        borderRadius: '6px'
        },
        replyTextArea: {
        width: '100%',
        padding: '12px',
        border: '1px solid #d4b996',
        borderRadius: '6px',
        minHeight: '100px',
        marginBottom: '10px',
        fontSize: '1rem',
        fontFamily: "'Poppins', sans-serif"
        },
        replyActions: {
        display: 'flex',
        gap: '10px',
        justifyContent: 'flex-end'
        },
        cancelButton: {
        backgroundColor: '#6c757d',
        color: 'white'
        },
        errorMessage: {
        backgroundColor: '#ffe6e6',
        color: '#d8000c',
        padding: '10px',
        borderRadius: '5px',
        marginBottom: '20px'
        },
        successMessage: {
        backgroundColor: '#e6ffe6',
        color: '#155724',
        padding: '10px',
        borderRadius: '5px',
        marginBottom: '20px'
        },
        loadingText: {
        textAlign: 'center',
        fontSize: '1.1rem',
        color: '#5a3921'
        },
        emptyState: {
        textAlign: 'center',
        padding: '40px',
        color: '#888'
        }
    };

    return (
        <div style={styles.container}>
        <h2 style={styles.header}>Review Management</h2>
        
        {error && (
            <div style={styles.errorMessage}>
            {error}
            <button 
                onClick={() => setError('')}
                style={{ 
                float: 'right', 
                background: 'none', 
                border: 'none', 
                color: '#d8000c', 
                cursor: 'pointer' 
                }}
            >
                ×
            </button>
            </div>
        )}
        
        {success && (
            <div style={styles.successMessage}>
            {success}
            <button 
                onClick={() => setSuccess('')}
                style={{ 
                float: 'right', 
                background: 'none', 
                border: 'none', 
                color: '#155724', 
                cursor: 'pointer' 
                }}
            >
                ×
            </button>
            </div>
        )}
        
        <div style={styles.filterContainer}>
            <button 
            style={{ 
                ...styles.filterButton, 
                ...(filter === 'all' && styles.filterButtonActive) 
            }}
            onClick={() => setFilter('all')}
            >
            All Reviews
            </button>
            <button 
            style={{ 
                ...styles.filterButton, 
                ...(filter === 'approved' && styles.filterButtonActive) 
            }}
            onClick={() => setFilter('approved')}
            >
            Approved
            </button>
            <button 
            style={{ 
                ...styles.filterButton, 
                ...(filter === 'pending' && styles.filterButtonActive) 
            }}
            onClick={() => setFilter('pending')}
            >
            Pending Approval
            </button>
        </div>
        
        {isLoading ? (
            <div style={styles.loadingText}>Loading reviews...</div>
        ) : filteredReviews.length === 0 ? (
            <div style={styles.emptyState}>
            <h3>No reviews found</h3>
            <p>There are no reviews matching your current filter.</p>
            </div>
        ) : (
            filteredReviews.map((review) => (
            <div 
                key={review.id} 
                style={{
                ...styles.reviewItem,
                ...(!review.is_approved && styles.pendingReview)
                }}
            >
                <div style={styles.reviewHeader}>
                <div>
                    <div style={styles.reviewerName}>{review.name}</div>
                    <div style={styles.reviewDate}>{review.email}</div>
                    <div style={styles.reviewDate}>{new Date(review.created_at).toLocaleDateString()}</div>
                </div>
                <div>
                    <span style={{
                    ...styles.statusBadge,
                    ...(review.is_approved ? styles.statusApproved : styles.statusPending)
                    }}>
                    {review.is_approved ? 'Approved' : 'Pending Approval'}
                    </span>
                </div>
                </div>
                
                <div style={styles.reviewRating}>
                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </div>
                
                <p style={styles.reviewComment}>{review.comment}</p>
                
                {/* Replies section */}
                {review.replies && review.replies.length > 0 && (
                <div style={{ marginTop: '15px' }}>
                    <h4 style={{ marginBottom: '10px', color: '#5a3921' }}>Replies:</h4>
                    {review.replies.map((reply) => (
                    <div key={reply.id} style={{
                        backgroundColor: 'white',
                        padding: '12px',
                        borderRadius: '6px',
                        marginBottom: '10px',
                        borderLeft: '3px solid #b78d65'
                    }}>
                        <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        marginBottom: '5px'
                        }}>
                        <strong>{reply.name}</strong>
                        <span style={{ color: '#888', fontSize: '0.9rem' }}>
                            {new Date(reply.created_at).toLocaleDateString()}
                        </span>
                        </div>
                        <p style={{ margin: 0 }}>{reply.comment}</p>
                    </div>
                    ))}
                </div>
                )}
                
                <div style={styles.actionButtons}>
                {!review.is_approved && (
                    <button 
                    style={{ ...styles.button, ...styles.approveButton }}
                    onClick={() => approveReview(review.id)}
                    >
                    Approve Review
                    </button>
                )}
                
                <button 
                    style={{ ...styles.button, ...styles.replyButton }}
                    onClick={() => setActiveReply(activeReply === review.id ? null : review.id)}
                >
                    {activeReply === review.id ? 'Cancel Reply' : 'Reply'}
                </button>
                
                <button 
                    style={{ ...styles.button, ...styles.deleteButton }}
                    onClick={() => deleteReview(review.id)}
                >
                    Delete
                </button>
                </div>
                
                {/* Reply form */}
                {activeReply === review.id && (
                <div style={styles.replyForm}>
                    <h4 style={{ marginTop: 0 }}>Post a Reply</h4>
                    <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    style={styles.replyTextArea}
                    placeholder="Write your response..."
                    />
                    <div style={styles.replyActions}>
                    <button 
                        style={{ ...styles.button, ...styles.cancelButton }}
                        onClick={() => {
                        setActiveReply(null);
                        setReplyText('');
                        }}
                    >
                        Cancel
                    </button>
                    <button 
                        style={{ ...styles.button, ...styles.replyButton }}
                        onClick={() => submitReply(review.id)}
                    >
                        Post Reply
                    </button>
                    </div>
                </div>
                )}
            </div>
            ))
        )}
        </div>
    );
};

export default ReviewsView;