/* eslint-disable react-refresh/only-export-components */
import {createContext,useState,useContext} from "react";

export const CartProvider = ({children}) => {
    // store booked images
    const [cartItems, setCartItems] = useState([]);
    
    const addToCart = (image) => {
        // add booked image
        setCartItems ((prev) => [...prev,image]);
    };

    const removeFromCart = (id) => {
        setCartItems ((prev) => prev.filter((item) => item.id !==id));
    };

    return(
        < CartContext.Provider value={{cartItems,addToCart,removeFromCart}}>
            {children}
        </CartContext.Provider>
    );
};

// cart provider
const CartContext = createContext();

// custom hook for easy use
export const useCart = () => useContext(CartContext);