import React, { useState } from 'react';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(process.env.REACT_APP_BASE_URL + '/teachers/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            if (response.ok) {
                alert('Password reset link sent to your email');
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error during password reset request:', error);
            alert('Error during password reset request');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-200">
            <div className="bg-white shadow-lg rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
                <form onSubmit={handleForgotPassword}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-lg font-medium text-gray-700">Email</label>
                        <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="bg-gray-300 h-12 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 sm:text-lg" />
                    </div>
                    <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#00A0E3] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Send Reset Link
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
