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
  
  // Message states
  const [loginMessage, setLoginMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [registerMessage, setRegisterMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const clearMessages = () => {
    setLoginMessage(null);
    setRegisterMessage(null);
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setLoginMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    setIsLoading(true);
    clearMessages();

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      
      if (response.ok) {
        login(data.token, data.username, data.email, data.userId);
        // Don't show success message, just close modal
        onClose();
      } else {
        setLoginMessage({ type: 'error', text: data.message || 'Login failed' });
      }
    } catch (error) {
      console.error('Error during login:', error);
      setLoginMessage({ type: 'error', text: 'An error occurred during login. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      setRegisterMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    setIsLoading(true);
    clearMessages();

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, fullName, phoneNumber }),
      });
      const data = await response.json();
      
      if (response.ok) {
        setRegisterMessage({ type: 'success', text: data.message });
        // Clear form after successful registration
        setTimeout(() => {
          setIsRegistering(false);
          setEmail('');
          setPassword('');
          setUsername('');
          setFullName('');
          setPhoneNumber('');
          setRegisterMessage(null);
        }, 2000);
      } else {
        setRegisterMessage({ type: 'error', text: data.message || 'Registration failed' });
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setRegisterMessage({ type: 'error', text: 'An error occurred during registration. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (isRegister: boolean) => {
    setIsRegistering(isRegister);
    clearMessages();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md relative text-gray-800">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        
        <div className="flex border-b mb-6">
          <button 
            onClick={() => handleTabChange(false)} 
            className={`flex-1 py-2 text-center text-lg font-semibold ${!isRegistering ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          >
            Login
          </button>
          <button 
            onClick={() => handleTabChange(true)} 
            className={`flex-1 py-2 text-center text-lg font-semibold ${isRegistering ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          >
            Register
          </button>
        </div>

        {isRegistering ? (
          <div>
            <h2 className="text-2xl font-bold mb-2 text-center">Create Account</h2>
            <p className="text-center text-gray-600 mb-6">Let's get you started!</p>
            
            {/* Register Message */}
            {registerMessage && (
              <div className={`mb-4 p-3 rounded text-sm ${registerMessage.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>
                {registerMessage.text}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                Username *
              </label>
              <input 
                id="username" 
                type="text" 
                placeholder="Enter your username" 
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email *
              </label>
              <input 
                id="email" 
                type="email" 
                placeholder="Enter your email" 
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fullName">
                Full Name
              </label>
              <input 
                id="fullName" 
                type="text" 
                placeholder="Enter your full name" 
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phoneNumber">
                Phone Number
              </label>
              <input 
                id="phoneNumber" 
                type="tel" 
                placeholder="Enter your phone number" 
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={phoneNumber} 
                onChange={(e) => setPhoneNumber(e.target.value)} 
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Password *
              </label>
              <input 
                id="password" 
                type="password" 
                placeholder="Enter your password" 
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>
            <button 
              onClick={handleRegister} 
              disabled={isLoading}
              className={`w-full font-bold py-2 px-4 rounded transition-colors ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isLoading ? 'Creating Account...' : 'Register'}
            </button>
            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account? <button onClick={() => handleTabChange(false)} className="text-blue-600 hover:underline">Sign In</button>
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-2 text-center">Welcome Back</h2>
            <p className="text-center text-gray-600 mb-6">Sign in to your account to continue</p>
            
            {/* Login Message */}
            {loginMessage && (
              <div className={`mb-4 p-3 rounded text-sm ${loginMessage.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>
                {loginMessage.text}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="login-email">
                Email *
              </label>
              <input 
                id="login-email" 
                type="email" 
                placeholder="Enter your email" 
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="login-password">
                Password *
              </label>
              <input 
                id="login-password" 
                type="password" 
                placeholder="Enter your password" 
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>
            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center text-sm text-gray-600">
                <input type="checkbox" className="mr-2" />
                Remember me
              </label>
              <a href="#" className="text-sm text-blue-600 hover:underline">Forgot password?</a>
            </div>
            <button 
              onClick={handleLogin} 
              disabled={isLoading}
              className={`w-full font-bold py-2 px-4 rounded transition-colors ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
            <p className="text-center text-sm text-gray-600 mt-4">
              Don't have an account? <button onClick={() => handleTabChange(true)} className="text-blue-600 hover:underline">Sign up</button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal; 