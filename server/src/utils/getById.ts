import { db } from "../db";

export const getCellById = async (cellId: number) => {
    try {
        const cell = await db.cell.findUnique({
            where: {
                id: cellId,
            },
        });
        return cell;
    } catch (error) {
        console.error('Error fetching cell by ID:', error);
        throw new Error('Error fetching cell');
    }
};

export const getSheetById = async (sheetId: number) => {
    try {
        const sheet = await db.sheet.findUnique({
            where: {
                id: sheetId,
            },
        });
        return sheet;
    } catch (error) {
        console.error('Error fetching sheet by ID:', error);
        throw new Error('Error fetching sheet');
    }
};

export const getSpreadsheetById = async (spreadsheetId: number) => {
    try {
        const spreadsheet = await db.spreadsheet.findUnique({
            where: {
                id: spreadsheetId,
            },
        });
        return spreadsheet;
    } catch (error) {
        console.error('Error fetching spreadsheet by ID:', error);
        throw new Error('Error fetching spreadsheet');
    }
};
