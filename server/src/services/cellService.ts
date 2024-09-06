import { db } from '../db';
import { Prisma, type Cell } from '@prisma/client';
import { findSheetIdByCellId } from '../utils/findSheetId';
import { findSpreadsheetIdByCellId } from '../utils/findSpreadsheetId';
import { getUserPermissionForSpreadsheet } from '../utils/checkPermission';

import { CS_PROTECTED_COLUMNS_LENGTH, CS_PROTECTED_COLUMNS_EDITABLE } from './spreadsheetService';
import { addCols, addRows } from './sheetService';
import { getCellById, getSheetById } from '../utils/getById';
import { getCellByPosition } from '../utils/getByPosition';

export type SelectedCellsContent = {
    [rowIndex: number]: {
        [colIndex: number]: string | null;
    };
};

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

export const setPastedContent = async (firstCellId: number, contents: SelectedCellsContent, userId: number) => {
    const firstCell = await getCellById(firstCellId);
    if (!firstCell) throw new Error('First cell not found');

    const { row: firstRow, col: firstCol, sheetId } = firstCell;

    const rowIndices = Object.keys(contents).map(rowIndex => parseInt(rowIndex, 10));
    const colIndices = Object.values(contents).flatMap(row => Object.keys(row).map(colIndex => parseInt(colIndex, 10)));

    const requiredRows = Math.max(...rowIndices) - Math.min(...rowIndices) + 1;
    const requiredCols = Math.max(...colIndices) - Math.min(...colIndices) + 1;

    const lastRow = firstRow + requiredRows - 1;
    const lastCol = firstCol + requiredCols - 1;

    const sheet = await getSheetById(sheetId);
    if (!sheet) throw new Error('Sheet not found');

    // Adjust number of rows/col if necessary
    // Weird calculations
    if (sheet.numRows < lastRow - 1 + requiredRows) {
        await addRows(sheetId, sheet.numRows, requiredRows - 1, userId);
    }

    if (sheet.numCols < lastCol - 1 + requiredCols) {
        await addCols(sheetId, sheet.numCols, requiredCols - 1, userId);
    }

    // Normalize contents
    const normalizedContents: { cellId: number; content: string }[] = [];

    let hasNonNullContent = false;

    for (const relativeRowIndex in contents) {
        const rowContent = contents[relativeRowIndex];
        for (const relativeColIndex in rowContent) {
            const content = rowContent[relativeColIndex];
            if (content !== null) {
                hasNonNullContent = true;
                const absoluteRow = firstRow + (parseInt(relativeRowIndex, 10) - Math.min(...rowIndices));
                const absoluteCol = firstCol + (parseInt(relativeColIndex, 10) - Math.min(...colIndices));

                // Retrieve the cellId based on the absoluteRow and absoluteCol
                const cell = await getCellByPosition(sheetId, absoluteRow, absoluteCol);
                if (cell) {
                    normalizedContents.push({ cellId: cell.id, content });
                }
            }
        }
    }

    if (!hasNonNullContent) {
        // still return the updated sheet if no content is updated
        // maybe numRows/numCols is updated
        const updatedSheet = await db.sheet.findUnique({
            where: { id: sheetId },
            include: {
                cells: true,
            },
        });

        return updatedSheet;
    }

    console.log(hasNonNullContent);
    const updatedSheet = await setContent(normalizedContents, userId);
    return updatedSheet;

};


const updateCell = async (cellId: number, data: object, userId: number) => {
    const cell = await fetchCellById(cellId, db);

    // We'll need the old values for protected cell edits (quantity)
    let cellsInRow: Cell[];
    if (cell.protected) {
        cellsInRow = await fetchRowCells(cell, db);
    }

    return await db.$transaction(async (transaction) => {
        await validateSpreadsheetAndPermissions(cellId, userId, transaction);

        const updatedCell = await transaction.cell.update({
            where: { id: cellId },
            data,
        });

        if ('content' in data) {
            await handleContentUpdate(cell, data.content as string, cellsInRow, transaction);
        }

        return updatedCell;
    });
};

const fetchCellById = async (cellId: number, transaction: Prisma.TransactionClient) => {
    const cell = await transaction.cell.findFirst({ where: { id: cellId } });
    if (!cell) {
        throw new Error('Cell not found');
    }
    return cell;
};

const validateSpreadsheetAndPermissions = async (cellId: number, userId: number, transaction: Prisma.TransactionClient) => {
    const spreadsheetId = await findSpreadsheetIdByCellId(cellId);
    if (!spreadsheetId) {
        throw new Error('Associated spreadsheet not found');
    }

    const permission = await getUserPermissionForSpreadsheet(spreadsheetId, userId);
    if (permission !== 'EDIT') {
        throw new Error('You do not have permission to edit this cell.');
    }

    return spreadsheetId;
};


