export const getColumnLetter = (col: number) => {
    let letter = '';
    while (col >= 0) {
        letter = String.fromCharCode((col % 26) + 65) + letter;
        col = Math.floor(col / 26) - 1;
    }
    return letter;
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