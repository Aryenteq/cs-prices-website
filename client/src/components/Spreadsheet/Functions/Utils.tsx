import { CS_PROTECTED_COLUMNS_LENGTH } from "../SpreadsheetTable";

import { HorizontalAlignment, VerticalAlignment, TextAlign } from "./Types";

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


export const getTextAlign = (alignment?: HorizontalAlignment): TextAlign | undefined => {
    switch (alignment) {
        case 'LEFT':
            return 'left';
        case 'CENTER':
            return 'center';
        case 'RIGHT':
            return 'right';
        default:
            return undefined;
    }
};

export const getVerticalAlign = (alignment?: VerticalAlignment): string => {
    switch (alignment) {
        case 'TOP':
            return 'top';
        case 'CENTER':
            return 'middle';
        case 'BOTTOM':
            return 'bottom';
        default:
            return 'middle';
    }
};

export const sketchColors = [
    { color: '#000000', title: 'Black' },
    { color: '#4D4D4D', title: 'Dark Gray 1' },
    { color: '#999999', title: 'Dark Gray 2' },
    { color: '#B3B3B3', title: 'Gray' },
    { color: '#CCCCCC', title: 'Light Gray 1' },
    { color: '#E6E6E6', title: 'Light Gray 2' },
    { color: '#F2F2F2', title: 'Light Gray 3' },
    { color: '#FFFFFF', title: 'White' },
    { color: '#FF0000', title: 'Red' },
    { color: '#FF9900', title: 'Orange' },
    { color: '#FFFF00', title: 'Yellow' },
    { color: '#00FF00', title: 'Green' },
    { color: '#00FFFF', title: 'Cyan' },
    { color: '#0066FF', title: 'Blue' },
    { color: '#6600FF', title: 'Purple' },
    { color: '#FF00FF', title: 'Pink' },
];
