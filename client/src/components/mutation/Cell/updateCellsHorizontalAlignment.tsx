import { useMutation } from "react-query";
import { updateCellsHorizontalAlignment } from "../../../fetch/CellFetch";
import { useInfo } from "../../../context/InfoContext";
import { Cell } from "../../../types/cellTypes";

export const useUpdateCellsHorizontalAlignmentMutation = (
    setSpreadsheet: Function,
    updateCtrlZMemory: Function,
    setSaving: Function
) => {
    const { setInfo } = useInfo();

    return useMutation(updateCellsHorizontalAlignment, {
        onMutate: async (alignmentsToUpdate) => {
            setSaving(true);

            return setSpreadsheet((prevSpreadsheet: any) => {
                if (!prevSpreadsheet) return prevSpreadsheet;

                const updatedSheet = {
                    ...prevSpreadsheet.sheet,
                    cells: prevSpreadsheet.sheet.cells.map((cell: Cell) => {
                        const alignmentUpdate = alignmentsToUpdate.find(
                            ({ cellId }) => cellId === cell.id
                        );
                        if (alignmentUpdate) {
                            return {
                                ...cell,
                                hAlignment: alignmentUpdate.hAlignment,
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

            let errorMessage = 'Something went wrong updating the horizontal alignment';
            if (error.status !== 401) {
                console.error('Error updating horizontal alignment:', error);
            }
            setInfo({ message: errorMessage, isError: true });
        },
    });
};