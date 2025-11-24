/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { setUser } = useContext(AuthContext);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { slug } = useParams();

    const LoginEndRef = useRef(null);
    
    useEffect(() => {
        LoginEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [username]);

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
            const response = await fetch(`${API_URL}/auth/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username.trim(),
                    password: password.trim(),
                    spa_slug: slug
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
                const response = await fetch(`${API_URL}/validate/${slug}/`);
                const spa_data = await response.json();
                
                if (spa_data.slug == slug && spa_data.payment_status == "active"  ){
                    localStorage.setItem('access_token', data.access);
                    localStorage.setItem('refresh_token', data.refresh);
                    localStorage.setItem('user_data', JSON.stringify(data.user));
                    
                    setUser(data.user);
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
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 flex items-center justify-center p-4">
            <div ref={LoginEndRef} />
            
            <div className="w-full max-w-md">
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-pink-100">
                    {/* Logo/Brand */}
                    <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                            <span className="text-white text-2xl font-bold">A</span>
                        </div>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                            ATriUM
                        </h3>
                        <p className="text-gray-600 text-sm">Beauty & Wellness Portal</p>
                    </div>

                    {/* Header */}
                    <div className="text-center space-y-2">
                        <h4 className="text-lg font-semibold text-gray-800">Welcome Back</h4>
                        <p className="text-sm text-gray-600">Enter your login credentials</p>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        <div>
                            <input
                                required
                                placeholder="Username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 outline-none bg-gray-50"
                            />
                        </div>
                        <div>
                            <input
                                required
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 outline-none bg-gray-50"
                            />
                        </div>
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                    >
                        Login
                    </button>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-red-600 text-sm text-center font-medium">{error}</p>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="text-center pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                            &copy; {new Date().getFullYear()} syntelsafe
                        </p>
                    </div>
                </form>

                {/* Decorative Elements */}
                <div className="absolute top-10 left-10 w-20 h-20 bg-pink-200 rounded-full opacity-20 blur-xl"></div>
                <div className="absolute bottom-10 right-10 w-24 h-24 bg-purple-200 rounded-full opacity-20 blur-xl"></div>
            </div>
        </div>
    );
}