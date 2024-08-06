import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import leftArrow from './media/left-arrow.svg';

interface ForgotPassProp {
    toggle: () => void;
  }

const handleSubmit = () => {
    // TODO
}

const ForgotPass: React.FC<ForgotPassProp> = ({ toggle }) => {
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={'forgot-pass'}
                initial={{ x: '-50%' }}
                animate={{ x: 0 }}
                exit={{ x: '-50%' }}
                transition={{ duration: 0.2 }}
                className={`flex flex-col justify-around items-center h-full w-full md:w-1/2 absolute bg-background`}
            >
                <button type='button' className='absolute top-5 left-5' onClick={toggle}>
                    <img src={leftArrow} alt="Back" className='w-12 h-12 white' />
                </button>
                <h2 className='text-4xl text-center mt-8'>Recover password</h2>
                {/* Custom scrollbar for the form in Auth.css */}
                <form onSubmit={handleSubmit} className='form-container flex flex-col justify-center px-20 py-2'>
                    <div key='email' className='flex flex-col justify-center items-center my-2 relative'>
                        <label htmlFor='email' className='font-medium my-1'>E-mail</label>
                        <input
                            id='email-forgot'
                            name='email'
                            type='email'
                            required={true}
                            className='bg-input border-2 border-primary focus:bg-input-dark focus:border-primary-dark hover:bg-input-dark hover:border-primary-dark text-black px-8 py-2 rounded'
                        />
                    </div>

                    {/* Submit button*/}
                    <button type="submit" className='bg-primary rounded mt-4 py-3 hover:bg-primary-dark'>Submit</button>
                </form>
                <div className="">When clicking submit, an e-mail will be sent to you in order to recover your account.</div>
            </motion.div>
        </AnimatePresence>
    )
}

export default ForgotPass;