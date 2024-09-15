import { useQuery } from "react-query";
import { fetchSpreadsheet } from "../../../fetch/SpreadsheetFetch";
import type { Spreadsheet } from "../../../types/spreadsheetTypes";
import { useInfo } from "../../InfoContext";

export const useSpreadsheetFetch = (spreadsheetId: number | null, sheetIndex: number) => {
    const { setInfo } = useInfo();

    const { data: fetchedSpreadsheet, isLoading, error } = useQuery<Spreadsheet, Error>(
        ['spreadsheet', spreadsheetId],
        () => fetchSpreadsheet(spreadsheetId!, sheetIndex),
        {
            keepPreviousData: true,
            onError: (error: any) => {
                if (error.status !== 401) {
                    console.error('Error getting spreadsheet:', error);
                }
                const parsedMessage = JSON.parse(error.message);
                const errorMessage = parsedMessage.message || 'An unknown error occurred while getting the spreadsheet.';
                setInfo({ message: errorMessage, isError: true });
            },
        }
    );

    return { fetchedSpreadsheet, isLoading, error };
};
