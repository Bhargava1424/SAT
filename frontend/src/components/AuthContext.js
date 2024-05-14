import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // Attempt to get user data from sessionStorage when the component mounts
        const savedUser = sessionStorage.getItem('username');
        const savedRole = sessionStorage.getItem('role');
        if (savedUser && savedRole) {
            return { username: savedUser, role: savedRole };
        }
        return null;
    });

    const login = (username, role) => {
        setUser({ username, role });
        sessionStorage.setItem('username', username);
        sessionStorage.setItem('role', role);
    };

    const logout = () => {
        setUser(null);
        sessionStorage.clear();
    };

    // Optionally, to handle changes in sessionStorage across tabs:
    useEffect(() => {
        const handleStorageChange = () => {
            const savedUser = sessionStorage.getItem('username');
            const savedRole = sessionStorage.getItem('role');
            if (savedUser && savedRole) {
                setUser({ username: savedUser, role: savedRole });
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
