import { authTokensFetch } from "../../../utils/authTokens";

export const fetchSpreadsheet = async (spreadsheetId: number): Promise<any> => {
    return await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/spreadsheet/${spreadsheetId}?index=0`, {
        method: 'GET',
    });
};

export const updateRowHeight = async ({ sheetId, rowIndex, height }: { sheetId: number, rowIndex: number, height: number }) => {
    return await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/sheet/${sheetId}/row-height`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index: rowIndex, height }),
    });
};

export const updateColWidth = async ({ sheetId, colIndex, width }: { sheetId: number, colIndex: number, width: number }) => {
    return await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/sheet/${sheetId}/col-width`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index: colIndex, width }),
    });
};

export const updateHiddenRows = async ({ sheetId, rowIndex, hidden }: { sheetId: number, rowIndex: number, hidden: boolean }) => {
    return await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/sheet/${sheetId}/row-hidden`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index: rowIndex, hidden }),
    });
};

export const updateHiddenCols = async ({ sheetId, colIndex, hidden }: { sheetId: number, colIndex: number, hidden: boolean }) => {
    return await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/sheet/${sheetId}/col-hidden`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index: colIndex, hidden }),
    });
};

export const deleteSheetRows = async ({ sheetId, startIndex, rowsNumber }: { sheetId: number, startIndex: number, rowsNumber: number }): Promise<any> => {
    return await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/sheet/${sheetId}/rows`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startIndex, rowsNumber }),
    });
};

export const deleteSheetCols = async ({ sheetId, startIndex, colsNumber }: { sheetId: number, startIndex: number, colsNumber: number }): Promise<any> => {
    return await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/sheet/${sheetId}/cols`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startIndex, colsNumber }),
    });
};

export const addRows = async ({ sheetId, startIndex, rowsNumber }: { sheetId: number, startIndex: number, rowsNumber: number }) => {
    return await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/sheet/${sheetId}/rows`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startIndex, rowsNumber }),
    });
};

export const addCols = async ({ sheetId, startIndex, colsNumber }: { sheetId: number, startIndex: number, colsNumber: number }) => {
    return await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/sheet/${sheetId}/cols`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startIndex, colsNumber }),
    });
};

export const deleteSheet = async (sheetId: number): Promise<any> => {
    return await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/sheet/${sheetId}`, {
        method: 'DELETE',
    });
};

export const updateCellContent = async (contents: { cellId: number, content: string }[]) => {
    return await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/cells/content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
    });
};