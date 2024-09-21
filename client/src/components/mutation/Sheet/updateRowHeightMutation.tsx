import { useMutation } from "react-query";
import { updateRowHeight } from "../../../fetch/SheetFetch";
import { useInfo } from "../../../context/InfoContext";
import { Spreadsheet } from "../../../types/spreadsheetTypes";
import { Sheet } from "../../../types/sheetTypes";

export const useUpdateRowHeightMutation = (
    setSpreadsheet: React.Dispatch<React.SetStateAction<Spreadsheet>>, 
    updateCtrlZMemory: (updatedSheet: Sheet) => void, 
    setSaving: React.Dispatch<React.SetStateAction<boolean>>
) => {
    const { setInfo } = useInfo();

    return useMutation(updateRowHeight, {
        onSuccess: (updatedSheet) => {
            setSaving(false);
            setSpreadsheet((prevSpreadsheet: any) => {
                if (!prevSpreadsheet) {
                    return prevSpreadsheet;
                }

                // handling of setColWidths made inside the handleMouseMove

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
        }
    });
};
