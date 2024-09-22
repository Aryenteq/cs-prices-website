import { useMutation } from "react-query";
import { updateColWidth } from "../../../fetch/SheetFetch";
import { useInfo } from "../../../context/InfoContext";
import { Spreadsheet } from "../../../types/spreadsheetTypes";
import { Sheet } from "../../../types/sheetTypes";
import { useRef } from "react";
import { initializeSizes } from "../../Spreadsheet/Functions/Utils";
import { DEFAULT_COL_WIDTH } from "../../Spreadsheet/SpreadsheetTable";

export const useUpdateColWidthMutation = (
    spreadsheet: Spreadsheet | undefined,
    setSpreadsheet: React.Dispatch<React.SetStateAction<Spreadsheet | undefined>>,
    setColWidths: React.Dispatch<React.SetStateAction<number[]>>,
    updateCtrlZMemory: (updatedSheet: Sheet) => void,
    setSaving: React.Dispatch<React.SetStateAction<boolean>>
) => {
    const { setInfo } = useInfo();

    // For rollback purposes
    const previousSpreadsheetRef = useRef<Spreadsheet | undefined>(spreadsheet);

    return useMutation(updateColWidth, {
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
            let errorMessage = 'Something went wrong saving the new width. Try again';

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            if (error.status !== 401) {
                console.error('Error updating column width:', errorMessage);
            }
            setInfo({ message: errorMessage, isError: true });

            // Rollback in case of error
            if (previousSpreadsheetRef.current) {
                setSpreadsheet(previousSpreadsheetRef.current);

                const numCols = previousSpreadsheetRef.current.sheet?.numCols ?? 26;
                const colWidths = previousSpreadsheetRef.current.sheet?.columnWidths ?? {};

                setColWidths(() => initializeSizes(numCols, DEFAULT_COL_WIDTH, colWidths));
            }
        },
    });
};