import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  user: { username: string; email: string } | null;
  login: (token: string, username: string, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);

  useEffect(() => {
    // Check for token in localStorage on initial load
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    const storedEmail = localStorage.getItem('email');

    if (token && storedUsername && storedEmail) {
      setIsLoggedIn(true);
      setUser({ username: storedUsername, email: storedEmail });
    }
  }, []);

  const login = (token: string, username: string, email: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    localStorage.setItem('email', email);
    setIsLoggedIn(true);
    setUser({ username, email });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
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