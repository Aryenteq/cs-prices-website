import { useMutation } from "react-query";
import { addRows } from "../../../fetch/SheetFetch";
import { useInfo } from "../../InfoContext";
import { initializeSizes } from "../../Spreadsheet/Functions/Utils";
import { DEFAULT_ROW_HEIGHT } from "../../Spreadsheet/SpreadsheetTable";

export const useAddRowsMutation = (setSpreadsheet: Function, setRowHeights: React.Dispatch<React.SetStateAction<number[]>>,
    updateCtrlZMemory: Function, setSaving: Function) => {
    const { setInfo } = useInfo();

    return useMutation(addRows, {
        onSuccess: (updatedSheet) => {
            setSaving(false);
            setSpreadsheet((prevSpreadsheet: any) => {
                if (!prevSpreadsheet) {
                    return prevSpreadsheet;
                }

                setRowHeights(initializeSizes(updatedSheet.numRows, DEFAULT_ROW_HEIGHT, updatedSheet.rowHeights));

                return {
                    ...prevSpreadsheet,
                    sheet: updatedSheet,
                };
            });
            updateCtrlZMemory(updatedSheet);
        },
        onError: (error: any) => {
            setSaving(false);
            let errorMessage = 'Something went wrong deleting the rows. Try again';

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            if (error.status !== 401) {
                console.error('Error deleting rows:', errorMessage);
            }
            setInfo({ message: errorMessage, isError: true });
        }
    });
};