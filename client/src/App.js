import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Admin Imports
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/Dashboard';
import EventManagement from './pages/Admin/EventManagement';
import VenueManagement from './pages/Admin/VenueManagement';
import StaffManagement from './pages/Admin/StaffManagement';

// Student Imports
import StudentLayout from './pages/Student/StudentLayout';
import StudentDashboard from './pages/Student/Dashboard';
import BrowseEvents from './pages/Student/BrowseEvents';
import EventDetails from './pages/Student/EventDetails';
import MyRegistrations from './pages/Student/MyRegistrations';
import MyQR from './pages/Student/MyQR';
import StudentForums from './pages/Student/Forums';

// Employee (Faculty/Staff) Imports
import EmployeeLayout from './pages/Employee/EmployeeLayout';
import EmployeeDashboard from './pages/Employee/Dashboard';
import AssignedEvents from './pages/Employee/AssignedEvents';
import EmployeeForums from './pages/Employee/Forums';
import EmployeeTasks from './pages/Employee/Tasks';

// Common User
import UserProfile from './pages/Common/Profile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="events" element={<EventManagement />} />
            <Route path="venues" element={<VenueManagement />} />
            <Route path="staff" element={<StaffManagement />} />
          </Route>
          
          {/* Student Routes */}
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<StudentDashboard />} />
            <Route path="browse" element={<BrowseEvents />} />
            <Route path="events/:id" element={<EventDetails />} />
            <Route path="registrations" element={<MyRegistrations />} />
            <Route path="qr" element={<MyQR />} />
            <Route path="forums" element={<StudentForums />} />
            <Route path="profile" element={<UserProfile />} />
          </Route>

          {/* Shared Employee Layout for Faculty and Support Staff */}
          <Route path="/faculty" element={<EmployeeLayout role="Faculty" />}>
            <Route index element={<EmployeeDashboard />} />
            <Route path="assigned" element={<AssignedEvents />} />
            <Route path="forums" element={<EmployeeForums />} />
            <Route path="profile" element={<UserProfile />} />
          </Route>

          <Route path="/staff" element={<EmployeeLayout role="Supporting Staff" />}>
            <Route index element={<EmployeeDashboard />} />
            <Route path="assigned" element={<AssignedEvents />} />
            <Route path="tasks" element={<EmployeeTasks />} />
            <Route path="forums" element={<EmployeeForums />} />
            <Route path="profile" element={<UserProfile />} />
          </Route>

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
