import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import RoomForm from '../components/RoomForm';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
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

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
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

  const generateRoomId = () => {
    const newRoomId = Math.random().toString(36).substr(2, 9);
    setRoomId(newRoomId);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      alert('Please enter a username');
      return;
    }
    const newRoomId = roomId || Math.random().toString(36).substr(2, 9);
    setRoomId(newRoomId);
    navigate(`/editor/${newRoomId}`, { state: { username } });
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
    </div>
  );
};

export default Home; 