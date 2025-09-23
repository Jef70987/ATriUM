import './LoadingSpinner.css'
const LoadingSpinner = ({ small }) => {
    return (
        <div className="loading--container">
            <div className= {small ? "loading--spinner" : "loading--smallSpinner"}></div>
            <p>Please wait as we load resources...</p>
        </div>
    );
};

export default LoadingSpinner;