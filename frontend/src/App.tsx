import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Editor from './pages/EditorPage';
import './App.css';
import { FileContextProvider } from './context/FileContext';
import { SocketContextProvider } from './context/SocketContext';
import { AppContextProvider } from './context/AppContext';

function App() {
  return (
    <Router>
      <AppContextProvider>
        <SocketContextProvider socket={null}>
          <FileContextProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/join/:roomId" element={<Home />} />
              <Route path="/editor/:roomId" element={<Editor />} />
            </Routes>
          </FileContextProvider>
        </SocketContextProvider>
      </AppContextProvider>
    </Router>
  );
}

export default App;
