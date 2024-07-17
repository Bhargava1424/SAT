import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // Attempt to get user data from sessionStorage when the component mounts
        const savedUser = sessionStorage.getItem('name');
        const savedRole = sessionStorage.getItem('role');
        const savedBranch = sessionStorage.getItem('branch');
        const savedSubject = sessionStorage.getItem('subject');
        if (savedUser && savedRole && savedBranch && savedSubject) {
            return { name: savedUser, role: savedRole, branch: savedBranch, subject: savedSubject};
        }
        return null;
    });

    const login = (name, role, branch, subject) => {
        setUser({ name, role, branch, subject });
        sessionStorage.setItem('name', name);
        sessionStorage.setItem('role', role);
        sessionStorage.setItem('branch', branch);
        sessionStorage.setItem('subject', subject);
    };

    const logout = () => {
        setUser(null);
        sessionStorage.clear();
        window.location.reload();
    };

    // Optionally, to handle changes in sessionStorage across tabs:
    useEffect(() => {
        const handleStorageChange = () => {
            const savedUser = sessionStorage.getItem('name');
            const savedRole = sessionStorage.getItem('role');
            const savedBranch = sessionStorage.getItem('branch');
            const savedSubject = sessionStorage.getItem('subject');
            if (savedUser && savedRole) {
                setUser({ name: savedUser, role: savedRole, branch: savedBranch, subject: savedSubject });
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
