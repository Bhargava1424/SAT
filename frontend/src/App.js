import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import Dashboard from './components/Dashboard';
import UpdateStudent from './components/UpdateStudent';
import LoginPage from './components/LoginPage';

function App() {
  const isLoggedIn = () => {
    // Implement check based on your authentication logic
    return sessionStorage.getItem('username') ? true : false;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={isLoggedIn() ? <Navigate replace to="/dashboard" /> : <LoginPage />} />
          <Route path="/dashboard" element={isLoggedIn() ? <Dashboard /> : <Navigate replace to="/" />} />
          <Route path="/updateStudent" element={isLoggedIn() ? <UpdateStudent /> : <Navigate replace to="/" />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
