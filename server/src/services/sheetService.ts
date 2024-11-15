import { db } from '../db';
import type { Sheet as PrismaSheet } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { getUserPermissionForSpreadsheet } from '../utils/checkPermission';
import { CS_PROTECTED_COLUMNS_LENGTH, generateCells } from './spreadsheetService';
import type { ItemsVisibility, Sheet } from '../utils/types';
import { getSheetById, getSpreadsheetById } from '../utils/getById';
import { findSpreadheetIdBySheetId } from '../utils/findById';

const DEFAULT_ROW_HEIGHT = 21;
const DEFAULT_COL_WIDTH = 100;

export const getSheet = async (sheetId: number, userId: number) => {
    const spreadsheetData = await db.sheet.findUnique({
        where: {
            id: sheetId,
        },
        select: {
            spreadsheetId: true,
        }
    });

    if (!spreadsheetData) {
        throw new Error('Spreadsheet not found!');
    }

    const spreadsheetId = spreadsheetData.spreadsheetId;

    const permission = await getUserPermissionForSpreadsheet(spreadsheetId, userId);

    if (!permission) {
        throw new Error('Sheet not found or you don\'t have permission to access it');
    }

    const sheet = await db.sheet.findFirst({
        where: {
            id: sheetId,
        },
        include: {
            cells: true,
        },
    });

    if (!sheet) {
        throw new Error('Sheet not found');
    }

    return sheet;
};

const computeBatchSize = (totalCells: number): number => {
    const MIN_BATCH_SIZE = 50;
    const MAX_BATCH_SIZE = 500;

    return Math.min(MAX_BATCH_SIZE, Math.max(MIN_BATCH_SIZE, Math.floor(totalCells / 50)));
};

const hasCellChanged = (dbCell: any, newCell: any): boolean => {
    return (
        dbCell.row !== newCell.row ||
        dbCell.col !== newCell.col ||
        //dbCell.protected !== newCell.protected || // this can not be edited
        dbCell.bgColor !== newCell.bgColor ||
        dbCell.color !== newCell.color ||
        JSON.stringify(dbCell.style) !== JSON.stringify(newCell.style) ||
        dbCell.hAlignment !== newCell.hAlignment ||
        dbCell.vAlignment !== newCell.vAlignment ||
        dbCell.content !== newCell.content
    );
};

export const revertSheet = async (sheet: Sheet, userId: number) => {
    const permission = await getUserPermissionForSpreadsheet(sheet.spreadsheetId, userId);

    if (permission !== 'EDIT') {
        throw new Error('You do not have permission to edit this spreadsheet.');
    }

    await db.sheet.update({
        where: { id: sheet.id },
        data: {
            name: sheet.name,
            index: sheet.index,
            color: sheet.color,
            numRows: sheet.numRows,
            numCols: sheet.numCols,
            columnWidths: sheet.columnWidths || undefined,
            rowHeights: sheet.rowHeights || undefined,
            hiddenCols: sheet.hiddenCols || undefined,
            hiddenRows: sheet.hiddenRows || undefined,
        },
    });

    const existingCells = await db.cell.findMany({
        where: { sheetId: sheet.id },
    });

    const existingCellMap = new Map(existingCells.map(cell => [cell.id, cell]));

    // Identify cells to delete (that exist in DB but not in updated data)
    const existingCellIds = new Set(existingCells.map(cell => cell.id));
    const newCellIds = new Set(sheet.cells.map(cell => cell.id));
    const cellIdsToDelete = Array.from(existingCellIds).filter(id => !newCellIds.has(id));

    if (cellIdsToDelete.length > 0) {
        await db.cell.deleteMany({
            where: { id: { in: cellIdsToDelete } },
        });
    }

    const totalCells = sheet.numRows * sheet.numCols;

    const BATCH_SIZE = computeBatchSize(totalCells);

    // Filter cells that have been added or modified
    const changedCells = sheet.cells.filter(newCell => {
        const dbCell = existingCellMap.get(newCell.id);
        return !dbCell || hasCellChanged(dbCell, newCell); // Either new or changed
    });

    const batchUpserts = async (cells: any[], sheetId: number) => {
        for (let i = 0; i < cells.length; i += BATCH_SIZE) {
            const batch = cells.slice(i, i + BATCH_SIZE);

            const upsertPromises = batch.map(cell => {
                return db.cell.upsert({
                    where: { id: cell.id },
                    update: {
                        row: cell.row,
                        col: cell.col,
                        protected: cell.protected,
                        bgColor: cell.bgColor,
                        color: cell.color,
                        style: cell.style,
                        hAlignment: cell.hAlignment,
                        vAlignment: cell.vAlignment,
                        content: cell.content,
                        created: new Date(cell.created),
                        updatedAt: new Date(cell.updatedAt),
                    },
                    create: {
                        id: cell.id,
                        sheetId,
                        row: cell.row,
                        col: cell.col,
                        protected: cell.protected,
                        bgColor: cell.bgColor,
                        color: cell.color,
                        style: cell.style,
                        hAlignment: cell.hAlignment,
                        vAlignment: cell.vAlignment,
                        content: cell.content,
                        created: new Date(cell.created),
                        updatedAt: new Date(cell.updatedAt),
                    },
                });
            });

            await Promise.all(upsertPromises);
        }
    };

    if (changedCells.length > 0) {
        await batchUpserts(changedCells, sheet.id);
    }
};

