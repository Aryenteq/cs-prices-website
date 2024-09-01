import React from "react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import { useInfo } from "../InfoContext";

import csSheet from "../../media/imgs/cs-sheet.png";
import normalSheet from "../../media/imgs/normal-sheet.png";
import { authTokensFetch } from "../../utils/authTokens";
import { encryptData } from '../../utils/encrypt';

const createSpreadsheet = async ({ type }: { type: string }) => {
    try {
        const data = await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/spreadsheet`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: 'New spreadsheet',
                type: type,
            }),
        });
        return data;
    } catch (error: any) {
        throw error;
    }
};

const NewSpreadsheetMenu: React.FC = () => {
    const navigate = useNavigate();
    const { setInfo } = useInfo();

    const mutation = useMutation(createSpreadsheet, {
        onSuccess: (data) => {
            const spreadsheetId = data.id;

            const encodedInfo = encodeURIComponent(encryptData(`${spreadsheetId}`));
            navigate(`/spreadsheet/${encodedInfo}`);
        },
        onError: (error: any) => {
            setInfo({ message: error.message, isError: true });
            if (error.status !== 401) {
                console.error('Error creating spreadsheet:', error);
            }
        },
    });

    const handleCreateSpreadsheet = (type: string) => {
        mutation.mutate({ type });
    };

    return (
        <div className="flex flex-col gap-3 items-center">
            <h2 className="text-2xl">Create a new spreadsheet</h2>
            <div className="w-full flex justify-center gap-10">
                <button onClick={() => handleCreateSpreadsheet('NORMAL')} className="relative flex justify-center items-center border border-primary p-6 rounded hover:bg-gray-700 transition duration-300 ease-in-out">
                    <p className="absolute text-shadow">Normal</p>
                    <img src={normalSheet} alt="New Normal Sheet" className="w-24 h-24" />
                </button>
                <button onClick={() => handleCreateSpreadsheet('CS')} className="relative flex justify-center items-center border border-primary p-6 rounded hover:bg-gray-700 transition duration-300 ease-in-out">
                    <p className="absolute text-shadow">CS</p>
                    <img src={csSheet} alt="New CS Sheet" className="w-24 h-24" />
                </button>
            </div>
        </div>
    );
};

export default NewSpreadsheetMenu;