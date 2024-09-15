import { useMutation } from "react-query";
import { addCols } from "../../../fetch/SheetFetch";
import { useInfo } from "../../InfoContext";
import { initializeSizes } from "../../Spreadsheet/Functions/Utils";
import { DEFAULT_COL_WIDTH } from "../../Spreadsheet/SpreadsheetTable";

export const useAddColsMutation = (setSpreadsheet: Function, setColWidths: React.Dispatch<React.SetStateAction<number[]>>, 
    updateCtrlZMemory: Function, setSaving: Function) => {
    const { setInfo } = useInfo();

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
        }
    });
};