export const createSheet = async (sheet: PrismaSheet, userId: number) => {
    const permission = await getUserPermissionForSpreadsheet(sheet.spreadsheetId, userId);

    if (permission !== 'EDIT') {
        throw new Error('You do not have permission to edit this spreadsheet.');
    }

    const newSheet = await db.sheet.create({
        data: {
            ...sheet,
            columnWidths: sheet.columnWidths ?? {},
            rowHeights: sheet.rowHeights ?? {},
            hiddenCols: sheet.hiddenCols ?? {},
            hiddenRows: sheet.hiddenRows ?? {},
        },
    });

    const cellsData = await generateCells(sheet.spreadsheetId, newSheet.id, newSheet.numRows, newSheet.numCols);

    await db.cell.createMany({
        data: cellsData,
    });

    const sheetWithCells = await db.sheet.findUnique({
        where: {
            id: newSheet.id,
        },
        include: {
            cells: true,
        },
    });

    return sheetWithCells;
};

export const deleteSheet = async (sheetId: number, userId: number) => {
    const sheet = await db.sheet.findFirst({
        where: {
            id: sheetId,
        },
        include: {
            Spreadsheet: true,
        },
    });

    if (!sheet) {
        throw new Error('Sheet not found.');
    }

    const permission = await getUserPermissionForSpreadsheet(sheet.spreadsheetId, userId);

    if (permission !== 'EDIT') {
        throw new Error('You do not have permission to delete this sheet.');
    }

    const sheetCount = await db.sheet.count({
        where: {
            spreadsheetId: sheet.spreadsheetId,
        },
    });

    if (sheetCount <= 1) {
        throw new Error('Cannot delete the only sheet in the spreadsheet.');
    }

    await db.sheet.delete({
        where: {
            id: sheetId,
        },
    });

    // Index update on the remaining sheets
    await db.sheet.updateMany({
        where: {
            spreadsheetId: sheet.spreadsheetId,
            index: {
                gt: sheet.index,
            },
        },
        data: {
            index: {
                decrement: 1,
            },
        },
    });

    return { sheetId };
};

export const setName = async (sheetId: number, name: string, userId: number) => {
    const sheet = await db.sheet.findFirst({
        where: {
            id: sheetId,
        }
    });

    if (!sheet) {
        throw new Error('Sheet not found');
    }

    const permission = await getUserPermissionForSpreadsheet(sheet.spreadsheetId, userId);

    if (permission !== 'EDIT') {
        throw new Error('You do not have permission to rename this sheet.');
    }

    return await db.sheet.update({
        where: {
            id: sheetId
        },
        data: {
            name
        },
        include: {
            cells: true,
        }
    });
};


