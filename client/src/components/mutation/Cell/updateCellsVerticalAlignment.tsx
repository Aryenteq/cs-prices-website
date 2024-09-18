import { useMutation } from "react-query";
import { updateCellsVerticalAlignment } from "../../../fetch/CellFetch";
import { useInfo } from "../../InfoContext";
import { Cell } from "../../../types/cellTypes";

export const useUpdateCellsVerticalAlignmentMutation = (
    setSpreadsheet: Function,
    updateCtrlZMemory: Function,
    setSaving: Function
) => {
    const { setInfo } = useInfo();

    return useMutation(updateCellsVerticalAlignment, {
        onMutate: async (alignmentsToUpdate: { cellId: number, vAlignment: string }[]) => {
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
                                vAlignment: alignmentUpdate.vAlignment,
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

            let errorMessage = 'Something went wrong updating the vertical alignment';
            if (error.status !== 401) {
                console.error('Error updating vertical alignment:', error);
            }
            setInfo({ message: errorMessage, isError: true });
        },
    });
};