/* eslint-disable react-refresh/only-export-components */

import React, { createContext, useState, useEffect, useContext } from 'react';



export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });

    useEffect(() => {
        if (user) localStorage.setItem('user', JSON.stringify(user));
        else localStorage.removeItem('user');
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, setUser }}>
        {children}
        </AuthContext.Provider>
    );
}
export const AuthContext = createContext();

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}