// Could be changed in the future?
export const setIndex = async (sheetId: number, newIndex: number, userId: number) => {
    const sheet = await db.sheet.findFirst({
        where: {
            id: sheetId
        },
        include: {
            Spreadsheet: true,
        },
    });

    if (!sheet) {
        throw new Error('Sheet not found');
    }

    const permission = await getUserPermissionForSpreadsheet(sheet.spreadsheetId, userId);

    if (permission !== 'EDIT') {
        throw new Error('You do not have permission to change the indexes on this sheet.');
    }

    const currentIndex = sheet.index;
    const spreadsheetId = sheet.spreadsheetId;

    const allSheets = await db.sheet.findMany({
        where: {
            spreadsheetId: spreadsheetId,
        },
        orderBy: {
            index: 'asc',
        },
    });

    const totalSheets = allSheets.length;

    if (newIndex < 0 || newIndex >= totalSheets) {
        // real it is between 0 and totalSheets - 1, but for user-friendliness
        throw new Error(`Invalid index: Index should be between 1 and ${totalSheets}`);
    }

    return await db.$transaction(async (transaction) => {
        if (newIndex > currentIndex) {
            // Shift sheets down (decrement index)
            await transaction.sheet.updateMany({
                where: {
                    spreadsheetId: spreadsheetId,
                    index: {
                        gt: currentIndex,
                        lte: newIndex,
                    },
                },
                data: {
                    index: {
                        decrement: 1,
                    },
                },
            });
        } else if (newIndex < currentIndex) {
            // Shift sheets up (increment index)
            await transaction.sheet.updateMany({
                where: {
                    spreadsheetId: spreadsheetId,
                    index: {
                        gte: newIndex,
                        lt: currentIndex,
                    },
                },
                data: {
                    index: {
                        increment: 1,
                    },
                },
            });
        }

        await transaction.sheet.update({
            where: {
                id: sheetId,
            },
            data: {
                index: newIndex,
            },
        });

        const updatedSheets = await transaction.sheet.findMany({
            where: {
                spreadsheetId: spreadsheetId,
            },
            orderBy: {
                index: 'asc',
            },
        });

        // Map to return sheetsInfo
        const sheetsInfo = updatedSheets.map(sheet => ({
            id: sheet.id,
            name: sheet.name,
            index: sheet.index,
            color: sheet.color,
        }));

        return { sheetsInfo, currentSheetId: sheetId };
    });
};

export const setColor = async (sheetId: number, color: string, userId: number) => {
    const sheet = await db.sheet.findFirst({
        where: {
            id: sheetId,
        }
    });

    if (!sheet) {
        throw new Error('Sheet not found');
    }

    const permission = await getUserPermissionForSpreadsheet(sheet.spreadsheetId, userId);

    if (permission !== 'EDIT') {
        throw new Error('You do not have permission to recolor this sheet.');
    }

    return await db.sheet.update({
        where: {
            id: sheetId
        },
        data: {
            color
        },
        include: {
            cells: true,
        }
    });
};

export const addRows = async (sheetId: number, startIndex: number, rowsNumber: number, userId: number) => {
    const sheet = await db.sheet.findFirst({
        where: {
            id: sheetId
        },
        include: {
            cells: true,
        }
    });

    if (!sheet) {
        throw new Error('Sheet not found');
    }

    const permission = await getUserPermissionForSpreadsheet(sheet.spreadsheetId, userId);

    if (permission !== 'EDIT') {
        throw new Error('You do not have permission to add rows.');
    }

    if (sheet.numRows + rowsNumber > 65536) {
        throw new Error('Can\'t exceed 65536 rows.');
    }

    // Update row positions
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

    const newCells = await generateCellsForNewRows(sheetId, startIndex, rowsNumber, sheet.numCols);
    await db.cell.createMany({
        data: newCells
    });

    // Height & Hidden Json object adjustment
    const updatedRowHeights: Prisma.JsonObject = {};
    const updatedHiddenRows: Prisma.JsonObject = {};

    if (sheet.rowHeights) {
        const rowHeights = sheet.rowHeights as Prisma.JsonObject;

        for (const [key, value] of Object.entries(rowHeights)) {
            const rowIndex = parseInt(key, 10);

            if (rowIndex < startIndex) {
                updatedRowHeights[rowIndex] = value;
            } else {
                updatedRowHeights[rowIndex + rowsNumber] = value;
            }
        }
    }

    if (sheet.hiddenRows) {
        const hiddenRows = sheet.hiddenRows as Prisma.JsonObject;

        for (const [key, value] of Object.entries(hiddenRows)) {
            const rowIndex = parseInt(key, 10);

            if (rowIndex < startIndex) {
                updatedHiddenRows[rowIndex] = value;
            } else {
                updatedHiddenRows[rowIndex + rowsNumber] = value;
            }
        }
    }

    for (let i = startIndex; i < startIndex + rowsNumber; i++) {
        updatedRowHeights[i] = DEFAULT_ROW_HEIGHT;
    }

    await db.sheet.update({
        where: {
            id: sheetId,
        },
        data: {
            numRows: sheet.numRows + rowsNumber,
            rowHeights: updatedRowHeights,
            hiddenRows: updatedHiddenRows,
        },
    });

    return await db.sheet.findFirst({
        where: {
            id: sheetId,
        },
        include: {
            cells: true,
        },
    });
};

