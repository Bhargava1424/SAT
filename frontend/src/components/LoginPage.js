import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../components/AuthContext';

const LoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
    const { login } = useAuth();

    useEffect(() => {
        const timer = setTimeout(() => {
            // Implement logout due to inactivity logic if needed
        }, 900000); // 15 mins of inactivity

        return () => clearTimeout(timer);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/teachers/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (response.ok) {
                login(data.teacher.name, data.teacher.role, data.teacher.branch);
                alert("Logged in Successfully");
                navigate('/dashboard', { replace: true });
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('Error during login');
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/teachers/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: forgotPasswordEmail })
            });
            const data = await response.json();
            if (response.ok) {
                alert('Password reset link sent to your email');
                setShowForgotPasswordModal(false);
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error during password reset request:', error);
            alert('Error during password reset request');
        }
    };

    return (
        <div>
            <Navbar />
            <div className="flex items-center justify-center min-h-screen bg-gray-200">
                <div className="bg-white shadow-lg rounded-lg">
                    <div className="flex flex-col items-center">
                        <div className="bg-[#2D5990] rounded-lg mb-4 w-80 h-32">
                            <img src="/9logo.jpg" alt="Nine Education Logo" className="rounded-xl p-4 mb-4 w-80 h-32" />
                        </div>
                        <form onSubmit={handleLogin} className='p-4'>
                            <div className="mb-4 w-60">
                                <label htmlFor="email" className="block text-lg font-medium text-gray-700">Email</label>
                                <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="bg-gray-300 h-12 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-lg" placeholder="example@gmail.com" />
                            </div>
                            <div className="mb-6 w-60">
                                <label htmlFor="password" className="block text-lg font-medium text-gray-700">Password</label>
                                <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className="bg-gray-300 h-12 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-lg" />
                            </div>
                            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#00A0E3] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                Log in
                            </button>
                            <a href="#" onClick={() => setShowForgotPasswordModal(true)} className="mt-2 text-sm text-[#2D5990] hover:text-[#00A0E3]">Forgot password?</a>
                        </form>
                    </div>
                </div>
            </div>

            {showForgotPasswordModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
                        <form onSubmit={handleForgotPassword}>
                            <div className="mb-4">
                                <label htmlFor="forgotPasswordEmail" className="block text-lg font-medium text-gray-700">Email</label>
                                <input type="email" id="forgotPasswordEmail" value={forgotPasswordEmail} onChange={e => setForgotPasswordEmail(e.target.value)} className="bg-gray-300 h-12 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-lg" placeholder="example@gmail.com" />
                            </div>
                            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#00A0E3] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                Send Reset Link
                            </button>
                            <button type="button" onClick={() => setShowForgotPasswordModal(false)} className="w-full flex justify-center py-2 px-4 mt-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoginPage;
