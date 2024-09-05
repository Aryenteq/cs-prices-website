import { db } from '../db';
import { Prisma, type Cell } from '@prisma/client';
import { findSheetIdByCellId } from '../utils/findSheetId';
import { findSpreadsheetIdByCellId } from '../utils/findSpreadsheetId';
import { getUserPermissionForSpreadsheet } from '../utils/checkPermission';

import { CS_PROTECTED_COLUMNS_LENGTH, CS_PROTECTED_COLUMNS_EDITABLE_LENGTH } from './spreadsheetService';

const DEFAULT_ROW_HEIGHT = 21;
const DEFAULT_FONT_SIZE = 12;

export const updateStyle = async (styles: { cellId: number; style: object }[], userId: number) => {
    const updatedCells = [];

    for (const styleObj of styles) {
        const { cellId, style } = styleObj;

        if (isNaN(cellId) || typeof style !== 'object') {
            throw new Error(`Invalid cell data: cellId=${cellId}, style=${JSON.stringify(style)}`);
        }

        const updatedCell = await updateCellStyle(cellId, style, userId);
        updatedCells.push(updatedCell);
    }

    return updatedCells;
};

const updateCellStyle = async (cellId: number, newStyle: object, userId: number) => {
    const cell = await db.cell.findFirst({
        where: {
            id: cellId,
        },
    });

    if (!cell) {
        throw new Error('Cell not found');
    }

    const spreadsheetId = await findSpreadsheetIdByCellId(cellId);

    if (!spreadsheetId) {
        throw new Error('Associated spreadsheet not found');
    }

    const permission = await getUserPermissionForSpreadsheet(spreadsheetId, userId);

    if (permission !== 'EDIT') {
        throw new Error('You do not have permission to edit this cell.');
    }

    // Merge existing style with the new style updates
    const existingStyle = cell.style as Prisma.JsonObject || {};
    const updatedStyle = { ...existingStyle, ...newStyle };

    // When fontSize is increased, increase also the rowHeight if needed (text needs to fit)
    if ('fontSize' in newStyle) {
        const existingFontSize = parseInt((existingStyle?.['fontSize'] as string) || `${DEFAULT_FONT_SIZE}`, 10);
        const newFontSize = parseInt((newStyle?.['fontSize'] as string) || existingFontSize.toString(), 10);

        if (newFontSize > 48 || newFontSize < 8) {
            throw new Error('Font size must be between 5 and 48');
        }

        if (newFontSize > existingFontSize) {
            const sheet = await db.sheet.findFirst({
                where: { id: cell.sheetId },
            });

            if (!sheet) {
                throw new Error('Sheet not found');
            }

            const lineHeight = newFontSize * 1.5;

            const rowHeights = sheet.rowHeights as number[] || Array(sheet.numRows).fill(DEFAULT_ROW_HEIGHT);
            const currentRowHeight = rowHeights[cell.row] || DEFAULT_ROW_HEIGHT;

            if (lineHeight > currentRowHeight) {
                rowHeights[cell.row] = lineHeight;

                await db.sheet.update({
                    where: { id: sheet.id },
                    data: {
                        rowHeights: rowHeights,
                    },
                });
            }
        }
    }

    return await db.cell.update({
        where: {
            id: cellId,
        },
        data: {
            style: updatedStyle,
        },
    });
};


export const setBgColor = async (bgColors: { cellId: number; bgColor: string }[], userId: number) => {
    const updatedCells = [];

    for (const bgColorObj of bgColors) {
        const { cellId, bgColor } = bgColorObj;

        if (isNaN(cellId) || typeof bgColor !== 'string') {
            throw new Error(`Invalid cell data: cellId=${cellId}, bgColor=${bgColor}`);
        }

        const updatedCell = await updateCell(cellId, { bgColor }, userId);
        updatedCells.push(updatedCell);
    }

    return updatedCells;
};

export const setColor = async (colors: { cellId: number; color: string }[], userId: number) => {
    const updatedCells = [];

    for (const colorObj of colors) {
        const { cellId, color } = colorObj;

        if (isNaN(cellId) || typeof color !== 'string') {
            throw new Error(`Invalid cell data: cellId=${cellId}, color=${color}`);
        }

        const updatedCell = await updateCell(cellId, { color }, userId);
        updatedCells.push(updatedCell);
    }

    return updatedCells;
};

export const setHorizontalAlignment = async (hAlignments: { cellId: number; hAlignment: string }[], userId: number) => {
    const updatedCells = [];

    for (const hAlignmentObj of hAlignments) {
        const { cellId, hAlignment } = hAlignmentObj;

        if (isNaN(cellId) || typeof hAlignment !== 'string') {
            throw new Error(`Invalid cell data: cellId=${cellId}, hAlignment=${hAlignment}`);
        }

        const updatedCell = await updateCell(cellId, { hAlignment }, userId);
        updatedCells.push(updatedCell);
    }

    return updatedCells;
};

export const setVerticalAlignment = async (vAlignments: { cellId: number; vAlignment: string }[], userId: number) => {
    const updatedCells = [];

    for (const vAlignmentObj of vAlignments) {
        const { cellId, vAlignment } = vAlignmentObj;

        if (isNaN(cellId) || typeof vAlignment !== 'string') {
            throw new Error(`Invalid cell data: cellId=${cellId}, vAlignment=${vAlignment}`);
        }

        const updatedCell = await updateCell(cellId, { vAlignment }, userId);
        updatedCells.push(updatedCell);
    }

    return updatedCells;
};

