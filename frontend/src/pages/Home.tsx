import React, { useState } from 'react';
import '../App.css';
import RoomForm from '../components/RoomForm';
import { useNavigate } from 'react-router-dom';

const generateRoomId = () => {
  return Math.random().toString(36).substr(2, 9);
};

const Home: React.FC = () => {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleGenerateRoomId = () => {
    setRoomId(generateRoomId());
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId && username) {
      navigate(`/editor/${roomId}`, { state: { username } });
    } else {
      alert('Please enter both Room ID and Username');
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newRoomId = roomId || generateRoomId();
    setRoomId(newRoomId);
    if (username) {
      navigate(`/editor/${newRoomId}`, { state: { username } });
    } else {
      alert('Please enter a Username');
    }
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
        />
      </div>
    </div>
  );
};

export default Home; 