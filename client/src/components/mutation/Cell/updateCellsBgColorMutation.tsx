import { useMutation } from "react-query";
import { updateCellsBgColor } from "../../../fetch/CellFetch";
import { useInfo } from "../../../context/InfoContext";
import { Cell } from "../../../types/cellTypes";
import { Spreadsheet } from "../../../types/spreadsheetTypes";
import { Sheet } from "../../../types/sheetTypes";
import { useRef } from "react";

export const useUpdateCellsBgColorMutation = (
    spreadsheet: Spreadsheet | undefined,
    setSpreadsheet: React.Dispatch<React.SetStateAction<Spreadsheet | undefined>>,
    updateCtrlZMemory: (updatedSheet: Sheet) => void,
    setSaving: React.Dispatch<React.SetStateAction<boolean>>
) => {
    const { setInfo } = useInfo();

    const previousSpreadsheetRef = useRef<Spreadsheet | undefined>(spreadsheet);

    return useMutation(updateCellsBgColor, {
        onMutate: async (bgColorsToUpdate: { cellId: number, bgColor: string }[]) => {
            setSaving(true);

            return setSpreadsheet((prevSpreadsheet: any) => {
                if (!prevSpreadsheet) return prevSpreadsheet;

                const updatedSheet = {
                    ...prevSpreadsheet.sheet,
                    cells: prevSpreadsheet.sheet.cells.map((cell: Cell) => {
                        const bgColorUpdate = bgColorsToUpdate.find(({ cellId }) => cellId === cell.id);
                        if (bgColorUpdate) {
                            return {
                                ...cell,
                                bgColor: bgColorUpdate.bgColor,
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

            let errorMessage = 'Something went wrong updating the background color';
            if (error.status !== 401) {
                console.error('Error updating background color:', error);
            }

            setInfo({ message: errorMessage, isError: true });

            if (previousSpreadsheetRef.current) {
                setSpreadsheet(previousSpreadsheetRef.current);
            }
        },
    });
};