import React from 'react';

import LandingPageHeader from '../components/Landing/LandingPageHeader';
import NewSpreadsheetMenu from '../components/Landing/NewSpreadsheetMenu';
import SpreadsheetsList from '../components/Landing/SpreadsheetsList';

const LandingPage: React.FC = () => {
  return (
    <main className='h-full'>
      <LandingPageHeader />
      <NewSpreadsheetMenu />
      <SpreadsheetsList />
    </main>
  );
};

export default LandingPage;
