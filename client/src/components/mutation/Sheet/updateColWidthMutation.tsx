import { useMutation } from "react-query";
import { updateColWidth } from "../../../fetch/SheetFetch";
import { useInfo } from "../../InfoContext";

export const useUpdateColWidthMutation = (
    setSpreadsheet: Function, 
    updateCtrlZMemory: Function, 
    setSaving: Function
) => {
    const { setInfo } = useInfo();

    return useMutation(updateColWidth, {
        onSuccess: (updatedSheet) => {
            setSaving(false);
            setSpreadsheet((prevSpreadsheet: any) => {
                if (!prevSpreadsheet) {
                    return prevSpreadsheet;
                }

                // handling of setColWidths made inside the handleMouseMove

                return {
                    ...prevSpreadsheet,
                    sheet: updatedSheet,
                };
            });
            updateCtrlZMemory(updatedSheet);
        },
        onError: (error: any) => {
            setSaving(false);
            let errorMessage = 'Something went wrong saving the new width. Try again';

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            if (error.status !== 401) {
                console.error('Error updating column width:', errorMessage);
            }
            setInfo({ message: errorMessage, isError: true });
        }
    });
};
