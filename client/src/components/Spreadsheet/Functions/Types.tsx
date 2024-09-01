export enum HorizontalAlignment {
    LEFT = "LEFT",
    CENTER = "CENTER",
    RIGHT = "RIGHT"
}

export enum VerticalAlignment {
    TOP = "TOP",
    CENTER = "CENTER",
    BOTTOM = "BOTTOM"
}

export type TextAlign = 'left' | 'right' | 'center' | 'justify';

export interface Cell {
    id: number;
    sheetId: number;
    row: number;
    col: number;
    protected: boolean;
    bgColor: string;
    color: string;
    style?: Record<string, any>;
    hAlignment: HorizontalAlignment;
    vAlignment: VerticalAlignment;
    content?: string;
    created: string;
    updatedAt: string;
}

export interface Sheet {
    id: number;
    spreadsheetId: number;
    name: string;
    index: number;
    numRows: number;
    numCols: number;
    columnWidths?: Record<number, number>;
    rowHeights?: Record<number, number>;
    hiddenCols?: Record<number, boolean>;
    hiddenRows?: Record<number, boolean>;
    created: string;
    updatedAt: string;
    cells: Cell[];
}
