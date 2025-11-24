/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from 'react';
import { Routes, Route, useParams } from "react-router-dom";
import Home from "./Home";
import NavData from "../Navbar/NavData/Navigation";
import { useSlug } from '../Tenants/Tenant';
const API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = import.meta.env.VITE_BASE_API;

const Dashboard = () => {
    const { slug } = useParams();
    const { tenant } = useSlug();
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 w-full">
            {/* Carousel Section */}
            <div className="relative w-full h-screen overflow-hidden" ref={carlRef}>
                <div className="flex w-full h-full transition-transform duration-500 ease-in-out" ref={listItemRef}>
                    {mainItems.map((item, index) => (
                        <div key={index} className="carousel-item w-full h-full flex-shrink-0 relative">
                            {/* Background Image */}
                            <div 
                                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                                style={{ backgroundImage: `url(${item.img})` }}
                            >
                                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                            </div>

                            {/* Content Overlay */}
                            <div className="relative z-10 h-full flex items-center justify-center">
                                <div className="text-center text-white px-4 max-w-4xl mx-auto">
                                    {/* Copyright */}
                                    <div className="absolute top-4 left-4 text-xs text-white opacity-80">
                                        &copy; {new Date().getFullYear()} FaLKoN AnaLyTiKs
                                    </div>

                                    {/* Main Content */}
                                    <div className="space-y-6">
                                        <h1 
                                            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4"
                                            style={{ color: Theme || '#EC4899' }}
                                        >
                                            {item.title}
                                        </h1>
                                        
                                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-semibold mb-6 text-white">
                                            {item.topic}
                                        </h2>
                                        
                                        <p className="text-lg md:text-xl lg:text-2xl leading-relaxed max-w-3xl mx-auto text-gray-100">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation Arrows */}
                <div className="absolute bottom-8 right-8 z-20 flex space-x-4">
                    <button 
                        ref={prevRef}
                        className="w-12 h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-opacity-30 transition-all duration-200 border border-white border-opacity-30 hover:scale-110"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    
                    <button 
                        ref={nextRef}
                        className="w-12 h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-opacity-30 transition-all duration-200 border border-white border-opacity-30 hover:scale-110"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Progress Indicator */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
                    {mainItems.map((_, index) => (
                        <div 
                            key={index}
                            className="w-2 h-2 bg-white bg-opacity-50 rounded-full hover:bg-opacity-100 transition-all duration-300"
                        ></div>
                    ))}
                </div>
            </div>

            {/* Navigation Section */}
            <div className="w-full bg-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <NavData />
                </div>
            </div>

            {/* Main Content */}
            <div className="w-full">
                <Routes>
                    <Route path="/" element={<Home />} />
                </Routes>
            </div>

            {/* Error Display */}
            {error && (
                <div className="fixed top-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 max-w-sm z-50">
                    <p className="text-red-700 text-sm">{error}</p>
                </div>
            )}
        </div>
    );
};

export default Dashboard;