/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from 'react';
import { Routes, Route, useParams, useNavigate } from "react-router-dom";
import { useSlug } from '../Tenants/Tenant';
const API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = import.meta.env.VITE_BASE_API;

const Dashboard = () => {
    const { slug } = useParams();
    const { tenant } = useSlug();
    const navigate = useNavigate();
    const [Data, setMainData] = useState();
    const [Theme, setTheme] = useState();
    const [error, setError] = useState('');
    const nextRef = useRef(null);
    const prevRef = useRef(null);
    const carlRef = useRef(null);
    const listItemRef = useRef(null);
    const thumbnailRef = useRef(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await fetch(`${API_URL}/dashboard/${slug}/items`);    
                const data = await response.json();
                setMainData(data);
            } catch (error) {
                setError('Failed to fetch products. Please try again later.', error);
            }
        };
        fetchDashboard();
    }, []);

    useEffect(() => {
        const getSpaTheme = async () => {
            try {
                const response = await fetch(`${API_URL}/theme/${slug}/`);
                const data = await response.json();
                setTheme(data.theme_code);
            } catch (err) {
                setError('Theme not found', err);
            }
        };
        getSpaTheme();
    }, [slug]);

    const timeRan = 3000;
    const timeAutoNext = 10000;
    let runTimeOut;
    let runAutoRun;

    useEffect(() => {
        if (Data){
            setMainItems([
                {
                    img: `${Data.dashboard_img1}`,
                    title: Data.spa.spa_name,
                    topic: `Welcome to ${Data.spa.spa_name}`,
                    desc: "We are glad you could visit our site. We are dedicated to providing a sanctuary of relaxation and rejuvenation. Our mission is to help you look and feel your best through luxurious treatments designed to nurture both your body and mind"
                },
                {
                    img: `${Data.dashboard_img2}`,
                    title: Data.spa.spa_name,
                    topic: "Our Story",
                    desc: `Founded in ${Data.venture_date}, ${Data.spa.spa_name} was born from passion for beauty and wellness. A space was envisioned where clients could escape the stresses of daily life and indulge in self-care. With years of experience in the beauty industry, Our team brings a blend of expertise and creativity to every service we offer.`
                },
                {
                    img: `${Data.dashboard_img3}`,
                    title: Data.spa.spa_name,
                    topic: "What makes us unique",
                    desc: "We pride ourselves on offering personalized treatments tailored to your individual Needs. Every visit is designed to make you feel valued and renewed while every service is crafted with care. Our parlour features a serene, welcoming environment, designed to provide an unforgettable experience."
                },
                {
                    img: `${Data.dashboard_img4}`,
                    title: Data.spa.spa_name,
                    topic: "Join our community",
                    desc: "We value every client and are proud to have built a loyal community of individuals who trusts us with their beauty and wellness journey."
                },
                {
                    img: `${Data.dashboard_img5}`,
                    title: Data.spa.spa_name,
                    topic: "Visit Us Today",
                    desc: `Discover the magic of ${Data.spa.spa_name}. We can't wait to welcome you and help you shine from the inside out. Book your appointment today and take the first step toward rejuvenation.`
                },
                {
                    img: `${Data.dashboard_img6}`,
                    title: Data.spa.spa_name,
                    topic: "Welcome to our site",
                    desc: "We value your feedback. Explore online and discover what we're all about. From our services to our story, this is your guide to everything we've built with you in mind"
                },
                {
                    img: `${Data.dashboard_img7}`,
                    title: Data.spa.spa_name,
                    topic: "Welcome to our Spa",
                    desc: `${Data.spa.spa_name} is your destination for comfort, care and confidence. Every visit is more than a service, it's an experience crafted to leave you feeling at your best`
                }
            ]);
        }
    }, [Data]);

    const [mainItems, setMainItems] = useState([
        {
            img: "pic1",
            title: "BEAUTY SPA",
            topic: "Welcome to Adasa's spa.",
            desc: "We are glad you could visit our site. We are dedicated to providing a sanctuary of relaxation and rejuvenation. Our mission is to help you look and feel your best through luxurious treatments designed to nurture both your body and mind"
        },
        {
            img: "pic2",
            title: "BEAUTY SPA",
            topic: "Our Story",
            desc: "Founded in 2024, BEAUTY SPA was born from passion for beauty and wellness. Jeff, The founder, envisioned a space where clients could escape the stresses of daily life and indulge in self-care. With years of experience in the beauty industry, Our team brings a blend of expertise and creativity to every service we offer."
        },
        {
            img: "pic3",
            title: "BEAUTY SPA",
            topic: "What makes us unique",
            desc: "We pride ourselves on offering personalized treatments tailored to your individual Needs. Every visit is designed to make you feel valued and renewed while every service is crafted with care. Our parlour features a serene, welcoming environment, designed to provide an unforgettable experience."
        },
        {
            img: "pic4",
            title: "BEAUTY SPA",
            topic: "Join our community",
            desc: "We value every client and are proud to have built a loyal community of individuals who trusts us with their beauty and wellness journey."
        },
        {
            img: "pic5",
            title: "BEAUTY SPA",
            topic: "Visit Us Today",
            desc: "Discover the magic of BEAUTY SPA. We can't wait to welcome you and help you shine from the inside out. Book your appointment today and take the first step toward rejuvenation."
        },
        {
            img: "pic6",
            title: "BEAUTY SPA",
            topic: "Welcome to our site",
            desc: "We value your feedback. Explore online and discover what we're all about. From our services to our story, this is your guide to everything we've built with you in mind"
        },
        {
            img: "pic7",
            title: "BEAUTY SPA",
            topic: "Welcome to our Spa",
            desc: "BEAUTY SPA is your destination for comfort, care and confidence. Every visit is more than a service, it's an experience crafted to leave you feeling at your best"
        }
    ]);

    const showSlider = (type) => {
        const itemSlider = document.querySelectorAll('.carousel-item');
        if (!itemSlider.length) return;

        if (type === 'next') {
            listItemRef.current.appendChild(itemSlider[0]);
        } else {
            const positionLastItem = itemSlider.length - 1;
            listItemRef.current.prepend(itemSlider[positionLastItem]);
        }

        clearTimeout(runTimeOut);
        runTimeOut = setTimeout(() => {
            // Remove transition classes if needed
        }, timeRan);

        clearTimeout(runAutoRun);
        runAutoRun = setTimeout(() => {
            nextRef.current?.click();
        }, timeAutoNext);
    };

    useEffect(() => {
        const nextDom = nextRef.current;
        const prevDom = prevRef.current;

        if (nextDom) nextDom.onclick = () => showSlider('next');
        if (prevDom) prevDom.onclick = () => showSlider('prev');

        runAutoRun = setTimeout(() => {
            nextDom?.click();
        }, timeAutoNext);

        return () => {
            clearTimeout(runAutoRun);
            clearTimeout(runTimeOut);
        };
    }, []);

    const handleExploreClick = () => {
        navigate('/Home');
    };

    return (
        <div className="min-h-screen bg-transparent w-full">
            {/* Carousel Section */}
            <div className="relative w-full h-screen overflow-hidden" ref={carlRef}>
                <div className="flex w-full h-full transition-transform duration-500 ease-in-out" ref={listItemRef}>
                    {mainItems.map((item, index) => (
                        <div key={index} className="carousel-item w-full h-full flex-shrink-0">
                            {/* Flex container for two columns */}
                            <div className="flex flex-col lg:flex-row w-full h-full">
                                {/* Left Column - Background Image */}
                                <div className="w-full lg:w-1/2 h-1/2 lg:h-full relative">
                                    <div 
                                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                                        style={{ backgroundImage: `url(${item.img})` }}
                                    />
                                </div>

                                {/* Right Column - Text Content */}
                                <div className="w-full lg:w-1/2 h-1/2 lg:h-full flex items-center justify-center p-6 lg:p-12 bg-gradient-to-br from-white to-gray-50">
                                    <div className="w-full max-w-2xl">
                                        {/* Copyright */}
                                        <div className="absolute top-6 right-6 text-xs text-gray-500 font-light">
                                            &copy; {new Date().getFullYear()} syntelsafe
                                        </div>

                                        {/* Main Content */}
                                        <div className="space-y-6 lg:space-y-8 text-left">
                                            <h1 
                                                className="text-3xl lg:text-5xl font-bold font-serif tracking-tight"
                                                style={{ color: Theme || '#EC4899' }}
                                            >
                                                {item.title}
                                            </h1>
                                            
                                            <h2 className="text-xl lg:text-3xl font-semibold text-gray-800 font-sans">
                                                {item.topic}
                                            </h2>
                                            
                                            <p className="text-base lg:text-lg leading-relaxed text-gray-600 font-light tracking-wide">
                                                {item.desc}
                                            </p>

                                            {/* Explore Button */}
                                            <div className="pt-6 lg:pt-8">
                                                <button 
                                                    className="px-8 py-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 text-base lg:text-lg shadow-lg hover:shadow-xl"
                                                    onClick={handleExploreClick}
                                                    style={{ backgroundColor: Theme || '#EC4899' }}
                                                >
                                                    Explore Our Services
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation Arrows */}
                <div className="absolute bottom-8 right-6 lg:right-8 z-20 flex space-x-4">
                    <button 
                        ref={prevRef}
                        className="w-12 h-12 bg-white bg-opacity-90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 hover:bg-white transition-all duration-300 border border-gray-200 hover:scale-110 shadow-lg hover:shadow-xl"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    
                    <button 
                        ref={nextRef}
                        className="w-12 h-12 bg-white bg-opacity-90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 hover:bg-white transition-all duration-300 border border-gray-200 hover:scale-110 shadow-lg hover:shadow-xl"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Progress Indicator */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
                    {mainItems.map((_, index) => (
                        <div 
                            key={index}
                            className="w-3 h-3 bg-white bg-opacity-70 rounded-full hover:bg-opacity-100 transition-all duration-300 border border-gray-300"
                        ></div>
                    ))}
                </div>
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

export default Dashboard;