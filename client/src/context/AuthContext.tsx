import React, { createContext, useContext, ReactNode } from 'react';
import { JwtPayload } from '../props/jwtProps';

interface AuthContextType {
  uid: number;
  username: string;
  email: string;
  admin: boolean;
  exp: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<JwtPayload & { children: ReactNode }> = ({ children, uid, username, email, admin, exp }) => {
  if (uid === null || username === null || email === null || admin === null || exp === null) {
    console.error("One or more user information fields are null or undefined.");
    return <div>Error: Missing user information.</div>;
  }

  const userInfo: AuthContextType = { uid, username, email, admin, exp };

  return (
    <AuthContext.Provider value={userInfo}>
      {children}
    </AuthContext.Provider>
  );
};