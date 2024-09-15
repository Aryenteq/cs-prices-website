import { useMutation } from "react-query";
import { updateHiddenCols } from "../../../fetch/SheetFetch";
import { useInfo } from "../../InfoContext";
import { Spreadsheet } from "../../../types/spreadsheetTypes";
import type { ItemsVisibility } from "../../../types/sheetTypes";

export const useUpdateHiddenColsMutation = (
    setSpreadsheet: Function,
    setHiddenCols: Function,
    updateCtrlZMemory: Function,
    setSaving: Function
) => {
    const { setInfo } = useInfo();

    return useMutation(updateHiddenCols, {
        onMutate: async ({ cols }: { cols: ItemsVisibility[] }) => {
            setSaving(true);

            return setSpreadsheet((prevSpreadsheet: Spreadsheet | undefined) => {
                if (!prevSpreadsheet) return prevSpreadsheet;

                const updatedHiddenCols = { ...prevSpreadsheet.sheet.hiddenCols };

                cols.forEach((col) => {
                    updatedHiddenCols[col.index] = col.hidden;
                });

                setHiddenCols((prevHiddenCols: boolean[]) => {
                    const newHiddenCols = [...prevHiddenCols];
                    cols.forEach((col) => {
                        newHiddenCols[col.index] = col.hidden;
                    });
                    return newHiddenCols;
                });

                const updatedSheet = {
                    ...prevSpreadsheet.sheet,
                    hiddenCols: updatedHiddenCols
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
        onError: (error: any, rollback: any) => {
            setSaving(false);

            let errorMessage = 'Something went wrong saving the new hidden columns. Try again';
            if (error instanceof Error) {
                errorMessage = error.message;
            }

            if (error.status !== 401) {
                console.error('Error updating columns:', errorMessage);
            }
            setInfo({ message: errorMessage, isError: true });

            // Rollback in case of error
            if (rollback) {
                setSpreadsheet(rollback);
            }
        },
    });
};