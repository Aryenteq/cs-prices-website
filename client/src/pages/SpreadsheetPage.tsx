import React, { useEffect, useMemo, useState } from "react";
import { Navigate, useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { JwtPayload } from '../utils/types';
import type { Spreadsheet } from "../components/Spreadsheet/Functions/Types";

import SpreadsheetHeader from "../components/Spreadsheet/SpreadsheetHeader";
import SpreadsheetUtilities from "../components/Spreadsheet/SpreadsheetUtilities";
import SpreadsheetTable from "../components/Spreadsheet/SpreadsheetTable";
import SheetList from "../components/Spreadsheet/SheetList";
import { decryptData } from '../utils/encrypt';

import { fetchSpreadsheet } from "../components/Spreadsheet/Functions/SpreadsheetFetch";
import { useInfo } from "../components/InfoContext";

import { DEFAULT_FONT_SIZE, DEFAULT_FONT_FAMILY } from "../components/Spreadsheet/SpreadsheetTable";
import { useQuery } from "react-query";

export interface SpreadsheetProps {
    setSaving: React.Dispatch<React.SetStateAction<boolean>>;
    selectedCellIds: number[];
    setSelectedCellIds: React.Dispatch<React.SetStateAction<number[]>>;
    spreadsheet: Spreadsheet | undefined;
    setSpreadsheet: React.Dispatch<React.SetStateAction<Spreadsheet | undefined>>;
    currentFontFamily: string;
    setCurrentFontFamily: React.Dispatch<React.SetStateAction<string>>;
    currentFontSize: number;
    setCurrentFontSize: React.Dispatch<React.SetStateAction<number>>;
    currentTextColor: string;
    setCurrentTextColor: React.Dispatch<React.SetStateAction<string>>;
    currentBgColor: string;
    setCurrentBgColor: React.Dispatch<React.SetStateAction<string>>;
}

export interface SpreadsheetHeaderProps {
    uid: number;
    spreadsheetId: number;
    saving: boolean;
    setSaving: React.Dispatch<React.SetStateAction<boolean>>;
}

const SpreadsheetPage: React.FC = () => {
    const { setInfo } = useInfo();
    const [saving, setSaving] = useState<boolean>(false);
    const [selectedCellIds, setSelectedCellIds] = useState<number[]>([]);
    const [currentFontFamily, setCurrentFontFamily] = useState<string>(DEFAULT_FONT_FAMILY);
    const [currentFontSize, setCurrentFontSize] = useState<number>(DEFAULT_FONT_SIZE);
    const [currentTextColor, setCurrentTextColor] = useState<string>('#FFFFFF');
    const [currentBgColor, setCurrentBgColor] = useState<string>('#242424');
    const { encodedSpreadsheetId } = useParams<{ encodedSpreadsheetId: string }>();

    const [spreadsheetId, sheetIndex] = useMemo(() => {
        if (encodedSpreadsheetId) {
            try {
                const decodedInfo = decodeURIComponent(encodedSpreadsheetId);
                const decryptedData = decryptData(decodedInfo);

                const [id, index] = decryptedData.split('?index=').map(Number);

                return [id, index];
            } catch (error) {
                console.error('Failed to decode or decrypt spreadsheetId and index', error);
                return [null, 0];
            }
        }
        return [null, 0];
    }, [encodedSpreadsheetId]);


    const jwtInfo = useMemo(() => {
        const storedToken = Cookies.get('access_token');
        if (storedToken) {
            try {
                return jwtDecode<JwtPayload>(storedToken);
            } catch (error) {
                console.error('Failed to decode access_token', error);
                return null;
            }
        }
        return null;
    }, []);

    const [spreadsheet, setSpreadsheet] = useState<Spreadsheet | undefined>(undefined);

    const { data: fetchedSpreadsheet } = useQuery<Spreadsheet, Error>(
        ['spreadsheet', spreadsheetId],
        () => fetchSpreadsheet(spreadsheetId!, sheetIndex),
        {
            keepPreviousData: true,
            onError: (error: any) => {
                if (error.status !== 401) {
                    console.error('Error getting spreadsheet:', error);
                }
                const parsedMessage = JSON.parse(error.message);
                const errorMessage = parsedMessage.message || 'An unknown error occurred while getting the spreadsheet.';
                setInfo({ message: errorMessage, isError: true });
            },
        }
    );

    useEffect(() => {
        if (fetchedSpreadsheet) {
            setSpreadsheet(fetchedSpreadsheet);
        }
    }, [fetchedSpreadsheet]);

    if (!jwtInfo) {
        return <Navigate to="/connect" replace />;
    }

    if (!spreadsheetId) {
        return <Navigate to="/" replace />;
    }

    if (!spreadsheet) {
        return null;
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-shrink-0">
                <SpreadsheetHeader
                    uid={jwtInfo.uid}
                    spreadsheetId={spreadsheetId}
                    saving={saving}
                    setSaving={setSaving}
                />
                <SpreadsheetUtilities
                    setSaving={setSaving}
                    spreadsheet={spreadsheet}
                    setSpreadsheet={setSpreadsheet}
                    selectedCellIds={selectedCellIds}
                    setSelectedCellIds={setSelectedCellIds}
                    currentFontFamily={currentFontFamily}
                    setCurrentFontFamily={setCurrentFontFamily}
                    currentFontSize={currentFontSize}
                    setCurrentFontSize={setCurrentFontSize}
                    currentTextColor={currentTextColor}
                    setCurrentTextColor={setCurrentTextColor}
                    currentBgColor={currentBgColor}
                    setCurrentBgColor={setCurrentBgColor}
                />
            </div>
            <SpreadsheetTable
                setSaving={setSaving}
                selectedCellIds={selectedCellIds}
                setSelectedCellIds={setSelectedCellIds}
                spreadsheet={spreadsheet}
                setSpreadsheet={setSpreadsheet}
                currentFontFamily={currentFontFamily}
                setCurrentFontFamily={setCurrentFontFamily}
                currentFontSize={currentFontSize}
                setCurrentFontSize={setCurrentFontSize}
                currentTextColor={currentTextColor}
                setCurrentTextColor={setCurrentTextColor}
                currentBgColor={currentBgColor}
                setCurrentBgColor={setCurrentBgColor}
            />
            <SheetList
                setSaving={setSaving}
                selectedCellIds={selectedCellIds}
                setSelectedCellIds={setSelectedCellIds}
                spreadsheet={spreadsheet}
                setSpreadsheet={setSpreadsheet}
                currentFontFamily={currentFontFamily}
                setCurrentFontFamily={setCurrentFontFamily}
                currentFontSize={currentFontSize}
                setCurrentFontSize={setCurrentFontSize}
                currentTextColor={currentTextColor}
                setCurrentTextColor={setCurrentTextColor}
                currentBgColor={currentBgColor}
                setCurrentBgColor={setCurrentBgColor}
            />
        </div>
    );
}

export default SpreadsheetPage;