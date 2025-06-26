import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = async () => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        login(data.token, data.username, data.email, data.userId);
        alert(data.message);
        onClose();
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
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, fullName, phoneNumber }),
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        setIsRegistering(false);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md relative text-gray-800">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        
        <div className="flex border-b mb-6">
          <button 
            onClick={() => setIsRegistering(false)} 
            className={`flex-1 py-2 text-center text-lg font-semibold ${!isRegistering ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          >
            Login
          </button>
          <button 
            onClick={() => setIsRegistering(true)} 
            className={`flex-1 py-2 text-center text-lg font-semibold ${isRegistering ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          >
            Register
          </button>
        </div>

        {isRegistering ? (
          <div>
            <h2 className="text-2xl font-bold mb-2 text-center">Create Account</h2>
            <p className="text-center text-gray-600 mb-6">Let's get you started!</p>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                Username
              </label>
              <input id="username" type="text" placeholder="Enter your username" className="w-full border border-gray-300 rounded px-4 py-2" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input id="email" type="email" placeholder="Enter your email" className="w-full border border-gray-300 rounded px-4 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input id="password" type="password" placeholder="Enter your password" className="w-full border border-gray-300 rounded px-4 py-2" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button onClick={handleRegister} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Register
            </button>
            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account? <button onClick={() => setIsRegistering(false)} className="text-blue-600 hover:underline">Sign In</button>
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-2 text-center">Welcome Back</h2>
            <p className="text-center text-gray-600 mb-6">Sign in to your account to continue</p>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="login-email">
                Email
              </label>
              <input id="login-email" type="email" placeholder="Enter your email" className="w-full border border-gray-300 rounded px-4 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="login-password">
                Password
              </label>
              <input id="login-password" type="password" placeholder="Enter your password" className="w-full border border-gray-300 rounded px-4 py-2" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center text-sm text-gray-600">
                <input type="checkbox" className="mr-2" />
                Remember me
              </label>
              <a href="#" className="text-sm text-blue-600 hover:underline">Forgot password?</a>
            </div>
            <button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Sign In
            </button>
            <p className="text-center text-sm text-gray-600 mt-4">
              Don't have an account? <button onClick={() => setIsRegistering(true)} className="text-blue-600 hover:underline">Sign up</button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal; 