import { SelectedCellsContent } from "../types/cellTypes";
import { authTokensFetch } from "../utils/authTokens";

export const updateCellsStyle = async (styles: { cellId: number, style: object }[]) => {
    await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/cells/style`, {
        method: 'PUT', // ? PATCH doesn't work on Brave - CORS
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ styles }),
    });
};

export const updateCellsHorizontalAlignment = async (hAlignments: { cellId: number, hAlignment: string }[]) => {
    await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/cells/h-alignment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hAlignments }),
    });
};

export const updateCellsVerticalAlignment = async (vAlignments: { cellId: number, vAlignment: string }[]) => {
    await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/cells/v-alignment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vAlignments }),
    });
};

export const updateCellsColor = async (colors: { cellId: number, color: string }[]) => {
    await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/cells/color`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colors }),
    });
};

export const updateCellsBgColor = async (bgColors: { cellId: number, bgColor: string }[]) => {
    await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/cells/bg-color`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bgColors }),
    });
};

export const updateCellContent = async (contents: { cellId: number, content: string }[]) => {
    return await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/cells/content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
    });
};

export const updatePastedCellsContent = async ({ firstCellId, contents }: { firstCellId: number, contents: SelectedCellsContent }) => {
    return await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/cells/pasted-content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstCellId, contents }),
    });
};