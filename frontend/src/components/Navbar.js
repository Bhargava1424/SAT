import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../Navbar.css';  // Assuming you create a Navbar.css file for additional styling

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
            {/* Left spacer - Always present but empty when logged out */}
            <div className="flex-1"></div>
      
            {/* Centered logo */}
            <div className="flex-1 flex justify-center">
            <img src='/9logo.jpg' alt="Nine Education IIT Academy" className="h-16 rounded-xl" />

            </div>
      
            {/* Right side - Logout button or spacer */}
            {isLoggedIn ? (
              <div className="flex-1 flex justify-end">
                <button onClick={handleLogout} className="rounded-2xl bg-[#00A0E3] px-4 py-2 hover:bg-blue-600">Logout</button>
              </div>
            ) : (
              <div className="flex-1"></div>
            )}
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
  
