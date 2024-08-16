import { db } from '../db';

import { Prisma } from '@prisma/client';
import { findSpreadsheetIdByCellId } from '../utils/findSpreadsheetId';
import { getUserPermissionForSpreadsheet } from '../utils/checkPermission';

export const updateStyle = async (cellId: number, newStyle: object, userId: number) => {
    const cell = await db.cell.findFirst({
        where: {
            id: cellId,
        },
    });

    if (!cell) {
        throw new Error('Cell not found');
    }

    const spreadsheetId = await findSpreadsheetIdByCellId(cellId);

    if (!spreadsheetId) {
        throw new Error('Associated spreadsheet not found');
    }

    const permission = await getUserPermissionForSpreadsheet(spreadsheetId, userId);

    if (permission !== 'EDIT') {
        throw new Error('You do not have permission to edit this cell.');
    }

    // Merge existing style with the new style updates
    const existingStyle = cell.style as Prisma.JsonObject || {};
    const updatedStyle = { ...existingStyle, ...newStyle };

    return await db.cell.update({
        where: {
            id: cellId,
        },
        data: {
            style: updatedStyle,
        },
    });
};

export const setBgColor = async (cellId: number, bgColor: string, userId: number) => {
    return await updateCell(cellId, { bgColor }, userId);
};

export const setColor = async (cellId: number, color: string, userId: number) => {
    return await updateCell(cellId, { color }, userId);
};

export const setHorizontalAlignment = async (cellId: number, hAlignment: string, userId: number) => {
    return await updateCell(cellId, { hAlignment }, userId);
};

export const setVerticalAlignment = async (cellId: number, vAlignment: string, userId: number) => {
    return await updateCell(cellId, { vAlignment }, userId);
};

export const setContent = async (cellId: number, content: string, userId: number) => {
    return await updateCell(cellId, { content }, userId);
};

const updateCell = async (cellId: number, data: object, userId: number) => {
    const cell = await db.cell.findFirst({
        where: {
            id: cellId
        },
    });

    if (!cell) {
        throw new Error('Cell not found');
    }

    const spreadsheetId = await findSpreadsheetIdByCellId(cellId);

    if (!spreadsheetId) {
        throw new Error('Associated spreadsheet not found');
    }

    const permission = await getUserPermissionForSpreadsheet(spreadsheetId, userId);

    if (permission !== 'EDIT') {
        throw new Error('You do not have permission to edit this cell.');
    }

    return await db.cell.update({
        where: {
            id: cellId,
        },
        data,
    });
};
