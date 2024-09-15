import { useCallback } from 'react';
import { Spreadsheet } from '../../../../types/spreadsheetTypes';

export const useRevealRows = (
    hiddenRows: boolean[],
    setHiddenRows: Function,
    spreadsheet: Spreadsheet,
    updateHiddenRowsMutation: Function
) => {
    const handleRevealRows = useCallback((startIndex: number) => {
        const newHiddenRows = [...hiddenRows];

        let revealStart = startIndex;
        let revealEnd = startIndex;

        // left neighbors
        for (let i = startIndex - 1; i >= 0; i--) {
            if (newHiddenRows[i]) {
                revealStart = i;
            } else {
                break;
            }
        }

        // right neighbors
        for (let i = startIndex + 1; i < newHiddenRows.length; i++) {
            if (newHiddenRows[i]) {
                revealEnd = i;
            } else {
                break;
            }
        }

        const rowsToReveal = [];
        for (let i = revealStart; i <= revealEnd; i++) {
            if (newHiddenRows[i]) {
                rowsToReveal.push({ index: i, hidden: false });
            }
        }

        updateHiddenRowsMutation({
            sheetId: spreadsheet!.sheet.id,
            rows: rowsToReveal,
        });

        setHiddenRows(newHiddenRows);
    }, [hiddenRows, spreadsheet, updateHiddenRowsMutation, setHiddenRows]);

    return {
        handleRevealRows,
    };
};