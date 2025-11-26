const LoadingSpinner = ({ small }) => {
    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
            {/* Rotating spinner */}
            <div className={`
                border-4 border-gray-200 border-t-pink-500 rounded-full animate-spin
                ${small ? "w-8 h-8 border-2" : "w-16 h-16 border-4"}
            `}></div>
            
            {/* Loading text */}
            <p className={`
                text-gray-600 text-center
                ${small ? "text-sm" : "text-lg font-medium"}
            `}>
                Please wait as we load resources...
            </p>
        </div>
    );
};

export default LoadingSpinner;