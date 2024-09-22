import { useMutation } from "react-query";
import { deleteSheetCols } from "../../../fetch/SheetFetch";
import { useInfo } from "../../../context/InfoContext";
import { Spreadsheet } from "../../../types/spreadsheetTypes";
import { Sheet } from "../../../types/sheetTypes";
import { useRef } from "react";

export const useDeleteColsMutation = (
    spreadsheet: Spreadsheet | undefined,
    setSpreadsheet: React.Dispatch<React.SetStateAction<Spreadsheet | undefined>>, 
    updateCtrlZMemory: (updatedSheet: Sheet) => void, 
    setSaving: React.Dispatch<React.SetStateAction<boolean>>
) => {
    const { setInfo } = useInfo();

    const previousSpreadsheetRef = useRef<Spreadsheet | undefined>(spreadsheet);

    return useMutation(deleteSheetCols, {
        onSuccess: (updatedSheet) => {
            setSaving(false);
            setSpreadsheet((prevSpreadsheet: any) => {
                if (!prevSpreadsheet) {
                    return prevSpreadsheet;
                }

                return {
                    ...prevSpreadsheet,
                    sheet: updatedSheet,
                };
            });
            updateCtrlZMemory(updatedSheet);
        },
        onError: (error: any) => {
            setSaving(false);
            let errorMessage = 'Something went wrong deleting the cols. Try again';

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            if (error.status !== 401) {
                console.error('Error deleting cols:', errorMessage);
            }
            setInfo({ message: errorMessage, isError: true });

            if (previousSpreadsheetRef.current) {
                setSpreadsheet(previousSpreadsheetRef.current);
            }
        }
    });
};
