import { Sheet } from "../../../../types/sheetTypes";
import { Spreadsheet } from "../../../../types/spreadsheetTypes";
import { initializeSizes, initializeVisibility } from "../../../Spreadsheet/Functions/Utils";
import { DEFAULT_COL_WIDTH, DEFAULT_ROW_HEIGHT } from "../../../Spreadsheet/SpreadsheetTable";

export const useRedo = (
    ctrlZSheets: Sheet[] | null,
    ctrlZIndex: number | null,
    setCtrlZIndex: Function,
    setSpreadsheet: React.Dispatch<React.SetStateAction<Spreadsheet>>,
    setSaving: React.Dispatch<React.SetStateAction<boolean>>,
    setEditingCell: Function,
    revertSheetMutation: any,
    setRowHeights: React.Dispatch<React.SetStateAction<number[]>>,
    setColWidths: React.Dispatch<React.SetStateAction<number[]>>,
    setHiddenRows: React.Dispatch<React.SetStateAction<boolean[]>>,
    setHiddenCols: React.Dispatch<React.SetStateAction<boolean[]>>,
) => {
    const redo = async () => {
        if (ctrlZSheets === null || ctrlZIndex === null || ctrlZIndex >= ctrlZSheets.length - 1) {
            return;
        }

        setCtrlZIndex((prevIndex: number | null) => {
            const newIndex = prevIndex !== null ? prevIndex + 1 : 0;
            const nextSheet = ctrlZSheets[newIndex];

            if (nextSheet) {
                setSaving(true);
                setEditingCell(null);

                // Optimistic update
                setSpreadsheet((prevSpreadsheet: any) => {
                    if (!prevSpreadsheet) return prevSpreadsheet;

                    setRowHeights(() => initializeSizes(nextSheet.numRows, DEFAULT_ROW_HEIGHT, nextSheet.rowHeights));
                    setColWidths(() => initializeSizes(nextSheet.numCols, DEFAULT_COL_WIDTH, nextSheet.columnWidths));
                    setHiddenRows(() => initializeVisibility(nextSheet.numRows, nextSheet.hiddenRows));
                    setHiddenCols(() => initializeVisibility(nextSheet.numCols, nextSheet.hiddenCols));

                    return {
                        ...prevSpreadsheet,
                        sheet: nextSheet,
                    };
                });

                revertSheetMutation.mutate(
                    { sheetId: nextSheet.id, sheet: nextSheet },
                );
            }

            return newIndex;
        });
    };

    return redo;
};