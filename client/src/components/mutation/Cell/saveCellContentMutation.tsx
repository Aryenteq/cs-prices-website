import { useMutation } from "react-query";
import { updateCellContent } from "../../../fetch/CellFetch";
import { useInfo } from "../../../context/InfoContext";
import { Cell } from "../../../types/cellTypes";
import { defaultSpreadsheet, Spreadsheet } from "../../../types/spreadsheetTypes";
import { Sheet } from "../../../types/sheetTypes";

export const useSaveCellContentMutation = (
    setSpreadsheet: React.Dispatch<React.SetStateAction<Spreadsheet>>,
    updateCtrlZMemory: (updatedSheet: Sheet) => void,
    setSaving: React.Dispatch<React.SetStateAction<boolean>>
) => {
    const { setInfo } = useInfo();

    return useMutation(updateCellContent, {
        onMutate: async (updatedCellData: { cellId: number, content: string }[]) => {
            setSaving(true);

            let previousSpreadsheet: Spreadsheet = defaultSpreadsheet;

            setSpreadsheet((prevSpreadsheet) => {
                if (!prevSpreadsheet) return prevSpreadsheet;

                previousSpreadsheet = { ...prevSpreadsheet };

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

            return { previousSpreadsheet }; // Return for rollback
        },
        onSuccess: (updatedSheet: Sheet) => {
            setSaving(false);
            setSpreadsheet((prevSpreadsheet: Spreadsheet) => {
                if (!prevSpreadsheet) return prevSpreadsheet;

                updateCtrlZMemory(updatedSheet);

                return {
                    ...prevSpreadsheet,
                    sheet: updatedSheet
                };
            });
        },
        onError: (error: any, _updatedCellData: any, context: { previousSpreadsheet: Spreadsheet } | undefined) => {
            setSaving(false);
            let errorMessage = 'Something went wrong saving the new content. Try again';

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            if (error.status !== 401) {
                console.error('Error updating cell content:', errorMessage);
            }
            setInfo({ message: errorMessage, isError: true });

            if (context?.previousSpreadsheet) {
                setSpreadsheet(context.previousSpreadsheet);
            }
        }
    });
};