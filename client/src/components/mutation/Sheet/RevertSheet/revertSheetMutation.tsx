import { useMutation } from "react-query";
import { revertSheet } from "../../../../fetch/SheetFetch";
import { useInfo } from "../../../../context/InfoContext";

export const useRevertSheetMutation = (setSaving: React.Dispatch<React.SetStateAction<boolean>>) => {
    const { setInfo } = useInfo();

    return useMutation(revertSheet, {
        onSuccess: () => {
            setSaving(false);
        },
        onError: (error: any) => {
            setSaving(false);
            let errorMessage = 'Something went wrong saving the new content. Try again';

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            if (error.status !== 401) {
                console.error('Error updating cell content:', errorMessage);
            }
            setInfo({ message: errorMessage, isError: true });
        },
    });
};
