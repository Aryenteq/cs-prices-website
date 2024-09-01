import { getAuthHeader } from "../../../utils/authHeader";

export const fetchSpreadsheet = async (spreadsheetId: number): Promise<any> => {
    const headers = getAuthHeader();

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/spreadsheet/${spreadsheetId}?index=0`, {
        method: 'GET',
        headers: headers,
    });

    if (!response.ok) {
        const errorResponse = await response.json();
        const errorMessage = errorResponse.message || 'Failed to fetch spreadsheet';
        throw new Error(errorMessage);
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
        const errorResponse = await response.json();
        const errorMessage = errorResponse.message || 'Failed to update row height';
        throw new Error(errorMessage);
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
        const errorResponse = await response.json();
        const errorMessage = errorResponse.message || 'Failed to update column width';
        throw new Error(errorMessage);
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
        const errorResponse = await response.json();
        const errorMessage = errorResponse.message || 'Failed to update hidden row';
        throw new Error(errorMessage);
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
        const errorResponse = await response.json();
        const errorMessage = errorResponse.message || 'Failed to update hidden column';
        throw new Error(errorMessage);
    }
    return response.json();
};

export const deleteSheetRows = async ({ sheetId, startIndex, rowsNumber }: { sheetId: number, startIndex: number, rowsNumber: number }): Promise<any> => {
    const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
    };

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/sheet/${sheetId}/rows`, {
        method: 'DELETE',
        headers: headers,
        body: JSON.stringify({ startIndex, rowsNumber })
    });

    if (!response.ok) {
        const errorResponse = await response.json();
        const errorMessage = errorResponse.message || 'Failed to delete rows.';
        throw new Error(errorMessage);
    }

    return response.json();
};


export const deleteSheetCols = async ({ sheetId, startIndex, colsNumber }: { sheetId: number, startIndex: number, colsNumber: number }): Promise<any> => {
    const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
    };

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/sheet/${sheetId}/cols`, {
        method: 'DELETE',
        headers: headers,
        body: JSON.stringify({ startIndex, colsNumber })
    });

    if (!response.ok) {
        const errorResponse = await response.json();
        const errorMessage = errorResponse.message || 'Failed to delete cols.';
        throw new Error(errorMessage);
    }

    return response.json();
};

export const addRows = async ({ sheetId, startIndex, rowsNumber }: { sheetId: number, startIndex: number, rowsNumber: number }) => {
    const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
    };

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/sheet/${sheetId}/rows`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({ startIndex, rowsNumber })
    });

    if (!response.ok) {
        const errorResponse = await response.json();
        const errorMessage = errorResponse.message || 'Failed to add row(s)';
        throw new Error(errorMessage);
    }
    return response.json();
};


export const addCols = async ({ sheetId, startIndex, colsNumber }: { sheetId: number, startIndex: number, colsNumber: number }) => {
    const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
    };

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/sheet/${sheetId}/cols`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({ startIndex, colsNumber })
    });

    if (!response.ok) {
        const errorResponse = await response.json();
        const errorMessage = errorResponse.message || 'Failed to add column(s)';
        throw new Error(errorMessage);
    }
    return response.json();
};


export const deleteSheet = async (sheetId: number): Promise<any> => {
    const headers = getAuthHeader();

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/sheet/${sheetId}`, {
        method: 'DELETE',
        headers: headers,
    });

    if (!response.ok) {
        const errorResponse = await response.json();
        const errorMessage = errorResponse.message || 'Failed to delete sheet';
        throw new Error(errorMessage);
    }

    return response.json();
};




//
//
// CELLS
//
//

export const updateCellContent = async (contents: { cellId: number, content: string }[]) => {
    const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
    };

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/cells/content`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({ contents })
    });

    if (!response.ok) {
        const errorResponse = await response.json();
        const errorMessage = errorResponse.message || 'Failed to save cells content';
        throw new Error(errorMessage);
    }
    return response.json();
};