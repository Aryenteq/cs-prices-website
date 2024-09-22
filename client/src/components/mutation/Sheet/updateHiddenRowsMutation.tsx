import { useMutation } from "react-query";
import { updateHiddenRows } from "../../../fetch/SheetFetch";
import { useInfo } from "../../../context/InfoContext";
import { Spreadsheet } from "../../../types/spreadsheetTypes";
import type { ItemsVisibility, Sheet } from "../../../types/sheetTypes";
import { useRef } from "react";
import { initializeVisibility } from "../../Spreadsheet/Functions/Utils";

export const useUpdateHiddenRowsMutation = (
    spreadsheet: Spreadsheet | undefined,
    setSpreadsheet: React.Dispatch<React.SetStateAction<Spreadsheet | undefined>>,
    setHiddenRows: React.Dispatch<React.SetStateAction<boolean[]>>,
    updateCtrlZMemory: (updatedSheet: Sheet) => void,
    setSaving: React.Dispatch<React.SetStateAction<boolean>>
) => {
    const { setInfo } = useInfo();

    // For rollback purposes
    const previousSpreadsheetRef = useRef<Spreadsheet | undefined>(spreadsheet);

    return useMutation(updateHiddenRows, {
        onMutate: async ({ rows }: { rows: ItemsVisibility[] }) => {
            setSaving(true);

            setSpreadsheet((prevSpreadsheet: Spreadsheet | undefined) => {
                if (!prevSpreadsheet) return prevSpreadsheet;

                const updatedHiddenRows = { ...prevSpreadsheet.sheet.hiddenRows };
                rows.forEach((row) => {
                    updatedHiddenRows[row.index] = row.hidden;
                });

                setHiddenRows((prevHiddenRows) => {
                    const newHiddenRows = [...prevHiddenRows];
                    rows.forEach((row) => {
                        newHiddenRows[row.index] = row.hidden;
                    });
                    return newHiddenRows;
                });

                const updatedSheet = {
                    ...prevSpreadsheet.sheet,
                    hiddenRows: updatedHiddenRows,
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

            let errorMessage = 'Something went wrong saving the new hidden rows. Try again';
            if (error instanceof Error) {
                errorMessage = error.message;
            }

            if (error.status !== 401) {
                console.error('Error updating rows:', errorMessage);
            }
            setInfo({ message: errorMessage, isError: true });

            if (previousSpreadsheetRef.current) {
                setSpreadsheet(previousSpreadsheetRef.current);

                const numRows = previousSpreadsheetRef.current.sheet?.numRows ?? 100;
                const hiddenRows = previousSpreadsheetRef.current.sheet?.hiddenRows ?? {};

                setHiddenRows(() => initializeVisibility(numRows, hiddenRows));
            }
        },
    });
};