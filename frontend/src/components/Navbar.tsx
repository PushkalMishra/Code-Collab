import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css'; // Assuming App.css contains general styles, or create Navbar.css
import { useAuth } from '../context/AuthContext'; // Import useAuth

interface NavbarProps {
  isLoggedIn: boolean;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn, onLogout }) => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Destructure login from useAuth, though not directly used here for now

  const handleCategoriesClick = (event: React.MouseEvent) => {
    if (!isLoggedIn) {
      event.preventDefault(); // Prevent default link navigation
      alert('Please login first to access this page.');
    } else {
      // If logged in, navigation will proceed normally via Link or could be explicitly navigated
      navigate('/home');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">CodeCollab</div>
      <ul className="navbar-links">
        <li><Link to="/">Course</Link></li>
        <li><Link to="/home" onClick={handleCategoriesClick}>Create Room</Link></li>
        <li><Link to="/about-us">About us</Link></li>
      </ul>
      <div className="navbar-auth">
        {isLoggedIn ? (
          <button onClick={onLogout} className="get-started-button">Logout</button>
        ) : (
          <button className="get-started-button">Get Started</button>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 