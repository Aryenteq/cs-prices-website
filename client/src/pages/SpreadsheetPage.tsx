import React, { useMemo, useState } from "react";
import { Navigate, useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { JwtPayload } from '../utils/types';
import type { Sheet } from "../components/Spreadsheet/Functions/Types";

import SpreadsheetHeader from "../components/Spreadsheet/SpreadsheetHeader";
import SpreadsheetUtilities from "../components/Spreadsheet/SpreadsheetUtilities";
import SpreadsheetTable from "../components/Spreadsheet/SpreadsheetTable";
import { decryptData } from '../utils/encrypt';

import { DEFAULT_FONT_SIZE, DEFAULT_FONT_FAMILY } from "../components/Spreadsheet/SpreadsheetTable";

export interface SpreadsheetProps {
    spreadsheetId: number;
    setSaving: React.Dispatch<React.SetStateAction<boolean>>;
    selectedCellIds: number[];
    setSelectedCellIds: React.Dispatch<React.SetStateAction<number[]>>;
    sheet: Sheet;
    setSheet: React.Dispatch<React.SetStateAction<Sheet>>;
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
    const [saving, setSaving] = useState<boolean>(false);
    const [selectedCellIds, setSelectedCellIds] = useState<number[]>([]);
    const [sheet, setSheet] = useState<any>(null);
    const [currentFontFamily, setCurrentFontFamily] = useState<string>(DEFAULT_FONT_FAMILY);
    const [currentFontSize, setCurrentFontSize] = useState<number>(DEFAULT_FONT_SIZE);
    // const [currentBold, setCurrentBold] = useState<boolean>(false);
    // const [currentItalic, setCurrentItalic] = useState<boolean>(false);
    // const [currentStrikethrough, setCurrentStrikethrough] = useState<boolean>(false);
    const [currentTextColor, setCurrentTextColor] = useState<string>('#FFFFFF');
    const [currentBgColor, setCurrentBgColor] = useState<string>('#242424');
    const { encodedSpreadsheetId } = useParams<{ encodedSpreadsheetId: string }>();

    const spreadsheetId = useMemo(() => {
        if (encodedSpreadsheetId) {
            try {
                const decodedInfo = decodeURIComponent(encodedSpreadsheetId);
                return parseInt(decryptData(decodedInfo), 10);
            } catch (error) {
                console.error('Failed to decode or decrypt spreadsheetId', error);
                return null;
            }
        }
        return null;
    }, [encodedSpreadsheetId]);

    const jwtInfo = useMemo(() => {
        const storedToken = Cookies.get('token');
        if (storedToken) {
            try {
                return jwtDecode<JwtPayload>(storedToken);
            } catch (error) {
                console.error('Failed to decode token', error);
                return null;
            }
        }
        return null;
    }, []);

    if (!jwtInfo) {
        return <Navigate to="/connect" replace />;
    }

    if (!spreadsheetId) {
        return <Navigate to="/" replace />;
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
                    spreadsheetId={spreadsheetId}
                    setSaving={setSaving}
                    sheet={sheet}
                    setSheet={setSheet}
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
                spreadsheetId={spreadsheetId}
                setSaving={setSaving}
                selectedCellIds={selectedCellIds}
                setSelectedCellIds={setSelectedCellIds}
                sheet={sheet}
                setSheet={setSheet}
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