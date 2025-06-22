import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth

interface NavbarProps {
  isLoggedIn: boolean;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn, onLogout }) => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Destructure login from useAuth, though not directly used here for now

  const handleCategoriesClick = (event: React.MouseEvent) => {
    if (!isLoggedIn) {
      event.preventDefault(); // Prevent default link navigation
      alert('Please login first to access this page.');
    } else {
      // If logged in, navigation will proceed normally via Link or could be explicitly navigated
      navigate('/home');
    }
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 lg:px-12 bg-gray-900">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">C</span>
        </div>
        <span className="text-white font-bold text-xl">CodeCollab</span>
      </div>
      
      <div className="hidden md:flex items-center space-x-8">
        <Link to="/" className="text-gray-300 hover:text-white transition-colors">Course</Link>
        <Link to="/home" onClick={handleCategoriesClick} className="text-gray-300 hover:text-white transition-colors">Create Room</Link>
        <Link to="/about-us" className="text-gray-300 hover:text-white transition-colors">About us</Link>
      </div>
      
      <div className="navbar-auth">
        {isLoggedIn ? (
          <button 
            onClick={onLogout} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all duration-200 hover:scale-105"
          >
            Logout
          </button>
        ) : (
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all duration-200 hover:scale-105"
          >
            Get Started
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 