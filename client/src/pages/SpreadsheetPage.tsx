import React, { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { JwtPayload } from '../utils/types';
import { Sheet, type Spreadsheet } from "../components/Spreadsheet/Functions/Types";

import SpreadsheetHeader from "../components/Spreadsheet/SpreadsheetHeader";
import SpreadsheetUtilities from "../components/Spreadsheet/SpreadsheetUtilities";
import SpreadsheetTable from "../components/Spreadsheet/SpreadsheetTable";
import SheetList from "../components/Spreadsheet/SheetList";
import { decryptData } from '../utils/encrypt';

import { fetchSpreadsheet } from "../components/Spreadsheet/Functions/SpreadsheetFetch";
import { useInfo } from "../components/InfoContext";

import { DEFAULT_FONT_SIZE, DEFAULT_FONT_FAMILY } from "../components/Spreadsheet/SpreadsheetTable";
import { useQuery } from "react-query";
import KeyboardListener from "../components/Spreadsheet/Functions/KeyboardListener";

export interface SpreadsheetProps {
    setSaving: React.Dispatch<React.SetStateAction<boolean>>;
    selectedCellsId: number[];
    spreadsheet: Spreadsheet | undefined;
    setSpreadsheet: React.Dispatch<React.SetStateAction<Spreadsheet | undefined>>;
    setCurrentFontFamily: React.Dispatch<React.SetStateAction<string>>;
    setCurrentFontSize: React.Dispatch<React.SetStateAction<number>>;
    setCurrentTextColor: React.Dispatch<React.SetStateAction<string>>;
    setCurrentBgColor: React.Dispatch<React.SetStateAction<string>>;
}

export interface SpreadsheetHeaderProps {
    uid: number;
    spreadsheetId: number;
    saving: boolean;
    setSaving: React.Dispatch<React.SetStateAction<boolean>>;
}

export type SelectedCellsContent = {
    [rowIndex: number]: {
        [colIndex: number]: string | null;
    };
};

export const CTRL_Z_MEMORY_LENGTH = 50;

const SpreadsheetPage: React.FC = () => {
    const { setInfo } = useInfo();
    const [saving, setSaving] = useState<boolean>(false);
    const [selectedCellsId, setSelectedCellsId] = useState<number[]>([]);
    const [selectedCellsContent, setSelectedCellsContent] = useState<SelectedCellsContent>({});
    const [editingCell, setEditingCell] = useState<{ id: number, row: number, col: number } | null>(null);
    const editingCellRef = useRef<{ id: number, row: number, col: number } | null>(null);

    useEffect(() => {
        editingCellRef.current = editingCell;
    }, [editingCell]);

    const [currentFontFamily, setCurrentFontFamily] = useState<string>(DEFAULT_FONT_FAMILY);
    const [currentFontSize, setCurrentFontSize] = useState<number>(DEFAULT_FONT_SIZE);
    const [currentTextColor, setCurrentTextColor] = useState<string>('#FFFFFF');
    const [currentBgColor, setCurrentBgColor] = useState<string>('#242424');
    const { encodedSpreadsheetId } = useParams<{ encodedSpreadsheetId: string }>();

    const [isFirstRender, setIsFirstRender] = useState(true);
    const [CtrlZSheets, setCtrlZSheets] = useState<Sheet[] | null>(null);
    const [ctrlZIndex, setCtrlZIndex] = useState<number | null>(null);

    const updateCtrlZMemory = (updatedSheet: any) => {
        setCtrlZSheets((prevSheets) => {
            const currentCtrlZIndex = ctrlZIndex !== null ? ctrlZIndex : 0;

            const newSheets = prevSheets ? [...prevSheets] : [];

            // avoid future history (Ctrl+Y)
            const sheetsUpToCurrentIndex = newSheets.slice(0, currentCtrlZIndex + 1);

            const lastSheet = sheetsUpToCurrentIndex[sheetsUpToCurrentIndex.length - 1];
            if (lastSheet && JSON.stringify(lastSheet) === JSON.stringify(updatedSheet)) {
                return prevSheets;
            }

            sheetsUpToCurrentIndex.push(updatedSheet);

            if (sheetsUpToCurrentIndex.length > CTRL_Z_MEMORY_LENGTH) {
                sheetsUpToCurrentIndex.shift();
            }

            setCtrlZIndex(sheetsUpToCurrentIndex.length - 1);

            return sheetsUpToCurrentIndex;
        });
    };

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
                    selectedCellsId={selectedCellsId}
                    currentFontFamily={currentFontFamily}
                    setCurrentFontFamily={setCurrentFontFamily}
                    currentFontSize={currentFontSize}
                    setCurrentFontSize={setCurrentFontSize}
                    currentTextColor={currentTextColor}
                    setCurrentTextColor={setCurrentTextColor}
                    currentBgColor={currentBgColor}
                    setCurrentBgColor={setCurrentBgColor}
                    setEditingCell={setEditingCell}
                    updateCtrlZMemory={updateCtrlZMemory}
                    ctrlZSheets={CtrlZSheets}
                    ctrlZIndex={ctrlZIndex}
                    setCtrlZIndex={setCtrlZIndex}
                />
            </div>
            <SpreadsheetTable
                setSaving={setSaving}
                selectedCellsId={selectedCellsId}
                setSelectedCellsId={setSelectedCellsId}
                editingCellRef={editingCellRef}
                editingCell={editingCell}
                setEditingCell={setEditingCell}
                setSelectedCellsContent={setSelectedCellsContent}
                spreadsheet={spreadsheet}
                setSpreadsheet={setSpreadsheet}
                setCurrentFontFamily={setCurrentFontFamily}
                setCurrentFontSize={setCurrentFontSize}
                setCurrentTextColor={setCurrentTextColor}
                setCurrentBgColor={setCurrentBgColor}
                updateCtrlZMemory={updateCtrlZMemory}
                isFirstRender={isFirstRender}
                setIsFirstRender={setIsFirstRender}
            />
            <SheetList
                setSaving={setSaving}
                spreadsheet={spreadsheet}
                setSpreadsheet={setSpreadsheet}
                updateCtrlZMemory={updateCtrlZMemory}
            />
            <KeyboardListener
                setSaving={setSaving}
                selectedCellsId={selectedCellsId}
                selectedCellsContent={selectedCellsContent}
                editingCellRef={editingCellRef}
                setEditingCell={setEditingCell}
                setSpreadsheet={setSpreadsheet}
                updateCtrlZMemory={updateCtrlZMemory}
                ctrlZSheets={CtrlZSheets}
                ctrlZIndex={ctrlZIndex}
                setCtrlZIndex={setCtrlZIndex}
            />

        </div>
    );
}

export default SpreadsheetPage;