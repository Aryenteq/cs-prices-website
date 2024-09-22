import { useCallback } from 'react';
import { Spreadsheet } from '../../../../types/spreadsheetTypes';

export const useRevealCols = (
    hiddenCols: boolean[],
    setHiddenCols: Function,
    spreadsheet: Spreadsheet | undefined,
    updateHiddenColsMutation: Function
) => {
    const handleRevealCols = useCallback((startIndex: number) => {
        const newHiddenCols = [...hiddenCols];

        let revealStart = startIndex;
        let revealEnd = startIndex;

        // left neighbors
        for (let i = startIndex - 1; i >= 0; i--) {
            if (newHiddenCols[i]) {
                revealStart = i;
            } else {
                break;
            }
        }

        // right neighbors
        for (let i = startIndex + 1; i < newHiddenCols.length; i++) {
            if (newHiddenCols[i]) {
                revealEnd = i;
            } else {
                break;
            }
        }

        const colsToReveal = [];
        for (let i = revealStart; i <= revealEnd; i++) {
            if (newHiddenCols[i]) {
                colsToReveal.push({ index: i, hidden: false });
            }
        }

        updateHiddenColsMutation({
            sheetId: spreadsheet!.sheet.id,
            cols: colsToReveal,
        });

        setHiddenCols(newHiddenCols);
    }, [hiddenCols, spreadsheet, updateHiddenColsMutation, setHiddenCols]);

    return {
        handleRevealCols,
    };
};
