import React from 'react';
import { useEffect, useRef } from 'react';
import "./Auth.css";

import logInImage from './media/login.webp';
import signUpImage from './media/signup.webp';

interface AuthImageProps {
  isLogin: boolean;
}

const AuthImage: React.FC<AuthImageProps> = ({ isLogin }) => {
  const loginImgRef = useRef<HTMLImageElement>(null);
  const signupImgRef = useRef<HTMLImageElement>(null);
  const imgParent = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLogin) {
      loginImgRef.current?.classList.add('active');
      signupImgRef.current?.classList.remove('active');
      imgParent.current?.classList.remove('active');
    } else {
      loginImgRef.current?.classList.remove('active');
      signupImgRef.current?.classList.add('active');
      imgParent.current?.classList.add('active');
    }
  }, [isLogin]);

  return (
    <div className="image-container hidden md:block" ref={imgParent}>
      <div className="img-container-relative">
        <img
          ref={loginImgRef}
          src={logInImage}
          alt="Login Image"
          className="img-auth"
        />
        <img
          ref={signupImgRef}
          src={signUpImage}
          alt="Signup Image"
          className="img-auth"
        />
      </div>
    </div>
  );
};

export default AuthImage;