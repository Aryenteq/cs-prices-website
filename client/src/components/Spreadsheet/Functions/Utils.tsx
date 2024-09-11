import { CS_PROTECTED_COLUMNS_LENGTH } from "../SpreadsheetTable";

import { HorizontalAlignment, VerticalAlignment, TextAlign } from "./Types";

export const getColumnLetter = (abbreviated: boolean = true, type: 'CS' | 'NORMAL', col: number) => {
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
            title = abbreviated ? 'a' : 'Link (a)';
            break;
        case 1:
            title = abbreviated ? 'b' : 'Name (b)';
            break;
        case 2:
            title = abbreviated ? 'c' : 'Wear (c)';
            break;
        case 3:
            title = abbreviated ? 'd' : 'Quantity (d)';
            break;
        case 4:
            title = abbreviated ? 'e' : 'Latest price (e)';
            break;
        case 5:
            title = abbreviated ? 'f' : 'Latest price sum (f)';
            break;
        case 6:
            title = abbreviated ? 'g' : 'Real price (g)';
            break;
        case 7:
            title = abbreviated ? 'h' : 'Real price sum (h)';
            break;
        case 8:
            title = abbreviated ? 'i' : 'Buy Order Price (i)';
            break;
        default:
            break;
    }

    return title;
};

export const getColIndexFromLetter = (
    letter: string,
    type: 'CS' | 'NORMAL',
    CS_PROTECTED_COLUMNS_LENGTH: number
): number | string => {
    if (type === 'NORMAL') {
        if (letter.length === 1 && letter >= 'a' && letter <= 'z') {
            return '#ERROR';
        }

        let colIndex = 0;
        for (let i = 0; i < letter.length; i++) {
            colIndex = colIndex * 26 + (letter.charCodeAt(i) - 65 + 1);
        }

        return colIndex - 1;
    }

    if (type === 'CS') {
        if (letter.length === 1 && letter >= 'a' && letter <= 'g') {
            switch (letter) {
                case 'a':
                    return 0;
                case 'b':
                    return 1;
                case 'c':
                    return 2;
                case 'd':
                    return 3;
                case 'e':
                    return 4;
                case 'f':
                    return 5;
                case 'g':
                    return 6;
                default:
                    return '#ERROR';
            }
        }

        let colIndex = 0;
        for (let i = 0; i < letter.length; i++) {
            colIndex = colIndex * 26 + (letter.charCodeAt(i) - 65 + 1);
        }

        return colIndex - 1 + CS_PROTECTED_COLUMNS_LENGTH;
    }

    return '#ERROR';
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
    { color: '#242424', title: 'Background' },
    { color: '#FF0000', title: 'Red' },
    { color: '#FF9900', title: 'Orange' },
    { color: '#FFFF00', title: 'Yellow' },
    { color: '#00FF00', title: 'Green' },
    { color: '#00FFFF', title: 'Cyan' },
    { color: '#0066FF', title: 'Blue' },
    { color: '#6600FF', title: 'Purple' },
];
