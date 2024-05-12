// src/context/AuthContext.js
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const login = (username, role) => {
        setUser({ username, role });
        sessionStorage.setItem('username', username);
        sessionStorage.setItem('role', role);
    };

    const logout = () => {
        setUser(null);
        sessionStorage.clear();
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
