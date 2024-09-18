import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Navigate, useNavigate } from 'react-router-dom';

import { useInfo } from '../context/InfoContext';
import { useQuery } from './ResetPwdPage';

import AuthForm, { AuthFormProps } from '../components/Auth/AuthForm';
import AuthImage from '../components/Auth/AuthImage';
import ForgotPass from '../components/Auth/ForgotPass';

const AVAILABLE_LANGUAGES = ['RO', 'EN'];
const AVAILABLE_THEMES = ['DARK', 'LIGHT'];

export const handleLogInSubmit = async (data: Record<string, string>, setInfo: (info: { message: string; isError?: boolean } | null) => void, navigate: ReturnType<typeof useNavigate>, location: URLSearchParams) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, data);
    const { accessToken, refreshToken } = response.data;
    Cookies.set('access_token', accessToken);
    Cookies.set('refresh_token', refreshToken, { expires: 30 });

    const next = location.get('next');
    navigate(next ? `/${next}` : '/');
  } catch (error: any) {
    console.error('Login error:', error.response ? error.response.data : error.message);
    setInfo({ message: error.response?.data?.message || error.message, isError: true });
  }
};

export const handleSignUpSubmit = async (data: Record<string, string>, setInfo: (info: { message: string; isError?: boolean } | null) => void, navigate: ReturnType<typeof useNavigate>, location: URLSearchParams) => {
  try {
    if (!data.registrationType) {
      if (data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      delete data.confirmPassword;
      data.registrationType = 'FORM';
    }

    if (AVAILABLE_LANGUAGES.includes(navigator.language)) {
      data['prefferedLanguage'] = navigator.language;
    }

    const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'DARK' : 'LIGHT';
    if (AVAILABLE_THEMES.includes(preferredTheme)) {
      data['prefferedTheme'] = preferredTheme;
    }

    const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/signup`, data);
    const { accessToken, refreshToken } = response.data;
    Cookies.set('access_token', accessToken);
    Cookies.set('refresh_token', refreshToken, { expires: 30 });

    const next = location.get('next');
    navigate(next ? `/${next}` : '/');
  } catch (error: any) {
    console.error('Sign up error:', error.response ? error.response.data : error.message);
    setInfo({ message: error.response?.data?.message || error.message, isError: true });
  }
};

const AuthPage: React.FC = () => {
  const token = Cookies.get('access_token');
  if (token) {
    return <Navigate to="/" replace />;
  }

  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPass, setShowForgotPass] = useState(false);
  const navigate = useNavigate();
  const location = useQuery();

  const { setInfo } = useInfo();

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
    onSubmit: (data) => handleLogInSubmit(data, setInfo, navigate, location),
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
    onSubmit: (data) => handleSignUpSubmit(data, setInfo, navigate, location),
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

      {showForgotPass ? <ForgotPass toggle={toggleForgotPass} /> : ''}
    </div>
  );
};

export default AuthPage;