const generateCellsForNewRows = async (sheetId: number, startIndex: number, rowsNumber: number, numCols: number) => {
    const sheet = await getSheetById(sheetId);

    if (!sheet) {
        throw new Error("Sheet not found");
    }

    const spreadsheetId = await findSpreadheetIdBySheetId(sheet.id);

    if (!spreadsheetId) {
        throw new Error("Spreadsheet ID not found");
    }

    const spreadsheet = await getSpreadsheetById(spreadsheetId);

    if (!spreadsheet) {
        throw new Error("Spreadsheet ID not found");
    }

    const cells = [];
    for (let row = startIndex; row < startIndex + rowsNumber; row++) {
        for (let col = 0; col < numCols; col++) {
            cells.push({
                sheetId,
                row,
                col,
                protected: spreadsheet.type === 'CS' && col < CS_PROTECTED_COLUMNS_LENGTH,
            });
        }
    }
    return cells;
};

const getSpreadsheetTypeBySheetId = async (sheetId: number): Promise<string | null> => {
    const sheet = await db.sheet.findFirst({
        where: {
            id: sheetId,
        },
        select: {
            Spreadsheet: {
                select: {
                    type: true,
                },
            },
        },
    });

    if (!sheet || !sheet.Spreadsheet) {
        throw new Error('Sheet or associated spreadsheet not found');
    }

    return sheet.Spreadsheet.type;
};

export const addCols = async (sheetId: number, startIndex: number, colsNumber: number, userId: number) => {
    const sheet = await db.sheet.findFirst({
        where: {
            id: sheetId
        },
        include: {
            cells: true,
        }
    });

    if (!sheet) {
        throw new Error('Sheet not found');
    }

    const permission = await getUserPermissionForSpreadsheet(sheet.spreadsheetId, userId);

    if (permission !== 'EDIT') {
        throw new Error('You do not have permission to add columns.');
    }

    const spreadsheetType = await getSpreadsheetTypeBySheetId(sheetId);
    if (spreadsheetType === 'CS' && startIndex < CS_PROTECTED_COLUMNS_LENGTH) {
        throw new Error('Can\'t insert new columns between protected ones.');
    }

    if (sheet.numCols + colsNumber > 256) {
        throw new Error('Can\'t exceed 256 columns.');
    }

    // Update column positions
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

    const newCells = generateCellsForNewCols(sheetId, startIndex, colsNumber, sheet.numRows);
    await db.cell.createMany({
        data: newCells
    });

    // Width & Hidden Json object adjustment
    const updatedColumnWidths: Prisma.JsonObject = {};
    const updatedHiddenCols: Prisma.JsonObject = {};

    if (sheet.columnWidths) {
        const columnWidths = sheet.columnWidths as Prisma.JsonObject;

        for (const [key, value] of Object.entries(columnWidths)) {
            const colIndex = parseInt(key, 10);

            if (colIndex < startIndex) {
                updatedColumnWidths[colIndex] = value;
            } else {
                updatedColumnWidths[colIndex + colsNumber] = value;
            }
        }
    }

    if (sheet.hiddenCols) {
        const hiddenCols = sheet.hiddenCols as Prisma.JsonObject;

        for (const [key, value] of Object.entries(hiddenCols)) {
            const colIndex = parseInt(key, 10);

            if (colIndex < startIndex) {
                updatedHiddenCols[colIndex] = value;
            } else {
                updatedHiddenCols[colIndex + colsNumber] = value;
            }
        }
    }

    for (let i = startIndex; i < startIndex + colsNumber; i++) {
        updatedColumnWidths[i] = DEFAULT_COL_WIDTH;
    }

    await db.sheet.update({
        where: {
            id: sheetId,
        },
        data: {
            numCols: sheet.numCols + colsNumber,
            columnWidths: updatedColumnWidths,
            hiddenCols: updatedHiddenCols,
        },
    });

    return await db.sheet.findFirst({
        where: {
            id: sheetId,
        },
        include: {
            cells: true,
        },
    });
};

const generateCellsForNewCols = (sheetId: number, startIndex: number, colsNumber: number, numRows: number) => {
    const cells = [];
    for (let col = startIndex; col < startIndex + colsNumber; col++) {
        for (let row = 0; row < numRows; row++) {
            cells.push({
                sheetId,
                row,
                col,
            });
        }
    }
    return cells;
};

