import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import LoadingSpinner from '../Shop/LoadingSpinner';
import ErrorMessage from '../Shop/ErrorMessage';
import StaffMain from '../Staff/StaffMain';
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const TenantStaff = () => {
    const { slug } = useParams();
    const [slugExists, setSlugExists] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const verifySlugWithDjango = async () => {
        if (!slug) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            
            // Verify slug with Django backend
            const response = await fetch(`${API_URL}/validate/${slug}/`);
            const data = await response.json();
            // Check if spa exists from Django response
            if (data.slug == slug && data.payment_status == "active" ){
                setSlugExists(true);
                setError(null);
            }
            else if(data.slug == slug && data.payment_status == "inactive"){
                setError("Access Error! Contact admin...")
            }
            else {
                setError('Bad Error:Not Found')
            }
            
        } catch (err) {
            
            setError('Err100.1:Server error... ',err);
            setSlugExists(false);
        } finally {
            setLoading(false);
        }
        };

        verifySlugWithDjango();
    }, [slug]);

    if (loading) {
        return <LoadingSpinner message="Verifying spa access..." />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    if (!slug) {
        return <ErrorMessage message="Access error: Contact administrator" />;
    }


    // Only render Spa if slug exists and is valid
    if (slugExists && !error) {
        return (
            <SlugContext.Provider value={slug}>
                <StaffMain/>
            </SlugContext.Provider>
        );
    }
    return <ErrorMessage message="Access error...." />;

};
// creating a custom hook to use the context
    // eslint-disable-next-line react-refresh/only-export-components
    export const useSlug = () => {
        const context = useContext(SlugContext);
        return context;
    };
    // Create context for tenant data
    const SlugContext = createContext();


export default TenantStaff;