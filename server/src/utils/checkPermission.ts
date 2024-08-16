import { db } from '../db';
import type { PermissionType } from '@prisma/client';

export const getUserPermissionForSpreadsheet = async (spreadsheetId: number, userId: number): Promise<PermissionType | null> => {
    const isOwner = await db.spreadsheet.findFirst({
        where: {
            id: spreadsheetId,
            ownerId: userId,
        },
    });

    if (isOwner) {
        return 'EDIT';
    }

    const sharedUser = await db.spreadsheetShare.findFirst({
        where: {
            spreadsheetId: spreadsheetId,
            userId: userId,
        },
    });

    return sharedUser ? sharedUser.permission : null;
};