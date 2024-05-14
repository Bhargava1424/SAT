import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../components/AuthContext'

const LoginPage = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loggedIn, setLoggedIn] = useState(false);
    const { login } = useAuth();

    const users = [
        { username: 'teacher1', password: 'pass1', role: 'teacher' },
        { username: 'teacher2', password: 'pass2', role: 'teacher' },
        { username: 'admin1', password: 'pass3', role: 'admin' },
        { username: 'a', password: 'a', role: 'admin' },
        { username: 'vp', password: 'vp', role: 'vicePrincipal' }
    ];

    useEffect(() => {
        if (loggedIn) {
            navigate('/dashboard', { replace: true });
        }
    }, [loggedIn, navigate]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (loggedIn) {
                console.log("Logging out due to inactivity.");
                logout();
            }
        }, 900000); // 15 mins of inactivity

        return () => clearTimeout(timer);
    }, [loggedIn]);

    const handleLogin = (e) => {
        e.preventDefault();
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            login(user.username, user.role);
            alert("Logged in Successfully");
            navigate('/dashboard', { replace: true });
        } else {
            alert("Invalid credentials!");
        }
    };

    const logout = () => {
        sessionStorage.clear();
        setLoggedIn(false);
        console.log("Logged out successfully.");
    };

    return (
        <div>
            <Navbar/>
            <div className="flex items-center justify-center min-h-screen bg-gray-200">
                <div className="bg-white shadow-lg rounded-lg">
                    <div className="flex flex-col items-center">
                        <div className="bg-[#2D5990] rounded-lg mb-4 w-80 h-32">
                            <img src="/9logo.jpg" alt="Nine Education Logo" className="rounded-xl p-4 mb-4 w-80 h-32" />
                        </div>

                        <form onSubmit={handleLogin} className='p-4 '>
                            <div className="mb-4 w-60">
                                <label htmlFor="username" className="block text-lg font-medium text-gray-700">Username</label>
                                <input type="text" id="username" value={username} onChange={e => setUsername(e.target.value)} className="bg-gray-300 h-12 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-lg" placeholder="example@gmail.com" />
                            </div>
                            <div className="mb-6 w-60">
                                <label htmlFor="password" className="block text-lg font-medium text-gray-700">Password</label>
                                <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className="bg-gray-300 h-12 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-lg" />
                            </div>
                            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#00A0E3] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                Log in
                            </button>
                            <a href="#" className="mt-2 text-sm text-[#2D5990] hover:text-[#00A0E3] ">Forgot password?</a>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
