import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../App.css';
import RoomForm from '../components/RoomForm';

const generateRoomId = () => {
  return Math.random().toString(36).substr(2, 9);
};

const Home: React.FC = () => {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract roomId from URL if present
  useEffect(() => {
    const pathParts = location.pathname.split('/');
    if (pathParts.length > 1 && pathParts[1] === 'join') {
      const urlRoomId = pathParts[2];
      if (urlRoomId) {
        setRoomId(urlRoomId);
        setIsJoining(true);
      }
    }
  }, [location]);

  const handleGenerateRoomId = () => {
    setRoomId(generateRoomId());
  };

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

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      alert('Please enter a username');
      return;
    }
    const newRoomId = roomId || generateRoomId();
    setRoomId(newRoomId);
    navigate(`/editor/${newRoomId}`, { state: { username } });
  };

  return (
    <div className="home-container">
      <div className="home-illustration">
        {/* Placeholder SVG illustration */}
        <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="400" rx="40" fill="#1A1A2E" />
          {/* Abstract shapes in a blue/purple theme */}
          <circle cx="100" cy="100" r="60" fill="#4E4A96" fillOpacity="0.3" />
          <rect x="150" y="200" width="150" height="100" rx="20" fill="#6A0572" fillOpacity="0.4" />
          <path d="M300 100 L350 150 L300 200 Z" fill="#9D0208" fillOpacity="0.5" />
          <path d="M100 300 L150 350 L200 300 Z" fill="#00B4D8" fillOpacity="0.5" />
        </svg>
      </div>
      <div className="home-form-section">
        <div className="home-title">
          <span className="logo-icon">💻</span>
          <span className="logo-text">Code <span className="logo-sync">Collab</span></span>
          <div className="home-subtitle">Code, Chat and Collaborate. It's All in Sync.</div>
        </div>
        <RoomForm
          roomId={roomId}
          setRoomId={setRoomId}
          username={username}
          setUsername={setUsername}
          handleJoin={handleJoin}
          handleCreate={handleCreate}
          handleGenerateRoomId={handleGenerateRoomId}
          isJoining={isJoining}
        />
      </div>
    </div>
  );
};

export default Home; 