import { useState ,useEffect} from 'react';
// import { useParams } from 'react-router-dom';
import { useSlug } from '../Tenants/Tenant';
import "./Services.css";
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
const BASE_URL = import.meta.env.VITE_BASE_API || 'http://127.0.0.1:8000';

const Services = () => {
  const slug = useSlug(); // Get slug from context
  const [services, setServices] = useState([]);
  const [error, setError] = useState('');

  const clearStorage = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
    };

  // Fetch services from Django backend
    useEffect(() => {
      clearStorage();
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${API_URL}/services/${slug}/service`);    
                const data = await response.json();
                setServices(data)
                
            } catch (error) {
                setError('Failed to fetch products. Please try again later.',error);
                
            }
        };
        fetchProducts();
    }, [slug]);

  // Responsive inline styles
  const styles = {
    container: {
      maxWidth: '100%',
      width: '100%',
      margin: '0 auto',
      padding: '20px',
      fontFamily: "'Poppins', sans-serif",
      backgroundColor: 'white',
      boxSizing: 'border-box'
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px',
      color: '#5a3921',
      fontSize: '2em',
      fontWeight: 'bold',
      textShadow: '0 5px 12px #0f0e0e'
    },
    servicesGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '30px'
    },
    serviceName: {
      fontSize: 'clamp(1.2rem, 4vw, 1.4rem)',
      fontWeight: '600',
      color: '#222',
      marginBottom: '8px'
    },
    serviceDescription: {
      color: '#555',
      fontSize: 'clamp(0.9rem, 3vw, 1rem)',
      lineHeight: '1.5',
      marginBottom: '12px'
    },
    servicePrice: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#b78d65'
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Our Services</h2>

      <div style={styles.servicesGrid}>
        {error}
        {services.length > 0 ? (
            services.map((service) => (
              <div key={service.id} className='serviceCard'>
                <img 
                  src={`${BASE_URL}${service.service_img}`} 
                  alt={service.name} 
                  className='serviceImage'
                  loading="lazy"
                />
                <div>
                  <h3 style={styles.serviceName}>{service.name}</h3>
                  <p style={styles.serviceDescription}>{service.description}</p>
                  <div style={styles.servicePrice}>{service.price}</div>
                </div>
              </div>
            ))
        ): <p>Oops!! No data available...</p>}
      </div>
    </div>
  );
};

export default Services;