import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import Loader from './Loader';

const RoleRoute = ({ role, children }) => {
  const { isAuthenticated, user, initialLoading } = useSelector((state) => state.auth);

  if (initialLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader message="Verifying session..." size="md" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== role) {
    // Redirect to correct dashboard based on real user role
    return <Navigate to={user?.role === 'recruiter' ? '/recruiter/dashboard' : '/dashboard'} replace />;
  }

  return children;
};

export default RoleRoute;
