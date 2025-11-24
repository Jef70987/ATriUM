/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */

import {useState,useEffect } from 'react';
import { useSlug } from '../Tenants/Tenant';
import { useParams } from 'react-router-dom';
const API_URL = import.meta.env.VITE_API_URL;

const Home = () => {
    const slug = useSlug();
    const [SpaName, setSpaName] = useState();
    const [HomeData, setHomeData] = useState();
    const [HomeSlogan, setHomeSlogan] = useState();
    const [HomePic, setHomePic] = useState();
    const [HomeOffers, setHomeOffers] = useState();
    const [News, setNews] = useState([]);
    const [error, setError] = useState(null);
    const [Contact, setContact] = useState();
    const [theme, setTheme] = useState('magenta');

    const clearStorage = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
    };

    const [HomeContact, setHomeContact] = useState({
        address:"Not available...",
        phone:"Not available...",
        email:"Not available ...",
        time:"----"
    });

    const [currentOffer, setCurrentOffer] = useState({
        title: "Not available...",
        description: "Not available...",
        validUntil: "Not available...",
    });

    useEffect(() => {
        clearStorage();

        const getSpaName = async () => {
            try {
                const response = await fetch(`${API_URL}/validate/${slug}/`);
                const data = await response.json();
                if (data.slug == slug ){
                    setSpaName(data.spa_name)
                } else {
                    setError('Access error: Contact administrator');
                }
            } catch (err) {
                setError('Access error: Contact administrator',err);
            }
        };

        getSpaName();
    }, [slug]);

    useEffect(() => {
        const getSpaTheme = async () => {
            try {
                const response = await fetch(`${API_URL}/theme/${slug}/`);
                const data = await response.json();
                setTheme(data.theme_code);
            } catch (err) {
                setError('Theme not found',err);
            }
        };

        getSpaTheme();
    }, [slug]);

    useEffect(() => {
        const fetchHomeData = async (slug) => {
            try {
                const response = await fetch(`${API_URL}/home/${slug}/details`);
                const data = await response.json();
                if (data.exists === false) {
                    return null;
                }
                setHomeData(data.welcome_content);
                setHomeSlogan(data.slogan)
                setHomePic(data.start_img );
            } catch (err) {
                return null;
            }
        };

        fetchHomeData(slug);
    }, [slug]);

    useEffect(() => {
        const fetchHomeContact = async (slug) => {
            try {
                const response = await fetch(`${API_URL}/home/${slug}/contact`);
                const data = await response.json();
                setContact(data);
            } catch (err) {
                setError('Access error: Contact administrator',err);
                return null;
            }
        };

        fetchHomeContact(slug);
    }, [slug]);

    useEffect(() => {
        if(Contact){
            setHomeContact({
                address:Contact.address,
                phone:Contact.phone,
                email:Contact.email,
                time:Contact.time
            });
        }
    },[Contact]);

    useEffect(() => {
        const fetchHomeOffers = async () => {
            try {
                const response = await fetch(`${API_URL}/home/${slug}/offers`);
                const data = await response.json();
                setHomeOffers(data);
            } catch (err) {
                setError('Access error: Contact administrator',err);
            }
        };

        fetchHomeOffers();
    }, []);

    useEffect(() =>{
        if(HomeOffers){
            setCurrentOffer({
                title: HomeOffers.offer_title,
                description: HomeOffers.offer_message,
                validUntil: HomeOffers.offer_valid
            });
        }
    },[HomeOffers]);

    useEffect(() => {
        const fetchNotification = async () => {
            try {
                const response = await fetch(`${API_URL}/home/${slug}/notifications`);
                const result = await response.json();
                setNews(result);
            } catch (error) {
                setError('Failed to fetch products. Please try again later.',error);
            }
        };
        fetchNotification();
    }, []);

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-pink-50 via-white to-purple-50 relative overflow-hidden">
            {/* Background Image with Gradient Overlay */}
            <div className="absolute inset-0 z-0">
                <img 
                    src={`${HomePic}`}
                    alt="Spa background" 
                    className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent"></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8 lg:mb-12">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 lg:p-8 shadow-xl border border-white/20">
                        <h1 
                            className="text-3xl lg:text-5xl font-bold mb-4 lg:mb-6 leading-tight"
                            style={{ color: theme || '#EC4899' }}
                        >
                            Welcome to {SpaName}
                        </h1>
                        <h2 className="text-xl lg:text-2xl text-gray-700 mb-4 font-light">
                            {HomeSlogan}
                        </h2>
                        <p className="text-gray-600 text-lg lg:text-xl leading-relaxed mb-6">
                            {HomeData}
                        </p>
                        
                        {/* Call to Action */}
                        <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-200 rounded-xl p-4 lg:p-6 text-center">
                            <p className="text-lg lg:text-xl font-semibold text-gray-800">
                                Limited appointments available! Book now to secure your preferred time slot.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Info Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Contact Card */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
                        <h2 className="text-2xl font-bold mb-6 pb-3 border-b border-gray-200" style={{ color: theme || '#EC4899' }}>
                            Contact Us
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <span className="text-xl text-pink-500 mt-1">📍</span>
                                <span className="text-gray-700 flex-1">{HomeContact.address}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className="text-xl text-pink-500">📞</span>
                                <span className="text-gray-700">{HomeContact.phone}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className="text-xl text-pink-500">✉️</span>
                                <span className="text-gray-700">{HomeContact.email}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className="text-xl text-pink-500">⏰</span>
                                <span className="text-gray-700">{HomeContact.time}</span>
                            </div>
                        </div>
                    </div>

                    {/* Offers Card */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
                        <h2 className="text-2xl font-bold mb-6 pb-3 border-b border-gray-200" style={{ color: theme || '#EC4899' }}>
                            Current Offer
                        </h2>
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-gray-800">{currentOffer.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{currentOffer.description}</p>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <p className="text-sm text-yellow-800 font-medium">
                                    Valid until: {currentOffer.validUntil}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* News Card */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
                        <h2 className="text-2xl font-bold mb-6 pb-3 border-b border-gray-200" style={{ color: theme || '#EC4899' }}>
                            What's New
                        </h2>
                        <div className="space-y-4">
                            {News.length > 0 ? (
                                News.map(news => (
                                    <div key={news.id} className="pb-3 border-b border-gray-100 last:border-b-0 last:pb-0">
                                        <p className="text-gray-700 leading-relaxed">{news.notification}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl">📰</span>
                                    </div>
                                    <p className="text-gray-500">Nothing new at the moment...</p>
                                    <p className="text-gray-400 text-sm mt-2">Check back later for updates!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-200 rounded-full opacity-20 blur-xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-200 rounded-full opacity-20 blur-xl"></div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="fixed top-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 max-w-sm z-50 shadow-lg">
                    <p className="text-red-700 text-sm">{error}</p>
                </div>
            )}
        </div>
    );
};

export default Home;