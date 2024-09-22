import { useMutation } from "react-query";
import { addCols } from "../../../fetch/SheetFetch";
import { useInfo } from "../../../context/InfoContext";
import { initializeSizes } from "../../Spreadsheet/Functions/Utils";
import { DEFAULT_COL_WIDTH } from "../../Spreadsheet/SpreadsheetTable";
import { Spreadsheet } from "../../../types/spreadsheetTypes";
import { Sheet } from "../../../types/sheetTypes";
import { useRef } from "react";

export const useAddColsMutation = (
    spreadsheet: Spreadsheet | undefined,
    setSpreadsheet: React.Dispatch<React.SetStateAction<Spreadsheet | undefined>>, 
    setColWidths: React.Dispatch<React.SetStateAction<number[]>>, 
    updateCtrlZMemory: (updatedSheet: Sheet) => void, 
    setSaving: React.Dispatch<React.SetStateAction<boolean>>
) => {
    const { setInfo } = useInfo();

    const previousSpreadsheetRef = useRef<Spreadsheet | undefined>(spreadsheet);

    return useMutation(addCols, {
        onSuccess: (updatedSheet) => {
            setSaving(false);
            setSpreadsheet((prevSpreadsheet: any) => {
                if (!prevSpreadsheet) {
                    return prevSpreadsheet;
                }

                setColWidths(initializeSizes(updatedSheet.numCols, DEFAULT_COL_WIDTH, updatedSheet.columnWidths));

                return {
                    ...prevSpreadsheet,
                    sheet: updatedSheet,
                };
            });
            updateCtrlZMemory(updatedSheet);
        },
        onError: (error: any) => {
            setSaving(false);
            let errorMessage = 'Something went wrong inserting the columns. Try again';

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            if (error.status !== 401) {
                console.error('Error inserting cols:', errorMessage);
            }
            setInfo({ message: errorMessage, isError: true });

            if (previousSpreadsheetRef.current) {
                setSpreadsheet(previousSpreadsheetRef.current);
            }
        }
    });
};
