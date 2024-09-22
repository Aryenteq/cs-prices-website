import { authTokensFetch } from "../utils/authTokens";
import { Sheet, ItemsVisibility } from "../types/sheetTypes";

export const updateRowHeight = async ({ sheetId, rowIndex, height }: { sheetId: number, rowIndex: number, height: number }) => {
    return await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/sheet/${sheetId}/row-height`, {
        method: 'PUT', // ? PATCH doesn't work on Brave - CORS
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index: rowIndex, height }),
    });
};

export const updateColWidth = async ({ sheetId, colIndex, width }: { sheetId: number, colIndex: number, width: number }) => {
    return await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/sheet/${sheetId}/col-width`, {
        method: 'PUT', // ? PATCH doesn't work on Brave - CORS
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index: colIndex, width }),
    });
};

export const updateHiddenRows = async ({ sheetId, rows }: { sheetId: number, rows: ItemsVisibility[] }) => {
    await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/sheet/${sheetId}/row-hidden`, {
        method: 'PUT', // ? PATCH doesn't work on Brave - CORS
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemsVisibility: rows }),
    });
};

export const updateHiddenCols = async ({ sheetId, cols }: { sheetId: number, cols: ItemsVisibility[] }) => {
    await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/sheet/${sheetId}/col-hidden`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemsVisibility: cols }),
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


// SHEET LIST

export const getSheet = async (sheetId: number): Promise<any> => {
    return await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/sheet/${sheetId}`, {
        method: 'GET',
    });
};

export const addSheet = async ({ spreadsheetId, index, name }: { spreadsheetId: number; index: number; name: string }): Promise<any> => {
    return await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/sheet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spreadsheetId, index, name }),
    });
};

export const deleteSheet = async (sheetId: number): Promise<any> => {
    return await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/sheet/${sheetId}`, {
        method: 'DELETE',
    });
};

export const setName = async ({ sheetId, name }: { sheetId: number, name: string }) => {
    return await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/sheet/${sheetId}/name`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
    });
};

export const setIndex = async ({ sheetId, newIndex }: { sheetId: number, newIndex: number }) => {
    return await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/sheet/${sheetId}/index`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newIndex }),
    });
};

export const setColor = async ({ sheetId, color }: { sheetId: number, color: string }) => {
    return await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/sheet/${sheetId}/color`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ color }),
    });
};


// CTRL + Z, CTRL+Y
export const revertSheet = async ({ sheetId, sheet }: { sheetId: number, sheet: Sheet }) => {
    await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/sheet/${sheetId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sheet),
    });
};