export const deleteRows = async (
    sheetId: number,
    startIndex: number,
    rowsNumber: number,
    userId: number
) => {
    const sheet = await db.sheet.findFirst({
        where: {
            id: sheetId,
        },
        include: {
            cells: true,
        },
    });

    if (!sheet) {
        throw new Error('Sheet not found');
    }

    const permission = await getUserPermissionForSpreadsheet(sheet.spreadsheetId, userId);

    if (permission !== 'EDIT') {
        throw new Error('You do not have permission to delete these rows.');
    }

    if (sheet.numRows - rowsNumber <= 0) {
        throw new Error('Cannot delete rows. Deleting these rows would leave the sheet with no rows.');
    }

    // Delete cells
    await db.cell.deleteMany({
        where: {
            sheetId: sheetId,
            row: {
                gte: startIndex,
                lt: startIndex + rowsNumber,
            },
        },
    });

    // Update rows positions
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

    // rowHeights & hiddenRows Json objects update
    const updatedRowHeights: Prisma.JsonObject = {};
    const updatedHiddenRows: Prisma.JsonObject = {};

    if (sheet.rowHeights) {
        const rowHeights = sheet.rowHeights as Prisma.JsonObject;

        for (const [key, value] of Object.entries(rowHeights)) {
            const rowIndex = parseInt(key, 10);

            if (rowIndex < startIndex) {
                updatedRowHeights[rowIndex] = value;
            } else if (rowIndex >= startIndex + rowsNumber) {
                updatedRowHeights[rowIndex - rowsNumber] = value;
            }
        }
    }

    if (sheet.hiddenRows) {
        const hiddenRows = sheet.hiddenRows as Prisma.JsonObject;

        for (const [key, value] of Object.entries(hiddenRows)) {
            const rowIndex = parseInt(key, 10);

            if (rowIndex < startIndex) {
                updatedHiddenRows[rowIndex] = value;
            } else if (rowIndex >= startIndex + rowsNumber) {
                updatedHiddenRows[rowIndex - rowsNumber] = value;
            }
        }
    }

    await db.sheet.update({
        where: {
            id: sheetId,
        },
        data: {
            numRows: sheet.numRows - rowsNumber,
            rowHeights: updatedRowHeights,
            hiddenRows: updatedHiddenRows,
        },
    });

    return await db.sheet.findFirst({
        where: {
            id: sheetId,
        },
        include: {
            cells: true,
        },
    });
};

export const deleteCols = async (
    sheetId: number,
    startIndex: number,
    colsNumber: number,
    userId: number
) => {
    const sheet = await db.sheet.findFirst({
        where: {
            id: sheetId,
        },
        include: {
            cells: true,
        },
    });

    if (!sheet) {
        throw new Error('Sheet not found');
    }

    const permission = await getUserPermissionForSpreadsheet(sheet.spreadsheetId, userId);

    if (permission !== 'EDIT') {
        throw new Error('You do not have permission to delete these columns.');
    }

    if (sheet.numCols - colsNumber <= 0) {
        throw new Error('Cannot delete columns. Deleting these columns would leave the sheet with no columns.');
    }

    // Protected cells
    const protectedCells = sheet.cells.filter(cell => {
        return cell.protected && cell.sheetId === sheetId && cell.col >= startIndex && cell.col < startIndex + colsNumber;
    });

    if (protectedCells.length > 0) {
        throw new Error('Cannot delete columns with protected cells.');
    }

    // Delete
    await db.cell.deleteMany({
        where: {
            sheetId: sheetId,
            col: {
                gte: startIndex,
                lt: startIndex + colsNumber,
            },
        },
    });

    // Update column positions
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

    // Update columnWidths & hiddenCols Json objects
    const updatedColumnWidths: Prisma.JsonObject = {};
    const updatedHiddenCols: Prisma.JsonObject = {};

    if (sheet.columnWidths) {
        const columnWidths = sheet.columnWidths as Prisma.JsonObject;

        for (const [key, value] of Object.entries(columnWidths)) {
            const colIndex = parseInt(key, 10);

            if (colIndex < startIndex) {
                updatedColumnWidths[colIndex] = value;
            } else if (colIndex >= startIndex + colsNumber) {
                updatedColumnWidths[colIndex - colsNumber] = value;
            }
        }
    }

    if (sheet.hiddenCols) {
        const hiddenCols = sheet.hiddenCols as Prisma.JsonObject;

        for (const [key, value] of Object.entries(hiddenCols)) {
            const colIndex = parseInt(key, 10);

            if (colIndex < startIndex) {
                updatedHiddenCols[colIndex] = value;
            } else if (colIndex >= startIndex + colsNumber) {
                updatedHiddenCols[colIndex - colsNumber] = value;
            }
        }
    }

    await db.sheet.update({
        where: {
            id: sheetId,
        },
        data: {
            numCols: sheet.numCols - colsNumber,
            columnWidths: updatedColumnWidths,
            hiddenCols: updatedHiddenCols,
        },
    });

    return await db.sheet.findFirst({
        where: {
            id: sheetId,
        },
        include: {
            cells: true,
        },
    });
};

