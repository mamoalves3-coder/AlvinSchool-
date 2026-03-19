/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CourseProvider } from './context/CourseContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminDashboard } from './pages/AdminDashboard';
import { Home } from './pages/Home';
import { Classroom } from './pages/Classroom';
import { Library } from './pages/Library';
import { About } from './pages/About';
import { Terms } from './pages/Terms';
import { ProtectedRoute } from './components/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <CourseProvider>
        <Router>
          <Routes>
            <Route element={<Layout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
            <Route path="/terms" element={<Terms />} />
            
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />

            <Route path="/biblioteca" element={
              <ProtectedRoute>
                <Library />
              </ProtectedRoute>
            } />
            
            <Route path="/class/:id" element={
              <ProtectedRoute>
                <Classroom />
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </Router>
      </CourseProvider>
    </AuthProvider>
  );
}
