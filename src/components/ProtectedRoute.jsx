// ProtectedRoute.jsx
// Experiment 1.3.2 — Role-based access control for routes
//
// Usage (with react-router-dom v6):
//   <Route element={<ProtectedRoute roles={['admin']} />}>
//     <Route path="/admin" element={<AdminPage />} />
//   </Route>

import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { selectIsAuthenticated, selectHasRole } from '../store/authSelectors';

export default function ProtectedRoute({ roles }) {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const hasRole = useSelector((state) =>
    roles ? selectHasRole(state, roles) : true
  );

  if (!isAuthenticated) {
    // Not logged in — redirect to login, remembering where they came from
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !hasRole) {
    // Logged in, but role isn't permitted for this route
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}