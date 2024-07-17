import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../Navbar.css';
import Confetti from 'react-confetti';

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAccordionOpen, setIsAccordionOpen] = useState(false);
    const [isProfileHovered, setIsProfileHovered] = useState(false);

    const handleLogout = () => {
        sessionStorage.clear();
        alert("Logged out successfully!");
        navigate('/login', { replace: true });
    };

    const isLoggedIn = sessionStorage.getItem('name') && sessionStorage.getItem('role');
    const name = sessionStorage.getItem('name');
    const role = sessionStorage.getItem('role');
    const subject = sessionStorage.getItem('subject');

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', roles: ['admin', 'teacher', 'vice president', 'director'] },
        { name: 'Update Student', path: '/updateStudent', roles: ['admin', 'director'] },
        { name: 'Add User', path: '/addTeacher', roles: ['admin', 'director'] },
        { name: 'Sessions & Allotments', path: '/sessionsAndAllotments', roles: ['admin', 'director'] },
        { name: 'Pending Sessions', path: '/pendingSessions', roles: ['teacher'] },
        { name: 'Completed Sessions', path: '/completedSessions', roles: ['teacher'] },
        { name: 'Upcoming Sessions', path: '/upcomingSessions', roles: ['teacher'] },
        { name: 'View Feedbacks', path: '/viewFeedbacks', roles: ['admin', 'vice president', 'director'] },
    ];

    const filteredNavItems = navItems.filter(item => item.roles.includes(role));

    const toggleAccordion = () => {
        setIsAccordionOpen(!isAccordionOpen);
    };

    const handleProfileMouseEnter = () => {
        setIsProfileHovered(true);
    };

    const handleProfileMouseLeave = () => {
        setIsProfileHovered(false);
    };

    const [isLogoHovered, setIsLogoHovered] = useState(false);

    const handleLogoMouseEnter = () => {
        setIsLogoHovered(true);
    };

    const handleLogoMouseLeave = () => {
        setIsLogoHovered(false);
    };

    return (
        <div>
            <div className="bg-[#2D5990] text-white shadow-2xl rounded-b-xl flex items-center justify-between px-4 h-16 sm:h-20">
                <div className="flex-1 invisible sm:visible">
                    {isLoggedIn && <div className="w-8 h-8 sm:w-10 sm:h-10"></div>}
                </div>

                <div className="flex-1 flex justify-center relative">
                    <div
                        className="relative inline-block"
                        onMouseEnter={handleLogoMouseEnter}
                        onMouseLeave={handleLogoMouseLeave}
                    >
                        <img
                            src='/9logo.jpg'
                            alt="Nine Education IIT Academy"
                            className="h-8 md:h-16 transition-transform duration-300 transform hover:scale-105"
                        />
                        {isLogoHovered && (
                            <Confetti
                                width={250}
                                height={650}
                                numberOfPieces={300}
                                gravity={0.1}
                                recycle={false}
                                tweenDuration={1000}
                                className="absolute top-0 left-0"
                                colors={['#2D5990', '#00A0E3', '#FFFFFF']}
                            />
                        )}
                    </div>
                </div>

                <div className="flex-1 flex justify-end items-center">
                    {isLoggedIn ? (
                        <>
                            <div
                                className="relative"
                                onMouseEnter={handleProfileMouseEnter}
                                onMouseLeave={handleProfileMouseLeave}
                            >
                                <img
                                    src="/profileicon.jpeg"
                                    alt="Profile"
                                    className={`w-12 h-12 rounded-full mr-2 cursor-pointer transition-transform duration-300 transform ${isProfileHovered ? 'scale-110' : ''}`}
                                    onClick={toggleAccordion}
                                />
                                {isAccordionOpen && (
                                    <div className="absolute top-14 right-0 bg-white text-black rounded-lg shadow-xl p-4 w-48 z-50 text-xs md:text-sm">
                                        <p><strong>Name:</strong> {name}</p>
                                        <p><strong>Role:</strong> <span className='uppercase'>{role}</span></p>
                                        <p><strong>Subject:</strong> <span className='uppercase'>{subject}</span></p>
                                        <button
                                            onClick={handleLogout}
                                            className="mt-4 rounded-full bg-[#2D5990] hover:bg-[#00A0E3] text-white font-medium py-2 px-4 transition-colors duration-300"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="ml-2 sm:hidden focus:outline-none"
                            >
                                <svg
                                    className={`w-6 h-6 fill-current transition-transform duration-300 transform ${isMenuOpen ? 'rotate-90' : ''}`}
                                    viewBox="0 0 24 24"
                                >
                                    {isMenuOpen ? (
                                        <path
                                            fillRule="evenodd"
                                            d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z"
                                        />
                                    ) : (
                                        <path
                                            fillRule="evenodd"
                                            d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2z"
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
                                className={`px-4 py-2 text-white font-bold rounded-full transition-colors duration-300 ${location.pathname === item.path ? 'bg-[#2D5990] hover:bg-[#2D5990] active-button' : 'bg-[#00A0E3] hover:bg-[#2D5990]'}`}
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