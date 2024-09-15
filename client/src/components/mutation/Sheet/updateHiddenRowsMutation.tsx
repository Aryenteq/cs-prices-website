import { useMutation } from "react-query";
import { updateHiddenRows } from "../../../fetch/SheetFetch";
import { useInfo } from "../../InfoContext";
import { Spreadsheet } from "../../../types/spreadsheetTypes";
import type { ItemsVisibility } from "../../../types/sheetTypes";

export const useUpdateHiddenRowsMutation = (
    setSpreadsheet: Function,
    setHiddenRows: Function,
    updateCtrlZMemory: Function,
    setSaving: Function
) => {
    const { setInfo } = useInfo();

    return useMutation(updateHiddenRows, {
        onMutate: async ({ rows }: { rows: ItemsVisibility[] }) => {
            setSaving(true);

            return setSpreadsheet((prevSpreadsheet: Spreadsheet | undefined) => {
                if (!prevSpreadsheet) return prevSpreadsheet;

                const updatedHiddenRows = { ...prevSpreadsheet.sheet.hiddenRows };

                // Update hidden rows optimistically
                rows.forEach((row) => {
                    updatedHiddenRows[row.index] = row.hidden;
                });

                setHiddenRows((prevHiddenRows: boolean[]) => {
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
        onError: (error: any, rollback: any) => {
            setSaving(false);

            let errorMessage = 'Something went wrong saving the new hidden rows. Try again';
            if (error instanceof Error) {
                errorMessage = error.message;
            }

            if (error.status !== 401) {
                console.error('Error updating rows:', errorMessage);
            }
            setInfo({ message: errorMessage, isError: true });

            // Rollback in case of error
            if (rollback) {
                setSpreadsheet(rollback);
            }
        },
    });
};