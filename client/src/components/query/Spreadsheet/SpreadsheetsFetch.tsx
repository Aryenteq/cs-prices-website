import { useQuery } from "react-query";
import { useInfo } from "../../../context/InfoContext";

import type { Spreadsheet, Filters } from "../../../types/SpreadsheetListTypes";
import { fetchSpreadsheets } from "../../../fetch/SpreadsheetFetch";

export const useSpreadsheets = (filters: Filters) => {
    const { setInfo } = useInfo();

    return useQuery<Spreadsheet[], Error>(
        ['spreadsheets', filters],
        () => fetchSpreadsheets(filters),
        {
            keepPreviousData: true,
            onError: (error: Error) => {
                setInfo({ message: error.message, isError: true });
                const typedError = error as any;
                if (typedError.status !== 401) {
                    console.error('Error fetching spreadsheets:', error.message);
                }
            },
        }
    );
};