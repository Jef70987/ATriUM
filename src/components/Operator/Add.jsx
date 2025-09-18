/* eslint-disable no-unused-vars */
// components/Add.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSlug } from "../Tenants/TenantOperator";
import './Add.css';

const Add = () => {
    const slug = useSlug();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('service');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Service form state
    const [serviceForm, setServiceForm] = useState({
        name: '',
        description: '',
        price: '',
        service_img: '',
        is_active: 'True'
    });

    // Gallery form state
    const [galleryForm, setGalleryForm] = useState({
        image: null,
        caption: ''
    });

    const getCsrfToken = async () => {
        const response = await fetch('http://localhost:8000/api/csrf-token/');
        const data = await response.json();
        return data.csrfToken;
    };

    // Handle service form submission
    const handleServiceSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const token = localStorage.getItem('access_token');
        
        if (!token) {
        navigate('/login');
        return;
        }

        const formData = new FormData();
        formData.append('name', serviceForm.name);
        formData.append('description', serviceForm.description);
        formData.append('price', serviceForm.price);
        formData.append('is_active', serviceForm.is_active);
        
        if (serviceForm.service_img) {
        formData.append('service_img', serviceForm.service_img);
        }

        try {
                const csrfToken = await getCsrfToken();
                const response = await fetch(`http://localhost:8000/api/spa/${slug}/services/`, {
                method: 'POST',
                headers: {
                'X-CSRFToken': csrfToken,
                },
                body: formData,
            });
            setMessage('Service added successfully!');
            setServiceForm({
            name: '',
            description: '',
            price: '',
            service_img: '',
            is_active: ''
            });
            // Clear file input
            document.getElementById('service-img-upload').value = '';

            // const data = await response.json();
            // console.log("RESPONSE DATA",data);
            // if (response.ok) {
            //     setMessage('Service added successfully!');
            //     setServiceForm({
            //     name: '',
            //     description: '',
            //     price: '',
            //     service_img: '',
            //     is_active: ''
            //     });
            //     // Clear file input
            //     document.getElementById('service-img-upload').value = '';
            // } else {
            //     setMessage(data.error || data.detail || 'Failed to add service');
            // }
        } catch (error) {
        setMessage('Error adding service');
        console.error('Error:', error);
        } finally {
        setLoading(false);
        }
    };

    // Handle gallery form submission
    const handleGallerySubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const token = localStorage.getItem('access_token');
        
        if (!token) {
        
        return(<div><p>Access error...</p></div>);
        }

        const formData = new FormData();
        formData.append('caption', galleryForm.caption);
        
        if (galleryForm.image) {
        formData.append('image', galleryForm.image);
        }

        try {
            const csrfToken = await getCsrfToken();
            const response = await fetch(`http://localhost:8000/api/spa/${slug}/gallery/`, {
            method: 'POST',
            headers: {
            'X-CSRFToken': csrfToken,
            },
            body: formData,
        });

        const data = await response.json();
        
        if (response.ok) {
            setMessage('Image added to gallery successfully!');
            setGalleryForm({
            image: null,
            caption: ''
            });
            // Clear file input
            // document.getElementById('gallery-image-upload').value = '';
        } else {
            setMessage(data.error || data.detail || 'Failed to add image');
        }
        } catch (error) {
        setMessage('Error adding image');
        console.error('Error:', error);
        } finally {
        setLoading(false);
        }
    };

    // Handle service image change
    const handleServiceImageChange = (e) => {
        setServiceForm({
        ...serviceForm,
        service_img: e.target.files[0]
        });
    };

    // Handle gallery image change
    const handleGalleryImageChange = (e) => {
        setGalleryForm({
        ...galleryForm,
        image: e.target.files[0]
        });
    };

    if (loading) {
        return <div className="loading">Processing...</div>;
    }

    return (
        <div className="add-container">
        <header className="add-header">
            <h1>Add Content to {slug}</h1>
        </header>

        <div className="tabs">
            <button 
            className={activeTab === 'service' ? 'active' : ''}
            onClick={() => setActiveTab('service')}
            >
            Add Service
            </button>
            <button 
            className={activeTab === 'gallery' ? 'active' : ''}
            onClick={() => setActiveTab('gallery')}
            >
            Add Gallery Image
            </button>
        </div>

        {message && (
            <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
            {message}
            </div>
        )}

        {activeTab === 'service' && (
            <p style={{color:'red'}}>This service is currently not available here...</p>
            // <form onSubmit={handleServiceSubmit} className="add-form">
            // <h2>Add New Service</h2>
            
            // <div className="form-group">
            //     <label>Service Name *</label>
            //     <input
            //     type="text"
            //     value={serviceForm.name}
            //     onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})}
            //     required
            //     />
            // </div>

            // <div className="form-group">
            //     <label>Description</label>
            //     <textarea
            //     value={serviceForm.description}
            //     onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
            //     rows="3"
            //     />
            // </div>

            // <div className="form-group">
            //     <label>Price (KSh) *</label>
            //     <input
            //     type="number"
            //     step="0.01"
            //     min="0"
            //     value={serviceForm.price}
            //     onChange={(e) => setServiceForm({...serviceForm, price: e.target.value})}
            //     required
            //     />
            // </div>

            // <div className="form-group">
            //     <label>Service Image</label>
            //     <input
            //     id="service-img-upload"
            //     type="file"
            //     accept="image/*"
            //     onChange={handleServiceImageChange}
            //     />
            // </div>

            // <div className="form-group">
            //     <label>
            //     <input
            //         type="checkbox"
            //         checked={serviceForm.is_active}
            //         onChange={(e) => setServiceForm({...serviceForm, is_active: e.target.checked})}
            //     />
            //     Active Service
            //     </label>
            // </div>

            // <button type="submit" disabled={loading}>
            //     {loading ? 'Adding Service...' : 'Add Service'}
            // </button>
            // </form>
        )}

        {activeTab === 'gallery' && (
            <p style={{color:'red'}}>This service is currently not available here...</p>
            // <form onSubmit={handleGallerySubmit} className="add-form">
            // <h2>Add Gallery Image</h2>
            
            // <div className="form-group">
            //     <label>Caption</label>
            //     <input
            //     type="text"
            //     value={galleryForm.caption}
            //     onChange={(e) => setGalleryForm({...galleryForm, caption: e.target.value})}
            //     placeholder="Brief description of the image"
            //     />
            // </div>

            // <div className="form-group">
            //     <label>Image *</label>
            //     <input
            //     id="gallery-image-upload"
            //     type="file"
            //     accept="image/*"
            //     onChange={handleGalleryImageChange}
            //     required
            //     />
            // </div>

            // <button type="submit" disabled={loading}>
            //     {loading ? 'Adding Image...' : 'Add to Gallery'}
            // </button>
            // </form>
        )}
        </div>
    );
};

export default Add;