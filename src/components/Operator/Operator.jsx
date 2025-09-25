/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import  { Routes, Route, Navigate } from "react-router-dom";
import ReviewsView from "./Reply";
import Inventory from "./Inventory";
import Login from "../Auth/Login"
import OperatorNavData from "./OperatorNav";
import BookingView from "./ViewBookings";
import { useSlug } from "../Tenants/TenantOperator";
import { useEffect,useState } from "react";
import Add from "./Add";
import Staff from "./Staff";
import './Operator.css';
import BookingAnalysis from "./BookingAnalysis";
const API_URL = import.meta.env.VITE_API_URL;
import ProtectedRoute from "../Shared/ProtectedRoute";

const Operator = () => {
    const slug = useSlug();
    const [Data, setMainData] = useState();
    const [error, setError] = useState('');
    // const navigate = useNavigate();

    useEffect(() => {
                const fetchAdminData = async () => {
                    try {
                        const response = await fetch(`${API_URL}/dashboard/${slug}/items`);    
                        const data = await response.json();
                        setMainData(data)
                        
                    } catch (error) {
                        setError('Failed to fetch products. Please try again later.',error);
                        
                    }
                    
                };
                fetchAdminData();
            }, []);

    useEffect(() => {
                if(Data){
                    setMainItems(
                        {
                            
                            parlor:Data.spa.spa_name,
                            operator:Data.spa.owner.username,
                            logo:Data.spa.logo,
                            subscription:Data.spa.Subscription_status.Subscription_type,
                            status:Data.spa.payment_status
                        }
                    );
                }
            }, [Data]);
            const [ mainItems ,setMainItems]= useState( 
            {
                parlor:"undefined",
                operator:"undefined",
                logo:"undefined",
                subscription:"undefined",
                status:"undefined"
            },
            
            );
    

    const clearStorage = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
    };


    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');
    const user = JSON.parse(userData);

    if(!token && !userData){
        return(
                <div >
                    
                        <Routes>
                            <Route path="/" element={<Login/>}/>
                        </Routes>
                </div>
            );
    }
    else if(token && userData && user.role == 'CLIENT'){
        return(
            <div className="operator--container">
                <div>
                    <div className="operator--login--author">
                        &copy; {new Date().getFullYear()} FaLKoN AnaLyTiKs
                    </div>
                    <div className="operator--header">
                        <h1>Welcome, Nice To See You.</h1>
                        <h4>{mainItems.parlor}</h4>
                    </div>
                        {error}
                        <div className="operator--header--2">
                
                            <div>
                                <div className="operator--headerItem">
                                    <p><b>_Operator:</b><i>{mainItems.operator}</i></p>
                                    <p><b>Subscription:</b><i style={{color:'green'}}> {mainItems.subscription} </i></p>
                                    <p><b>status:</b><i style={{color:'red'}}> {mainItems.status}</i> </p>
                                </div>
                                
                            </div>
                        </div>

                        <div >
                            <div className="operator--NavContainer"  >
                                <OperatorNavData />
                            </div>
                        </div>
                    <Routes>
                        <Route path="/" element={<ProtectedRoute> <BookingView/> </ProtectedRoute>}/>
                        <Route path="/bookings" element={<ProtectedRoute> <BookingView/> </ProtectedRoute>}/>
                        <Route path="/add" element={<ProtectedRoute> <Add/> </ProtectedRoute>}/>
                        <Route path="/Reviews" element={<ProtectedRoute> <ReviewsView/> </ProtectedRoute>}/>
                        <Route path="/Analytics" element={ <ProtectedRoute> <BookingAnalysis/> </ProtectedRoute>}/>
                        <Route path="/inventory" element={ <ProtectedRoute>  <Inventory/> </ProtectedRoute>}/>
                        <Route path="/staff" element={ <ProtectedRoute> <Staff/> </ProtectedRoute>}/>
                    </Routes>
                </div>
            </div>
        );
    }
    else{
        clearStorage();
    }
};
export default Operator;