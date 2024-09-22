import React from 'react';
import { useNavigate } from 'react-router-dom';

import ghost from '../media/imgs/404ghost.png';

const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();

    const redirect = () => {
        navigate('/');
    }
    return (
        <div className='flex justify-center items-center h-full'>
            <button onClick={redirect}>
                <img src={ghost} alt="404" /> <br></br>Căutăm designer!
            </button>
        </div>
    );
};

export default NotFoundPage;