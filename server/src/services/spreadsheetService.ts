import { db } from '../db';

import type { SpreadsheetTypes } from '@prisma/client';

export const getAllSpreadsheets = async (userId: number) => {
    return await db.spreadsheet.findMany({
        where: {
            ownerId: userId,
        },
        select: {
            id: true,
            name: true,
            type: true,
            created: true,
            updatedAt: true,
        },
    });
};

export const getSpreadsheet = async (spreadsheetId: number, index: number, userId: number) => {
    const spreadsheet = await db.spreadsheet.findFirst({
        where: {
            id: spreadsheetId,
            ownerId: userId,
        },
        include: {
            sheets: {
                where: {
                    index: index,
                },
                include: {
                    cells: true,
                },
                take: 1, // retrieve only one element
            },
        },
    });

    if (!spreadsheet) {
        throw new Error('Spreadsheet not found or you don\'t have permission to access it');
    }

    return {
        ...spreadsheet,
        firstSheet: spreadsheet.sheets[0], // Extract first sheet from the result
    };
};

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