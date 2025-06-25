import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import RoomForm from '../components/RoomForm';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/Auth/AuthModal';

const Home: React.FC = () => {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'join' | 'create' | null>(null);
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
      }
    }
  }, [location]);

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

  const doJoin = () => {
    if (!username.trim()) {
      alert('Please enter a username');
      return;
    }
    if (!roomId.trim()) {
      alert('Please enter a Room ID');
      return;
    }
    navigate(`/editor/${roomId}`, { state: { username } });
  };

  const doCreate = () => {
    if (!username.trim()) {
      alert('Please enter a username');
      return;
    }
    const newRoomId = roomId || Math.random().toString(36).substr(2, 9);
    setRoomId(newRoomId);
    navigate(`/editor/${newRoomId}`, { state: { username } });
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setPendingAction('join');
      setIsModalOpen(true);
      return;
    }
    doJoin();
  };

  const generateRoomId = () => {
    const newRoomId = Math.random().toString(36).substr(2, 9);
    setRoomId(newRoomId);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
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
          />
        </div>
      </div>
      {isModalOpen && <AuthModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default Home; 