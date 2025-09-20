import './LoadingSpinner.css'
const LoadingSpinner = ({ small }) => {
    return (
        <div className="loading--container">
            <div className= {small ? "loading--spinner" : "loading--smallSpinner"}></div>
        </div>
    );
};

export default LoadingSpinner;