import React from 'react';
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
import AddAttendance from './components/AddAttendance';
import StudentAssessment from './components/StudentAssessment';
import StudentECA from './components/StudentECA';
import ForgotPasswordPage from './components/ForgotPasswordPage'; // Import the ForgotPasswordPage component

function App() {
  const { user } = useAuth();

  const userHasRequiredRole = (roles) => {
    return user && roles.includes(user.role);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={user ? (user.role === 'receptionist' ? <Navigate replace to="/addAttendance" /> : <Navigate replace to="/dashboard" />) : <LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} /> {/* Add the forgot password route */}
          <Route path="/dashboard" element={userHasRequiredRole(['admin', 'teacher', 'vice president', 'director']) ? <Dashboard /> : <Navigate replace to="/" />} />
          <Route path="/updateStudent" element={userHasRequiredRole(['admin', 'director']) ? <UpdateStudent /> : <Navigate replace to="/" />} />
          <Route path="/addTeacher" element={userHasRequiredRole(['admin', 'director', 'vice president']) ? <AddTeachers /> : <Navigate replace to="/" />} />
          <Route path="/sessionsAndAllotments" element={userHasRequiredRole(['admin', 'director']) ? <SessionAndAllotments /> : <Navigate replace to="/" />} />
          <Route path="/pendingSessions" element={userHasRequiredRole(['teacher']) ? <PendingSessions /> : <Navigate replace to="/" />} />
          <Route path="/completedSessions" element={userHasRequiredRole(['teacher']) ? <CompletedSessions /> : <Navigate replace to="/" />} />
          <Route path="/assessment/:name" element={userHasRequiredRole(['teacher']) ? <StudentAssessment /> : <Navigate replace to="/" />} />
          <Route path="/eca/:applicationNumber/:studentName" element={userHasRequiredRole(['vice president']) ? <StudentECA /> : <Navigate replace to="/" />} />
          <Route path="/upcomingSessions" element={userHasRequiredRole(['teacher']) ? <UpcomingSessions /> : <Navigate replace to="/" />} />
          <Route path="/viewFeedbacks" element={userHasRequiredRole(['admin', 'vice president', 'director']) ? <ViewFeedbacks /> : <Navigate replace to="/" />} />
          <Route path="/addAttendance" element={userHasRequiredRole(['admin', 'receptionist']) ? <AddAttendance /> : <Navigate replace to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
