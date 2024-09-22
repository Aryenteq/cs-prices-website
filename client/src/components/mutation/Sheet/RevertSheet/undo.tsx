import { Sheet } from "../../../../types/sheetTypes"
import { Spreadsheet } from "../../../../types/spreadsheetTypes";
import { initializeSizes, initializeVisibility } from "../../../Spreadsheet/Functions/Utils";
import { DEFAULT_COL_WIDTH, DEFAULT_ROW_HEIGHT } from "../../../Spreadsheet/SpreadsheetTable";

export const useUndo = (
    ctrlZSheets: Sheet[] | null,
    ctrlZIndex: number | null,
    setCtrlZIndex: Function,
    setSpreadsheet: React.Dispatch<React.SetStateAction<Spreadsheet | undefined>>,
    setSaving: React.Dispatch<React.SetStateAction<boolean>>,
    setEditingCell: React.Dispatch<React.SetStateAction<{ id: number, row: number, col: number } | null>>,
    revertSheetMutation: any,
    setRowHeights: React.Dispatch<React.SetStateAction<number[]>>,
    setColWidths: React.Dispatch<React.SetStateAction<number[]>>,
    setHiddenRows: React.Dispatch<React.SetStateAction<boolean[]>>,
    setHiddenCols: React.Dispatch<React.SetStateAction<boolean[]>>,
) => {
    const undo = async () => {
        if (ctrlZSheets === null || ctrlZIndex === null || ctrlZIndex === 0) {
            return;
        }

        setCtrlZIndex((prevIndex: number | null) => {
            const newIndex = prevIndex !== null && prevIndex > 0 ? prevIndex - 1 : 0;
            const sheetToRevert = ctrlZSheets[newIndex];

            if (sheetToRevert) {
                setSaving(true);
                setEditingCell(null);

                // Optimistic update
                setSpreadsheet((prevSpreadsheet: any) => {
                    if (!prevSpreadsheet) return prevSpreadsheet;

                    setRowHeights(() => initializeSizes(sheetToRevert.numRows, DEFAULT_ROW_HEIGHT, sheetToRevert.rowHeights));
                    setColWidths(() => initializeSizes(sheetToRevert.numCols, DEFAULT_COL_WIDTH, sheetToRevert.columnWidths));
                    setHiddenRows(() => initializeVisibility(sheetToRevert.numRows, sheetToRevert.hiddenRows));
                    setHiddenCols(() => initializeVisibility(sheetToRevert.numCols, sheetToRevert.hiddenCols));

                    return {
                        ...prevSpreadsheet,
                        sheet: sheetToRevert,
                    };
                });

                revertSheetMutation.mutate(
                    { sheetId: sheetToRevert.id, sheet: sheetToRevert },
                );
            }

            return newIndex;
        });
    };

    return undo;
};