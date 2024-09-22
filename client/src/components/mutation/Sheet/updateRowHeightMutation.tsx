import { useMutation } from "react-query";
import { updateRowHeight } from "../../../fetch/SheetFetch";
import { useInfo } from "../../../context/InfoContext";
import { Spreadsheet } from "../../../types/spreadsheetTypes";
import { Sheet } from "../../../types/sheetTypes";
import { useRef } from "react";
import { initializeSizes } from "../../Spreadsheet/Functions/Utils";
import { DEFAULT_ROW_HEIGHT } from "../../Spreadsheet/SpreadsheetTable";

export const useUpdateRowHeightMutation = (
    spreadsheet: Spreadsheet | undefined,
    setSpreadsheet: React.Dispatch<React.SetStateAction<Spreadsheet | undefined>>,
    setRowHeights: React.Dispatch<React.SetStateAction<number[]>>,
    updateCtrlZMemory: (updatedSheet: Sheet) => void, 
    setSaving: React.Dispatch<React.SetStateAction<boolean>>
) => {
    const { setInfo } = useInfo();

    const previousSpreadsheetRef = useRef<Spreadsheet | undefined>(spreadsheet);

    return useMutation(updateRowHeight, {
        onSuccess: (updatedSheet) => {
            setSaving(false);
            setSpreadsheet((prevSpreadsheet: any) => {
                if (!prevSpreadsheet) {
                    return prevSpreadsheet;
                }

                // handling of setColWidths is made inside the handleMouseMove

                return {
                    ...prevSpreadsheet,
                    sheet: updatedSheet,
                };
            });
            updateCtrlZMemory(updatedSheet);
        },
        onError: (error: any) => {
            setSaving(false);
            let errorMessage = 'Something went wrong saving the new height. Try again';

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            if (error.status !== 401) {
                console.error('Error updating row height:', errorMessage);
            }
            setInfo({ message: errorMessage, isError: true });

            if (previousSpreadsheetRef.current) {
                setSpreadsheet(previousSpreadsheetRef.current);

                const numRows = previousSpreadsheetRef.current.sheet?.numRows ?? 100;
                const rowHeights = previousSpreadsheetRef.current.sheet?.rowHeights ?? {};

                setRowHeights(() => initializeSizes(numRows, DEFAULT_ROW_HEIGHT, rowHeights));
            }
        }
    });
};
