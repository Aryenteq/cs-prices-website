import { db } from '../db';
import { Prisma } from '@prisma/client';
import type { SpreadsheetTypes } from '@prisma/client';
import { getUserPermissionForSpreadsheet } from '../utils/checkPermission';


type SpreadsheetType = 'ALL' | 'NORMAL' | 'CS';
type SpreadsheetOwner = 'ME' | 'OTHER' | 'ALL';
type SpreadsheetOrderBy = 'TITLE' | 'LAST_OPENED' | 'CREATED';
type SpreadsheetOrderType = 'asc' | 'desc';

export const getAllSpreadsheets = async (
    userId: number,
    type: SpreadsheetType | null,
    owner: SpreadsheetOwner,
    orderby: SpreadsheetOrderBy = 'LAST_OPENED',
    orderType: SpreadsheetOrderType = 'asc'
) => {
    const whereConditions: Prisma.SpreadsheetWhereInput = {};

    if (type && type !== 'ALL') {
        whereConditions.type = type;
    }

    // owner filter
    if (owner === 'ME') {
        whereConditions.ownerId = userId;
    } else if (owner === 'OTHER') {
        whereConditions.sharedUsers = {
            some: {
                userId: userId,
            },
        };
    } else if (owner === 'ALL') {
        whereConditions.OR = [
            { ownerId: userId },
            { sharedUsers: { some: { userId: userId } } },
        ];
    }

    // order
    const orderByFieldMap: { [key in SpreadsheetOrderBy]: string } = {
        'TITLE': 'name',
        'LAST_OPENED': 'lastOpened',
        'CREATED': 'created',
    };

    const orderByCondition = {
        [orderByFieldMap[orderby]]: orderType,
    };

    // Query
    const spreadsheets = await db.spreadsheet.findMany({
        where: whereConditions,
        select: {
            id: true,
            ownerId: true,
            name: true,
            type: true,
            created: true,
            updatedAt: true,
            lastOpened: true,
            sharedUsers: {
                where: { userId: userId },
                select: {
                    lastOpened: true,
                    permission: true,
                },
            },
            User: {
                select: {
                    username: true,
                },
            },
        },
        orderBy: orderByCondition,
    });

    return spreadsheets.map(spreadsheet => {
        const isOwner = spreadsheet.ownerId === userId;
        const correctLastOpened = spreadsheet.sharedUsers.length > 0
            ? spreadsheet.sharedUsers[0].lastOpened
            : spreadsheet.lastOpened;

        const permission = isOwner
            ? 'EDIT'
            : spreadsheet.sharedUsers[0]?.permission || 'VIEW';

        return {
            ...spreadsheet,
            lastOpened: correctLastOpened,
            ownerName: spreadsheet.User.username,
            permission,
        };
    });
};

export const getSpreadsheetName = async (spreadsheetId: number, userId: number) => {
    const permission = await getUserPermissionForSpreadsheet(spreadsheetId, userId);

    if (!permission) {
        throw new Error('Spreadsheet not found or you don\'t have permission to access it');
    }

    const spreadsheet = await db.spreadsheet.findUnique({
        where: {
            id: spreadsheetId,
        },
        select: {
            name: true,
        },
    });

    if (!spreadsheet) {
        throw new Error('Spreadsheet not found');
    }

    return spreadsheet.name;
};

export const getSpreadsheetType = async (spreadsheetId: number, userId: number) => {
    const permission = await getUserPermissionForSpreadsheet(spreadsheetId, userId);

    if (!permission) {
        throw new Error('Spreadsheet not found or you don\'t have permission to access it');
    }

    const spreadsheet = await db.spreadsheet.findUnique({
        where: {
            id: spreadsheetId,
        },
        select: {
            type: true,
        },
    });

    if (!spreadsheet) {
        throw new Error('Spreadsheet not found');
    }

    return spreadsheet.type;
};

