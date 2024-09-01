import { authTokensFetch } from "../../../utils/authTokens";

export const updateCellsStyle = async (styles: { cellId: number, style: object }[]) => {
    const data = await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/cells/style`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ styles }),
    });
    return data;
};

export const updateCellsHorizontalAlignment = async (hAlignments: { cellId: number, hAlignment: string }[]) => {
    const data = await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/cells/h-alignment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hAlignments }),
    });
    return data;
};

export const updateCellsVerticalAlignment = async (vAlignments: { cellId: number, vAlignment: string }[]) => {
    const data = await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/cells/v-alignment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vAlignments }),
    });
    return data;
};

export const updateCellsColor = async (colors: { cellId: number, color: string }[]) => {
    const data = await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/cells/color`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colors }),
    });
    return data;
};

export const updateCellsBgColor = async (bgColors: { cellId: number, bgColor: string }[]) => {
    const data = await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/cells/bg-color`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bgColors }),
    });
    return data;
};