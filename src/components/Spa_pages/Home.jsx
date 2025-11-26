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
        <div className="min-h-screen w-full bg-[#f9f5f0]">
            {/* Background Image with Curved Effect */}
            <div className="fixed inset-0 z-0">
                <img 
                    src={`${HomePic}`}
                    alt="Spa background" 
                    className="w-full h-full object-cover opacity-20 lg:opacity-25"
                />
                {/* Curved overlay for desktop */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#f9f5f0] via-[#f9f5f0]/95 to-transparent 
                              lg:bg-gradient-to-r lg:from-[#f9f5f0] lg:via-[#f9f5f0]/90 lg:to-transparent"
                ></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 w-full">
                {/* Welcome Section - Full width */}
                <div className="w-full bg-[#f9f5f0] bg-opacity-90 backdrop-blur-sm py-8 lg:py-12">
                    <div className="w-full px-4 sm:px-6 lg:px-8">
                        <div className="max-w-7xl mx-auto">
                            <h1 
                                className="text-3xl lg:text-5xl xl:text-6xl font-bold mb-4 lg:mb-6 leading-tight text-[#333] text-center"
                                style={{ color: theme || '#EC4899' }}
                            >
                                Welcome to {SpaName}
                            </h1>
                            <h2 className="text-xl lg:text-2xl xl:text-3xl text-[#555] text-center mb-6 lg:mb-8 font-light">
                                {HomeSlogan}
                            </h2>
                            <p className="text-[#555] text-lg lg:text-xl xl:text-2xl leading-relaxed text-center max-w-6xl mx-auto mb-8">
                                {HomeData}
                            </p>
                            
                            {/* Call to Action */}
                            <div className="bg-[#f9f5f0] border-2 border-[#d4b996] rounded-2xl p-6 lg:p-8 text-center max-w-4xl mx-auto">
                                <p className="text-lg lg:text-xl xl:text-2xl font-semibold text-[#333]">
                                    Limited appointments available! Book now to secure your preferred time slot.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Cards Grid - Full width background */}
                <div className="w-full bg-[#f9f5f0] bg-opacity-80 py-8 lg:py-12">
                    <div className="w-full px-4 sm:px-6 lg:px-8">
                        <div className="max-w-7xl mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                                {/* Contact Card */}
                                <div className="bg-[#f9f5f0] bg-opacity-90 backdrop-blur-sm rounded-2xl p-6 lg:p-8 shadow-lg border border-[#d4b996] hover:shadow-xl transition-all duration-300">
                                    <h2 
                                        className="text-2xl lg:text-3xl font-bold mb-6 pb-4 border-b border-[#d4b996] text-[#333] text-center"
                                        style={{ color: theme || '#EC4899' }}
                                    >
                                        Contact Us
                                    </h2>
                                    <div className="space-y-4 lg:space-y-5">
                                        <div className="flex items-start space-x-4">
                                            <span className="text-xl text-[#b78d65] mt-1 flex-shrink-0">📍</span>
                                            <span className="text-[#333] text-base lg:text-lg flex-1">{HomeContact.address}</span>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <span className="text-xl text-[#b78d65] flex-shrink-0">📞</span>
                                            <span className="text-[#333] text-base lg:text-lg">{HomeContact.phone}</span>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <span className="text-xl text-[#b78d65] flex-shrink-0">✉️</span>
                                            <span className="text-[#333] text-base lg:text-lg">{HomeContact.email}</span>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <span className="text-xl text-[#b78d65] flex-shrink-0">⏰</span>
                                            <span className="text-[#333] text-base lg:text-lg">{HomeContact.time}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Offers Card */}
                                <div className="bg-[#f9f5f0] bg-opacity-80 backdrop-blur-sm rounded-2xl p-6 lg:p-8 shadow-lg border border-[#d4b996] hover:shadow-xl transition-all duration-300">
                                    <h2 
                                        className="text-2xl lg:text-3xl font-bold mb-6 pb-4 border-b border-[#d4b996] text-[#333] text-center"
                                        style={{ color: theme || '#EC4899' }}
                                    >
                                        Current Offer
                                    </h2>
                                    <div className="space-y-4 lg:space-y-5">
                                        <h3 className="text-xl lg:text-2xl font-semibold text-[#333] text-center">{currentOffer.title}</h3>
                                        <p className="text-[#555] text-base lg:text-lg leading-relaxed text-center">{currentOffer.description}</p>
                                        <div className="bg-[#f9f5f0] border-2 border-[#d4b996] rounded-xl p-4 mt-4">
                                            <p className="text-sm lg:text-base text-[#555] font-medium text-center">
                                                Valid until: {currentOffer.validUntil}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* News Card */}
                                <div className="bg-[#f9f5f0] bg-opacity-90 backdrop-blur-sm rounded-2xl p-6 lg:p-8 shadow-lg border border-[#d4b996] hover:shadow-xl transition-all duration-300">
                                    <h2 
                                        className="text-2xl lg:text-3xl font-bold mb-6 pb-4 border-b border-[#d4b996] text-[#333] text-center"
                                        style={{ color: theme || '#EC4899' }}
                                    >
                                        What's New
                                    </h2>
                                    <div className="space-y-4 lg:space-y-5">
                                        {News.length > 0 ? (
                                            News.map(news => (
                                                <div key={news.id} className="pb-4 border-b border-dashed border-[#d4b996] last:border-b-0 last:pb-0">
                                                    <p className="text-[#333] text-base lg:text-lg leading-relaxed">{news.notification}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-6">
                                                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-[#f9f5f0] rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#d4b996]">
                                                    <span className="text-2xl lg:text-3xl text-[#b78d65]">📰</span>
                                                </div>
                                                <p className="text-[#555] text-base lg:text-lg">Stay tuned for updates!</p>
                                                <p className="text-[#b78d65] text-sm mt-2">Check back later for news</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="fixed top-4 right-4 bg-white border border-gray-200 rounded-lg p-4 max-w-sm z-50 shadow-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}
        </div>
    );
};

export default Home;