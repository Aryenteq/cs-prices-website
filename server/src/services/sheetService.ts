import { db } from '../db';
import type { Sheet as PrismaSheet } from '@prisma/client';
import { Prisma } from '@prisma/client';

const DEFAULT_ROW_HEIGHT = 21;
const DEFAULT_COL_WIDTH = 100;

export const createSheet = async (sheet: PrismaSheet) => {
    return await db.sheet.create({
        data: {
            ...sheet,
            columnWidths: sheet.columnWidths ?? {},
            rowHeights: sheet.rowHeights ?? {},
            hiddenCols: sheet.hiddenCols ?? {},
            hiddenRows: sheet.hiddenRows ?? {},
        },
    });
};

export const deleteSheet = async (sheetId: number, userId: number) => {
    const sheet = await db.sheet.findFirst({
        where: {
            id: sheetId,
            Spreadsheet: {
                ownerId: userId
            }
        }
    });

    if (!sheet) {
        throw new Error('Sheet not found or you don\'t have permission to delete it');
    }

    return await db.sheet.delete({
        where: {
            id: sheetId
        }
    });
};

export const setName = async (sheetId: number, name: string, userId: number) => {
    const sheet = await db.sheet.findFirst({
        where: {
            id: sheetId,
            Spreadsheet: {
                ownerId: userId
            }
        }
    });

    if (!sheet) {
        throw new Error('Sheet not found or you don\'t have permission to update it');
    }

    return await db.sheet.update({
        where: {
            id: sheetId
        },
        data: {
            name
        }
    });
};

export const addRows = async (sheetId: number, startIndex: number, rowsNumber: number, userId: number) => {
    const sheet = await db.sheet.findFirst({
        where: {
            id: sheetId,
            Spreadsheet: {
                ownerId: userId
            }
        },
        include: {
            cells: true,
        }
    });

    if (!sheet) {
        throw new Error('Sheet not found or you don\'t have permission to update it');
    }

    // Update the row positions of existing cells
    await db.cell.updateMany({
        where: {
            sheetId: sheetId,
            row: {
                gte: startIndex,
            }
        },
        data: {
            row: {
                increment: rowsNumber
            }
        }
    });

    // Update row heights with the new rows
    const updatedRowHeights: Prisma.JsonObject = sheet.rowHeights ? sheet.rowHeights as Prisma.JsonObject : {};
    for (let i = startIndex; i < startIndex + rowsNumber; i++) {
        updatedRowHeights[i] = DEFAULT_ROW_HEIGHT;
    }

    return await db.sheet.update({
        where: {
            id: sheetId
        },
        data: {
            numRows: sheet.numRows + rowsNumber,
            rowHeights: updatedRowHeights
        }
    });
};

export const addCols = async (sheetId: number, startIndex: number, colsNumber: number, userId: number) => {
    const sheet = await db.sheet.findFirst({
        where: {
            id: sheetId,
            Spreadsheet: {
                ownerId: userId
            }
        },
        include: {
            cells: true,
        }
    });

    if (!sheet) {
        throw new Error('Sheet not found or you don\'t have permission to update it');
    }

    // Update the column positions of existing cells
    await db.cell.updateMany({
        where: {
            sheetId: sheetId,
            col: {
                gte: startIndex,
            }
        },
        data: {
            col: {
                increment: colsNumber
            }
        }
    });

    // Update column widths with the new columns
    const updatedColumnWidths: Prisma.JsonObject = sheet.columnWidths ? sheet.columnWidths as Prisma.JsonObject : {};
    for (let i = startIndex; i < startIndex + colsNumber; i++) {
        updatedColumnWidths[i] = DEFAULT_COL_WIDTH;
    }

    return await db.sheet.update({
        where: {
            id: sheetId
        },
        data: {
            numCols: sheet.numCols + colsNumber,
            columnWidths: updatedColumnWidths
        }
    });
};

export const deleteRows = async (sheetId: number, startIndex: number, rowsNumber: number, userId: number) => {
    const sheet = await db.sheet.findFirst({
        where: {
            id: sheetId,
            Spreadsheet: {
                ownerId: userId,
            },
        },
        include: {
            cells: true,
        },
    });

    if (!sheet) {
        throw new Error('Sheet not found or you don\'t have permission to update it');
    }

    // Check for protected cells in the range to be deleted
    const protectedCells = sheet.cells.filter(cell => {
        return cell.protected && cell.sheetId === sheetId && cell.row >= startIndex && cell.row < startIndex + rowsNumber;
    });

    if (protectedCells.length > 0) {
        throw new Error('Cannot delete rows with protected cells');
    }

    // Delete cells within the specified rows
    await db.cell.deleteMany({
        where: {
            sheetId: sheetId,
            row: {
                gte: startIndex,
                lt: startIndex + rowsNumber,
            },
        },
    });

    // Update remaining cells' row positions
    await db.cell.updateMany({
        where: {
            sheetId: sheetId,
            row: {
                gte: startIndex + rowsNumber,
            },
        },
        data: {
            row: {
                decrement: rowsNumber,
            },
        },
    });

    // Update the sheet by removing rows and adjusting row heights
    const updatedRowHeights = sheet.rowHeights ? sheet.rowHeights as Prisma.JsonObject : {};
    for (let i = startIndex; i < startIndex + rowsNumber; i++) {
        delete updatedRowHeights[i];
    }

    return await db.sheet.update({
        where: {
            id: sheetId,
        },
        data: {
            numRows: sheet.numRows - rowsNumber,
            rowHeights: updatedRowHeights,
        },
    });
};

