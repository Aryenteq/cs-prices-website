import { useMutation } from "react-query";
import { updateCellsColor } from "../../../fetch/CellFetch";
import { useInfo } from "../../../context/InfoContext";
import { Cell } from "../../../types/cellTypes";

export const useUpdateCellsColorMutation = (
    setSpreadsheet: Function,
    updateCtrlZMemory: Function,
    setSaving: Function
) => {
    const { setInfo } = useInfo();

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
        onError: (error: any, rollback: any) => {
            setSaving(false);
            if (rollback) {
                setSpreadsheet(rollback);
            }

            let errorMessage = 'Something went wrong updating the text color';
            if (error.status !== 401) {
                console.error('Error updating text color:', error);
            }
            setInfo({ message: errorMessage, isError: true });
        },
    });
};