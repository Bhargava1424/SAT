import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './components/AuthContext';
import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';
import UpdateStudent from './components/UpdateStudent';
import AddTeachers from './components/AddTeachers';
import PendingSessions from './components/pendingSessions';
import CompletedSessions from './components/completedSessions';

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={user ? <Navigate replace to="/dashboard" /> : <LoginPage />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate replace to="/" />} />
          <Route path="/updateStudent" element={user ? <UpdateStudent /> : <Navigate replace to="/" />} />
          <Route path="/add-teacher" element={user ? <AddTeachers /> : <Navigate replace to="/" />} />
          <Route path="/pendingSessions" element={user ? <PendingSessions /> : <Navigate replace to="/" />} />
          <Route path="/completedSessions" element={user ? <CompletedSessions /> : <Navigate replace to="/" />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
