import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Editor from './pages/EditorPage';
import LandingPage from './pages/LandingPage';
// import RegisterPage from './pages/RegisterPage'; // Removed import
import AboutUsPage from './pages/AboutUsPage';
// import ContactPage from './pages/ContactPage'; // Removed ContactPage import
import './App.css';
// import { SocketContextProvider } from './context/SocketContext'; // Removed import
import { AppContextProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContextProvider>
          {/* <SocketContextProvider socket={null}> Removed SocketContextProvider */}
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/home" element={<Home />} />
                <Route path="/join/:roomId" element={<Home />} />
                <Route path="/editor/:roomId" element={<Editor />} />
                {/* <Route path="/register" element={<RegisterPage />} /> Removed route */}
                <Route path="/about-us" element={<AboutUsPage />} />
              {/* <Route path="/contact" element="" /> Removed Contact route */}
              </Routes>
          {/* </SocketContextProvider> */}
        </AppContextProvider>
      </AuthProvider>
      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </Router>
  );
}

export default App;
