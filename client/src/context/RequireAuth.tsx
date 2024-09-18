import React, { useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { AuthProvider } from './AuthContext';
import { JwtPayload } from '../props/jwtProps';

interface RequireAuthProps {
  children: React.ReactNode;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const accessToken = Cookies.get('access_token');
  const refreshToken = Cookies.get('refresh_token');
  const location = useLocation();

  const jwtInfo = useMemo(() => {
    if (accessToken) {
      try {
        return jwtDecode<JwtPayload>(accessToken);
      } catch (error) {
        console.error('Failed to decode access_token:', error);
        return null;
      }
    }
    return null;
  }, [accessToken]);

  if (!refreshToken || !jwtInfo) {
    const isRoot = location.pathname === '/' && !location.search;
    const redirectTo = isRoot
      ? '/connect'
      : `/connect?next=${encodeURIComponent(location.pathname + location.search)}`;

    return <Navigate to={redirectTo} replace />;
  }

  return (
    <AuthProvider uid={jwtInfo.uid} username={jwtInfo.username} email={jwtInfo.email} admin={jwtInfo.admin} exp={jwtInfo.exp}>
      {children}
    </AuthProvider>
  );
};

export default RequireAuth;