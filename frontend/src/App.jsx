import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

// A simple wrapper to protect the dashboard from logged-out users
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('king777_user');
  return isAuthenticated ? children : <Navigate to="/" />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}