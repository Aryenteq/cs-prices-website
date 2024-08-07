import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

import AuthForm, { AuthFormProps } from '../components/Auth/AuthForm';
import AuthImage from '../components/Auth/AuthImage';
import ForgotPass from '../components/Auth/ForgotPass';

const handleLogInSubmit = async (data: Record<string, string>, navigate: ReturnType<typeof useNavigate>) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, data);
    Cookies.set('token', response.data.token, { expires: 1 });
    navigate('/');
  } catch (error: any) {
    console.error('Login error:', error.response ? error.response.data : error.message);
  }
};

const handleSignUpSubmit = async (data: Record<string, string>, navigate: ReturnType<typeof useNavigate>) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/signup`, data);
    Cookies.set('token', response.data.token, { expires: 1 });
    navigate('/');
  } catch (error: any) {
    console.error('Sign up error:', error.response ? error.response.data : error.message);
  }
};

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPass, setShowForgotPass] = useState(false);
  const navigate = useNavigate();

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  const toggleForgotPass = () => {
    setShowForgotPass(!showForgotPass);
  };

  const loginFields: AuthFormProps = {
    type: 'login',
    title: 'Welcome back!',
    fields: [
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true },
    ],
    buttonText: 'Log In',
    onSubmit: (data) => handleLogInSubmit(data, navigate),
    toggleAuthMode,
    toggleText: "Don't have an account?",
    toggleForgotPass
  };

  const signupFields: AuthFormProps = {
    type: 'signup',
    title: 'Welcome to us!',
    fields: [
      { name: 'username', label: 'Username', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true },
      { name: 'confirmPassword', label: 'Confirm Password', type: 'password', required: true },
    ],
    buttonText: 'Sign Up',
    onSubmit: (data) => handleSignUpSubmit(data, navigate),
    toggleAuthMode,
    toggleText: 'Already have an account?'
  };

  return (
    <div className={`flex auth-container h-full`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={isLogin ? 'login' : 'signup'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          className={`auth-form w-full md:w-1/2 h-full ${isLogin ? '' : 'ml-0 md:ml-1/2'}`}
        >
          {isLogin ? (
            <AuthForm {...loginFields} />
          ) : (
            <AuthForm {...signupFields} />
          )}
        </motion.div>
      </AnimatePresence>
      <AuthImage isLogin={isLogin} />

      {showForgotPass ? <ForgotPass toggle={toggleForgotPass}/> : ''}
    </div>
  );
};

export default AuthPage;
