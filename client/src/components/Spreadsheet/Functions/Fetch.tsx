import { getAuthHeader } from "../../../utils/authHeader";

export const fetchSpreadsheet = async (spreadsheetId: number): Promise<any> => {
    const headers = getAuthHeader();

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/spreadsheet/${spreadsheetId}?index=0`, {
        method: 'GET',
        headers: headers,
    });

    if (!response.ok) {
        throw new Error('Failed to fetch spreadsheet');
    }

    return response.json();
};

export const updateRowHeight = async ({ sheetId, rowIndex, height }: { sheetId: number, rowIndex: number, height: number }) => {
    const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
    };

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/sheet/${sheetId}/row-height`, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify({ index: rowIndex, height })
    });

    if (!response.ok) {
        throw new Error('Failed to update row height');
    }
    return response.json();
};

export const updateColWidth = async ({ sheetId, colIndex, width }: { sheetId: number, colIndex: number, width: number }) => {
    const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
    };

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/sheet/${sheetId}/col-width`, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify({ index: colIndex, width })
    });

    if (!response.ok) {
        throw new Error('Failed to update column width');
    }
    return response.json();
};


export const updateHiddenRows = async ({ sheetId, rowIndex, hidden }: { sheetId: number, rowIndex: number, hidden: boolean }) => {
    const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
    };

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/sheet/${sheetId}/row-hidden`, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify({ index: rowIndex, hidden })
    });

    if (!response.ok) {
        throw new Error('Failed to update hidden row');
    }
    return response.json();
};

export const updateHiddenCols = async ({ sheetId, colIndex, hidden }: { sheetId: number, colIndex: number, hidden: boolean }) => {
    const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
    };

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/sheet/${sheetId}/col-hidden`, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify({ index: colIndex, hidden })
    });

    if (!response.ok) {
        throw new Error('Failed to update hidden column');
    }
    return response.json();
};