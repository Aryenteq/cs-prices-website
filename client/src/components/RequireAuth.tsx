import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';

interface RequireAuthProps {
  children: React.ReactNode;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const token = Cookies.get('token');
  const location = useLocation();

  if (!token) {
    const isRoot = location.pathname === '/' && !location.search;
    const redirectTo = isRoot 
      ? '/connect' 
      : `/connect?next=${encodeURIComponent(location.pathname + location.search)}`;

    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;