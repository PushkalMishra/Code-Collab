import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import '../App.css';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook

const LandingPage = () => {
  const { isLoggedIn, login, logout } = useAuth(); // Use the auth context
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isRegistering, setIsRegistering] = useState(false); // State to toggle between login/register

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        login(data.token, data.username, data.email); // Store token and user data
        alert(data.message);
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('An error occurred during login.');
    }
  };

  const handleRegister = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, fullName, phoneNumber }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        setIsRegistering(false); // Switch back to login form after successful registration
        setEmail('');
        setPassword('');
        setUsername('');
        setFullName('');
        setPhoneNumber('');
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      alert('An error occurred during registration.');
    }
  };

  return (
    <div className="landing-page">
      <Navbar isLoggedIn={isLoggedIn} onLogout={logout} />
      <div className="landing-content">
        <div className="hero-section">
          <h1>Digital Skills for Engineers & Designers</h1>
          <p>Master BIM, AutoCAD, Revit & More</p>
          <p>With Real World Projects</p>
          <div className="hero-buttons">
            <button className="get-started-button">Get Started</button>
            <button className="youtube-button">Youtube</button>
          </div>
        </div>
        <div className={`login-section ${isRegistering ? 'is-registering' : ''}`}>
          <div className="flip-card">
            <div className="flip-card-inner">
              <div className="flip-card-front">
                <div className="login-card">
                  <h2>Login</h2>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <a href="#" className="forgot-password">Forgot Password?</a>
                  <button className="continue-button" onClick={handleLogin}>Continue</button>
                  <p className="register-link">New User? <a href="#" onClick={() => setIsRegistering(true)}>Register</a></p>
                </div>
              </div>
              <div className="flip-card-back">
                <div className="register-card">
                  <h2>Register</h2>
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Full Name (Optional)"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Phone Number (Optional)"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  <button className="continue-button" onClick={handleRegister}>Register</button>
                  <p className="login-link">Already have an account? <a href="#" onClick={() => setIsRegistering(false)}>Login</a></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 