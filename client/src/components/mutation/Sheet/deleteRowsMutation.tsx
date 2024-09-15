import { useMutation } from "react-query";
import { deleteSheetRows } from "../../../fetch/SheetFetch";
import { useInfo } from "../../InfoContext";

export const useDeleteRowsMutation = (setSpreadsheet: Function, updateCtrlZMemory: Function, setSaving: Function) => {
    const { setInfo } = useInfo();

    return useMutation(deleteSheetRows, {
        onSuccess: (updatedSheet) => {
            setSaving(false);
            setSpreadsheet((prevSpreadsheet: any) => {
                if (!prevSpreadsheet) {
                    return prevSpreadsheet;
                }

                return {
                    ...prevSpreadsheet,
                    sheet: updatedSheet,
                };
            });
            updateCtrlZMemory(updatedSheet);
        },
        onError: (error: any) => {
            setSaving(false);

            let errorMessage = 'Something went wrong deleting the rows. Try again';

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            if (error.status !== 401) {
                console.error('Error deleting rows:', errorMessage);
            }
            setInfo({ message: errorMessage, isError: true });
        }
    });
};
