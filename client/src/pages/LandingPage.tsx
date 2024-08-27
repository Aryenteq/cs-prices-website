import React, { useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { JwtPayload } from '../utils/types';

import LandingPageHeader from '../components/Landing/LandingPageHeader';
import NewSpreadsheetMenu from '../components/Landing/NewSpreadsheetMenu';
import SpreadsheetsList from '../components/Landing/SpreadsheetsList';

const LandingPage: React.FC = () => {
  const jwtInfo = useMemo(() => {
    const storedToken = Cookies.get('token');
    if (storedToken) {
      try {
        return jwtDecode<JwtPayload>(storedToken);
      } catch (error) {
        console.error('Failed to decode token', error);
        return null;
      }
    }
    return null;
  }, []);

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
