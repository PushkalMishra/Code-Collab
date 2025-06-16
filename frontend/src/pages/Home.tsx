import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../App.css';
import RoomForm from '../components/RoomForm';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const generateRoomId = () => {
  return Math.random().toString(36).substr(2, 9);
};

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
    <div className="landing-page">
      <Navbar isLoggedIn={isLoggedIn} onLogout={logout} />
      <div className="landing-content">
        <div className="room-form-section">
          <div className="room-card">
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
            />
          </div>
        </div>
        <div className="home-illustration-new">
          <img src="https://raw.githubusercontent.com/smthari/Switchable-signup-and-login-page/master/Images/person.png" alt="Illustration" style={{ maxWidth: '100%', height: 'auto' }} />
        </div>
      </div>
    </div>
  );
};

export default Home; 