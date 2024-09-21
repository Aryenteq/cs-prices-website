import { useCallback } from 'react';
import { Sheet } from '../../../../types/sheetTypes';
import { CTRL_Z_MEMORY_LENGTH } from '../../../../pages/SpreadsheetPage';

export const useCtrlZMemory = (
    setCtrlZSheets: Function,
    ctrlZIndex: number | null,
    setCtrlZIndex: Function,
) => {

    const updateCtrlZMemory = useCallback((updatedSheet: Sheet) => {
        setCtrlZSheets((prevSheets: Sheet[] | null) => {
            const currentCtrlZIndex = ctrlZIndex !== null ? ctrlZIndex : 0;

            const newSheets = prevSheets ? [...prevSheets] : [];

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
    }, [ctrlZIndex, setCtrlZSheets, setCtrlZIndex, CTRL_Z_MEMORY_LENGTH]);

    return {
        updateCtrlZMemory,
    };
};