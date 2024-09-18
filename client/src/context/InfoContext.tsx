import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface InfoContextProps {
    info: { message: string; isError?: boolean } | null;
    setInfo: (info: { message: string; isError?: boolean } | null) => void;
}

const InfoContext = createContext<InfoContextProps | undefined>(undefined);

export const useInfo = () => {
    const context = useContext(InfoContext);
    if (!context) {
        throw new Error('useInfo must be used within an InfoProvider');
    }
    return context;
};

export const InfoProvider = ({ children }: { children: ReactNode }) => {
    const [info, setInfo] = useState<{ message: string; isError?: boolean } | null>(null);

    const handleInfoClose = () => {
        setInfo(null);
    };

    return (
        <InfoContext.Provider value={{ info, setInfo }}>
            {children}
            {info && <InfoComponent info={info.message} isError={info.isError} onClose={handleInfoClose} />}
        </InfoContext.Provider>
    );
};

interface InfoComponentProps {
    info: string;
    isError?: boolean;
    onClose: () => void;
}

const InfoComponent: React.FC<InfoComponentProps> = ({ info, isError = true, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <AnimatePresence>
            <motion.div
                key="pop-up-info"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 ${
                    isError ? 'bg-red-500' : 'bg-primary'
                } text-white text-center p-4 rounded-lg shadow-lg flex items-center justify-center`}
                style={{ minWidth: '300px', padding: '1rem', bottom: '2rem' }}
            >
                <div className="flex-grow">{info}</div>
                <button onClick={onClose} className="ml-4 text-xl leading-none">
                    &times;
                </button>
            </motion.div>
        </AnimatePresence>
    );
};

export default InfoComponent;