export const setContent = async (contents: { cellId: number; content: string }[], userId: number) => {
    const updatedCellIds = [];

    for (const contentObj of contents) {
        const { cellId, content } = contentObj;

        if (isNaN(cellId) || typeof content !== 'string') {
            throw new Error(`Invalid cell data: cellId=${cellId}, content=${content}`);
        }

        await updateCell(cellId, { content }, userId);
        updatedCellIds.push(cellId);
    }

    const firstCellId = updatedCellIds[0];
    const spreadsheetId = await findSheetIdByCellId(firstCellId);


    if (!spreadsheetId) {
        throw new Error('Associated spreadsheet not found');
    }

    const updatedSheet = await db.sheet.findUnique({
        where: { id: spreadsheetId },
        include: {
            cells: true,
        },
    });

    return updatedSheet;
};

const updateCell = async (cellId: number, data: object, userId: number) => {
    // Using transaction to do a rollback to the update if an error occurs
    return await db.$transaction(async (transaction) => {
        const cell = await transaction.cell.findFirst({
            where: {
                id: cellId
            },
        });

        if (!cell) {
            throw new Error('Cell not found');
        }

        const spreadsheetId = await findSpreadsheetIdByCellId(cellId);

        if (!spreadsheetId) {
            throw new Error('Associated spreadsheet not found');
        }

        const permission = await getUserPermissionForSpreadsheet(spreadsheetId, userId);
        if (permission !== 'EDIT') {
            throw new Error('You do not have permission to edit this cell.');
        }

        const updatedCell = await transaction.cell.update({
            where: { id: cellId },
            data,
        });

        // Changes made to content = may be a protected cell, which requires additional operations
        if ('content' in data) {
            try {
                await handleCellEdit(cell, data.content as string, transaction);
            } catch (error: any) {
                throw new Error(`Error processing cell update: ${error.message}`);
            }
        }

        return updatedCell;
    });
};


// transaction is passed to keep it consistent
const handleCellEdit = async (cell: Cell, content: string, transaction: Prisma.TransactionClient): Promise<void | null> => {
    if (cell.protected) {
        if (cell.col >= CS_PROTECTED_COLUMNS_EDITABLE_LENGTH) {
            throw new Error(`Cannot edit cells in protected columns, except for columns lower than ${CS_PROTECTED_COLUMNS_EDITABLE_LENGTH}`);
        }

        const cellsInRow = await db.cell.findMany({
            where: {
                sheetId: cell.sheetId,
                row: cell.row,
                col: {
                    lt: CS_PROTECTED_COLUMNS_LENGTH
                }
            },
            orderBy: {
                col: 'asc'
            }
        });

        let link: string | null = null;
        let quantity: number | null = null;

        // cell.content is not saved yet (transition)
        // so get the content directly

        // based on the col index of the edited cell, get the link and quantity
        if (cell.col === 0) {
            link = content || null;
            quantity = cellsInRow[1].content ? parseFloat(cellsInRow[1].content) : 1;
        } else {
            link = cellsInRow[0].content;
            if (!content) {
                await deleteCSRow(cell);
                return;
            }
            quantity = parseFloat(content);
        }

        if (!link) {
            await deleteCSRow(cell);
            return;
        }

        if (isNaN(quantity)) {
            quantity = 1;
        }

        if (quantity < 0) {
            throw new Error("Quantity can not be negative");
        }

        const decodedUrl = decodeURIComponent(link);
        const lastPart = decodedUrl.substring(decodedUrl.lastIndexOf('/') + 1);

        const steamPrice = await db.steamPrices.findFirst({
            where: { name: lastPart },
        });

        if (!steamPrice) {
            throw new Error(`No Steam Market item found for name: ${lastPart}`);
        }

        const { priceLatest, priceReal, buyOrderPrice } = steamPrice;

        const updates = [
            { col: 2, content: priceLatest.toNumber().toString() },
            { col: 3, content: (priceLatest.toNumber() * quantity).toString() },
            { col: 4, content: priceReal.toNumber().toString() },
            { col: 5, content: (priceReal.toNumber() * quantity).toString() },
            { col: 6, content: buyOrderPrice.toNumber().toString() },
        ];

        await db.$transaction(async (prisma) => {
            for (const update of updates) {
                await prisma.cell.updateMany({
                    where: { sheetId: cell.sheetId, row: cell.row, col: update.col },
                    data: { content: update.content },
                });
            }
        });
    }
}

const deleteCSRow = async (exceptedCell: Cell): Promise<void> => {
    const sheetId = exceptedCell.sheetId;
    const row = exceptedCell.row;

    const cellsToUpdate = await db.cell.findMany({
        where: {
            sheetId: sheetId,
            row: row,
            col: {
                lt: CS_PROTECTED_COLUMNS_LENGTH,
                gt: 1,
            },
        },
    });

    await db.$transaction(async (transaction) => {
        for (const cell of cellsToUpdate) {
            await transaction.cell.update({
                where: { id: cell.id },
                data: { content: null },
            });
        }
    });
}