import { db } from "../db";

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