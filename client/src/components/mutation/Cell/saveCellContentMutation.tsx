import { useMutation } from "react-query";
import { updateCellContent } from "../../../fetch/CellFetch";
import { useInfo } from "../../../context/InfoContext";
import { Cell } from "../../../types/cellTypes";

export const useSaveCellContentMutation = (
    setSpreadsheet: Function, 
    updateCtrlZMemory: Function, 
    setSaving: Function
) => {
    const { setInfo } = useInfo();

    return useMutation(updateCellContent, {
        onMutate: async (updatedCellData: { cellId: number, content: string }[]) => {
            setSaving(true);

            return setSpreadsheet((prevSpreadsheet: any) => {
                if (!prevSpreadsheet) return prevSpreadsheet;

                const updatedSheet = {
                    ...prevSpreadsheet.sheet,
                    cells: prevSpreadsheet.sheet.cells.map((cell: Cell) => {
                        const contentUpdate = updatedCellData.find(({ cellId }) => cellId === cell.id);
                        if (contentUpdate) {
                            return {
                                ...cell,
                                content: contentUpdate.content, // Optimistically update
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
        onSuccess: (updatedSheet) => {
            setSaving(false);
            setSpreadsheet((prevSpreadsheet: any) => {
                if (!prevSpreadsheet) return prevSpreadsheet;

                return {
                    ...prevSpreadsheet,
                    sheet: updatedSheet
                };
            });
            updateCtrlZMemory(updatedSheet);
        },
        onError: (error: any, rollback: any) => {
            setSaving(false);
            let errorMessage = 'Something went wrong saving the new content. Try again';

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            if (error.status !== 401) {
                console.error('Error updating cell content:', errorMessage);
            }
            setInfo({ message: errorMessage, isError: true });

            if (rollback) {
                setSpreadsheet(rollback);
            }
        }
    });
};