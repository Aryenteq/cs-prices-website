import React from 'react';
import { useNavigate } from 'react-router-dom';
import googleLogo from './media/google-logo.svg';
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useInfo } from '../../context/InfoContext';
import { app } from '../../utils/firebase';

import { handleLogInSubmit, handleSignUpSubmit } from '../../pages/AuthPage';
import { useQuery } from '../../pages/ResetPwdPage';

interface GoogleAuthButtonProps {
  text: string;
  type: 'login' | 'signup'
}

const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ text, type }) => {
  const { setInfo } = useInfo();
  const navigate = useNavigate();
  const location = useQuery();

  const handleButtonClick = () => {
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();

    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        const userData = {
          username: user.displayName || '',
          email: user.email || '',
          photoURL: user.photoURL || '',
          registrationType: 'GOOGLE'
        };

        if (type === 'login') {
          handleLogInSubmit(userData, setInfo, navigate, location);
        } else {
          handleSignUpSubmit(userData, setInfo, navigate, location);
        }
      })
      .catch((error) => {
        console.error('Error during sign in:', error);
        setInfo({ message: error.response?.data?.message || error.message, isError: true });
      });
  };

  return (
    <div className="w-auto">
      <button className="google-auth rounded border-2 border-white hover:bg-background-dark flex justify-center items-center space-x-2 px-14 py-3" type="button" onClick={handleButtonClick}>
        <img src={googleLogo} alt="Google Logo" className="h-6 w-6" />
        <span>{text} with Google</span>
      </button>
    </div>
  );
};

export default GoogleAuthButton;
