import { useRef, useEffect } from 'react';
import { Spreadsheet } from '../../../../types/spreadsheetTypes';
import { Cell } from '../../../../types/cellTypes';
import { getColumnLetter } from '../../Functions/Utils';

import { DEFAULT_FONT_FAMILY, DEFAULT_FONT_SIZE } from '../../SpreadsheetTable';

export const useCellSelection = (
    spreadsheet: Spreadsheet | null,
    selectedCellsId: number[],
    setSelectedCellsId: (ids: number[]) => void,
    setSelectedCellsContent: (content: { [row: number]: { [col: number]: string | null } }) => void,
    handleCellBlur: () => void,
    setSelectedRange: React.Dispatch<React.SetStateAction<string | null>>,
    setCurrentFontFamily: React.Dispatch<React.SetStateAction<string>>,
    setCurrentFontSize: React.Dispatch<React.SetStateAction<number>>,
    setCurrentTextColor: React.Dispatch<React.SetStateAction<string>>,
    setCurrentBgColor: React.Dispatch<React.SetStateAction<string>>,
) => {
    const spreadsheetType = spreadsheet!.type;
    const isSelecting = useRef<boolean>(false);
    const startCell = useRef<{ row: number, col: number } | null>(null);

    useEffect(() => {
        const handleWindowMouseUp = () => {
            handleCellMouseUp();
        };

        window.addEventListener('mouseup', handleWindowMouseUp);

        return () => {
            window.removeEventListener('mouseup', handleWindowMouseUp);
        };
    }, []);

    const getSelectedCells = (start: { row: number, col: number }, end: { row: number, col: number }) => {
        let selectedCells: { row: number, col: number, id: number, content: string | null }[] = [];
        const startRow = Math.min(start.row, end.row);
        const endRow = Math.max(start.row, end.row);
        const startCol = Math.min(start.col, end.col);
        const endCol = Math.max(start.col, end.col);

        for (let rowIndex = startRow; rowIndex <= endRow; rowIndex++) {
            for (let colIndex = startCol; colIndex <= endCol; colIndex++) {
                const cell = spreadsheet?.sheet?.cells?.find((c: Cell) => c.row === rowIndex && c.col === colIndex);
                if (cell) {
                    selectedCells.push({
                        row: rowIndex,
                        col: colIndex,
                        id: cell.id,
                        content: cell.content ? cell.content : null,
                    });
                }
            }
        }
        return selectedCells;
    };

    const handleCellMouseDown = (e: React.MouseEvent, rowIndex: number, colIndex: number) => {
        e.preventDefault();
        handleCellBlur();
        isSelecting.current = true;
        startCell.current = { row: rowIndex, col: colIndex };
        setSelectedCellsId([]);
        setSelectedCellsContent({});
        setSelectedRange(null);
    };

    const handleCellMouseMove = (e: React.MouseEvent, rowIndex: number, colIndex: number) => {
        e.preventDefault();
        if (isSelecting.current && startCell.current) {
            const newSelectedCells = getSelectedCells(startCell.current, { row: rowIndex, col: colIndex });

            // Sort cells by row and column (needed for operations like Ctrl+V)
            const sortedSelectedCells = newSelectedCells.sort((a, b) => {
                if (a.row === b.row) {
                    return a.col - b.col;
                }
                return a.row - b.row;
            });

            const selectedCellsId = sortedSelectedCells.map(cell => cell.id);

            const selectedCellsContent = sortedSelectedCells.reduce((acc, cell) => {
                if (!acc[cell.row]) {
                    acc[cell.row] = {};
                }
                acc[cell.row][cell.col] = cell.content;
                return acc;
            }, {} as { [row: number]: { [col: number]: string | null } });

            setSelectedCellsId(selectedCellsId);
            setSelectedCellsContent(selectedCellsContent);
        }
    };

    const handleCellMouseUp = () => {
        isSelecting.current = false;
        startCell.current = null;
    };

    // Update selected range and cell styles whenever selectedCellsId changes
    useEffect(() => {
        if (selectedCellsId.length > 0 && spreadsheet!.sheet) {
            const calculatedRange = calculateSelectedRange(selectedCellsId);
            setSelectedRange(calculatedRange);

            const cell = spreadsheet?.sheet.cells.find(c => c.id === selectedCellsId[0]);
            if (cell) {
                setCurrentFontFamily(cell.style?.fontFamily || DEFAULT_FONT_FAMILY);
                setCurrentFontSize(cell.style?.fontSize || DEFAULT_FONT_SIZE);
                setCurrentTextColor(cell.color || '#FFFFFF');
                setCurrentBgColor(cell.bgColor || '#242424');
            }
        }
    }, [selectedCellsId]);

    const calculateSelectedRange = (selectedIds: number[]) => {
        if (!spreadsheet?.sheet?.cells) return null;

        const selectedCells = selectedIds
            .map(id => spreadsheet.sheet?.cells?.find((c: Cell) => c.id === id))
            .filter((c): c is Cell => c !== undefined);

        if (selectedCells.length === 0) return null;

        const rows = selectedCells.map(c => c.row);
        const cols = selectedCells.map(c => c.col);

        const minRow = Math.min(...rows) + 1;
        const maxRow = Math.max(...rows) + 1;
        const minCol = Math.min(...cols);
        const maxCol = Math.max(...cols);

        const minColLetter = getColumnLetter(true, spreadsheetType, minCol);
        const maxColLetter = getColumnLetter(true, spreadsheetType, maxCol);

        if (minRow === maxRow && minCol === maxCol) {
            return `${minColLetter}${minRow}`;
        } else {
            return `${minColLetter}${minRow}:${maxColLetter}${maxRow}`;
        }
    };

    return {
        handleCellMouseDown,
        handleCellMouseMove,
    };
};