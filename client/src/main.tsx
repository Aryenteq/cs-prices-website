import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from 'react-query';
import './index.css';

import { InfoProvider } from "./context/InfoContext";
import RequireAuth from "./context/RequireAuth";

import AuthPage from "./pages/AuthPage";
import LandingPage from "./pages/LandingPage";
import ResetPwdPage from "./pages/ResetPwdPage";
import NotFoundPage from "./pages/NotFoundPage";
import SpreadsheetPage from "./pages/SpreadsheetPage";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <RequireAuth>
        <LandingPage />
      </RequireAuth>
    ),
  },
  {
    path: "/connect",
    element: <AuthPage />,
  },
  {
    path: "/reset-pwd",
    element: <ResetPwdPage />,
  },
  {
    path: "/spreadsheet/:encodedSpreadsheetId",
    element: (
      <RequireAuth>
        <SpreadsheetPage />
      </RequireAuth>
    ),
  },
  {
    path: "*",
    element: <NotFoundPage />,
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <InfoProvider>
        <RouterProvider router={router} />
      </InfoProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
