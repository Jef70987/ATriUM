const LoadingSpinner = ({ small }) => {
    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
            {/* Pulse animation spinner */}
            <div className={`
                rounded-full bg-gradient-to-r from-pink-400 to-purple-500 animate-pulse
                ${small ? "w-8 h-8" : "w-16 h-16"}
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