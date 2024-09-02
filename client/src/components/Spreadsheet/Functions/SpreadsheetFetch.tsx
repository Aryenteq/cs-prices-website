import { authTokensFetch } from "../../../utils/authTokens";
import { ShareInfo } from "./Types";

export const fetchSpreadsheet = async (spreadsheetId: number, sheetIndex: number): Promise<any> => {
    return await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/spreadsheet/${spreadsheetId}?index=${sheetIndex}`, {
        method: 'GET',
    });
};

export const fetchSpreadsheetShares = async (spreadsheetId: number): Promise<ShareInfo[]> => {
    const data = await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/spreadsheet/${spreadsheetId}/shares`, {
        method: 'GET',
    });
    return data;
};

export const updatePermission = async (spreadsheetId: number, email: string, permission: string): Promise<void> => {
    const headers = {
        'Content-Type': 'application/json',
    };

    await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/spreadsheet/${spreadsheetId}/shared-users-ids`, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify({ email, permission }),
    });
};


// Not used
export const fetchSpreadsheetPermission = async (spreadsheetId: number): Promise<string> => {
    const data = await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/spreadsheet/${spreadsheetId}/permission`, {
        method: 'GET',
    });
    return data;
};