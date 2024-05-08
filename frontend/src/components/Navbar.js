import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../Navbar.css';  // Assuming you have a Navbar.css file for additional styling

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        sessionStorage.clear();
        alert("Logged out successfully!");
        navigate('/login', { replace: true });
    };

    const isLoggedIn = sessionStorage.getItem('username') && sessionStorage.getItem('role');
    const navItems = [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Update Student', path: '/updateStudent' },
        { name: 'Add Teacher', path: '/add-teacher' },
        { name: 'View Sessions', path: '/view-sessions' },
        { name: 'View Allotments', path: '/view-allotments' }
    ];

    return (
        <div>
            <div className="bg-[#2D5990] text-white shadow-2xl rounded-b-xl flex items-center justify-between px-4 h-20">
                {/* Invisible spacer to maintain symmetry */}
                <div className="flex-1 invisible">
                    {isLoggedIn && <div className="w-10 h-10"></div>}
                </div>
                
                {/* Centered logo */}
                <div className="flex-1 flex justify-center">
                    <img src='/9logo.jpg' alt="Nine Education IIT Academy" className="h-16" />
                </div>

                {/* Right side - Profile icon and Logout button or invisible spacer */}
                <div className="flex-1 flex justify-end items-center">
                    {isLoggedIn ? (
                        <>
                            <img src="/profileicon.jpeg" alt="Profile" className="w-10 h-10 rounded-full mr-2" />
                            <button onClick={handleLogout} className="rounded-2xl bg-[#00A0E3] px-4 py-2 hover:bg-blue-600">Logout</button>
                        </>
                    ) : (
                        <div className="w-10 h-10 invisible"></div> // Invisible spacer to balance the layout
                    )}
                </div>
            </div>
            {isLoggedIn && (
                <div className="flex justify-center space-x-4 p-4">
                    {navItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => navigate(item.path)}
                            className={`px-4 py-2 text-white font-bold transition-all duration-300 ${location.pathname === item.path ? 'bg-[#2D5990] active-button' : 'bg-[#00A0E3] rounded-xl hover:bg-blue-600'}`}
                        >
                            {item.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Navbar;
