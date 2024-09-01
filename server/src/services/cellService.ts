import { db } from '../db';
import { Prisma } from '@prisma/client';
import { findSpreadsheetIdByCellId } from '../utils/findSpreadsheetId';
import { getUserPermissionForSpreadsheet } from '../utils/checkPermission';

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

        if(newFontSize > 48 || newFontSize < 8) {
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
    const updatedCells = [];

    for (const contentObj of contents) {
        const { cellId, content } = contentObj;

        if (isNaN(cellId) || typeof content !== 'string') {
            throw new Error(`Invalid cell data: cellId=${cellId}, content=${content}`);
        }

        const updatedCell = await updateCell(cellId, { content }, userId);
        updatedCells.push(updatedCell);
    }

    return updatedCells;
};

const updateCell = async (cellId: number, data: object, userId: number) => {
    const cell = await db.cell.findFirst({
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

    // Can't edit protected cells content
    if ('content' in data) {
        if (cell.protected && cell.col !== 0) {
            throw new Error(`Cannot edit cells in protected columns, except for column 0`);
        }
    }

    return await db.cell.update({
        where: {
            id: cellId,
        },
        data,
    });
};
