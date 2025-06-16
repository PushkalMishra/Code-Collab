import React from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import '../App.css';

const AboutUsPage = () => {
  const { isLoggedIn, logout } = useAuth();

  return (
    <div className="about-us-page">
      <Navbar isLoggedIn={isLoggedIn} onLogout={logout} />
      <div className="about-us-content">
        <h2>About CodeCollab</h2>
        <p>CodeCollab is a real-time collaborative code editor and development environment. Our mission is to provide a seamless platform for engineers and designers to work together on projects, share code, and learn from each other.</p>
        <p>With features like live code synchronization, integrated chat, and robust file management, CodeCollab aims to enhance productivity and foster a collaborative learning experience.</p>
        <p>Whether you're mastering BIM, AutoCAD, Revit, or working on new world projects, CodeCollab is designed to support your journey with real-time interaction and powerful tools.</p>
      </div>
    </div>
  );
};

export default AboutUsPage; 