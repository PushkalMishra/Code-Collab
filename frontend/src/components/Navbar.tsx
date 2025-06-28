import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthModal from './Auth/AuthModal';

interface NavbarProps {
  isLoggedIn: boolean;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn, onLogout }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Helper function to check if JWT token is expired
  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true; // If we can't decode the token, consider it expired
    }
  };

  const handleCategoriesClick = (event: React.MouseEvent) => {
    event.preventDefault(); // Prevent default link navigation
    
    if (!isLoggedIn) {
      // Show auth modal if not logged in
      setIsModalOpen(true);
      return;
    }

    // Check if token is expired
    const token = localStorage.getItem('token');
    if (!token || isTokenExpired(token)) {
      // Token is expired, logout and show auth modal
      onLogout();
      setIsModalOpen(true);
      return;
    }

    // If logged in and token is valid, navigate to home
    navigate('/home');
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
        <Link to="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
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
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all duration-200 hover:scale-105"
          >
            Get Started
          </button>
        )}
      </div>
      
      {isModalOpen && <AuthModal onClose={() => setIsModalOpen(false)} />}
    </nav>
  );
};

export default Navbar; 