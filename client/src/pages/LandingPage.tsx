import React from 'react';

import LandingPageHeader from '../components/Landing/LandingPageHeader';
import NewSpreadsheetMenu from '../components/Landing/NewSpreadsheetMenu';
import SpreadsheetsList from '../components/Landing/SpreadsheetsList';

const LandingPage: React.FC = () => {
  return (
    <main className='min-h-full'>
      <LandingPageHeader />
      <NewSpreadsheetMenu />
      <SpreadsheetsList />
      <div className='h-10'></div>
    </main>
  );
};

export default LandingPage;
