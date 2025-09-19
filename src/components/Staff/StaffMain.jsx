/* eslint-disable no-unused-vars */
import React from "react";
import  { Routes, Route } from "react-router-dom";
import Login from "../Auth/Login"
import { useSlug } from "../Tenants/TenantStaff";
import { useEffect,useState } from "react";
import StaffView from "./StaffView";
const API_URL = import.meta.env.VITE_API_URL;


const StaffMain = () => {
    const slug = useSlug();
    const [Data, setMainData] = useState();
    const [error, setError] = useState('');
    // const navigate = useNavigate();

    const clearStorage = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
    };

    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');
    const user = JSON.parse(userData);

    // if(!token && !userData){
    //     return(
    //             <div >
                    
    //                     <Routes>
    //                         <Route path="/" element={<Login/>}/>
    //                     </Routes>
    //             </div>
    //         );
    // }

    
    return(
        <div className="operator--container">
            <div>
                <div className="operator--login--author">
                    &copy; {new Date().getFullYear()} FaLKoN AnaLyTiKs
                </div>
                <Routes>
                    <Route path="/" element={<StaffView/>}/>
                </Routes>
            </div>
        </div>
    );
};
export default StaffMain;