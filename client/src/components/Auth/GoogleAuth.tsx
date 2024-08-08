import React from 'react';
import googleLogo from './media/google-logo.svg';
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useInfo } from '../InfoContext';

interface GoogleAuthButtonProps {
  text: string;
}

const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ text }) => {
  const { setInfo } = useInfo();

  const handleButtonClick = () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    signInWithPopup(auth, provider)
      .then((result) => {
        // TODO
        const user = result.user;
        console.log('User signed in:', user);
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
