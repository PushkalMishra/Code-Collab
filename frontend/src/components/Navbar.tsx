import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthModal from './Auth/AuthModal';
import { HomeIcon, PlusCircleIcon, InformationCircleIcon, UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

interface NavbarProps {
  isLoggedIn: boolean;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn, onLogout }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 lg:px-12 bg-gray-900 relative">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">C</span>
        </div>
        <span className="text-white font-bold text-xl">CodeCollab</span>
      </div>
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-8">
        <Link to="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
        <Link to="/home" onClick={handleCategoriesClick} className="text-gray-300 hover:text-white transition-colors">Create Room</Link>
        <Link to="/about-us" className="text-gray-300 hover:text-white transition-colors">About us</Link>
      </div>
      {/* Desktop Auth Button */}
      <div className="hidden md:block navbar-auth">
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
      {/* Mobile Hamburger Button */}
      <div className="md:hidden">
        <button
          onClick={handleMobileMenuToggle}
          className="text-white hover:text-gray-300 focus:outline-none"
          aria-label="Open menu"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>
      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full right-4 md:hidden z-50">
          <div className="bg-gray-900 border-t border-gray-700 min-w-max mt-2 rounded-lg shadow-lg px-4 py-4 space-y-4 backdrop-blur-sm">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
              onClick={closeMobileMenu}
            >
              <HomeIcon className="w-5 h-5" /> Home
            </Link>
            <Link 
              to="/home" 
              onClick={(e) => {
                closeMobileMenu();
                handleCategoriesClick(e);
              }} 
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <PlusCircleIcon className="w-5 h-5" /> Create Room
            </Link>
            <Link 
              to="/about-us" 
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
              onClick={closeMobileMenu}
            >
              <InformationCircleIcon className="w-5 h-5" /> About us
            </Link>
            <div className="pt-4 border-t border-gray-700">
              {isLoggedIn ? (
                <button 
                  onClick={() => {
                    closeMobileMenu();
                    onLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all duration-200"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" /> Logout
                </button>
              ) : (
                <button 
                  onClick={() => {
                    closeMobileMenu();
                    setIsModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all duration-200"
                >
                  <UserIcon className="w-5 h-5" /> Get Started
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {isModalOpen && <AuthModal onClose={() => setIsModalOpen(false)} />}
    </nav>
  );
};

export default Navbar; 