const handleContentUpdate = async (cell: Cell, content: string, cellsInRow: Cell[], transaction: Prisma.TransactionClient) => {
    if (cell.protected) {
        if (!CS_PROTECTED_COLUMNS_EDITABLE.includes(cell.col)) {
            throw new Error(`Cannot edit cells in protected columns, except for columns ${CS_PROTECTED_COLUMNS_EDITABLE.join(', ')}`);
        }

        const { link, quantity } = await processCellUpdate(cell, content, cellsInRow, transaction);

        if (link && quantity !== null) {
            await updateSteamPrices(link, quantity, cell, transaction);
        } else {
            await deleteCSRow(cell, transaction);
        }
    }
};

const fetchRowCells = async (cell: Cell, transaction: Prisma.TransactionClient) => {
    return await transaction.cell.findMany({
        where: {
            sheetId: cell.sheetId,
            row: cell.row,
            col: { lt: CS_PROTECTED_COLUMNS_LENGTH },
        },
        orderBy: { col: 'asc' },
    });
};

const processCellUpdate = async (cell: Cell, content: string, cellsInRow: Cell[], transaction: Prisma.TransactionClient) => {
    let link = null;
    let quantity = null;

    // get old qunatity content -- too complicated parsers for this
    const quantityContent = cellsInRow[CS_PROTECTED_COLUMNS_EDITABLE[1]].content;
    const parsedQuantity = quantityContent === null || quantityContent === undefined ? NaN : parseFloat(quantityContent);
    const oldQuantity = isNaN(parsedQuantity) ? 1 : parsedQuantity;
    const oldColor = cellsInRow[CS_PROTECTED_COLUMNS_EDITABLE[1]].bgColor;

    // link edited
    if (cell.col === CS_PROTECTED_COLUMNS_EDITABLE[0]) {
        link = content || null;
        quantity = oldQuantity;
    } else {
        // quantity edited
        link = cellsInRow[CS_PROTECTED_COLUMNS_EDITABLE[0]].content;
        quantity = content ? parseFloat(content) : 1;
    }

    // recolor (quantity goes to 0 or > 0 & not recolored by user)
    if (quantity === 0) {
        await colorRow(cell, transaction, '#FF0000');
    } else if (quantity > 0 && oldQuantity === 0 && oldColor === '#FF0000') {
        await colorRow(cell, transaction, '#242424');
    }

    if (isNaN(quantity) || quantity < 0) {
        throw new Error('Quantity cannot be negative or NaN');
    }

    return { link, quantity };
};

const updateSteamPrices = async (link: string, quantity: number, cell: Cell, transaction: Prisma.TransactionClient) => {
    const decodedUrl = decodeURIComponent(link);
    const lastPart = decodedUrl.substring(decodedUrl.lastIndexOf('/') + 1);
    const steamPrice = await transaction.steamPrices.findFirst({ where: { name: lastPart } });

    if (!steamPrice) {
        throw new Error(`No Steam Market item found for name: ${lastPart}`);
    }

    const updates = preparePriceUpdates(steamPrice, quantity);

    const lastPipeIndex = lastPart.lastIndexOf('|');
    if (lastPipeIndex !== -1) {
        const name = lastPart.substring(0, lastPipeIndex).trim();
        const float = lastPart.substring(lastPipeIndex + 1).trim();

        updates.push(
            { col: 1, content: name },
            { col: 2, content: float }
        );
    }

    await Promise.all(
        updates.map(async (update) => {
            await transaction.cell.updateMany({
                where: {
                    sheetId: cell.sheetId,
                    row: cell.row,
                    col: update.col,
                },
                data: { content: update.content },
            });
        })
    );

};


const preparePriceUpdates = (steamPrice: any, quantity: number) => {
    const { priceLatest, priceReal, buyOrderPrice } = steamPrice;

    return [
        { col: 4, content: priceLatest.toNumber().toString() },
        { col: 5, content: (priceLatest.toNumber() * quantity).toString() },
        { col: 6, content: priceReal.toNumber().toString() },
        { col: 7, content: (priceReal.toNumber() * quantity).toString() },
        { col: 8, content: buyOrderPrice.toNumber().toString() },
    ];
};


const deleteCSRow = async (cell: Cell, transaction: Prisma.TransactionClient): Promise<void> => {
    await transaction.cell.updateMany({
        where: {
            sheetId: cell.sheetId,
            row: cell.row,
            col: { lt: CS_PROTECTED_COLUMNS_LENGTH, notIn: CS_PROTECTED_COLUMNS_EDITABLE },
        },
        data: { content: null },
    });
};

const colorRow = async (cell: Cell, transaction: Prisma.TransactionClient, color: string): Promise<void> => {
    const sheetId = await findSheetIdByCellId(cell.id);

    if (!sheetId) {
        throw new Error('Sheet ID not found');
    }

    await transaction.cell.updateMany({
        where: {
            sheetId: sheetId,
            row: cell.row,
            col: { lt: CS_PROTECTED_COLUMNS_LENGTH },
        },
        data: { bgColor: color },
    });
};
