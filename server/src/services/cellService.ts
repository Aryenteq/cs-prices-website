import { db } from '../db';

import { Prisma } from '@prisma/client';

export const updateStyle = async (cellId: number, newStyle: object, userId: number) => {
    const cell = await db.cell.findFirst({
        where: {
            id: cellId,
            Sheet: {
                Spreadsheet: {
                    ownerId: userId,
                },
            },
        },
    });

    if (!cell) {
        throw new Error('Cell not found or you don\'t have permission to update it');
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
            id: cellId,
            Sheet: {
                Spreadsheet: {
                    ownerId: userId,
                },
            },
        },
    });

    if (!cell) {
        throw new Error('Cell not found or you don\'t have permission to update it');
    }

    return await db.cell.update({
        where: {
            id: cellId,
        },
        data,
    });
};