export const updateRowsHeight = async (sheetId: number, index: number, height: number, userId: number) => {
    const sheet = await db.sheet.findFirst({
        where: {
            id: sheetId,
        },
    });

    if (!sheet) {
        throw new Error('Sheet not found');
    }

    const permission = await getUserPermissionForSpreadsheet(sheet.spreadsheetId, userId);

    if (permission !== 'EDIT') {
        throw new Error('You do not have permission to update this sheet.');
    }

    if (height < 20) {
        throw new Error('Height cannot be under 20px');
    }

    let currentRowHeights: Prisma.JsonObject;
    if (!sheet.rowHeights || typeof sheet.rowHeights !== 'object') {
        currentRowHeights = {};
    } else {
        currentRowHeights = sheet.rowHeights as Prisma.JsonObject;
    }

    if (typeof height === 'number') {
        currentRowHeights[index] = height;
    } else {
        throw new Error('Invalid height value');
    }

    const updatedSheet = await db.sheet.update({
        where: {
            id: sheetId,
        },
        data: {
            rowHeights: currentRowHeights,
        },
        include: {
            cells: true,
        },
    });

    return updatedSheet;
};

export const updateColsWidth = async (sheetId: number, index: number, width: number, userId: number) => {
    const sheet = await db.sheet.findFirst({
        where: {
            id: sheetId,
        },
    });

    if (!sheet) {
        throw new Error('Sheet not found');
    }

    const permission = await getUserPermissionForSpreadsheet(sheet.spreadsheetId, userId);

    if (permission !== 'EDIT') {
        throw new Error('You do not have permission to update this sheet.');
    }

    if (width < 20) {
        throw new Error('Width cannot be under 20px');
    }

    let currentColumnWidths: Prisma.JsonObject;
    if (!sheet.columnWidths || typeof sheet.columnWidths !== 'object') {
        currentColumnWidths = {};
    } else {
        currentColumnWidths = sheet.columnWidths as Prisma.JsonObject;
    }

    if (typeof width === 'number') {
        currentColumnWidths[index] = width;
    } else {
        throw new Error('Invalid width value');
    }

    const updatedSheet = await db.sheet.update({
        where: {
            id: sheetId,
        },
        data: {
            columnWidths: currentColumnWidths,
        },
        include: {
            cells: true,
        },
    });

    return updatedSheet;
};


export const updateVisibility = async (
    sheetId: number,
    itemsVisibility: ItemsVisibility[],
    userId: number,
    type: 'row' | 'col'
) => {
    const sheet = await db.sheet.findFirst({
        where: {
            id: sheetId,
        },
    });

    if (!sheet) {
        throw new Error('Sheet not found');
    }

    const permission = await getUserPermissionForSpreadsheet(sheet.spreadsheetId, userId);

    if (permission !== 'EDIT') {
        throw new Error('You do not have permission to update this sheet.');
    }

    let updatedVisibility: Record<number, boolean> = {};
    let currentVisibility: Record<number, boolean> | null = null;
    let totalItems = 0;

    if (type === 'row') {
        currentVisibility = sheet.hiddenRows as Record<number, boolean>;
        totalItems = sheet.numRows;
    } else if (type === 'col') {
        currentVisibility = sheet.hiddenCols as Record<number, boolean>;
        totalItems = sheet.numCols;
    }

    if (!currentVisibility) {
        updatedVisibility = {};
    } else {
        updatedVisibility = { ...currentVisibility };
    }

    itemsVisibility.forEach(({ index, hidden }) => {
        updatedVisibility[index] = hidden;
    });

    const visibleCount = totalItems - Object.values(updatedVisibility).filter(value => value === true).length;
    if (visibleCount <= 0) {
        throw new Error(`Cannot hide all ${type === 'row' ? 'rows' : 'columns'}. At least one ${type === 'row' ? 'row' : 'column'} must remain visible.`);
    }

    const updateData = type === 'row' ? { hiddenRows: updatedVisibility } : { hiddenCols: updatedVisibility };

    await db.sheet.update({
        where: { id: sheetId },
        data: updateData,
    });
};