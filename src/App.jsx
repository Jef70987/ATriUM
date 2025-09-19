import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
// import ProtectedRoute from './components/Shared/ProtectedRoute';
import Tenant from './components/Tenants/Tenant';
import TenantOperator from './components/Tenants/TenantOperator';
import TenantStaff from './components/Tenants/TenantStaff';
import FalkoNParlour from './components/Landing/LandingPage';
function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename='/falkon-parlor/'>
        <Routes>
          <Route path="/" element={<FalkoNParlour />} />
          <Route path="/:slug/*" element={<Tenant />} />

          <Route path="/:slug/operator/*" element={<TenantOperator />} />
          <Route path="/:slug/staff/*" element={<TenantStaff />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;