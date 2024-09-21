import { useState, useEffect } from 'react';
import { Spreadsheet } from '../../../../types/spreadsheetTypes';
import { MINIMUM_SIZE, EDGE_THRESHOLD } from '../../SpreadsheetTable';

export const useColResizeHandler = (
    colWidths: number[],
    setColWidths: Function,
    updateColWidthMutation: Function,
    spreadsheet: Spreadsheet,
    setSaving: React.Dispatch<React.SetStateAction<boolean>>
) => {
    const [currentResizeColIndex, setCurrentResizeColIndex] = useState<number | null>(null);
    const [isResizing, setIsResizing] = useState(false);
    const [startX, setStartX] = useState(0);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return; // lmb only
        e.preventDefault();
        setIsResizing(true);
        setStartX(e.clientX);
    };

    const handleMouseMove = (e: React.MouseEvent, currentIndex: number) => {
        const { clientX } = e;

        if (isResizing && currentResizeColIndex !== null) {
            const deltaX = clientX - startX;
            setStartX(clientX);
            const newWidth = Math.max(MINIMUM_SIZE, colWidths[currentResizeColIndex] + deltaX);
            setColWidths((prevWidths: number[]) => {
                const updatedWidths = [...prevWidths];
                updatedWidths[currentResizeColIndex] = newWidth;
                return updatedWidths;
            });
        } else {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const isNearRightEdge = clientX >= rect.right - EDGE_THRESHOLD && clientX <= rect.right + EDGE_THRESHOLD;
            const isNearLeftEdgeNextCol = clientX >= rect.left - EDGE_THRESHOLD && clientX <= rect.left + EDGE_THRESHOLD;

            if (isNearRightEdge) {
                setCurrentResizeColIndex(currentIndex);
            } else if (isNearLeftEdgeNextCol && currentIndex > 0) {
                setCurrentResizeColIndex(currentIndex - 1);
            } else {
                setCurrentResizeColIndex(null);
            }
        }
    };

    const handleMouseUp = () => {
        if (isResizing && currentResizeColIndex !== null) {
            setColWidths((prevWidths: number[]) => {
                const newWidth = prevWidths[currentResizeColIndex];
                setSaving(true);
                updateColWidthMutation({
                    sheetId: spreadsheet!.sheet.id,
                    colIndex: currentResizeColIndex,
                    width: newWidth
                });
                return prevWidths;
            });
            setIsResizing(false);
        }
    };

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    return {
        handleMouseDown,
        handleMouseMove,
        currentResizeColIndex,
        setCurrentResizeColIndex,
        isResizing,
    };
};