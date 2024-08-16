import { db } from '../db';

import type { SpreadsheetTypes } from '@prisma/client';
import { getUserPermissionForSpreadsheet } from '../utils/checkPermission';

export const getAllSpreadsheets = async (userId: number) => {
    const ownedSpreadsheets = await db.spreadsheet.findMany({
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

    const sharedSpreadsheets = await db.spreadsheet.findMany({
        where: {
            sharedUsers: {
                some: {
                    userId: userId,
                },
            },
        },
        select: {
            id: true,
            name: true,
            type: true,
            created: true,
            updatedAt: true,
        },
    });

    return [...ownedSpreadsheets, ...sharedSpreadsheets];
};



export const getSpreadsheet = async (spreadsheetId: number, index: number, userId: number) => {
    const permission = await getUserPermissionForSpreadsheet(spreadsheetId, userId);

    if (!permission) {
        throw new Error('Spreadsheet not found or you don\'t have permission to access it');
    }

    const spreadsheet = await db.spreadsheet.findFirst({
        where: {
            id: spreadsheetId,
        },
        include: {
            sheets: {
                orderBy: {
                    index: 'asc',
                },
                include: {
                    cells: true,
                },
            },
        },
    });

    if (!spreadsheet) {
        throw new Error('Spreadsheet not found');
    }

    const firstSheet = spreadsheet.sheets.find(sheet => sheet.index === index);

    if (!firstSheet) {
        throw new Error('Sheet not found at the specified index');
    }

    const sheetInfo = spreadsheet.sheets.map(sheet => ({
        name: sheet.name,
        index: sheet.index,
    }));

    return {
        ...spreadsheet,
        firstSheet: {
            ...firstSheet,
            cells: firstSheet.cells, // cells for the first sheet
        },
        sheets: sheetInfo, // names and indexes of all sheets
    };
};


export const createSpreadsheet = async (name: string, type: SpreadsheetTypes, userId: number) => {
    return await db.spreadsheet.create({
        data: {
            name,
            type,
            ownerId: userId,
            lastOpened: new Date(Date.now())
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
    if (isNaN(spreadsheetId)) {
        throw new Error("Invalid spreadsheet ID");
    }

    const permission = await getUserPermissionForSpreadsheet(spreadsheetId, userId);

    if (!permission || permission !== 'EDIT') {
        throw new Error("Unauthorized to rename the spreadsheet");
    }

    return await db.spreadsheet.update({
        where: { id: spreadsheetId },
        data: { name },
    });
};

export const setLastOpened = async (spreadsheetId: number, userId: number) => {
    if (isNaN(spreadsheetId)) {
        throw new Error("Invalid spreadsheet ID");
    }

    const spreadsheet = await db.spreadsheet.findUnique({
        where: { id: spreadsheetId },
    });

    if (!spreadsheet) {
        throw new Error("Spreadsheet not found");
    }

    const isOwner = spreadsheet.ownerId === userId;

    // Owner (update in Spreadsheet table)
    if (isOwner) {
        return await db.spreadsheet.update({
            where: { id: spreadsheetId },
            data: { lastOpened: new Date() },
        });
    }

    // Shared (update in SpreadsheetShare table)
    const shareRecord = await db.spreadsheetShare.findUnique({
        where: {
            spreadsheetId_userId: {
                spreadsheetId: spreadsheetId,
                userId: userId,
            },
        },
    });

    if (!shareRecord) {
        throw new Error("Unauthorized to update the spreadsheet");
    }

    return await db.spreadsheetShare.update({
        where: {
            spreadsheetId_userId: {
                spreadsheetId: spreadsheetId,
                userId: userId,
            },
        },
        data: { lastOpened: new Date() },
    });
};

export const updateSharedUsersIds = async (
    spreadsheetId: number,
    email: string,
    permission: 'NONE' | 'VIEW' | 'EDIT',
    userId: number
) => {
    // Only the owner can add/remove people
    const spreadsheet = await db.spreadsheet.findFirst({
        where: {
            id: spreadsheetId,
            ownerId: userId,
        },
    });

    if (!spreadsheet) {
        throw new Error('Spreadsheet not found or you don\'t have permission to update it');
    }

    // Find the user to share the spreadsheet with
    const userToShare = await db.user.findUnique({
        where: { email },
    });

    if (!userToShare) {
        throw new Error('User with the given email does not exist');
    }

    if (userToShare.uid === userId) {
        throw new Error('You cannot share the spreadsheet with yourself');
    }

    const existingPermission = await getUserPermissionForSpreadsheet(spreadsheetId, userToShare.uid);

    if (permission === 'NONE') {
        if (!existingPermission) {
            throw new Error('User is not in the shared list');
        }

        await db.spreadsheetShare.deleteMany({
            where: {
                spreadsheetId,
                userId: userToShare.uid,
            },
        });
    } else {
        // Add or update the user's permission
        if (existingPermission) {
            await db.spreadsheetShare.updateMany({
                where: {
                    spreadsheetId,
                    userId: userToShare.uid,
                },
                data: {
                    permission,
                },
            });
        } else {
            await db.spreadsheetShare.create({
                data: {
                    spreadsheetId,
                    userId: userToShare.uid,
                    permission,
                    lastOpened: null,
                },
            });
        }
    }

    return await db.spreadsheet.findUnique({
        where: { id: spreadsheetId },
        include: {
            sharedUsers: true,
        },
    });
};