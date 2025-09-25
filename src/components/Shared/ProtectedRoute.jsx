import { Navigate } from 'react-router-dom';
import { useSlug } from "../Tenants/TenantOperator";

const ProtectedRoute = ({ children}) =>{
    //authentication check
    const slug = useSlug();
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');

    if ( !token && !userData){
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        //redirect to login while remembering where they came from
        return < Navigate to={`/${slug}/operator/`} replace />;
    }
    
    return children;
}

export default ProtectedRoute;





