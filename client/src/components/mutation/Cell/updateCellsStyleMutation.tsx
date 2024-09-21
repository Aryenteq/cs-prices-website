import { useMutation } from "react-query";
import { updateCellsStyle } from "../../../fetch/CellFetch";
import { useInfo } from "../../../context/InfoContext";
import { Cell } from "../../../types/cellTypes";
import { Spreadsheet } from "../../../types/spreadsheetTypes";
import { Sheet } from "../../../types/sheetTypes";

export const useUpdateCellsStyleMutation = (setSpreadsheet: React.Dispatch<React.SetStateAction<Spreadsheet>>, updateCtrlZMemory: (updatedSheet: Sheet) => void, setSaving: React.Dispatch<React.SetStateAction<boolean>>) => {
    const { setInfo } = useInfo();

    return useMutation(updateCellsStyle, {
        onMutate: async (stylesToUpdate: { cellId: number, style: Record<string, any> }[]) => {
            setSaving(true);

            return setSpreadsheet((prevSpreadsheet: any) => {
                if (!prevSpreadsheet) return prevSpreadsheet;

                const updatedSheet = {
                    ...prevSpreadsheet.sheet,
                    cells: prevSpreadsheet.sheet.cells.map((cell: Cell) => {
                        const styleUpdate = stylesToUpdate.find(({ cellId }) => cellId === cell.id);
                        if (styleUpdate) {
                            return {
                                ...cell,
                                style: { ...cell.style, ...styleUpdate.style },
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
        onError: (error: any, rollback: any) => {
            setSaving(false);
            if (rollback) {
                setSpreadsheet(rollback);
            }

            let errorMessage = 'Something went wrong updating the styles';
            if (error.status !== 401) {
                console.error('Error updating styles:', error);
            }
            setInfo({ message: errorMessage, isError: true });
        },
    });
};