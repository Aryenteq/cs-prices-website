import { useMutation } from "react-query";
import { updateCellsColor } from "../../../fetch/CellFetch";
import { useInfo } from "../../../context/InfoContext";
import { Cell } from "../../../types/cellTypes";
import { Spreadsheet } from "../../../types/spreadsheetTypes";
import { Sheet } from "../../../types/sheetTypes";
import { useRef } from "react";

export const useUpdateCellsColorMutation = (
    spreadsheet: Spreadsheet | undefined,
    setSpreadsheet: React.Dispatch<React.SetStateAction<Spreadsheet | undefined>>,
    updateCtrlZMemory: (updatedSheet: Sheet) => void,
    setSaving: React.Dispatch<React.SetStateAction<boolean>>
) => {
    const { setInfo } = useInfo();

    const previousSpreadsheetRef = useRef<Spreadsheet | undefined>(spreadsheet);

    return useMutation(updateCellsColor, {
        onMutate: async (colorsToUpdate: { cellId: number, color: string }[]) => {
            setSaving(true);

            return setSpreadsheet((prevSpreadsheet: any) => {
                if (!prevSpreadsheet) return prevSpreadsheet;

                const updatedSheet = {
                    ...prevSpreadsheet.sheet,
                    cells: prevSpreadsheet.sheet.cells.map((cell: Cell) => {
                        const colorUpdate = colorsToUpdate.find(({ cellId }) => cellId === cell.id);
                        if (colorUpdate) {
                            return {
                                ...cell,
                                color: colorUpdate.color,
                            };
                        }
                        return cell;
                    }),
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

            let errorMessage = 'Something went wrong updating the text color';
            if (error.status !== 401) {
                console.error('Error updating text color:', error);
            }

            setInfo({ message: errorMessage, isError: true });

            if (previousSpreadsheetRef.current) {
                setSpreadsheet(previousSpreadsheetRef.current);
            }
        },
    });
};