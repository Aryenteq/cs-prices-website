import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import hidePass from '../components/Auth/media/hide-pass.svg';
import showPass from '../components/Auth/media/show-pass.svg';
import '../components/Auth/Auth.css';
import { useInfo } from '../components/InfoContext';

export const useQuery = () => {
    return new URLSearchParams(useLocation().search);
};

const handleSubmit = (token: string, email: string, setInfo: (info: { message: string; isError?: boolean } | null) => void, navigate: ReturnType<typeof useNavigate>) => async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const pwd = formData.get('pwd') as string;
    const repeatedPwd = formData.get('repeatedPwd') as string;

    try {
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/reset-pwd`, { pwd, repeatedPwd, email, token });
        navigate('/connect');
    } catch (error: any) {
        console.error('Error resetting password:', error.response ? error.response.data : error.message);
        setInfo({ message: error.response?.data?.message || error.message, isError: true });
    }
};

const ResetPwdPage: React.FC = () => {
    const query = useQuery();
    const email = query.get('email');
    const token = query.get('token');

    const navigate = useNavigate();

    const { setInfo } = useInfo();
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className={`flex flex-col justify-around items-center h-full w-full absolute bg-background`}>
            <h2 className='text-4xl text-center mt-8'>Reset password</h2>
            {/* Custom scrollbar for the form in Auth.css */}
            <form onSubmit={handleSubmit(token!, email!, setInfo, navigate)} className='form-container flex flex-col justify-center px-20 py-2'>
                <div key='newPwd' className='flex flex-col justify-center items-center my-2 relative'>
                    <label htmlFor='pwd' className='font-medium my-1'>Password</label>
                    <input
                        id='pwd'
                        name='pwd'
                        type={showPassword ? 'text' : 'password'}
                        required={true}
                        className='bg-input border-2 border-primary focus:bg-input-dark focus:border-primary-dark hover:bg-input-dark hover:border-primary-dark text-black px-8 py-2 rounded'
                    />

                    <span className="absolute right-2 px-2 mt-8 cursor-pointer" onClick={togglePasswordVisibility}>
                        <img src={showPassword ? hidePass : showPass} alt="Toggle password visibility" className="h-6 w-6" />
                    </span>
                </div>
                <div key='repeatedPwd' className='flex flex-col justify-center items-center my-2 relative'>
                    <label htmlFor='repeated-pwd' className='font-medium my-1'>Repeat Password</label>
                    <input
                        id='repeated-pwd'
                        name='repeatedPwd'
                        type={showPassword ? 'text' : 'password'}
                        required={true}
                        className='bg-input border-2 border-primary focus:bg-input-dark focus:border-primary-dark hover:bg-input-dark hover:border-primary-dark text-black px-8 py-2 rounded'
                    />

                    <span className="absolute right-2 px-2 mt-8 cursor-pointer" onClick={togglePasswordVisibility}>
                        <img src={showPassword ? hidePass : showPass} alt="Toggle password visibility" className="h-6 w-6" />
                    </span>
                </div>



                {/* Submit button*/}
                <button type="submit" className='bg-primary rounded mt-4 py-3 hover:bg-primary-dark'>Change password</button>
            </form>
            <div className="">When clicking submit, you will be redirected to the connect page.</div>
        </div>
    )
};

export default ResetPwdPage;
