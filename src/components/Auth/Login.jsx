/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Login.css';
const API_URL = import.meta.env.VITE_API_URL;


export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { setUser } = useContext(AuthContext);
    // const [Data, setMainData] = useState();
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { slug } = useParams(); // Get spa slug from URL

    const LoginEndRef = useRef(null);
    
    useEffect(() => {
        LoginEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [username]);

    // Check if user is already logged in to this spa
    // useEffect(() => {
    //     clearStorage();
    //     const token = localStorage.getItem('access_token');
    //     const userData = localStorage.getItem('user_data');
        
    //     if (token && userData) {
    //         try {
    //             const user = JSON.parse(userData);
    //             // Check if the stored user has access to this spa
    //             if (user.spa_slug === slug) {
    //                 setUser(user);
    //                 redirectBasedOnRole(user.role);
    //             }
    //         } catch (err) {
    //             err;
    //             console.error('Error parsing stored user data:');
    //             clearStorage();
    //         }
    //     }
    // }, [setUser, navigate, slug]);

    // useEffect(() => {
            
    //         const fetchDashboard = async () => {
    //             try {
    //                 const response = await fetch(`${API_URL}/dashboard/${slug}/items`);
    //                 const data = await response.json();
    //                 setMainData(data)
    //             } catch (error) {
    //                 setError('Failed to fetch products. Please try again later.',error);
                    
    //             }
                
    //         };
    //         fetchDashboard();
    //     }, []);

    const clearStorage = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
    };

    clearStorage();

    const redirectBasedOnRole = (role) => {
        if (role == 'CLIENT') {
            navigate(`/${slug}/operator/bookings`);
        } else if (role == 'ADMIN') {
            navigate(`/${slug}/operator/bookings`);
        } else {
            return;
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!slug) {
            setError('Spa identifier is missing');
            return;
        }
        
        try {
            // Use multi-tenant login endpoint
            const response = await fetch(`${API_URL}/auth/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username.trim(),
                    password: password.trim(),
                    spa_slug: slug // Include spa slug in login request
                }),
            });

            const data = await response.json();
            
            if (!response.ok) {
                if (response.status === 400) {
                    throw new Error( 'Please enter all required fields');
                } else if (response.status === 401 || response.status === 403) {
                    throw new Error( 'Invalid credentials / access denied');
                } else if (response.status === 404) {
                    throw new Error('Spa not found');
                } else {
                    throw new Error('Login failed. Please try again.');
                }
            }

            try {
            
                // Verify slug with Django backend
                const response = await fetch(`${API_URL}/validate/${slug}/`);
                const spa_data = await response.json();
                // Check if spa exists from Django response
                if (spa_data.slug == slug && spa_data.payment_status == "active"  ){
                    // Store tokens and user data in localStorage
                    localStorage.setItem('access_token', data.access);
                    localStorage.setItem('refresh_token', data.refresh);
                    localStorage.setItem('user_data', JSON.stringify(data.user));
                    
                    // Update context
                    setUser(data.user);
                    
                    // Redirect based on role
                    redirectBasedOnRole(data.user.role);
                }
                else if(spa_data.slug == slug && spa_data.payment_status == "inactive" || spa_data.payment_status == "dormant"){
                    setError("Kindly Renew Your Subscription To Login")
                }
                else {
                    setError('Bad Error:Not Found')
                }
                
            } catch (err) {
                
                setError('Err100.1:Server error... ',err);
            }
            
        } catch (err) {
            err;
            setError("Access Error");
        }
    };

    return (
        <div className='login--mainDisplay'>
            <div ref={LoginEndRef} />
            
            <form onSubmit={handleSubmit} className='login--form'>
                <h3 style={{ textAlign: 'center', color: 'magenta' }}>ATriUM</h3>
                {/* <h3 style={{ textAlign: 'center', color: 'magenta' }}>{Data.spa.spa_name}</h3> */}
                <h4 style={{ textAlign: 'center', color: 'red' }}>Enter Login Credentials</h4>
                <input
                    required
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    
                />
                <input
                    required
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    
                />
                <button
                    type="submit"
                >
                    Login
                </button>
                {error && <p style={{ color: 'red', marginTop: '1rem', textAlign: 'center' }}>{error}</p>}
                <div className="login--author">
                    &copy; {new Date().getFullYear()} FaLKoN AnaLyTiKs
                </div>
            </form>
            
        </div>
    );
}