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
    // State for offers and news
    const [currentOffer, setCurrentOffer] = useState( 
        {
            title: "Not available...",
            description: "Not available...",
            validUntil: "Not available...",
        }
    );

    useEffect(() => {
        clearStorage();

        const getSpaName = async () => {
        try {
            
            // Verify slug with Django backend
            const response = await fetch(`${API_URL}/validate/${slug}/`);
            const data = await response.json();
            // Check if spa exists from Django response
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

    useEffect(() => {
        const fetchHomeData = async (slug) => {

        try {
            
            // Verify slug with Django backend
            const response = await fetch(`${API_URL}/home/${slug}/details`);
            const data = await response.json();
            // Check if spa exists from Django response
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
            
            // Verify slug with Django backend
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
                
                // Verify slug with Django backend
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




    // Fetch notification from Django backend
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


    // Inline styles
    const styles = {
        container: {
            
            maxWidth: '100vw',
            margin: '0 auto',
            padding: '30px 20px',
            fontFamily: "'Poppins', sans-serif",
            color: '#333',
            position: 'relative',
            overflow: 'hidden'
        },
        ColumnLayout: {
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            position: 'relative',
            zIndex: 1
        },
        twoColumnLayout: {
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '15px',
            position: 'relative',
            minHeight: '400px'
        },
        contentColumn: {
            display: 'flex',
            flexDirection: 'column',
            opacity: 0.8,
            zIndex: 2,
            position: 'relative'
        },
        welcomeCard: {
            backgroundColor: 'rgba(249, 245, 240, 0.8)',
            borderRadius: '12px',
            padding: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            
        },
        welcomeTitle: {
            fontSize: 'clamp(1.8rem, 4vw, 2.2rem)',
            fontWeight: '400',
            color: `${theme}`,
            marginBottom: '20px',
            lineHeight: '1.3',
            textShadow: '0 5px 10px #484747'
        },
        welcomeText: {
            fontSize: '1rem',
            lineHeight: '1.6',
            marginBottom: '25px',
            color: '#555'
        },
        hurryText: {
            backgroundColor: 'transparent',
            color: 'black',
            padding: '15px',
            borderRadius: '8px',
            fontWeight: '500',
            textAlign: 'center',
            margin: '25px 0',
            textShadow: '0 5px 10px #484747'
        },
        contactCard: {
            backgroundColor: 'rgba(249, 245, 240, 0.8)',
            borderRadius: '12px',
            padding: '25px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            backdropFilter: 'blur(2px)',
            opacity: 0.7,
            zIndex: 2,
        },
        cardTitle: {
            fontSize: '1.3rem',
            fontWeight: '600',
            color:`${theme}`,
            marginBottom: '20px',
            borderBottom: '2px solid #d4b996',
            paddingBottom: '10px',
            textShadow: '0 5px 10px #484747'
        },
        contactItem: {
            display: 'flex',
            alignItems: 'center',
            marginBottom: '15px',
            fontSize: '0.95rem'
        },
        contactIcon: {
            marginRight: '12px',
            color: '#b78d65',
            fontSize: '1.2rem'
        },
        offersCard: {
            backgroundColor: 'rgba(249, 245, 240, 0.8)',
            borderRadius: '12px',
            padding: '25px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            backdropFilter: 'blur(2px)',
            opacity: 0.6,
            zIndex: 2,
        },
        offerTitle: {
            color: "#333",
            fontWeight: '600',
            marginBottom: '5px',
            textShadow: '0 5px 10px #484747'
        },
        offerValid: {
            fontSize: '0.8rem',
            color: '#888',
            fontStyle: 'italic',
            textShadow: '0 5px 10px #484747'
        },
        newsCard: {
            backgroundColor: 'rgba(249, 245, 240, 0.8)',
            borderRadius: '12px',
            padding: '25px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            backdropFilter: 'blur(2px)'
        },
        newsItem: {
            marginBottom: '12px',
            paddingBottom: '12px',
            borderBottom: '1px dashed #d4b996',
            ':lastChild': {
                marginBottom: '0',
                paddingBottom: '0',
                borderBottom: 'none'
            }
        },
        imageColumn: {
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            
            overflow: 'hidden'
        },
        spaImage: {
            width: '100%',
            height: '90%',
            objectFit: 'cover',
            opacity: 0.9,
            position: 'absolute',
            top: 0,
            left: 0,
            borderLeft: `10px solid ${theme}`,
            borderTopLeftRadius: '80% 50%',
            borderBottomLeftRadius: '80% 50%',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            webkitmaskImage:' linear-gradient(to right, rgb(57, 56, 56) 50%, transparent 100%)',
            maskImage: 'linear-gradient(to right, rgb(86, 85, 85)50%, transparent 100%)',
        },
        imageFade: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,1))',
            
        },
        inforCards: {
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            zIndex: 2,
            position: 'relative'
        },
        
        // Media queries
        '@media (min-width: 768px)': {
            twoColumnLayout: {
                gridTemplateColumns: '1fr'
            },
            inforCards: {
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'center'
            },
            spaImage: {
                opacity: 0.8
            }
        },
        '@media (max-width: 767px)': {
            container: {
                padding: '15px'
            },
            welcomeCard: {
                padding: '15px'
            },
            inforCards: {
                marginLeft: '0'
            },
            spaImage: {
                opacity: 0.6
            }
        }
    };

    // Helper function for responsive styles
    const getStyle = (baseStyle) => {
        const isDesktop = window.innerWidth >= 768;
        return {
            ...baseStyle,
            ...(isDesktop && baseStyle['@media (min-width: 768px)']),
            ...(!isDesktop && baseStyle['@media (max-width: 767px)'])
        };
    };

    return (
        <div style={styles.container}>
            
            {/* Background Image */}
            <div style={styles.imageColumn}>
                <img 
                    src={`${HomePic}`}
                    alt="Adasa spa" 
                    style={getStyle(styles.spaImage)}
                />
                <div style={getStyle(styles.imageFade)}></div>
            </div>
            
            <div style={styles.ColumnLayout}>
                <div style={getStyle(styles.twoColumnLayout)}>
                    {/* Left Column - Content */}
                    <div style={styles.contentColumn}>
                        {/* Welcome Card */}
                        <div style={styles.welcomeCard}>
                            <h1 style={styles.welcomeTitle}>
                            Welcome to {SpaName} - {HomeSlogan}
                            </h1>
                            <p style={styles.welcomeText}>
                                {HomeData}
                            </p>
                            
                            <div style={styles.hurryText}>
                                Limited appointments available! Book now to secure your preferred time slot.
                            </div>
                        </div>
                    </div>
                </div>

                <div style={getStyle(styles.inforCards)}>
                    {/* Contact Card */}
                    <div style={styles.contactCard}>
                        <h2 style={styles.cardTitle}>Contact Us</h2>
                        <div style={styles.contactItem}>
                            <span style={styles.contactIcon}>📍</span>
                            <span>{HomeContact.address}</span>
                        </div>
                        <div style={styles.contactItem}>
                            <span style={styles.contactIcon}>📞</span>
                            <span>{HomeContact.phone}</span>
                        </div>
                        <div style={styles.contactItem}>
                            <span style={styles.contactIcon}>✉️</span>
                            <span>{HomeContact.email}</span>
                        </div>
                        <div style={styles.contactItem}>
                            <span style={styles.contactIcon}>⏰</span>
                            <span>{HomeContact.time}</span>
                        </div>
                    </div>
                    
                    {/* Offers Card */}
                    <div style={styles.offersCard}>
                        <h2 style={styles.cardTitle}>Current Offer</h2>
                            <h3 style={styles.offerTitle}>{currentOffer.title}</h3>
                            <p>{currentOffer.description}</p>
                            <p style={styles.offerValid}>Valid until: {currentOffer.validUntil}</p>
                    </div>
                    
                    {/* News Card */}
                    <div style={styles.newsCard}>
                        <h2 style={styles.cardTitle}>What's New</h2>
                            {News.length > 0 ? (
                                News.map(news => (
                                    <div key={news.id} style={styles.newsItem}>
                                        {news.notification}
                                    </div>
                                ))
                            ): <p>Oops!! Nothing new..</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;

