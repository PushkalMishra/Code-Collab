import React, { useState } from 'react';
import './App.css';
import RoomForm from './components/RoomForm';
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
          <rect width="400" height="400" rx="40" fill="#23272F" />
          <circle cx="200" cy="200" r="100" fill="#6EE7B7" fillOpacity="0.2" />
          <rect x="120" y="160" width="160" height="80" rx="16" fill="#6EE7B7" fillOpacity="0.4" />
        </svg>
      </div>
      <div className="home-form-section">
        <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="github-corner">
          {/* GitHub icon SVG */}
          <svg height="32" viewBox="0 0 16 16" width="32" fill="#fff" style={{position: 'absolute', top: 0, right: 0}} aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
        </a>
        <div className="home-title">
          <span className="logo-icon">🟢</span>
          <span className="logo-text">Code <span className="logo-sync">Sync</span></span>
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