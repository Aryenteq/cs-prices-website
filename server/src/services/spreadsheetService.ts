import { db } from '../db';

import type { SpreadsheetTypes } from '@prisma/client';

export const createSpreadsheet = async (name: string, type: SpreadsheetTypes, userId: number) => {
    return await db.spreadsheet.create({
        data: {
            name,
            type,
            ownerId: userId
        }
    });
};

export const deleteSpreadsheet = async (spreadsheetId: number, userId: number) => {
    const spreadsheet = await db.spreadsheet.findUnique({
        where: { id: spreadsheetId },
    });

    if (!spreadsheet || spreadsheet.ownerId !== userId) {
        throw new Error("Spreadsheet not found or unauthorized");
    }

    await db.spreadsheet.delete({
        where: { id: spreadsheetId },
    });
};

export const setName = async (spreadsheetId: number, name: string, userId: number) => {
    const spreadsheet = await db.spreadsheet.findUnique({
        where: { id: spreadsheetId },
    });

    if (isNaN(spreadsheetId)) {
        throw new Error("Invalid spreadsheet ID");
    }

    if (!spreadsheet || spreadsheet.ownerId !== userId) {
        throw new Error("Spreadsheet not found or unauthorized");
    }

    return await db.spreadsheet.update({
        where: { id: spreadsheetId },
        data: { name },
    });
};