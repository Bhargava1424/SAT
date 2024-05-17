// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './components/AuthContext';
import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';
import UpdateStudent from './components/UpdateStudent';
import AddTeachers from './components/AddTeachers';
import PendingSessions from './components/PendingSessions';
import CompletedSessions from './components/CompletedSessions';
import UpcomingSessions from './components/UpcomingSessions';
import ViewFeedbacks from './components/ViewFeedbacks';
import SessionAndAllotments from './components/SessionsAndAllotments';


function App() {
  const { user } = useAuth();

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={user ? <Navigate replace to="/dashboard" /> : <LoginPage />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate replace to="/" />} />
          <Route path="/updateStudent" element={user ? <UpdateStudent /> : <Navigate replace to="/" />} />
          <Route path="/addTeacher" element={user ? <AddTeachers /> : <Navigate replace to="/" />} />
          <Route path="/sessions&Allotments" element={user ? <SessionAndAllotments /> : <Navigate replace to="/" />} />
          <Route path="/pendingSessions" element={user ? <PendingSessions /> : <Navigate replace to="/" />} />
          <Route path="/completedSessions" element={user ? <CompletedSessions /> : <Navigate replace to="/" />} />
          <Route path="/upcomingSessions" element={user ? <UpcomingSessions /> : <Navigate replace to="/" />} />
          <Route path="/viewFeedbacks" element={user ? <ViewFeedbacks /> : <Navigate replace to="/" />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;