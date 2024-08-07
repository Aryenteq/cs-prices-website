import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface ErrorProp {
    error: string
}

const Error: React.FC<ErrorProp> = ({ error }) => {
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key='error'
                initial={{ x: '50%' }}
                animate={{ x: '0' }}
                exit={{ x: '50%' }}
                transition={{ duration: 0.2 }}
                className='absolute bg-primary'
            >
                <p>{error}</p>
            </motion.div>
        </AnimatePresence>
    );
};

export default Error;
