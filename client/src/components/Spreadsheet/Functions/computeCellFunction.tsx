import { CS_PROTECTED_COLUMNS_LENGTH } from "../SpreadsheetTable";
import { Spreadsheet } from "./Types";
import { getColIndexFromLetter } from "./Utils";

export const computeCellFunction = (content: string, spreadsheet: Spreadsheet): string | number => {
    try {
        if (!content.startsWith('=')) return content;

        // Extract the function name and parameters (e.g., =SUM(a1:b4))
        const formulaMatch = content.match(/^=(\w+)\((.*)\)$/);
        if (!formulaMatch) return '#ERROR';

        const [, functionName, params] = formulaMatch;

        switch (functionName.toUpperCase()) {
            case 'SUM':
                return computeSum(params, spreadsheet);
            default:
                return '#ERROR';
        }
    } catch (error) {
        return '#ERROR';
    }
};

// SUM
const computeSum = (range: string, spreadsheet: Spreadsheet): string | number => {
    const rangeMatch = range.match(/^([a-zA-Z]+)(\d+):([a-zA-Z]+)(\d+)$/);
    if (!rangeMatch) return '#ERROR'; // Invalid range format

    const [, startColLetter, startRow, endColLetter, endRow] = rangeMatch;

    const startCol = getColIndexFromLetter(startColLetter, spreadsheet.type, CS_PROTECTED_COLUMNS_LENGTH);
    const endCol = getColIndexFromLetter(endColLetter, spreadsheet.type, CS_PROTECTED_COLUMNS_LENGTH);

    if (typeof startCol !== 'number' || typeof endCol !== 'number') {
        return '#ERROR';
    }

    const startRowIndex = parseInt(startRow, 10) - 1;
    const endRowIndex = parseInt(endRow, 10) - 1;

    if (startCol < 0 || endCol < 0 || startCol > spreadsheet.sheet.numCols || endCol > spreadsheet.sheet.numCols) {
        return '#ERROR';
    }

    if (startRowIndex < 0 || endRowIndex < 0 || startRowIndex > spreadsheet.sheet.numRows || endRowIndex > spreadsheet.sheet.numRows) {
        return '#ERROR';
    }


    let sum = 0;

    for (let rowIndex = startRowIndex; rowIndex <= endRowIndex; rowIndex++) {
        for (let colIndex = startCol; colIndex <= endCol; colIndex++) {
            const cell = spreadsheet.sheet.cells.find(
                (c) => c.row === rowIndex && c.col === colIndex
            );

            let value: number;

            if (cell?.content?.startsWith('=')) {
                const result = computeCellFunction(cell.content, spreadsheet);
                value = typeof result === 'number' && !isNaN(result) ? result : 0;
            } else {
                value = parseFloat(cell?.content || '0');
            }

            sum += isNaN(value) ? 0 : value;
        }
    }

    return sum;
};
