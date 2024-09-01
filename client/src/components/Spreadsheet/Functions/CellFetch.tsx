import { getAuthHeader } from "../../../utils/authHeader";

export const updateCellsStyle = async (styles: { cellId: number, style: object }[]) => {
    const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
    };

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/cells/style`, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify({ styles }),
    });

    if (!response.ok) {
        const errorResponse = await response.json();
        const errorMessage = errorResponse.message || 'Failed to update cells';
        throw new Error(errorMessage);
    }

    return response.json();
};

export const updateCellsHorizontalAlignment = async (hAlignments: { cellId: number, hAlignment: string }[]) => {
    const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
    };

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/cells/h-alignment`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({ hAlignments }),
    });

    if (!response.ok) {
        const errorResponse = await response.json();
        const errorMessage = errorResponse.message || 'Failed to update cells';
        throw new Error(errorMessage);
    }

    return response.json();
};

export const updateCellsVerticalAlignment = async (vAlignments: { cellId: number, vAlignment: string }[]) => {
    const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
    };

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/cells/v-alignment`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({ vAlignments }),
    });

    if (!response.ok) {
        const errorResponse = await response.json();
        const errorMessage = errorResponse.message || 'Failed to update cells';
        throw new Error(errorMessage);
    }

    return response.json();
};

export const updateCellsColor = async (colors: { cellId: number, color: string }[]) => {
    const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
    };

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/cells/color`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({ colors }),
    });

    if (!response.ok) {
        const errorResponse = await response.json();
        const errorMessage = errorResponse.message || 'Failed to update cells';
        throw new Error(errorMessage);
    }

    return response.json();
};

export const updateCellsBgColor = async (bgColors: { cellId: number, bgColor: string }[]) => {
    const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
    };

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/cells/bg-color`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({ bgColors }),
    });

    if (!response.ok) {
        const errorResponse = await response.json();
        const errorMessage = errorResponse.message || 'Failed to update cells';
        throw new Error(errorMessage);
    }

    return response.json();
};