/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from './CartContext';

const API_URL = import.meta.env.VITE_API_URL;

const ImageGallery = () => {
    const { slug } = useParams();
    const { addToCart } = useCart();
    const [error, setError] = useState('');
    const [BookCart, setBookCart] = useState([]);
    const [imageData, setImageData] = useState([]);

    const handleCart = (imageId) => {
        addToCart(imageId);
    };

    const clearStorage = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
    };

    useEffect(() => {
        clearStorage();
        const fetchGallery = async () => {
            try {
                const response = await fetch(`${API_URL}/gallery/${slug}/gallery`);    
                const data = await response.json();
                setImageData(data);
            } catch (error) {
                setError('Failed to fetch products. Please try again later.');
            }
        };
        fetchGallery();
    }, [slug]);

    const [selectedImage, setSelectedImage] = useState(null);
    const sortedImages = [...imageData].sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at));

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
                        Our Gallery
                    </h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-600 mx-auto rounded-full mb-4"></div>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Discover the beautiful moments and transformations from our spa
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-center max-w-2xl mx-auto">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Gallery Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {sortedImages.map((image, index) => (
                        <div 
                            key={image.id} 
                            className="relative group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:scale-105"
                            onClick={() => setSelectedImage(image)}
                        >
                            {/* Image */}
                            <div className="relative overflow-hidden">
                                <img 
                                    src={image.image} 
                                    alt={image.title} 
                                    className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                                    loading="lazy"
                                />
                                
                                {/* Image Number Badge */}
                                <div className="absolute top-3 left-3 bg-black bg-opacity-70 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                                    {sortedImages.length - index}
                                </div>

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-end">
                                    <div className="w-full p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        <h3 className="text-white font-semibold text-lg mb-1 truncate">
                                            {image.caption}
                                        </h3>
                                        <p className="text-gray-200 text-sm">
                                            {new Date(image.uploaded_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Book Button - Hidden until hover on desktop, always visible on mobile */}
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 md:block hidden">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCart(image.id);
                                    }}
                                    className="bg-pink-500 hover:bg-pink-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 shadow-lg"
                                >
                                    Book
                                </button>
                            </div>

                            {/* Mobile Book Button - Always visible */}
                            <div className="md:hidden absolute top-3 right-3">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCart(image.id);
                                    }}
                                    className="bg-pink-500 hover:bg-pink-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 shadow-lg"
                                >
                                    Book
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {sortedImages.length === 0 && !error && (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl text-gray-400">📷</span>
                        </div>
                        <p className="text-gray-500 text-lg">No images available in the gallery</p>
                        <p className="text-gray-400 text-sm mt-2">Check back later for updates</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <button 
                        className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 transition-colors duration-200 z-10 bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(null);
                        }}
                    >
                        ×
                    </button>
                    
                    <div 
                        className="relative max-w-4xl max-h-full w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img 
                            src={selectedImage.image} 
                            alt={selectedImage.title} 
                            className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                        />
                        
                        <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-b-lg p-6 mt-2">
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                {selectedImage.caption || selectedImage.title}
                            </h3>
                            <p className="text-gray-600">
                                {new Date(selectedImage.uploaded_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                            
                            <div className="mt-4 flex justify-center">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCart(selectedImage.id);
                                        setSelectedImage(null);
                                    }}
                                    className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 shadow-lg"
                                >
                                    Book This Style
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Decorative Elements */}
            <div className="fixed top-20 left-4 w-32 h-32 bg-pink-200 rounded-full opacity-20 blur-xl -z-10"></div>
            <div className="fixed bottom-20 right-4 w-40 h-40 bg-purple-200 rounded-full opacity-20 blur-xl -z-10"></div>
        </div>
    );
};

export default ImageGallery;