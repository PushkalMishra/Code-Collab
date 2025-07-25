import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import RoomForm from '../components/RoomForm';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/Auth/AuthModal';
import { isTokenExpired } from '../utils/tokenUtils';

const Home: React.FC = () => {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'join' | 'create' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, logout } = useAuth();

  // Extract roomId from URL if present
  useEffect(() => {
    const pathParts = location.pathname.split('/');
    if (pathParts.length > 1 && pathParts[1] === 'join') {
      const urlRoomId = pathParts[2];
      if (urlRoomId) {
        setRoomId(urlRoomId);
        
        // If user is logged in but token is expired, logout and show auth modal
        if (isLoggedIn) {
          const token = localStorage.getItem('token');
          if (!token || isTokenExpired(token)) {
            logout();
            setPendingAction('join');
            setIsModalOpen(true);
          }
        }
      }
    }
  }, [location, isLoggedIn, logout]);

  // If user logs in while modal is open and there is a pending action, perform it
  React.useEffect(() => {
    if (isLoggedIn && isModalOpen && pendingAction) {
      setIsModalOpen(false);
      if (pendingAction === 'join') {
        doJoin();
      } else if (pendingAction === 'create') {
        doCreate();
      }
      setPendingAction(null);
    }
  }, [isLoggedIn, isModalOpen, pendingAction]);

  const clearError = () => {
    setErrorMessage(null);
  };

  const doJoin = () => {
    if (!username.trim()) {
      setErrorMessage('Please enter a username');
      return;
    }
    if (!roomId.trim()) {
      setErrorMessage('Please enter a Room ID');
      return;
    }
    clearError();
    navigate(`/editor/${roomId}`, { state: { username } });
  };

  const doCreate = () => {
    if (!username.trim()) {
      setErrorMessage('Please enter a username');
      return;
    }
    clearError();
    const newRoomId = roomId || Math.random().toString(36).substr(2, 9);
    setRoomId(newRoomId);
    navigate(`/editor/${newRoomId}`, { state: { username } });
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    // Check if user is logged in
    if (!isLoggedIn) {
      setPendingAction('join');
      setIsModalOpen(true);
      return;
    }

    // Check if token is expired
    const token = localStorage.getItem('token');
    if (!token || isTokenExpired(token)) {
      // Token is expired, logout and show auth modal
      logout();
      setPendingAction('join');
      setIsModalOpen(true);
      return;
    }

    doJoin();
  };

  const generateRoomId = () => {
    const newRoomId = Math.random().toString(36).substr(2, 9);
    setRoomId(newRoomId);
    clearError();
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    // Check if user is logged in
    if (!isLoggedIn) {
      setPendingAction('create');
      setIsModalOpen(true);
      return;
    }

    // Check if token is expired
    const token = localStorage.getItem('token');
    if (!token || isTokenExpired(token)) {
      // Token is expired, logout and show auth modal
      logout();
      setPendingAction('create');
      setIsModalOpen(true);
      return;
    }

    doCreate();
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white flex flex-col">
      <Navbar isLoggedIn={isLoggedIn} onLogout={logout} />
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-md">
          <RoomForm
            roomId={roomId}
            setRoomId={setRoomId}
            username={username}
            setUsername={setUsername}
            handleJoin={handleJoin}
            handleCreate={handleCreate}
            generateRoomId={generateRoomId}
            errorMessage={errorMessage}
            clearError={clearError}
          />
        </div>
      </div>
      {isModalOpen && <AuthModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default Home; 