export const getSpreadsheetShares = async (spreadsheetId: number, userId: number) => {
    const permission = await getUserPermissionForSpreadsheet(spreadsheetId, userId);

    if (!permission) {
        throw new Error('Spreadsheet not found or you don\'t have permission to access it');
    }
    
    const owner = await db.spreadsheet.findUnique({
        where: { id: spreadsheetId },
        include: {
            User: {
                select: {
                    uid: true,
                    username: true,
                    email: true,
                    photoURL: true,
                }
            }
        }
    });

    if (!owner) {
        throw new Error('Spreadsheet not found');
    }

    const sharedUsers = await db.spreadsheetShare.findMany({
        where: {
            spreadsheetId: spreadsheetId
        },
        include: {
            User: {
                select: {
                    uid: true,
                    username: true,
                    email: true,
                    photoURL: true,
                }
            }
        }
    });

    const result = [
        {
            uid: owner.User.uid,
            username: owner.User.username,
            email: owner.User.email,
            photoURL: owner.User.photoURL,
            permission: 'OWNER'
        },
        ...sharedUsers.map(share => ({
            uid: share.User.uid,
            username: share.User.username,
            email: share.User.email,
            photoURL: share.User.photoURL,
            permission: share.permission
        }))
    ];

    return result;
};

// index = sheet index (usually will be called with 0)
export const getSpreadsheet = async (spreadsheetId: number, index: number, userId: number) => {
    const permission = await getUserPermissionForSpreadsheet(spreadsheetId, userId);

    if (!permission) {
        throw new Error('Spreadsheet not found or you don\'t have permission to access it');
    }

    const spreadsheet = await db.spreadsheet.findUnique({
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

    // update the "Last Opened"
    setLastOpened(spreadsheetId, userId);

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
        permission,
    };
};


export const createSpreadsheet = async (name: string, type: SpreadsheetTypes, userId: number) => {
    if (!name || !type) {
        throw new Error("Required: name and type");
    }

    if (type !== 'NORMAL' && type !== 'CS') {
        throw new Error("Type must be NORMAL or CS");
    }

    const spreadsheet = await db.spreadsheet.create({
        data: {
            name,
            type,
            ownerId: userId,
            lastOpened: new Date(Date.now()),
            sheets: {
                create: [
                    {
                        index: 0,
                    }
                ]
            }
        },
        include: {
            sheets: true,
        },
    });

    const sheet = spreadsheet.sheets[0];

    await db.cell.createMany({
        data: generateCells(sheet.id, sheet.numRows, sheet.numCols),
    });

    const updatedSpreadsheet = await db.spreadsheet.findUnique({
        where: {
            id: spreadsheet.id,
        },
        include: {
            sheets: {
                include: {
                    cells: true,
                },
            },
        },
    });

    return updatedSpreadsheet;
};

export const generateCells = (sheetId: number, numRows: number, numCols: number) => {
    const cells = [];
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            cells.push({
                sheetId,
                row,
                col,
            });
        }
    }
    return cells;
};

const removeUserFromSpreadsheetShare = async (spreadsheetId: number, userId: number) => {
    try {
        await db.spreadsheetShare.deleteMany({
            where: {
                spreadsheetId: spreadsheetId,
                userId: userId,
            },
        });
    } catch (error: any) {
        throw new Error(`Failed to remove user from SpreadsheetShare: ${error.message}`);
    }
};

export const deleteSpreadsheet = async (spreadsheetId: number, userId: number) => {
    const spreadsheet = await db.spreadsheet.findUnique({
        where: { id: spreadsheetId },
    });

    if (!spreadsheet) {
        throw new Error("Spreadsheet not found or unauthorized");
    }

    const permission = await getUserPermissionForSpreadsheet(spreadsheetId, userId);

    if (permission === 'VIEW') {
        await removeUserFromSpreadsheetShare(spreadsheetId, userId);
        return { message: 'User removed from shared spreadsheet' };
    }

    if (!permission || permission !== 'EDIT') {
        throw new Error("Unauthorized to delete the spreadsheet");
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

    if (name.length === 0) {
        throw new Error("Name can not be empty");
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
    permission: 'NONE' | 'VIEW' | 'EDIT', // new permission
    userId: number
) => {
    const spreadsheet = await db.spreadsheet.findFirst({
        where: {
            id: spreadsheetId,
        },
    });

    if (!spreadsheet) {
        throw new Error('Spreadsheet not found');
    }

    const currentPermission = await getUserPermissionForSpreadsheet(spreadsheetId, userId);

    if (!currentPermission || currentPermission !== 'EDIT') {
        throw new Error("Unauthorized to share the spreadsheet");
    }

    // Find the user to share the spreadsheet with
    const userToShare = await db.user.findUnique({
        where: { email },
    });

    if (!userToShare) {
        throw new Error('User with the given email does not exist');
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