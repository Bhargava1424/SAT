import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Dashboard from './components/Dashboard';
import UpdateStudent from './components/UpdateStudent';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/UpdateStudent" element={<UpdateStudent />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;