const styles = {
    container: {
        width:'1200px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100px',
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #ff6b6b',
        borderRadius: '50%',
        animation: 'spin 5s linear infinite',
    },
    smallSpinner: {
        width: '20px',
        height: '20px',
        border: '3px solid #f3f3f3',
        borderTop: '3px solid #ff6b6b',
        borderRadius: '50%',
        animation: 'spin 5s linear infinite',
    },
};

const LoadingSpinner = ({ small }) => {
    return (
        <div style={styles.container}>
        <div style={small ? styles.smallSpinner : styles.spinner}>Loading...</div>
        </div>
    );
};

export default LoadingSpinner;