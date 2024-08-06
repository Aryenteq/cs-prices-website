import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import './index.css';

import AuthPage from "./pages/AuthPage";

const router = createBrowserRouter([
  // {
  //   path: "/",
  //   element: <LandingPage />,
  // },
  {
    path: "/connect",
    element: <AuthPage />,
    // errorElement: <NotFoundPage />,
  },
  // {
  //   path: "/reset",
  //   element: <ResetPassword />,
  // },
  // {
  //   path: "*",
  //   element: <NotFoundPage />,
  // }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
     <RouterProvider router={router} />
  </React.StrictMode>,
)
