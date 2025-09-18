/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from 'react';
import  { Routes, Route, useParams, data } from "react-router-dom";
import Home from "./Home";
import NavData from "../Navbar/NavData/Navigation";
import { useSlug } from '../Tenants/Tenant';
import './Dashboard.css';
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
const BASE_URL = import.meta.env.VITE_BASE_API || 'http://127.0.0.1:8000';

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
                setMainData(data)
            } catch (error) {
                setError('Failed to fetch products. Please try again later.',error);
                
            }
            
        };
        fetchDashboard();
    }, []);

    useEffect(() => {
        const getSpaTheme = async () => {
        try {
            
            // get theme
            const response = await fetch(`${API_URL}/theme/${slug}/`);
            const data = await response.json();
            
            setTheme(data.theme_code);
            
        } catch (err) {
            
            setError('Theme not found',err);
        } 
        };

        getSpaTheme();
    }, [slug]);


    const timeRan = 3000;
    const timeAutoNext = 10000;
    let runTimeOut;
    let runAutoRun;
    
  // Styles object
    const styles = {
        title: {
            color:`${Theme}`,
        },
        
    };


    

    useEffect(() => {
        
        if (Data){
            setMainItems([
                {
        
                img:`${BASE_URL}${Data.dashboard_img1}`,
                title: Data.spa.spa_name,
                topic: `Welcome to ${Data.spa.spa_name} .`,
                desc: "We are glad you could visit our site. We are dedicated to providing a sanctuary of relaxation and rejuvenation. Our mission is to help you look and feel your best through luxurious treatments designed to nurture both your body and mind"
                },
                {
                img: `${BASE_URL}${Data.dashboard_img2}`,
                title: Data.spa.spa_name,
                topic: "Our Story",
                desc: `Founded in ${Data.venture_date}, ${Data.spa.spa_name} was born from passion for beauty and wellness. A space was envisioned where clients could escape the stresses of daily life and indulge in self-care. With years of experience in the beauty industry, Our team brings a blend of expertise and creativity to every service we offer.`
                },
                {
                img: `${BASE_URL}${Data.dashboard_img3}`,
                title: Data.spa.spa_name,
                topic: "What makes us unique",
                desc: "We pride ourselves on offering personalized treatments tailored to your individual Needs. Every visit is designed to make you feel valued and renewed while every service is crafted with care. Our parlour features a serene, welcoming environment, designed to provide an unforgettable experience."
                },
                {
                img: `${BASE_URL}${Data.dashboard_img4}`,
                title: Data.spa.spa_name,
                topic: "Join our community",
                desc: "We value every client and are proud to have built a loyal community of individuals who trusts us with their beauty and wellness journey."
                },
                {
                img: `${BASE_URL}${Data.dashboard_img5}`,
                title: Data.spa.spa_name,
                topic: "Visit Us Today",
                desc: `Discover the magic of ${Data.spa.spa_name}. We can't wait to welcome you and help you shine from the inside out. Book your appointment today and take the first step toward rejuvenation.`
                },
                {
                img: `${BASE_URL}${Data.dashboard_img6}`,
                title: Data.spa.spa_name,
                topic: "Welcome to our site",
                desc: "We value your feedback. Explore online and discover what we're all about. From our services to our story, this is your guide to everything we've built with you in mind"
                },
                {
                img: `${BASE_URL}${Data.dashboard_img7}`,
                title: Data.spa.spa_name,
                topic: "Welcome to our Spa",
                desc: `${Data.spa.spa_name} is your destination for comfort, care and confidence. Every visit is more than a service, it's an experience crafted to leave you feeling at your best`
                }
            ]);
        }
    }, [Data]);

    

    const [ mainItems ,setMainItems]= useState( [
        {
        
        img:"pic1" ,
        title: "BEAUTY SPA",
        topic: "Welcome to Adasa's spa.",
        desc: "We are glad you could visit our site. We are dedicated to providing a sanctuary of relaxation and rejuvenation. Our mission is to help you look and feel your best through luxurious treatments designed to nurture both your body and mind"
        },
        {
        img: "pic2" ,
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
        img: "pic4" ,
        title: "BEAUTY SPA",
        topic: "Join our community",
        desc: "We value every client and are proud to have built a loyal community of individuals who trusts us with their beauty and wellness journey."
        },
        {
        img: "pic5" ,
        title: "BEAUTY SPA",
        topic: "Visit Us Today",
        desc: "Discover the magic of BEAUTY SPA. We can't wait to welcome you and help you shine from the inside out. Book your appointment today and take the first step toward rejuvenation."
        },
        {
        img: "pic6" ,
        title: "BEAUTY SPA",
        topic: "Welcome to our site",
        desc: "We value your feedback. Explore online and discover what we're all about. From our services to our story, this is your guide to everything we've built with you in mind"
        },
        {
        img: "pic7" ,
        title: "BEAUTY SPA",
        topic: "Welcome to our Spa",
        desc: "BEAUTY SPA is your destination for comfort, care and confidence. Every visit is more than a service, it's an experience crafted to leave you feeling at your best"
        }
    ]);


    const showSlider = (type) => {
        const itemSlider = document.querySelectorAll('.dashboard--carousel .dashboard--list .dashboard--item');
        // const itemThumbnail = document.querySelectorAll('.dashboard--carousel .dashboard--item');

        if (type === 'next') {
        listItemRef.current.appendChild(itemSlider[0]);
        carlRef.current.classList.add('next');
        } else {
        const positionLastItem = itemSlider.length - 1;
        listItemRef.current.prepend(itemSlider[positionLastItem]);
        carlRef.current.classList.add('prev');
        }

        clearTimeout(runTimeOut);
        runTimeOut = setTimeout(() => {
        carlRef.current.classList.remove('next');
        carlRef.current.classList.remove('prev');
        }, timeRan);

        clearTimeout(runAutoRun);
        runAutoRun = setTimeout(() => {
        nextRef.current.click();
        }, timeAutoNext);
    };


    useEffect(() => {
        const nextDom = nextRef.current;
        const prevDom = prevRef.current;

        nextDom.onclick = () => showSlider('next');
        prevDom.onclick = () => showSlider('prev');

        runAutoRun = setTimeout(() => {
        nextDom.click();
        }, timeAutoNext);

        return () => {
        clearTimeout(runAutoRun);
        clearTimeout(runTimeOut);
        };
    }, []);

    return (
        <div  className='dashboard--body'>
            <div className="dashboard--carousel" ref={carlRef}>
                <div className="dashboard--list" ref={listItemRef}>
                    {mainItems.map((item, index) => (
                        <div className="dashboard--item" key={index} >
                            <img className='dashboard--itemImg' src={item.img} alt="" />
                            <div className="dashboard--content">

                                <div className="dashboard--author">
                                    &copy; {new Date().getFullYear()} FaLKoN AnaLyTiKs
                                </div>

                                <div className="dashboard--title" style={styles.title}>
                                    {item.title}
                                </div>

                                <div className="dashboard--topic">
                                    {item.topic}
                                </div>

                                <div className="dashboard--desc" >
                                    {item.desc}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>


                <div className="arrows" >
                <button 
                    
                    id="prev" 
                    ref={prevRef} 
                    className="dashboard--prev-button" 
                    style={{display: 'none' }}
                ></button>
                <button 
                    id="next" 
                    ref={nextRef}
                    className='arrowButton'
                    onMouseOver={(e) => {
                    e.target.style.border = '4px solid white';
                    e.target.style.color = 'white';
                    }}
                    onMouseOut={(e) => {
                    e.target.style.border = '2px solid black';
                    e.target.style.color = 'black';
                    }}
                >
                    &gt;&gt;
                </button>
                </div>

                <div className="dashboard--time"></div>
            </div>
            <div className="dashboard--NavContainer" >
                    < NavData />
            </div>
            <div>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                </Routes>
            </div>
        </div>
    );
};

export default Dashboard;