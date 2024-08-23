import React from "react";
import { useQuery } from "react-query";
import { UserIdProps } from "../../utils/types";
import logo from "../../assets/logo.webp";
import account from "../../assets/user-edit.svg";
import loading from "../../assets/loading.svg";

import SpreadsheetSearch from "./SpreadsheetSearch";
import { getAuthHeader } from '../../utils/authHeader';
import { useNavigate } from "react-router-dom";

const fetchUserPhoto = async (userId: number) => {
    const headers = getAuthHeader();

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/photo/${userId}`, {
        headers: headers,
    });

    if (!response.ok) {
        throw new Error('Failed to fetch user photo');
    }

    return await response.json();
};

const LandingPageHeader: React.FC<UserIdProps> = ({ userId }) => {
    const { data: photoURL, isLoading, error } = useQuery(['userPhoto', userId], () => fetchUserPhoto(userId));
    const navigate = useNavigate();

    const accountPage = () => {
        navigate('/account');
    };

    return (
        <header className="relative">
            <SpreadsheetSearch />
            <div className="flex justify-between mx-10 my-6 items-center">
                <div className="logo flex items-center gap-2">
                    <img src={logo} alt="Logo" className="h-10 w-10" />
                    <h1 className="text-primary-light text-4xl font-title hidden lg:block">IHMLegend.ary</h1>
                </div>

                <div>
                    <button onClick={accountPage}>
                        <img src={isLoading ? loading : error ? account : photoURL}
                            alt='Account' title="Account" className="h-10 w-10 rounded-full" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default LandingPageHeader;
