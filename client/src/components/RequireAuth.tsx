import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';

interface RequireAuthProps {
  children: React.ReactNode;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const accessToken = Cookies.get('access_token');
  const refreshToken = Cookies.get('refresh_token');
  const location = useLocation();

  if (!accessToken && !refreshToken) {
    const isRoot = location.pathname === '/' && !location.search;
    const redirectTo = isRoot 
      ? '/connect' 
      : `/connect?next=${encodeURIComponent(location.pathname + location.search)}`;

    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;