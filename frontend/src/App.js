import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import Dashboard from './components/Dashboard';
import UpdateStudent from './components/UpdateStudent';
import LoginPage from './components/LoginPage';
import AddTeachers from './components/AddTeachers';



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
          <Route path="/add-teacher" element={isLoggedIn() ? <AddTeachers /> : <Navigate replace to="/" />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
