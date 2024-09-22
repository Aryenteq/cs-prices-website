import { useMutation } from "react-query";
import { revertSheet } from "../../../../fetch/SheetFetch";
import { useInfo } from "../../../../context/InfoContext";
import { Spreadsheet } from "../../../../types/spreadsheetTypes";
import { useRef } from "react";

export const useRevertSheetMutation = (
    spreadsheet: Spreadsheet | undefined,
    setSpreadsheet: React.Dispatch<React.SetStateAction<Spreadsheet | undefined>>,
    setSaving: React.Dispatch<React.SetStateAction<boolean>>,
) => {
    const { setInfo } = useInfo();

    const previousSpreadsheetRef = useRef<Spreadsheet | undefined>(spreadsheet);

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

            if (previousSpreadsheetRef.current) {
                setSpreadsheet(previousSpreadsheetRef.current);
            }
        },
    });
};
