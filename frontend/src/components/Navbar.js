import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../Navbar.css';

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        sessionStorage.clear();
        alert("Logged out successfully!");
        navigate('/login', { replace: true });
    };

    const isLoggedIn = sessionStorage.getItem('username') && sessionStorage.getItem('role');
    const role = sessionStorage.getItem('role');

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', roles: ['admin', 'teacher','vicePrincipal'] },
        { name: 'Update Student', path: '/updateStudent', roles: ['admin'] },
        { name: 'Add Teacher', path: '/addTeacher', roles: ['admin'] },
        { name: 'Sessions & Allotments', path: '/sessions&Allotments', roles: ['admin'] },
        { name: 'Pending Sessions', path: '/pendingSessions', roles: ['teacher'] },
        { name: 'Completed Sessions', path: '/completedSessions', roles: ['teacher'] },
        { name: 'Upcoming Sessions', path:'/upcomingSessions', roles: ['teacher']},
        { name: 'View Feedbacks', path:'/viewFeedbacks', roles: ['admin', 'vicePrincipal']},
    ];

    const filteredNavItems = navItems.filter(item => item.roles.includes(role));

    return (
        <div>
            <div className="bg-[#2D5990] text-white shadow-2xl rounded-b-xl flex items-center justify-between px-4 h-16 sm:h-20">
                <div className="flex-1 invisible sm:visible">
                    {isLoggedIn && <div className="w-8 h-8 sm:w-10 sm:h-10"></div>}
                </div>
                
                <div className="flex-1 flex justify-center">
                    <img src='/9logo.jpg' alt="Nine Education IIT Academy" className="h-8 md:h-16" />
                </div>

                <div className="flex-1 flex justify-end items-center">
                    {isLoggedIn ? (
                        <>
                            <img src="/profileicon.jpeg" alt="Profile" className="w-12 h-12 rounded-full mr-2 hidden sm:block" />
                            <button onClick={handleLogout} className="rounded-2xl bg-[#00A0E3] px-3 md:pb-2 h-8 w-20 md:h-12 w-24 text-xs md:text-lg hover:bg-blue-600">Logout</button>
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="ml-2 sm:hidden focus:outline-none"
                            >
                                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                    {isMenuOpen ? (
                                        <path
                                            fillRule="evenodd"
                                            d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z"
                                        />
                                    ) : (
                                        <path
                                            fillRule="evenodd"
                                            d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
                                        />
                                    )}
                                </svg>
                            </button>
                        </>
                    ) : (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 invisible"></div>
                    )}
                </div>
            </div>
            {isLoggedIn && (
                <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:flex justify-center`}>
                    <div className="grid grid-cols-2 gap-4 p-4 sm:flex sm:space-x-4">
                        {filteredNavItems.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    navigate(item.path);
                                    setIsMenuOpen(false);
                                }}
                                className={`px-4 py-2 text-white font-bold transition-all duration-300 ${location.pathname === item.path ? 'bg-[#2D5990] active-button' : 'bg-[#00A0E3] rounded-xl hover:bg-blue-600'}`}
                            >
                                {item.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
                    </div>
    );
}

export default Navbar;