export const deleteCols = async (sheetId: number, startIndex: number, colsNumber: number, userId: number) => {
    const sheet = await db.sheet.findFirst({
        where: {
            id: sheetId,
            Spreadsheet: {
                ownerId: userId,
            },
        },
        include: {
            cells: true,
        },
    });

    if (!sheet) {
        throw new Error('Sheet not found or you don\'t have permission to update it');
    }

    // Check for protected cells in the range to be deleted
    const protectedCells = sheet.cells.filter(cell => {
        return cell.protected && cell.sheetId === sheetId && cell.col >= startIndex && cell.col < startIndex + colsNumber;
    });

    if (protectedCells.length > 0) {
        throw new Error('Cannot delete columns with protected cells');
    }

    // Delete cells within the specified columns
    await db.cell.deleteMany({
        where: {
            sheetId: sheetId,
            col: {
                gte: startIndex,
                lt: startIndex + colsNumber,
            },
        },
    });

    // Update remaining cells' column positions
    await db.cell.updateMany({
        where: {
            sheetId: sheetId,
            col: {
                gte: startIndex + colsNumber,
            },
        },
        data: {
            col: {
                decrement: colsNumber,
            },
        },
    });

    // Update the sheet by removing columns and adjusting column widths
    const updatedColumnWidths = sheet.columnWidths ? sheet.columnWidths as Prisma.JsonObject : {};
    for (let i = startIndex; i < startIndex + colsNumber; i++) {
        delete updatedColumnWidths[i];
    }

    return await db.sheet.update({
        where: {
            id: sheetId,
        },
        data: {
            numCols: sheet.numCols - colsNumber,
            columnWidths: updatedColumnWidths,
        },
    });
};

export const updateRowsHeight = async (sheetId: number, index: number, height: number, userId: number) => {
    const sheet = await db.sheet.findFirst({
        where: {
            id: sheetId,
            Spreadsheet: {
                ownerId: userId
            }
        }
    });

    if (!sheet) {
        throw new Error('Sheet not found or you don\'t have permission to update it');
    }

    const updatedRowHeights = { ...(sheet.rowHeights as Prisma.JsonObject), [index]: height };

    return await db.sheet.update({
        where: {
            id: sheetId
        },
        data: {
            rowHeights: updatedRowHeights
        }
    });
};

export const updateColsWidth = async (sheetId: number, index: number, width: number, userId: number) => {
    const sheet = await db.sheet.findFirst({
        where: {
            id: sheetId,
            Spreadsheet: {
                ownerId: userId
            }
        }
    });

    if (!sheet) {
        throw new Error('Sheet not found or you don\'t have permission to update it');
    }

    const updatedColumnWidths = { ...(sheet.columnWidths as Prisma.JsonObject), [index]: width };

    return await db.sheet.update({
        where: {
            id: sheetId
        },
        data: {
            columnWidths: updatedColumnWidths
        }
    });
};

export const updateHiddenRows = async (sheetId: number, index: number, hidden: boolean, userId: number) => {
    const sheet = await db.sheet.findFirst({
        where: {
            id: sheetId,
            Spreadsheet: {
                ownerId: userId
            }
        }
    });

    if (!sheet) {
        throw new Error('Sheet not found or you don\'t have permission to update it');
    }

    const updatedHiddenRows = { ...(sheet.hiddenRows as Prisma.JsonObject), [index]: hidden };

    return await db.sheet.update({
        where: {
            id: sheetId
        },
        data: {
            hiddenRows: updatedHiddenRows
        }
    });
};

export const updateHiddenCols = async (sheetId: number, index: number, hidden: boolean, userId: number) => {
    const sheet = await db.sheet.findFirst({
        where: {
            id: sheetId,
            Spreadsheet: {
                ownerId: userId
            }
        }
    });

    if (!sheet) {
        throw new Error('Sheet not found or you don\'t have permission to update it');
    }

    const updatedHiddenCols = { ...(sheet.hiddenCols as Prisma.JsonObject), [index]: hidden };

    return await db.sheet.update({
        where: {
            id: sheetId
        },
        data: {
            hiddenCols: updatedHiddenCols
        }
    });
};
