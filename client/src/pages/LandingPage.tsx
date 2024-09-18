import React, { useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { JwtPayload } from '../props/jwtProps';

import LandingPageHeader from '../components/Landing/LandingPageHeader';
import NewSpreadsheetMenu from '../components/Landing/NewSpreadsheetMenu';
import SpreadsheetsList from '../components/Landing/SpreadsheetsList';

const LandingPage: React.FC = () => {
  const jwtInfo = useMemo(() => {
    const accessToken = Cookies.get('access_token');
    const refreshToken = Cookies.get('refresh_token');
    if (accessToken) {
      try {
        return jwtDecode<JwtPayload>(accessToken);
      } catch (error) {
        console.error('Failed to decode access_token', error);
        return null;
      }
    }

    if (refreshToken) {
      Cookies.set('access_token', '');
    }

    return null;
  }, [Cookies.get('access_token'), Cookies.get('refresh_token')]);

  if (!jwtInfo) {
    return <Navigate to="/connect" replace />;
  }

  return (
    <main className='h-full'>
      <LandingPageHeader userId={jwtInfo.uid} />
      <NewSpreadsheetMenu />
      <SpreadsheetsList />
    </main>
  );
};

export default LandingPage;
