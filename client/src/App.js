import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminLayout from './pages/Admin/AdminLayout';
import Dashboard from './pages/Admin/Dashboard';
import EventManagement from './pages/Admin/EventManagement';
import VenueManagement from './pages/Admin/VenueManagement';
import StaffManagement from './pages/Admin/StaffManagement';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="events" element={<EventManagement />} />
            <Route path="venues" element={<VenueManagement />} />
            <Route path="staff" element={<StaffManagement />} />
          </Route>
          
          {/* Placeholder for other roles */}
          <Route path="/faculty" element={<div className="p-5 text-center mt-5"><h4>Faculty Dashboard Coming Soon</h4><a href="/login">Logout</a></div>} />
          <Route path="/student" element={<div className="p-5 text-center mt-5"><h4>Student Dashboard Coming Soon</h4><a href="/login">Logout</a></div>} />
          <Route path="/staff" element={<div className="p-5 text-center mt-5"><h4>Staff Dashboard Coming Soon</h4><a href="/login">Logout</a></div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
