import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.webp";
import account from "../../media/svgs/user-edit.svg";
import loading from "../../media/svgs/loading.svg";

import SpreadsheetSearch from "./SpreadsheetSearch";
import { useUserPhotoFetch } from "../query/User/UserPhotoFetch";
import { useAuth } from "../../context/AuthContext";

const LandingPageHeader: React.FC = () => {
    const { uid } = useAuth();
    const { photoURL, isLoading, error } = useUserPhotoFetch(uid);
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
