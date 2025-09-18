/* eslint-disable no-unused-vars */
import { useState,useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from './CartContext';
import './Gallery.css';

const API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = import.meta.env.VITE_BASE_API;

const ImageGallery = () => {
    const {slug} = useParams(); // Get slug from context
    const {addToCart} = useCart();
    const [error, setError] = useState('');
    const [BookCart, setBookCart] = useState([]);
    const [imageData, setImageData] = useState([]);

    const handleCart =(imageId) =>{
        addToCart(imageId);
    };

    const clearStorage = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
    };

    // Fetch services from Django backend
    useEffect(() => {
        clearStorage();
        const fetchGallery = async () => {
            try {
                const response = await fetch(`${API_URL}/gallery/${slug}/gallery`);    
                const data = await response.json();
                setImageData(data)
                
            } catch (error) {
                setError('Failed to fetch products. Please try again later.',error);
                
            }
        };
        fetchGallery();
    }, [slug]);

    
    //styles
    const styles = {
        cardHover:{
            transform: 'scale(1.03)',
        }
    };
    

    const [selectedImage, setSelectedImage] = useState(null);
    // Sort images from newest to oldest
    const sortedImages = [...imageData].sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at));


    return (
        <div className='gallery--container'>
        <h2 className='gallery--header'>Gallery</h2>
        
        <div className='gallery--grid'>
            {sortedImages.map((image, index) => (
            <div 
                key={image.id} 
                className='gallery--card'
                onMouseEnter={(e) => e.currentTarget.style.transform = styles.cardHover.transform}
                onMouseLeave={(e) => e.currentTarget.style.transform = ''}
                onClick={() => setSelectedImage(image)}
            >
                <img 
                src={`${BASE_URL}${image.image}`} 
                alt={image.title} 
                className='gallery--image'
                loading="lazy"
                />
                <div className='gallery--imageNumber'>{sortedImages.length - index}</div>
                <div className='gallery--overlay'>
                <h3 className='gallery--title'>{image.caption}</h3>
                <p className='gallery--date'>{new Date(image.uploaded_at).toLocaleDateString()}</p>
                </div>
                {/* <button onClick={handleCart()} style={styles.bookButton}>Book</button> */}
            </div>
            ))}
        </div>

        {selectedImage && (
            <div className='gallery--modal ' onClick={() => setSelectedImage(null)}>
            <button 
                className='gallery--closeButton'
                onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
                }}
            >
                ×
            </button>
            <div className='gallery--modalContent' onClick={(e) => e.stopPropagation()}>
                <img 
                src={`${BASE_URL}${selectedImage.image}`} 
                alt={selectedImage.title} 
                className='gallery--modalImage'
                />
                <div style={{ color: 'white', textAlign: 'center', marginTop: '20px' }}>
                <h3>{selectedImage.title}</h3>
                <p>{new Date(selectedImage.image.uploaded_at).toLocaleDateString()}</p>
                </div>
            </div>
            </div>
        )}
        </div>
    );
};

export default ImageGallery;