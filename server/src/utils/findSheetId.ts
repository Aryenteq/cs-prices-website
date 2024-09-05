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