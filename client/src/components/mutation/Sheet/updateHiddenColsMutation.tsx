import { useMutation } from "react-query";
import { updateHiddenCols } from "../../../fetch/SheetFetch";
import { useInfo } from "../../../context/InfoContext";
import { Spreadsheet } from "../../../types/spreadsheetTypes";
import type { ItemsVisibility, Sheet } from "../../../types/sheetTypes";
import { initializeVisibility } from "../../Spreadsheet/Functions/Utils";
import { useRef } from "react";

export const useUpdateHiddenColsMutation = (
    spreadsheet: Spreadsheet | undefined,
    setSpreadsheet: React.Dispatch<React.SetStateAction<Spreadsheet | undefined>>,
    setHiddenCols: React.Dispatch<React.SetStateAction<boolean[]>>,
    updateCtrlZMemory: (updatedSheet: Sheet) => void,
    setSaving: React.Dispatch<React.SetStateAction<boolean>>
) => {
    const { setInfo } = useInfo();

    // For rollback porposes
    const previousSpreadsheetRef = useRef<Spreadsheet | undefined>(spreadsheet);

    return useMutation(updateHiddenCols, {
        onMutate: async ({ cols }: { cols: ItemsVisibility[] }) => {
            setSaving(true);

            setSpreadsheet((prevSpreadsheet: Spreadsheet | undefined) => {
                if (!prevSpreadsheet) return prevSpreadsheet;
        
                const updatedHiddenCols = { ...prevSpreadsheet.sheet.hiddenCols };
                cols.forEach((col) => {
                    updatedHiddenCols[col.index] = col.hidden;
                });
        
                setHiddenCols((prevHiddenCols) => {
                    const newHiddenCols = [...prevHiddenCols];
                    cols.forEach((col) => {
                        newHiddenCols[col.index] = col.hidden;
                    });
                    return newHiddenCols;
                });
        
                const updatedSheet = {
                    ...prevSpreadsheet.sheet,
                    hiddenCols: updatedHiddenCols,
                };
        
                updateCtrlZMemory(updatedSheet);

                return {
                    ...prevSpreadsheet,
                    sheet: updatedSheet,
                };
            });
        },
        onSuccess: () => {
            setSaving(false);
        },
        onError: (error: any) => {
            setSaving(false);
        
            let errorMessage = 'Something went wrong saving the new hidden columns. Try again';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
        
            if (error.status !== 401) {
                console.error('Error updating columns:', errorMessage);
            }
            setInfo({ message: errorMessage, isError: true });
        
            if (previousSpreadsheetRef.current) {
                setSpreadsheet(previousSpreadsheetRef.current);
        
                const numCols = previousSpreadsheetRef.current.sheet?.numCols ?? 26;
                const hiddenCols = previousSpreadsheetRef.current.sheet?.hiddenCols ?? {};
        
                setHiddenCols(() => initializeVisibility(numCols, hiddenCols));
            }
        }        
    });
};