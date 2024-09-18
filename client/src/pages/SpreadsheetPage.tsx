import React, { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useParams } from 'react-router-dom';

// types
import type { Sheet } from "../types/sheetTypes";
import type { Spreadsheet } from "../types/spreadsheetTypes";
import type { SelectedCellsContent } from "../types/cellTypes";

// components
import SpreadsheetHeader from "../components/Spreadsheet/SpreadsheetHeader";
import SpreadsheetUtilities from "../components/Spreadsheet/SpreadsheetUtilities";
import SpreadsheetTable, { DEFAULT_COL_WIDTH, DEFAULT_ROW_HEIGHT } from "../components/Spreadsheet/SpreadsheetTable";
import SheetList from "../components/Spreadsheet/SheetList";
import KeyboardListener from "../components/Spreadsheet/Functions/KeyboardListener";

// hooks
import { useSpreadsheetFetch } from "../components/query/Spreadsheet/SpreadsheetFetch";

// functions
import { decryptData } from '../utils/encrypt';

// vars
import { DEFAULT_FONT_SIZE, DEFAULT_FONT_FAMILY } from "../components/Spreadsheet/SpreadsheetTable";
import { initializeSizes, initializeVisibility } from "../components/Spreadsheet/Functions/Utils";
import { useCtrlZMemory } from "../components/Spreadsheet/hooks/ctrlZ/updateCtrlZMemory";

export const CTRL_Z_MEMORY_LENGTH = 50;

import LoadingGIF from "../media/imgs/loading.gif";

const SpreadsheetPage: React.FC = () => {
    const [saving, setSaving] = useState<boolean>(false);
    const [isFirstRender, setIsFirstRender] = useState(true);
    const [spreadsheet, setSpreadsheet] = useState<Spreadsheet | undefined>(undefined);

    const [selectedCellsId, setSelectedCellsId] = useState<number[]>([]);
    const [selectedCellsContent, setSelectedCellsContent] = useState<SelectedCellsContent>({});
    const [editingCell, setEditingCell] = useState<{ id: number, row: number, col: number } | null>(null);
    const editingCellRef = useRef<{ id: number, row: number, col: number } | null>(null);

    const [rowHeights, setRowHeights] = useState<number[]>([]);
    const [colWidths, setColWidths] = useState<number[]>([]);
    const [hiddenRows, setHiddenRows] = useState<boolean[]>([]);
    const [hiddenCols, setHiddenCols] = useState<boolean[]>([]);

    const getColumnWidth = (colIndex: number) => {
        return colWidths[colIndex] || DEFAULT_COL_WIDTH;
    };
    const getRowHeight = (rowIndex: number) => {
        return rowHeights[rowIndex] || DEFAULT_ROW_HEIGHT;
    };


    const [currentFontFamily, setCurrentFontFamily] = useState<string>(DEFAULT_FONT_FAMILY);
    const [currentFontSize, setCurrentFontSize] = useState<number>(DEFAULT_FONT_SIZE);
    const [currentTextColor, setCurrentTextColor] = useState<string>('#FFFFFF');
    const [currentBgColor, setCurrentBgColor] = useState<string>('#242424');
    const { encodedSpreadsheetId } = useParams<{ encodedSpreadsheetId: string }>();

    const [CtrlZSheets, setCtrlZSheets] = useState<Sheet[] | null>(null);
    const [ctrlZIndex, setCtrlZIndex] = useState<number | null>(null);

    const { updateCtrlZMemory } = useCtrlZMemory(setCtrlZSheets, ctrlZIndex, setCtrlZIndex, CTRL_Z_MEMORY_LENGTH);

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
    }, []);

    const { fetchedSpreadsheet, isLoading } = useSpreadsheetFetch(spreadsheetId, sheetIndex);

    useEffect(() => {
        if (fetchedSpreadsheet && isFirstRender) {
            setSpreadsheet(fetchedSpreadsheet);

            setRowHeights(initializeSizes(fetchedSpreadsheet.sheet.numRows, DEFAULT_ROW_HEIGHT, fetchedSpreadsheet.sheet.rowHeights));
            setColWidths(initializeSizes(fetchedSpreadsheet.sheet.numCols, DEFAULT_COL_WIDTH, fetchedSpreadsheet.sheet.columnWidths));
            setHiddenRows(initializeVisibility(fetchedSpreadsheet.sheet.numRows, fetchedSpreadsheet.sheet.hiddenRows));
            setHiddenCols(initializeVisibility(fetchedSpreadsheet.sheet.numCols, fetchedSpreadsheet.sheet.hiddenCols));
            setIsFirstRender(true);
        }
    }, [fetchedSpreadsheet, isFirstRender]);

    useEffect(() => {
        if (spreadsheet) {
            if (isFirstRender && spreadsheet.sheet) {
                updateCtrlZMemory(spreadsheet.sheet);
            }
        }
    }, [spreadsheet]);

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <img src={LoadingGIF} alt="Loading..." className="h-20" />
            </div>
        );
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
                    setRowHeights={setRowHeights}
                    setColWidths={setColWidths}
                    setHiddenRows={setHiddenRows}
                    setHiddenCols={setHiddenCols}
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
                rowHeights={rowHeights}
                setRowHeights={setRowHeights}
                colWidths={colWidths}
                setColWidths={setColWidths}
                hiddenRows={hiddenRows}
                setHiddenRows={setHiddenRows}
                hiddenCols={hiddenCols}
                setHiddenCols={setHiddenCols}
                getRowHeight={getRowHeight}
                getColumnWidth={getColumnWidth}
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
                spreadsheet={spreadsheet}
                setSpreadsheet={setSpreadsheet}
                updateCtrlZMemory={updateCtrlZMemory}
                ctrlZSheets={CtrlZSheets}
                ctrlZIndex={ctrlZIndex}
                setCtrlZIndex={setCtrlZIndex}
                setRowHeights={setRowHeights}
                setColWidths={setColWidths}
                setHiddenRows={setHiddenRows}
                setHiddenCols={setHiddenCols}
            />

        </div>
    );
}

export default SpreadsheetPage;