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
    <AppContextProvider>
      <SocketContextProvider socket={null}>
        <FileContextProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/editor/:roomId" element={<Editor />} />
            </Routes>
          </Router>
        </FileContextProvider>
      </SocketContextProvider>
    </AppContextProvider>
  );
}

export default App;
