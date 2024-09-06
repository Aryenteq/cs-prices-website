import { db } from "../db";

export const getCellByPosition = async (sheetId: number, row: number, col: number) => {
    try {
        const cell = await db.cell.findFirst({
            where: {
                sheetId: sheetId,
                row: row,
                col: col,
            },
        });
        return cell;
    } catch (error) {
        console.error('Error fetching cell by position:', error);
        throw new Error('Error fetching cell');
    }
};