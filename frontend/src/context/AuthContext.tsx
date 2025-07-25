import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { isTokenExpired } from '../utils/tokenUtils';

interface AuthContextType {
  isLoggedIn: boolean;
  user: { username: string; email: string; userId: string } | null;
  login: (token: string, username: string, email: string, userId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<{ username: string; email: string; userId: string } | null>(null);

  useEffect(() => {
    // Check for token in localStorage on initial load
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    const storedEmail = localStorage.getItem('email');
    const storedUserId = localStorage.getItem('userId');

    if (token && storedUsername && storedUserId) {
      // Check if token is expired
      if (isTokenExpired(token)) {
        // Token is expired, clear all auth data
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('email');
        localStorage.removeItem('userId');
        setIsLoggedIn(false);
        setUser(null);
        return;
      }
      
      // Token is valid, set logged in state
      setIsLoggedIn(true);
      setUser({ username: storedUsername, email: storedEmail || '', userId: storedUserId });
    }
  }, []);

  const login = (token: string, username: string, email: string, userId: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    localStorage.setItem('email', email);
    localStorage.setItem('userId', userId);
    setIsLoggedIn(true);
    setUser({ username, email, userId });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 