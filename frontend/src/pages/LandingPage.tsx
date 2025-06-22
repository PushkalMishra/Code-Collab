import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/Auth/AuthModal';
import illustration from '../assets/illustration.svg';
import { useTypingEffect } from '../hooks/useTypingEffect';

const LandingPage = () => {
  const { isLoggedIn, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [text, setText] = useState('Lead Generation Specialist for Online Businesses');
  const typedText = useTypingEffect(text, 50);

  useEffect(() => {
    const interval = setInterval(() => {
      setText('');
      setTimeout(() => {
        setText('Lead Generation Specialist for Online Businesses');
      }, 100);
    }, 4000); // Repeat every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <Navbar isLoggedIn={isLoggedIn} onLogout={logout} />
      <main className="px-6 lg:px-12 py-12 lg:py-24">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 lg:pr-12 text-center lg:text-left">
            <p className="text-lg text-gray-400 mb-2">Marketing Agency</p>
            <h1 className="text-3xl lg:text-5xl font-bold leading-tight mb-4 h-22 lg:h-31.5">
              {typedText}
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              We help business owners increase their revenue. Our team of unique specialists can help you achieve your business goals.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 hover:scale-105"
            >
              Get Started
            </button>
          </div>
          <div className="lg:w-1/2 mt-12 lg:mt-0">
            <img src={illustration} alt="Lead Generation Illustration" className="w-5/6 h-auto ml-auto floating" />
          </div>
        </div>
      </main>
      {isModalOpen && <AuthModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default LandingPage; 