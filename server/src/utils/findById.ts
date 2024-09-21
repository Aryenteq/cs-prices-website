import { db } from "../db";

export const findSheetIdByCellId = async (cellId: number): Promise<number | null> => {
    const cell = await db.cell.findUnique({
        where: { id: cellId },
        select: {
            sheetId: true,
        },
    });

    if (!cell) {
        throw new Error('Cell not found');
    }

    return cell.sheetId;
};

export const findSpreadsheetIdByCellId = async (cellId: number): Promise<number | null> => {
    const cell = await db.cell.findUnique({
        where: { id: cellId },
        include: {
            Sheet: {
                select: {
                    spreadsheetId: true,
                },
            },
        },
    });

    if (!cell || !cell.Sheet) {
        throw new Error('Cell or associated sheet not found');
    }

    return cell.Sheet.spreadsheetId;
};

export const findSpreadheetIdBySheetId = async (sheetId: number): Promise<number | null> => {
    const sheet = await db.sheet.findUnique({
        where: { id: sheetId },
        select: {
            spreadsheetId: true,
        },
    });

    if (!sheet) {
        throw new Error('Sheet not found');
    }

    return sheet.spreadsheetId;
};

