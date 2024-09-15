import { useMutation } from "react-query";
import { updatePastedCellsContent } from "../../../fetch/CellFetch";
import { useInfo } from "../../InfoContext";
import { Cell, SelectedCellsContent } from "../../../types/cellTypes";

export const useSavePastedContentMutation = (
    setSpreadsheet: Function,
    updateCtrlZMemory: Function,
    setSaving: Function
) => {
    const { setInfo } = useInfo();

    return useMutation(updatePastedCellsContent, {
        onMutate: async ({ firstCellId, contents }: { firstCellId: number, contents: SelectedCellsContent }) => {
            setSaving(true);
            /*
            return setSpreadsheet((prevSpreadsheet: any) => {
                if (!prevSpreadsheet) return prevSpreadsheet;

                const firstCell = prevSpreadsheet.sheet.cells.find((cell: Cell) => cell.id === firstCellId);

                if (!firstCell) {
                    console.error('First cell not found');
                    return prevSpreadsheet;
                }

                const { row: firstRow, col: firstCol } = firstCell;

                // If you optimistically update, you won't know if any changes are made after that or not
                // isEditing is not enough. If you want to update before the BE responds, isEditing needs to be true
                // ihmlegendary appears in front

                // also the logic for the update is not logic
                // doesn't work, was 2am, don't feel like thinking
                const rowDiff = contents[0]?.[0]
                const updatedSheet = {
                    ...prevSpreadsheet.sheet,
                    cells: prevSpreadsheet.sheet.cells.map((cell: Cell) => {
                        const relativeRow = cell.row - firstRow;
                        const relativeCol = cell.col - firstCol;
            
                        const cellContent = contents[relativeRow]?.[relativeCol];
            
                        if (cellContent !== undefined) {
                            return {
                                ...cell,
                                content: cellContent,
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
            }); */
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
            let errorMessage = 'Something went wrong saving the pasted content. Try again';

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            if (error.status !== 401) {
                console.error('Error updating pasted content:', errorMessage);
            }
            setInfo({ message: errorMessage, isError: true });

            if (rollback) {
                setSpreadsheet(rollback);
            }
        }
    });
};