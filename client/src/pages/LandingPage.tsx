import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

interface JwtPayload {
  username?: string;
  email?: string;
  exp?: number;
  [key: string]: any;
}

const LandingPage: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [decodedToken, setDecodedToken] = useState<JwtPayload | null>(null);

  useEffect(() => {
    const storedToken = Cookies.get('token');
    if (storedToken) {
      setToken(storedToken);
      const decoded: JwtPayload = jwtDecode(storedToken);
      setDecodedToken(decoded);
    }
  }, []);

  if (!decodedToken) {
    return <div>No token found or invalid token</div>;
  }

  return (
    <div>
      <h2>JWT Information</h2>
      <ul>
        {Object.entries(decodedToken).map(([key, value]) => (
          <li key={key}>
            <strong>{key}:</strong> {String(value)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LandingPage;
