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
