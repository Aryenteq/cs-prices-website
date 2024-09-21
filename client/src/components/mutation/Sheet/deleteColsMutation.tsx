import { useMutation } from "react-query";
import { deleteSheetCols } from "../../../fetch/SheetFetch";
import { useInfo } from "../../../context/InfoContext";
import { Spreadsheet } from "../../../types/spreadsheetTypes";
import { Sheet } from "../../../types/sheetTypes";

export const useDeleteColsMutation = (setSpreadsheet: React.Dispatch<React.SetStateAction<Spreadsheet>>, updateCtrlZMemory: (updatedSheet: Sheet) => void, setSaving: React.Dispatch<React.SetStateAction<boolean>>) => {
    const { setInfo } = useInfo();

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
        }
    });
};
