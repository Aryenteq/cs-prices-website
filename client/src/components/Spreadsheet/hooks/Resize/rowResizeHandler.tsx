import { useState, useEffect } from 'react';
import { Spreadsheet } from '../../../../types/spreadsheetTypes';

import { MINIMUM_SIZE, EDGE_THRESHOLD } from '../../SpreadsheetTable';

export const useRowResizeHandler = (
    rowHeights: number[],
    setRowHeights: Function,
    updateRowHeightMutation: Function,
    spreadsheet: Spreadsheet,
    setSaving: Function
) => {
    const [currentResizeRowIndex, setCurrentResizeRowIndex] = useState<number | null>(null);
    const [isResizing, setIsResizing] = useState(false);
    const [startY, setStartY] = useState(0);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return; // lmb only
        e.preventDefault();
        setIsResizing(true);
        setStartY(e.clientY);
    };

    const handleMouseMove = (e: React.MouseEvent, currentIndex: number) => {
        const { clientY } = e;

        if (isResizing && currentResizeRowIndex !== null) {
            const deltaY = clientY - startY;
            setStartY(clientY);
            const newHeight = Math.max(MINIMUM_SIZE, rowHeights[currentResizeRowIndex] + deltaY);
            setRowHeights((prevHeights: number[]) => {
                const updatedHeights = [...prevHeights];
                updatedHeights[currentResizeRowIndex] = newHeight;
                return updatedHeights;
            });
        } else {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const isNearBottomEdge = clientY >= rect.bottom - EDGE_THRESHOLD && clientY <= rect.bottom + EDGE_THRESHOLD;
            const isNearTopEdgeNextRow = clientY >= rect.top - EDGE_THRESHOLD && clientY <= rect.top + EDGE_THRESHOLD;

            if (isNearBottomEdge) {
                setCurrentResizeRowIndex(currentIndex);
            } else if (isNearTopEdgeNextRow && currentIndex > 0) {
                setCurrentResizeRowIndex(currentIndex - 1);
            } else {
                setCurrentResizeRowIndex(null);
            }
        }
    };

    const handleMouseUp = () => {
        if (isResizing && currentResizeRowIndex !== null) {
            setRowHeights((prevHeights: number[]) => {
                const newHeight = prevHeights[currentResizeRowIndex];
                setSaving(true);
                updateRowHeightMutation({
                    sheetId: spreadsheet!.sheet.id,
                    rowIndex: currentResizeRowIndex,
                    height: newHeight
                });
                return prevHeights;
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
        currentResizeRowIndex,
        setCurrentResizeRowIndex,
        isResizing,
    };
};