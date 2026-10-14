import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import Loader from '../common/Loader';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isInitialized } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isInitialized) {
    return <Loader fullScreen message="Restoring session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
