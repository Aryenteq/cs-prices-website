import { CS_PROTECTED_COLUMNS_LENGTH } from "../SpreadsheetTable";

export const getColumnLetter = (type: 'CS' | 'NORMAL', col: number) => {
    let title = '';

    if (type === 'NORMAL') {
        while (col >= 0) {
            title = String.fromCharCode((col % 26) + 65) + title;
            col = Math.floor(col / 26) - 1;
        }
        return title;
    }

    if (col >= CS_PROTECTED_COLUMNS_LENGTH) {
        col -= CS_PROTECTED_COLUMNS_LENGTH;
        while (col >= 0) {
            title = String.fromCharCode((col % 26) + 65) + title;
            col = Math.floor(col / 26) - 1;
        }
        return title;
    }

    switch (col) {
        case 0:
            title = 'Item name'
            break;
        case 1:
            title = 'Price'
            break;
        default:
            break;
    }
    return title;
};

// Combine JSON to Array (numbers)
export const initializeSizes = (
    numItems: number,
    defaultSize: number,
    specificSizes: { [key: number]: number } | null
): number[] => {
    const defaultSizes = new Array(numItems).fill(defaultSize);

    if (specificSizes) {
        for (const [index, size] of Object.entries(specificSizes)) {
            const numericIndex = parseInt(index, 10);
            if (numericIndex >= 0 && numericIndex < numItems) {
                defaultSizes[numericIndex] = size;
            }
        }
    }

    return defaultSizes;
};

// Combine JSON to Array (boolean)
export const initializeVisibility = (
    numItems: number,
    specificVisibility: { [key: number]: boolean }
): boolean[] => {
    const defaultVisibility = new Array(numItems).fill(false);
    return defaultVisibility.map((isVisible, index) => {
        return specificVisibility[index] !== undefined ? specificVisibility[index] : isVisible;
    });
};