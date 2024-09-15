import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { SpreadsheetHeaderProps } from "../../props/spreadsheetProps";
import { authTokensFetch } from "../../utils/authTokens";

import SpreadsheetShare from "./SpreadsheetShare";

import { useInfo } from "../InfoContext";

import cloudSavedImg from "../../media/svgs/cloud-saved.svg";
import cloudSavingImg from "../../media/svgs/timer.svg";
import normalSpreadsheetImg from "../../media/svgs/spreadsheet-normal.svg";
import csSpreadsheetImg from "../../media/svgs/spreadsheet-cs.svg";
import accountImg from "../../media/svgs/user-edit.svg";
import loadingImg from "../../media/svgs/loading.svg";

const fetchUserPhoto = async (userId: number) => {
    const data = await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/user/photo/${userId}`, {
        method: 'GET',
    });
    return data;
};

const fetchSpreadsheetName = async (spreadsheetId: number): Promise<string> => {
    const data = await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/spreadsheet/${spreadsheetId}/name`, {
        method: 'GET',
    });
    return data;
};

const fetchSpreadsheetType = async (spreadsheetId: number): Promise<string> => {
    const data = await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/spreadsheet/${spreadsheetId}/type`, {
        method: 'GET',
    });
    return data;
};

const SpreadsheetHeader: React.FC<SpreadsheetHeaderProps> = ({ uid, spreadsheetId, saving, setSaving }) => {
    const queryClient = useQueryClient();
    const [name, setName] = useState<string>('');
    const [spreadsheetType, setSpreadsheetType] = useState<string>('NORMAL');
    const [isShareVisible, setShareVisible] = useState<boolean>(false);

    const nameRef = useRef(name);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { setInfo } = useInfo();

    const showSpreadsheetShare = () => {
        setShareVisible(true);
    };

    const hideSpreadsheetShare = () => {
        setShareVisible(false);
    };


    const { data: spreadsheetName } = useQuery<string, Error>(
        ['spreadsheetName', spreadsheetId],
        () => fetchSpreadsheetName(spreadsheetId),
        {
            keepPreviousData: true,
            onSuccess: (data) => setName(data),
            onError: (error: any) => {
                if (error.status !== 401) {
                    console.error('Error getting spreadsheet name:', error);
                }
                const parsedMessage = JSON.parse(error.message);
                const errorMessage = parsedMessage.message || 'An unknown error occurred while getting the spreadsheet name.';
                setInfo({ message: errorMessage, isError: true });
            },
        }
    );

    useQuery<string, Error>(
        ['spreadsheetType', spreadsheetId],
        () => fetchSpreadsheetType(spreadsheetId),
        {
            keepPreviousData: true,
            onSuccess: (data) => setSpreadsheetType(data),
            onError: (error: any) => {
                if (error.status !== 401) {
                    console.error('Error getting spreadsheet type:', error);
                }
                const parsedMessage = JSON.parse(error.message);
                const errorMessage = parsedMessage.message || 'An unknown error occurred while getting the spreadsheet type.';
                setInfo({ message: errorMessage, isError: true });
            },
        }
    );

    const { data: photoURL, isLoading, error } = useQuery(['userPhoto', uid], () => fetchUserPhoto(uid));
    const navigate = useNavigate();

    const accountPage = () => {
        navigate('/account');
    };

    const landingPage = () => {
        navigate('/');
    }


    const renameMutation = useMutation(async (newName: string) => {
        const headers = {
            'Content-Type': 'application/json',
        };

        const data = await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/spreadsheet/${spreadsheetId}/name`, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify({ name: newName }),
        });

        return data;
    }, {
        onSuccess: () => {
            queryClient.invalidateQueries('spreadsheetName');
            setSaving(false);
        },
        onError: (error: any) => {
            setSaving(false);
            if (error.status !== 401) {
                console.error('Error renaming spreadsheet:', error);
            }
            const parsedMessage = JSON.parse(error.message);
            const errorMessage = parsedMessage.message || 'An unknown error occurred.';
            setInfo({ message: errorMessage, isError: true });
        },
    });

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setName(newValue);
        nameRef.current = newValue;
        setSaving(true);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            if (spreadsheetName !== nameRef.current && nameRef.current.trim().length > 0) {
                renameMutation.mutate(nameRef.current);
            }
        }, 2000);
    };

    const handleBlur = () => {
        if (spreadsheetName !== nameRef.current && nameRef.current.trim().length > 0) {
            renameMutation.mutate(nameRef.current);
        }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.select();
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (
        <>
            {/* Upper header (icon, name, saving, share, account) */}
            <div className="flex justify-between items-center m-4 gap-2">
                <button onClick={landingPage} className="rounded p-1 hover:bg-gray-700 transition duration-300 ease-in-out" title="Home">
                    <img src={spreadsheetType === 'NORMAL' ? normalSpreadsheetImg : csSpreadsheetImg} alt="Spreadsheet Icon" className="w-6 h-6" />
                </button>

                <input
                    ref={inputRef}
                    type="text"
                    value={name}
                    onChange={handleNameChange}
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    className="bg-transparent truncate px-4 py-2"
                />
                <img src={saving ? cloudSavingImg : cloudSavedImg}
                    alt={saving ? "Saving..." : "Saved"}
                    title={saving ? "Saving to cloud..." : "Saved to cloud"}
                    className="w-6 h-6 mr-auto" />
                <button
                    className="bg-primary px-6 py-2 rounded-full border border-primary-dark border-4 border-inset hover:bg-primary-dark focus:bg-primary-dark transition duration-300"
                    onClick={showSpreadsheetShare}
                >Share</button>
                <button onClick={accountPage}>
                    <img src={isLoading ? loadingImg : error ? accountImg : photoURL}
                        alt='Account' title="Account" className="h-10 w-10 rounded-full" />
                </button>
            </div>

            {/* Share dialog */}
            {isShareVisible && (
                <SpreadsheetShare onClose={hideSpreadsheetShare} uid={uid} spreadsheetId={spreadsheetId} />
            )}
        </>
    );
}

export default SpreadsheetHeader;