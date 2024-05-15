import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // Attempt to get user data from sessionStorage when the component mounts
        const savedUser = sessionStorage.getItem('name');
        const savedRole = sessionStorage.getItem('role');
        if (savedUser && savedRole) {
            return { name: savedUser, role: savedRole };
        }
        return null;
    });

    const login = (name, role) => {
        setUser({ name, role });
        sessionStorage.setItem('name', name);
        sessionStorage.setItem('role', role);
    };

    const logout = () => {
        setUser(null);
        sessionStorage.clear();
    };

    // Optionally, to handle changes in sessionStorage across tabs:
    useEffect(() => {
        const handleStorageChange = () => {
            const savedUser = sessionStorage.getItem('name');
            const savedRole = sessionStorage.getItem('role');
            if (savedUser && savedRole) {
                setUser({ name: savedUser, role: savedRole });
            } else {
                setUser(null);
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
