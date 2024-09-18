import { useMutation } from "react-query";
import { updateCellsBgColor } from "../../../fetch/CellFetch";
import { useInfo } from "../../../context/InfoContext";
import { Cell } from "../../../types/cellTypes";

export const useUpdateCellsBgColorMutation = (
    setSpreadsheet: Function,
    updateCtrlZMemory: Function,
    setSaving: Function
) => {
    const { setInfo } = useInfo();

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
        onError: (error: any, rollback: any) => {
            setSaving(false);
            if (rollback) {
                setSpreadsheet(rollback);
            }

            let errorMessage = 'Something went wrong updating the background color';
            if (error.status !== 401) {
                console.error('Error updating background color:', error);
            }
            setInfo({ message: errorMessage, isError: true });
        },
    });
};